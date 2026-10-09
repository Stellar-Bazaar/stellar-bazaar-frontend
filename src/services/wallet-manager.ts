import { WalletType, WalletOption, WalletAccount } from '../types/wallet';
import { FreighterWalletService } from './freighter-wallet';
import { CompanionSignerService, CompanionAccount } from './companion-signer';
import { shortenAddress } from './validation';

export const STELLAR_TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

export interface WalletAdapter {
  id: WalletType;
  name: string;
  description: string;
  category: 'EXTENSION' | 'WEB' | 'DEVELOPER';
  installUrl?: string;
  badge?: string;
  isAvailable(): Promise<boolean>;
  connect(): Promise<{ address: string; network: string; isTestnet: boolean }>;
  signTransaction(xdr: string, opts?: { networkPassphrase?: string }): Promise<string>;
  disconnect(): Promise<void>;
}

// 1. Freighter Adapter
const freighterAdapter: WalletAdapter = {
  id: 'FREIGHTER',
  name: 'Freighter Wallet',
  description: 'Official browser extension maintained by the Stellar Development Foundation.',
  category: 'EXTENSION',
  installUrl: 'https://www.freighter.app',
  badge: 'Recommended',
  async isAvailable() {
    return FreighterWalletService.isAvailable();
  },
  async connect() {
    const res = await FreighterWalletService.connect();
    return {
      address: res.address,
      network: res.network,
      isTestnet: res.isTestnet,
    };
  },
  async signTransaction(xdr: string) {
    return FreighterWalletService.signTransaction(xdr);
  },
  async disconnect() {
    // Freighter doesn't require explicit remote session termination
  },
};

// 2. xBull Adapter
const xbullAdapter: WalletAdapter = {
  id: 'XBULL',
  name: 'xBull Wallet',
  description: 'Powerful multi-platform Stellar wallet extension supporting Testnet and Mainnet.',
  category: 'EXTENSION',
  installUrl: 'https://xbull.app',
  badge: 'Extension',
  async isAvailable() {
    return typeof window !== 'undefined' && Boolean((window as any).xBullSDK);
  },
  async connect() {
    const isAvail = await this.isAvailable();
    if (!isAvail) {
      throw new Error(
        'xBull Wallet extension was not detected in this browser. Please install xBull from https://xbull.app or the Chrome Web Store.'
      );
    }
    const sdk = (window as any).xBullSDK;
    const publicKey = await sdk.getPublicKey();
    if (!publicKey) {
      throw new Error('xBull authorization was rejected by the user.');
    }
    return {
      address: publicKey,
      network: 'TESTNET',
      isTestnet: true,
    };
  },
  async signTransaction(xdr: string) {
    const sdk = (window as any).xBullSDK;
    if (!sdk) {
      throw new Error('xBull Wallet is unavailable.');
    }
    const signed = await sdk.sign({ xdr, network: 'testnet' });
    if (!signed) {
      throw new Error('Transaction signature rejected in xBull.');
    }
    return signed;
  },
  async disconnect() {},
};

// 3. Albedo Adapter
const albedoAdapter: WalletAdapter = {
  id: 'ALBEDO',
  name: 'Albedo Web Signer',
  description: 'Web-based delegated signature protocol. Works instantly across all browsers without extensions.',
  category: 'WEB',
  installUrl: 'https://albedo.link',
  badge: 'Zero-Install',
  async isAvailable() {
    // Albedo works in any modern browser via web intents / popups
    return typeof window !== 'undefined';
  },
  async connect() {
    // Web intent for Albedo public key
    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      // Albedo intent web bridge
      const intentUrl = 'https://albedo.link/intent/public_key?network=testnet';
      const popup = window.open(
        intentUrl,
        'albedo-login',
        `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0`
      );

      if (!popup) {
        return reject(new Error('Albedo popup was blocked by browser. Please allow popups for this site.'));
      }

      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== 'https://albedo.link') return;
        if (event.data && event.data.albedoIntentResponse) {
          window.removeEventListener('message', messageHandler);
          popup.close();
          const data = event.data.albedoIntentResponse;
          if (data.error) {
            reject(new Error(data.message || 'Albedo authorization was rejected.'));
          } else if (data.pubkey) {
            resolve({
              address: data.pubkey,
              network: 'TESTNET',
              isTestnet: true,
            });
          }
        }
      };

      window.addEventListener('message', messageHandler);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Albedo authorization window was closed before completing.'));
        }
      }, 800);
    });
  },
  async signTransaction(xdr: string) {
    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const intentUrl = `https://albedo.link/intent/tx?xdr=${encodeURIComponent(xdr)}&network=testnet`;
      const popup = window.open(
        intentUrl,
        'albedo-tx',
        `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0`
      );

      if (!popup) {
        return reject(new Error('Albedo popup was blocked. Please allow popups to sign transaction.'));
      }

      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== 'https://albedo.link') return;
        if (event.data && event.data.albedoIntentResponse) {
          window.removeEventListener('message', messageHandler);
          popup.close();
          const data = event.data.albedoIntentResponse;
          if (data.error) {
            reject(new Error(data.message || 'Transaction signing rejected in Albedo.'));
          } else if (data.signed_envelope_xdr) {
            resolve(data.signed_envelope_xdr);
          }
        }
      };

      window.addEventListener('message', messageHandler);
    });
  },
  async disconnect() {},
};

// 4. Hana Wallet Adapter
const hanaAdapter: WalletAdapter = {
  id: 'HANA',
  name: 'Hana Wallet',
  description: 'Multi-network Web3 extension supporting Stellar Soroban interactions.',
  category: 'EXTENSION',
  installUrl: 'https://hanawallet.io',
  badge: 'Extension',
  async isAvailable() {
    return typeof window !== 'undefined' && Boolean((window as any).hanaWallet);
  },
  async connect() {
    const isAvail = await this.isAvailable();
    if (!isAvail) {
      throw new Error(
        'Hana Wallet extension was not detected. Please install Hana Wallet from https://hanawallet.io or use Freighter.'
      );
    }
    const hana = (window as any).hanaWallet;
    const accounts = await hana.request({ method: 'stellar_getAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No account returned from Hana Wallet.');
    }
    return {
      address: accounts[0],
      network: 'TESTNET',
      isTestnet: true,
    };
  },
  async signTransaction(xdr: string) {
    const hana = (window as any).hanaWallet;
    if (!hana) throw new Error('Hana Wallet is unavailable.');
    return hana.request({
      method: 'stellar_signTransaction',
      params: { xdr, network: 'TESTNET' },
    });
  },
  async disconnect() {},
};

// 5. Testnet Companion Adapter
let activeCompanion: CompanionAccount | null = null;
const companionAdapter: WalletAdapter = {
  id: 'COMPANION',
  name: 'Testnet Companion Mode',
  description: 'Automated Testnet keypair funded by Friendbot. Guarantees real on-chain Testnet execution for testing.',
  category: 'DEVELOPER',
  badge: 'Funded Sandbox',
  async isAvailable() {
    return true;
  },
  async connect() {
    activeCompanion = await CompanionSignerService.getOrCreateCompanion();
    return {
      address: activeCompanion.publicKey,
      network: 'TESTNET',
      isTestnet: true,
    };
  },
  async signTransaction(xdr: string) {
    if (!activeCompanion) {
      activeCompanion = await CompanionSignerService.getOrCreateCompanion();
    }
    return CompanionSignerService.signTransaction(xdr, activeCompanion.secretKey);
  },
  async disconnect() {
    activeCompanion = null;
  },
};

const ADAPTERS: Record<WalletType, WalletAdapter> = {
  FREIGHTER: freighterAdapter,
  XBULL: xbullAdapter,
  ALBEDO: albedoAdapter,
  HANA: hanaAdapter,
  COMPANION: companionAdapter,
};

export class WalletManager {
  private static activeAdapter: WalletAdapter | null = null;
  private static activeAccount: WalletAccount | null = null;

  static async getAvailableWallets(): Promise<WalletOption[]> {
    const results: WalletOption[] = [];
    for (const type of Object.keys(ADAPTERS) as WalletType[]) {
      const adapter = ADAPTERS[type];
      const isAvail = await adapter.isAvailable();
      results.push({
        id: adapter.id,
        name: adapter.name,
        description: adapter.description,
        category: adapter.category,
        isAvailable: isAvail,
        installUrl: adapter.installUrl,
        badge: adapter.badge,
      });
    }
    return results;
  }

  static async connect(type: WalletType): Promise<WalletAccount> {
    const adapter = ADAPTERS[type];
    if (!adapter) {
      throw new Error(`Unsupported wallet type: ${type}`);
    }

    const connection = await adapter.connect();
    this.activeAdapter = adapter;

    this.activeAccount = {
      address: connection.address,
      shortAddress: shortenAddress(connection.address),
      network: connection.network,
      isTestnet: connection.isTestnet,
      type: adapter.id,
    };

    return this.activeAccount;
  }

  static async signTransaction(xdr: string, opts?: { networkPassphrase?: string }): Promise<string> {
    if (!this.activeAdapter) {
      throw new Error('No active wallet connected. Please connect a Stellar wallet first.');
    }
    return this.activeAdapter.signTransaction(xdr, opts);
  }

  static async disconnect(): Promise<void> {
    if (this.activeAdapter) {
      await this.activeAdapter.disconnect();
      this.activeAdapter = null;
      this.activeAccount = null;
    }
  }

  static getActiveWalletType(): WalletType | null {
    return this.activeAdapter ? this.activeAdapter.id : null;
  }

  static getActiveAccount(): WalletAccount | null {
    return this.activeAccount;
  }

  static isConnected(): boolean {
    return Boolean(this.activeAccount);
  }
}
