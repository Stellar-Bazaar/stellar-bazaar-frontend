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
  OnChainDeal,
  OnChainOffer,
  SellerReputation,
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

  static getDealEngineContractId(): string {
    return CONTRACT_CONFIG.dealEngine?.contractId || 'CDCK6A2QB5QTILDWILUQGAUWXI543TK63WN2OKG7WEWHBAMGZ6ESKY4G';
  }

  static getExplorerUrl(): string {
    return CONTRACT_CONFIG.explorerUrl;
  }

  static getDealEngineExplorerUrl(): string {
    return CONTRACT_CONFIG.dealEngine?.explorerUrl || `https://stellar.expert/explorer/testnet/contract/${this.getDealEngineContractId()}`;
  }

  /**
   * Fetches the total count of circles created on-chain in DemandCircleRegistry.
   */
  static async getCircleCount(): Promise<number> {
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
    return circles;
  }

  /**
   * Reads authoritative Deal State from BazaarDealEngine contract.
   */
  static async getDealState(dealId: number): Promise<OnChainDeal | null> {
    try {
      const server = this.server;
      const callerAccount = await server.getAccount(CONTRACT_CONFIG.deployerAddress);
      const dealEngineId = this.getDealEngineContractId();

      const tx = new TransactionBuilder(callerAccount, {
        fee: '100',
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: dealEngineId,
            function: 'get_circle',
            args: [nativeToScVal(BigInt(dealId), { type: 'u64' })],
          })
        )
        .setTimeout(60)
        .build();

      const sim = await server.simulateTransaction(tx);
      if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
        return null;
      }

      const raw = scValToNative(sim.result.retval);
      const statusMap: Record<number, 'OPEN' | 'QUORUM_REACHED' | 'SETTLED' | 'CANCELLED'> = {
        0: 'OPEN',
        1: 'QUORUM_REACHED',
        2: 'SETTLED',
        3: 'CANCELLED',
      };

      const deadlineSecs = Number(raw.deadline);
      const targetStroops = BigInt(raw.target_unit_price.toString());
      const escrowStroops = BigInt(raw.total_escrow.toString());

      return {
        id: Number(raw.id),
        creator: raw.creator.toString(),
        token: raw.token.toString(),
        target_unit_price_stroops: raw.target_unit_price.toString(),
        target_unit_price_xlm: (Number(targetStroops) / 10_000_000).toFixed(4),
        min_volume: Number(raw.min_volume),
        max_volume: Number(raw.max_volume),
        current_volume: Number(raw.current_volume),
        total_escrow_stroops: raw.total_escrow.toString(),
        total_escrow_xlm: (Number(escrowStroops) / 10_000_000).toFixed(4),
        deadline: deadlineSecs,
        deadlineDate: new Date(deadlineSecs * 1000).toLocaleString(),
        status: statusMap[raw.status] || 'OPEN',
        registry_address: raw.registry_address ? raw.registry_address.toString() : undefined,
        registry_circle_id: raw.registry_circle_id ? Number(raw.registry_circle_id) : undefined,
        accepted_offer_id: raw.accepted_offer_id ? Number(raw.accepted_offer_id) : undefined,
      };
    } catch (err) {
      console.warn(`Error querying deal #${dealId} state:`, err);
      return null;
    }
  }

  /**
   * Query all seller offers for a given deal from BazaarDealEngine.
   */
  static async getCircleOffers(dealId: number): Promise<OnChainOffer[]> {
    try {
      const server = this.server;
      const callerAccount = await server.getAccount(CONTRACT_CONFIG.deployerAddress);
      const dealEngineId = this.getDealEngineContractId();

      const tx = new TransactionBuilder(callerAccount, {
        fee: '100',
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: dealEngineId,
            function: 'get_circle_offers',
            args: [nativeToScVal(BigInt(dealId), { type: 'u64' })],
          })
        )
        .setTimeout(60)
        .build();

      const sim = await server.simulateTransaction(tx);
      if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
        return [];
      }

      const offerIds = scValToNative(sim.result.retval) as any[];
      const offers: OnChainOffer[] = [];

      for (const id of offerIds) {
        const offer = await this.getOffer(Number(id));
        if (offer) offers.push(offer);
      }

      return offers;
    } catch (err) {
      console.warn(`Error reading offers for deal #${dealId}:`, err);
      return [];
    }
  }

  /**
   * Query an individual seller offer by offer ID.
   */
  static async getOffer(offerId: number): Promise<OnChainOffer | null> {
    try {
      const server = this.server;
      const callerAccount = await server.getAccount(CONTRACT_CONFIG.deployerAddress);
      const dealEngineId = this.getDealEngineContractId();

      const tx = new TransactionBuilder(callerAccount, {
        fee: '100',
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: dealEngineId,
            function: 'get_offer',
            args: [nativeToScVal(BigInt(offerId), { type: 'u64' })],
          })
        )
        .setTimeout(60)
        .build();

      const sim = await server.simulateTransaction(tx);
      if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
        return null;
      }

      const raw = scValToNative(sim.result.retval);
      const statusMap: Record<number, 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'> = {
        0: 'SUBMITTED',
        1: 'ACCEPTED',
        2: 'REJECTED',
      };

      const unitPriceStroops = BigInt(raw.unit_price.toString());

      return {
        id: Number(raw.id),
        seller: raw.seller.toString(),
        circle_id: Number(raw.circle_id),
        unit_price_stroops: raw.unit_price.toString(),
        unit_price_xlm: (Number(unitPriceStroops) / 10_000_000).toFixed(4),
        volume: Number(raw.volume),
        lead_time_days: Number(raw.lead_time_days),
        status: statusMap[raw.status] || 'SUBMITTED',
      };
    } catch (err) {
      console.warn(`Error reading offer #${offerId}:`, err);
      return null;
    }
  }

  /**
   * Query verified seller reputation from on-chain transaction outcomes.
   */
  static async getSellerReputation(sellerAddress: string): Promise<SellerReputation> {
    try {
      const server = this.server;
      const callerAccount = await server.getAccount(CONTRACT_CONFIG.deployerAddress);
      const dealEngineId = this.getDealEngineContractId();

      const tx = new TransactionBuilder(callerAccount, {
        fee: '100',
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: dealEngineId,
            function: 'get_seller_reputation',
            args: [new Address(sellerAddress).toScVal()],
          })
        )
        .setTimeout(60)
        .build();

      const sim = await server.simulateTransaction(tx);
      if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
        return {
          seller: sellerAddress,
          successful_deals: 0,
          total_volume_settled: 0,
          total_amount_settled_stroops: '0',
          total_amount_settled_xlm: '0.00',
          disputed_or_refunded_deals: 0,
          scorePercentage: 100,
        };
      }

      const raw = scValToNative(sim.result.retval);
      const settledStroops = BigInt(raw.total_amount_settled.toString());
      const successCount = Number(raw.successful_deals);
      const disputeCount = Number(raw.disputed_or_refunded_deals);
      const totalDeals = successCount + disputeCount;
      const score = totalDeals > 0 ? Math.round((successCount / totalDeals) * 100) : 100;

      return {
        seller: sellerAddress,
        successful_deals: successCount,
        total_volume_settled: Number(raw.total_volume_settled),
        total_amount_settled_stroops: raw.total_amount_settled.toString(),
        total_amount_settled_xlm: (Number(settledStroops) / 10_000_000).toFixed(2),
        disputed_or_refunded_deals: disputeCount,
        scorePercentage: score,
      };
    } catch (err) {
      console.warn(`Error querying seller reputation for ${sellerAddress}:`, err);
      return {
        seller: sellerAddress,
        successful_deals: 0,
        total_volume_settled: 0,
        total_amount_settled_stroops: '0',
        total_amount_settled_xlm: '0.00',
        disputed_or_refunded_deals: 0,
        scorePercentage: 100,
      };
    }
  }

  /**
   * Helper to sign and submit a prepared Soroban contract invocation.
   */
  private static async executeContractInvocation(
    contractId: string,
    functionName: string,
    args: any[],
    userAddress: string
  ): Promise<{ txHash: string; returnValue?: any }> {
    const server = this.server;
    const account = await server.getAccount(userAddress);

    const tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: contractId,
          function: functionName,
          args,
        })
      )
      .setTimeout(120)
      .build();

    const prepared = await server.prepareTransaction(tx);
    const signedXdr = await WalletManager.signTransaction(prepared.toXDR());
    const signedTx = TransactionBuilder.fromXDR(signedXdr, CONTRACT_CONFIG.networkPassphrase || Networks.TESTNET);

    const sendRes = await server.sendTransaction(signedTx);
    if (sendRes.status === 'ERROR') {
      throw new Error(`Transaction submission error: ${sendRes.errorResult?.toXDR('base64') || 'Unknown'}`);
    }

    for (let attempt = 0; attempt < 35; attempt++) {
      await new Promise((r) => setTimeout(r, 2000));
      const statusRes = await server.getTransaction(sendRes.hash);
      if (statusRes.status === 'SUCCESS') {
        const retVal = statusRes.returnValue ? scValToNative(statusRes.returnValue) : undefined;
        return { txHash: sendRes.hash, returnValue: retVal };
      }
      if (statusRes.status === 'FAILED') {
        throw new Error(`Transaction ${sendRes.hash} failed on-chain.`);
      }
    }

    throw new Error(`Transaction ${sendRes.hash} timed out.`);
  }

  /**
   * Commit demand and deposit escrow funds into BazaarDealEngine.
   */
  static async commitDemand(
    dealId: number,
    quantity: number,
    buyerAddress: string
  ): Promise<{ txHash: string }> {
    return this.executeContractInvocation(
      this.getDealEngineContractId(),
      'commit_demand',
      [
        new Address(buyerAddress).toScVal(),
        nativeToScVal(BigInt(dealId), { type: 'u64' }),
        nativeToScVal(quantity, { type: 'u32' }),
      ],
      buyerAddress
    );
  }

  /**
   * Submit a competitive seller offer to BazaarDealEngine.
   */
  static async submitSellerOffer(
    dealId: number,
    unitPriceXlm: string,
    volume: number,
    leadTimeDays: number,
    sellerAddress: string
  ): Promise<{ txHash: string; offerId?: number }> {
    const stroops = BigInt(Math.round(parseFloat(unitPriceXlm) * 10_000_000));
    const res = await this.executeContractInvocation(
      this.getDealEngineContractId(),
      'submit_seller_offer',
      [
        new Address(sellerAddress).toScVal(),
        nativeToScVal(BigInt(dealId), { type: 'u64' }),
        nativeToScVal(stroops, { type: 'i128' }),
        nativeToScVal(volume, { type: 'u32' }),
        nativeToScVal(leadTimeDays, { type: 'u32' }),
      ],
      sellerAddress
    );
    return {
      txHash: res.txHash,
      offerId: res.returnValue ? Number(res.returnValue) : undefined,
    };
  }

  /**
   * Accept a seller offer on BazaarDealEngine.
   */
  static async acceptSellerOffer(
    dealId: number,
    offerId: number,
    creatorAddress: string
  ): Promise<{ txHash: string }> {
    return this.executeContractInvocation(
      this.getDealEngineContractId(),
      'accept_seller_offer',
      [
        new Address(creatorAddress).toScVal(),
        nativeToScVal(BigInt(dealId), { type: 'u64' }),
        nativeToScVal(BigInt(offerId), { type: 'u64' }),
      ],
      creatorAddress
    );
  }

  /**
   * Settle deal on BazaarDealEngine with escrow payout.
   */
  static async settleDeal(
    dealId: number,
    winningOfferId: number,
    callerAddress: string
  ): Promise<{ txHash: string }> {
    return this.executeContractInvocation(
      this.getDealEngineContractId(),
      'settle_deal',
      [
        nativeToScVal(BigInt(dealId), { type: 'u64' }),
        nativeToScVal(BigInt(winningOfferId), { type: 'u64' }),
      ],
      callerAddress
    );
  }

  /**
   * Claim refund from BazaarDealEngine if expired or cancelled.
   */
  static async claimRefund(
    dealId: number,
    buyerAddress: string
  ): Promise<{ txHash: string }> {
    return this.executeContractInvocation(
      this.getDealEngineContractId(),
      'claim_refund',
      [
        new Address(buyerAddress).toScVal(),
        nativeToScVal(BigInt(dealId), { type: 'u64' }),
      ],
      buyerAddress
    );
  }

  /**
   * Creates a new Demand Circle on-chain with input validation and state progress callbacks.
   */
  static async createDemandCircle(
    creatorAddress: string,
    params: CreateCircleParams,
    onStatusUpdate?: (step: 'SIMULATING' | 'AWAITING_SIGNATURE' | 'SUBMITTING' | 'CONFIRMING') => void
  ): Promise<{ txHash: string; circleId: number }> {
    if (!params.title || params.title.trim().length === 0 || params.title.length > 64) {
      throw new Error('Title must be between 1 and 64 characters');
    }
    if (!params.target_quantity || params.target_quantity <= 0) {
      throw new Error('Target quantity must be greater than zero');
    }
    const priceNum = parseFloat(params.target_price_xlm);
    if (isNaN(priceNum) || priceNum <= 0) {
      throw new Error('Target unit price must be a valid positive XLM amount');
    }
    if (!params.duration_days || params.duration_days < 1 || params.duration_days > 365) {
      throw new Error('Duration must be between 1 and 365 days');
    }

    onStatusUpdate?.('SIMULATING');
    const stroops = BigInt(Math.round(priceNum * 10_000_000));
    const durationSeconds = BigInt(params.duration_days * 86400);

    onStatusUpdate?.('AWAITING_SIGNATURE');
    const res = await this.executeContractInvocation(
      CONTRACT_CONFIG.contractId,
      'create_circle',
      [
        new Address(creatorAddress).toScVal(),
        nativeToScVal(params.title, { type: 'string' }),
        nativeToScVal(params.metadata_uri || '', { type: 'string' }),
        nativeToScVal(params.target_quantity, { type: 'u32' }),
        nativeToScVal(stroops, { type: 'i128' }),
        nativeToScVal(durationSeconds, { type: 'u64' }),
      ],
      creatorAddress
    );

    onStatusUpdate?.('CONFIRMING');
    return {
      txHash: res.txHash,
      circleId: res.returnValue ? Number(res.returnValue) : 1,
    };
  }

  /**
   * Creates a new Demand Circle on-chain via DemandCircleRegistry.
   */
  static async createCircle(
    params: CreateCircleParams,
    userAddress: string
  ): Promise<{ txHash: string; circleId: number }> {
    return this.createDemandCircle(userAddress, params);
  }

  /**
   * Contract event stream indexer with idempotent deduplication and cursor tracking.
   */
  static async syncEvents(startLedger?: number): Promise<ContractEventItem[]> {
    try {
      const server = this.server;
      const latestLedgerRes = await server.getLatestLedger();
      const latestLedger = latestLedgerRes.sequence;

      const queryStart = startLedger || Math.max(1, (this.lastIndexedLedger || latestLedger - 1000));
      const contractIds = [CONTRACT_CONFIG.contractId];
      if (CONTRACT_CONFIG.dealEngine?.contractId) {
        contractIds.push(CONTRACT_CONFIG.dealEngine.contractId);
      }

      const eventsRes = await server.getEvents({
        startLedger: queryStart,
        filters: [
          {
            type: 'contract',
            contractIds,
          },
        ],
      });

      if (eventsRes && eventsRes.events) {
        for (const ev of eventsRes.events) {
          const eventId = ev.id || `${ev.txHash}-${ev.ledger}`;
          if (this.indexedEvents.has(eventId)) continue;

          let topicName = 'Event';
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
            contractId: ev.contractId?.toString() || CONTRACT_CONFIG.contractId,
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
