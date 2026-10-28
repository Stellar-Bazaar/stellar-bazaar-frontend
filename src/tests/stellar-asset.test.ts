import { describe, it, expect } from 'vitest';
import {
  STELLAR_TESTNET_ASSETS,
  getAssetByCode,
  isSupportedAsset,
  getSupportedAssetsList,
} from '../types/stellar-asset';

describe('StellarAsset presets and helpers', () => {
  it('defines valid Native XLM metadata with 7 decimals', () => {
    const xlm = STELLAR_TESTNET_ASSETS.XLM;
    expect(xlm.code).toBe('XLM');
    expect(xlm.isNative).toBe(true);
    expect(xlm.decimals).toBe(7);
    expect(xlm.sorobanContractId).toMatch(/^C[A-Z0-9]{55}$/);
    expect(xlm.issuerAddress).toBeUndefined();
  });

  it('defines valid USDC metadata with issuer and SAC contract ID', () => {
    const usdc = STELLAR_TESTNET_ASSETS.USDC;
    expect(usdc.code).toBe('USDC');
    expect(usdc.isNative).toBe(false);
    expect(usdc.decimals).toBe(7);
    expect(usdc.issuerAddress).toMatch(/^G[A-Z0-9]{55}$/);
    expect(usdc.sorobanContractId).toMatch(/^C[A-Z0-9]{55}$/);
  });

  it('defines valid EURC metadata with issuer and SAC contract ID', () => {
    const eurc = STELLAR_TESTNET_ASSETS.EURC;
    expect(eurc.code).toBe('EURC');
    expect(eurc.isNative).toBe(false);
    expect(eurc.decimals).toBe(7);
    expect(eurc.issuerAddress).toMatch(/^G[A-Z0-9]{55}$/);
    expect(eurc.sorobanContractId).toMatch(/^C[A-Z0-9]{55}$/);
  });

  it('resolves assets by code case-insensitively', () => {
    expect(getAssetByCode('xlm')?.code).toBe('XLM');
    expect(getAssetByCode('XLM')?.code).toBe('XLM');
    expect(getAssetByCode('usdc')?.code).toBe('USDC');
    expect(getAssetByCode('EURC')?.code).toBe('EURC');
    expect(getAssetByCode('BTC')).toBeUndefined();
  });

  it('correctly verifies supported assets', () => {
    expect(isSupportedAsset('XLM')).toBe(true);
    expect(isSupportedAsset('usdc')).toBe(true);
    expect(isSupportedAsset('eurc')).toBe(true);
    expect(isSupportedAsset('DOGE')).toBe(false);
  });

  it('returns complete asset list of length 3', () => {
    const list = getSupportedAssetsList();
    expect(list).toHaveLength(3);
    const codes = list.map((a) => a.code);
    expect(codes).toContain('XLM');
    expect(codes).toContain('USDC');
    expect(codes).toContain('EURC');
  });
});
