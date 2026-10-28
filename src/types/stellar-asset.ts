/**
 * Stellar Asset definitions and Soroban Stellar Asset Contract (SAC) metadata
 */

export type AssetCode = 'XLM' | 'USDC' | 'EURC';

export interface StellarAsset {
  code: AssetCode;
  name: string;
  decimals: number;
  isNative: boolean;
  issuerAddress?: string;
  sorobanContractId: string;
  iconBgColor: string;
  symbol: string;
}

export const STELLAR_TESTNET_ASSETS: Record<AssetCode, StellarAsset> = {
  XLM: {
    code: 'XLM',
    name: 'Stellar Lumens',
    decimals: 7,
    isNative: true,
    sorobanContractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    iconBgColor: '#000000',
    symbol: 'XLM',
  },
  USDC: {
    code: 'USDC',
    name: 'USD Coin (Testnet)',
    decimals: 7,
    isNative: false,
    issuerAddress: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    sorobanContractId: 'CBIELTK6YBZJU5UP2WWQEUCYJLPU6QXN8J3BH5D6T2T6F5Q7V5Q5Q5Q5',
    iconBgColor: '#2775CA',
    symbol: '$',
  },
  EURC: {
    code: 'EURC',
    name: 'Euro Coin (Testnet)',
    decimals: 7,
    isNative: false,
    issuerAddress: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    sorobanContractId: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZUINRF2EB4E5KQA5USC',
    iconBgColor: '#003399',
    symbol: '€',
  },
};

export function getAssetByCode(code: string): StellarAsset | undefined {
  const upper = code.toUpperCase();
  if (upper in STELLAR_TESTNET_ASSETS) {
    return STELLAR_TESTNET_ASSETS[upper as AssetCode];
  }
  return undefined;
}

export function isSupportedAsset(code: string): boolean {
  return code.toUpperCase() in STELLAR_TESTNET_ASSETS;
}

export function getSupportedAssetsList(): StellarAsset[] {
  return Object.values(STELLAR_TESTNET_ASSETS);
}
