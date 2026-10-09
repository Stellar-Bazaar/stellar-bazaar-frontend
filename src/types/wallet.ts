export type WalletStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export type WalletType = 'FREIGHTER' | 'XBULL' | 'ALBEDO' | 'HANA' | 'COMPANION';

export interface WalletOption {
  id: WalletType;
  name: string;
  description: string;
  category: 'EXTENSION' | 'WEB' | 'DEVELOPER';
  isAvailable: boolean;
  installUrl?: string;
  badge?: string;
}

export interface AssetBalance {
  assetCode: string;
  assetIssuer?: string;
  balance: string;
  isNative: boolean;
}

export interface WalletAccount {
  address: string;
  shortAddress: string;
  network: string;
  isTestnet: boolean;
  type: WalletType;
}

export interface AccountBalanceState {
  xlm: string;
  balances: AssetBalance[];
  isFunded: boolean;
  lastFetchedAt: Date | null;
  isLoading: boolean;
  error: string | null;
}
