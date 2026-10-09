import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
  getNetworkDetails,
  getNetwork,
} from '@stellar/freighter-api';
import { TESTNET_PASSPHRASE } from './stellar-horizon';

export class FreighterWalletService {
  /**
   * Checks if Freighter extension is installed and responsive.
   */
  public static async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (typeof isConnected === 'function') {
        const res = await isConnected();
        if (typeof res === 'object' && res !== null && 'isConnected' in res) {
          return Boolean((res as any).isConnected);
        }
        return Boolean(res);
      }
      return Boolean((window as any).freighter);
    } catch {
      return false;
    }
  }

  /**
   * Requests wallet connection from the user via Freighter.
   */
  public static async connect(): Promise<{
    address: string;
    network: string;
    isTestnet: boolean;
  }> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error(
        'Freighter wallet extension was not detected. Please install Freighter from https://freighter.app to continue.'
      );
    }

    try {
      // 1. Request access permission
      let targetAddress = '';
      if (typeof requestAccess === 'function') {
        const access = await requestAccess();
        if (typeof access === 'string') {
          targetAddress = access;
        } else if (access && typeof access === 'object' && (access as any).address) {
          targetAddress = (access as any).address;
        }
      }

      // 2. Fallback to getAddress if needed
      if (!targetAddress && typeof getAddress === 'function') {
        const addrRes = await getAddress();
        if (typeof addrRes === 'string') {
          targetAddress = addrRes;
        } else if (addrRes && typeof addrRes === 'object' && (addrRes as any).address) {
          targetAddress = (addrRes as any).address;
        }
      }

      if (!targetAddress) {
        throw new Error(
          'No account unlocked in Freighter wallet. Please open Freighter and unlock your account.'
        );
      }

      // 3. Inspect network
      const networkInfo = await this.checkNetwork();

      return {
        address: targetAddress,
        network: networkInfo.network,
        isTestnet: networkInfo.isTestnet,
      };
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('reject')) {
        throw new Error('Connection request was rejected in Freighter.');
      }
      throw new Error(msg || 'Failed to connect to Freighter wallet.');
    }
  }

  /**
   * Checks whether the wallet is configured to Stellar Testnet.
   */
  public static async checkNetwork(): Promise<{
    network: string;
    isTestnet: boolean;
  }> {
    try {
      if (typeof getNetworkDetails === 'function') {
        const details = await getNetworkDetails();
        if (details) {
          const netName = (details as any).network || 'UNKNOWN';
          const isTest =
            netName.toUpperCase().includes('TESTNET') ||
            (details as any).networkPassphrase === TESTNET_PASSPHRASE;
          return { network: netName, isTestnet: isTest };
        }
      }

      if (typeof getNetwork === 'function') {
        const netRes = await getNetwork();
        if (netRes) {
          const netStr = typeof netRes === 'string' ? netRes : (netRes as any).network || 'TESTNET';
          const isTest = netStr.toUpperCase().includes('TEST');
          return { network: netStr, isTestnet: isTest };
        }
      }

      return { network: 'TESTNET', isTestnet: true };
    } catch {
      return { network: 'TESTNET', isTestnet: true };
    }
  }

  /**
   * Signs a transaction XDR via the Freighter extension popup.
   */
  public static async signTransaction(xdr: string): Promise<string> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Freighter extension not found.');
    }

    try {
      const res = await signTransaction(xdr, {
        networkPassphrase: TESTNET_PASSPHRASE,
      });

      if (!res) {
        throw new Error('Transaction signing was rejected in Freighter.');
      }

      if (typeof res === 'string') {
        return res;
      }

      if (typeof res === 'object') {
        if ((res as any).signedTxXdr) {
          return (res as any).signedTxXdr;
        }
        if ((res as any).error) {
          throw new Error((res as any).error);
        }
      }

      throw new Error('Unrecognized response format from Freighter signing.');
    } catch (err: any) {
      const msg = err?.message || '';
      if (
        msg.toLowerCase().includes('reject') ||
        msg.toLowerCase().includes('denied') ||
        msg.toLowerCase().includes('cancel')
      ) {
        throw new Error('Transaction signature was rejected in Freighter.');
      }
      throw new Error(msg || 'Failed to sign transaction with Freighter.');
    }
  }
}
