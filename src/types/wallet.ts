export type WalletStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export type WalletType = 'FREIGHTER' | 'COMPANION';

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
