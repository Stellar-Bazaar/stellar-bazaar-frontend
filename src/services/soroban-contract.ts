import {
  rpc,
  Networks,
  Operation,
  TransactionBuilder,
  Address,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import contractData from '../config/contract.json';
import {
  OnChainDemandCircle,
  ContractDeploymentConfig,
  CreateCircleParams,
  ContractEventItem,
  CircleStatusEnum,
} from '../types/contract';
import { WalletManager } from './wallet-manager';

export const CONTRACT_CONFIG: ContractDeploymentConfig = contractData as ContractDeploymentConfig;

export const STROOPS_PER_XLM = 10_000_000n;

export class SorobanContractService {
  private static server = new rpc.Server(CONTRACT_CONFIG.rpcUrl);
  private static indexedEvents: Map<string, ContractEventItem> = new Map();
  private static lastIndexedLedger = 0;

  static getConfig(): ContractDeploymentConfig {
    return CONTRACT_CONFIG;
  }

  static getContractId(): string {
    return CONTRACT_CONFIG.contractId;
  }

  static getExplorerUrl(): string {
    return CONTRACT_CONFIG.explorerUrl;
  }

  /**
   * Fetches the total count of circles created on-chain.
   */
  static async getCircleCount(): Promise<number> {
    try {
      const server = this.server;
      // Use deployer or any public key for read-only simulation
      const callerAccount = await server.getAccount(CONTRACT_CONFIG.deployerAddress);

      const tx = new TransactionBuilder(callerAccount, {
        fee: '100',
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: CONTRACT_CONFIG.contractId,
            function: 'get_circle_count',
            args: [],
          })
        )
        .setTimeout(60)
        .build();

      const sim = await server.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
        const count = scValToNative(sim.result.retval);
        return Number(count);
      }
      return 0;
    } catch (err) {
      console.warn('Failed to query circle count from contract:', err);
      return 0;
    }
  }

  /**
   * Reads a single demand circle by ID directly from authoritative Soroban contract storage.
   */
  static async getCircle(id: number): Promise<OnChainDemandCircle | null> {
    try {
      const server = this.server;
      const callerAccount = await server.getAccount(CONTRACT_CONFIG.deployerAddress);

      const tx = new TransactionBuilder(callerAccount, {
        fee: '100',
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: CONTRACT_CONFIG.contractId,
            function: 'get_circle',
            args: [nativeToScVal(BigInt(id), { type: 'u64' })],
          })
        )
        .setTimeout(60)
        .build();

      const sim = await server.simulateTransaction(tx);
      if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
        return null;
      }

      const raw = scValToNative(sim.result.retval);
      const statusMap: Record<number, CircleStatusEnum> = {
        0: 'OPEN',
        1: 'CLOSED',
        2: 'EXPIRED',
        3: 'CANCELLED',
      };

      const nowSecs = Math.floor(Date.now() / 1000);
      const deadlineSecs = Number(raw.deadline);
      const isExpired = deadlineSecs <= nowSecs && raw.status === 0;

      const stroopsBigInt = BigInt(raw.target_price_stroops.toString());
      const xlmDec = (Number(stroopsBigInt) / 10_000_000).toFixed(4);

      return {
        id: Number(raw.id),
        creator: raw.creator.toString(),
        title: raw.title.toString(),
        metadata_uri: raw.metadata_uri.toString(),
        target_quantity: Number(raw.target_quantity),
        target_price_stroops: raw.target_price_stroops.toString(),
        target_price_xlm: xlmDec,
        deadline: deadlineSecs,
        deadlineDate: new Date(deadlineSecs * 1000).toLocaleString(),
        created_at: Number(raw.created_at),
        createdDate: new Date(Number(raw.created_at) * 1000).toLocaleString(),
        status: isExpired ? 'EXPIRED' : (statusMap[raw.status] || 'OPEN'),
        isExpired,
        isAuthoritativeOnChain: true,
      };
    } catch (err) {
      console.warn(`Error reading circle #${id} from contract:`, err);
      return null;
    }
  }

  /**
   * Fetches all registered demand circles from on-chain state.
   */
  static async getAllCircles(): Promise<OnChainDemandCircle[]> {
    const count = await this.getCircleCount();
    if (count === 0) return [];

    const circles: OnChainDemandCircle[] = [];
    for (let id = 1; id <= count; id++) {
      const circle = await this.getCircle(id);
      if (circle) {
        circles.push(circle);
      }
    }
    return circles.reverse(); // Newest first
  }

  /**
   * Creates a new Demand Circle on-chain through the connected user's wallet.
   */
  static async createDemandCircle(
    creatorAddress: string,
    params: CreateCircleParams,
    onProgress?: (step: 'SIMULATING' | 'AWAITING_SIGNATURE' | 'SUBMITTING' | 'CONFIRMING') => void
  ): Promise<{ txHash: string; circleId: number; explorerUrl: string }> {
    const server = this.server;

    // Validate inputs per contract specifications
    if (!params.title || params.title.trim().length === 0 || params.title.length > 64) {
      throw new Error('Title must be between 1 and 64 characters.');
    }
    if (params.target_quantity <= 0) {
      throw new Error('Target quantity must be greater than zero.');
    }
    const priceNum = parseFloat(params.target_price_xlm);
    if (isNaN(priceNum) || priceNum <= 0) {
      throw new Error('Target unit price must be a valid positive XLM amount.');
    }
    if (params.duration_days <= 0 || params.duration_days > 365) {
      throw new Error('Duration must be between 1 and 365 days.');
    }

    const durationSeconds = BigInt(Math.floor(params.duration_days * 86400));
    const targetPriceStroops = BigInt(Math.round(priceNum * 10_000_000));
    const metadataUri = params.metadata_uri.trim() || `ipfs://bafybeibazaar${Date.now()}`;

    // Step 1: Simulate
    onProgress?.('SIMULATING');
    const account = await server.getAccount(creatorAddress);

    const tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_CONFIG.contractId,
          function: 'create_circle',
          args: [
            new Address(creatorAddress).toScVal(),
            nativeToScVal(params.title.trim(), { type: 'string' }),
            nativeToScVal(metadataUri, { type: 'string' }),
            nativeToScVal(params.target_quantity, { type: 'u32' }),
            nativeToScVal(targetPriceStroops, { type: 'i128' }),
            nativeToScVal(durationSeconds, { type: 'u64' }),
          ],
        })
      )
      .setTimeout(120)
      .build();

    const preparedTx = await server.prepareTransaction(tx);

    // Step 2: Sign
    onProgress?.('AWAITING_SIGNATURE');
    const signedXdr = await WalletManager.signTransaction(preparedTx.toXDR(), {
      networkPassphrase: CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET,
    });

    // Step 3: Submit
    onProgress?.('SUBMITTING');
    const signedTx = TransactionBuilder.fromXDR(
      signedXdr,
      CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET
    );
    const sendRes = await server.sendTransaction(signedTx);

    if (sendRes.status === 'ERROR') {
      const errorMsg = sendRes.errorResult?.toXDR('base64') || JSON.stringify(sendRes);
      throw new Error(`Transaction broadcast failed: ${errorMsg}`);
    }

    // Step 4: Wait for transaction confirmation
    onProgress?.('CONFIRMING');
    let attempts = 0;
    while (attempts < 30) {
      const txStatus = await server.getTransaction(sendRes.hash);
      if (txStatus.status === 'SUCCESS') {
        const circleId = txStatus.returnValue ? Number(scValToNative(txStatus.returnValue)) : 1;
        return {
          txHash: sendRes.hash,
          circleId,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${sendRes.hash}`,
        };
      }
      if (txStatus.status === 'FAILED') {
        throw new Error(`Transaction ${sendRes.hash} failed on-chain.`);
      }
      attempts++;
      await new Promise((r) => setTimeout(r, 2000));
    }

    throw new Error(`Transaction ${sendRes.hash} timed out awaiting ledger confirmation.`);
  }

  /**
   * Contract event stream indexer with idempotent deduplication and cursor tracking.
   */
  static async syncEvents(startLedger?: number): Promise<ContractEventItem[]> {
    try {
      const server = this.server;
      const latestLedgerRes = await server.getLatestLedger();
      const latestLedger = latestLedgerRes.sequence;

      // Determine query start ledger (up to 1000 ledgers back or checkpoint)
      const queryStart = startLedger || Math.max(1, (this.lastIndexedLedger || latestLedger - 1000));

      const eventsRes = await server.getEvents({
        startLedger: queryStart,
        filters: [
          {
            type: 'contract',
            contractIds: [CONTRACT_CONFIG.contractId],
          },
        ],
      });

      if (eventsRes && eventsRes.events) {
        for (const ev of eventsRes.events) {
          const eventId = ev.id || `${ev.txHash}-${ev.ledger}`;
          if (this.indexedEvents.has(eventId)) continue;

          // Decode event topics and data
          let topicName = 'Unknown';
          let circleId = 0;

          try {
            if (ev.topic && ev.topic.length > 1) {
              const sym = scValToNative(ev.topic[1]);
              topicName = sym.toString();
            }
            if (ev.topic && ev.topic.length > 2) {
              circleId = Number(scValToNative(ev.topic[2]));
            }
          } catch {
            // fallback
          }

          let eventData: any = {};
          try {
            if (ev.value) {
              eventData = scValToNative(ev.value);
            }
          } catch {
            eventData = { raw: ev.value };
          }

          const item: ContractEventItem = {
            id: eventId,
            type: topicName,
            circleId,
            txHash: ev.txHash,
            ledger: ev.ledger,
            timestamp: new Date().toLocaleTimeString(),
            contractId: CONTRACT_CONFIG.contractId,
            data: eventData,
          };

          this.indexedEvents.set(eventId, item);
        }
      }

      this.lastIndexedLedger = latestLedger;
      return Array.from(this.indexedEvents.values()).reverse();
    } catch (err) {
      console.warn('Event synchronization note:', err);
      return Array.from(this.indexedEvents.values()).reverse();
    }
  }

  static getIndexedEvents(): ContractEventItem[] {
    return Array.from(this.indexedEvents.values()).reverse();
  }
}
