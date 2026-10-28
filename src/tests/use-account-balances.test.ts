import { describe, it, expect } from 'vitest';
import {
  parseHorizonBalances,
  HorizonBalanceLine,
  useAccountBalances,
} from '../hooks/useAccountBalances';

describe('useAccountBalances and parseHorizonBalances', () => {
  it('exports hook and parser function correctly', () => {
    expect(useAccountBalances).toBeDefined();
    expect(typeof useAccountBalances).toBe('function');
    expect(parseHorizonBalances).toBeDefined();
  });

  it('correctly maps Horizon native and credit_alphanum4 lines', () => {
    const lines: HorizonBalanceLine[] = [
      {
        asset_type: 'native',
        balance: '10000.5000000',
      },
      {
        asset_type: 'credit_alphanum4',
        asset_code: 'USDC',
        asset_issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        balance: '250.0000000',
      },
      {
        asset_type: 'credit_alphanum4',
        asset_code: 'EURC',
        asset_issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        balance: '75.2500000',
      },
      {
        asset_type: 'credit_alphanum4',
        asset_code: 'UNKNOWN',
        balance: '999.0000000',
      },
    ];

    const result = parseHorizonBalances(lines);
    // 10000.5 XLM = 100,005,000,000 stroops
    expect(result.XLM).toBe(100_005_000_000n);
    // 250 USDC = 2,500,000,000 stroops
    expect(result.USDC).toBe(2_500_000_000n);
    // 75.25 EURC = 752,500,000 stroops
    expect(result.EURC).toBe(752_500_000n);
  });

  it('returns zeroes when balances array is empty', () => {
    const result = parseHorizonBalances([]);
    expect(result.XLM).toBe(0n);
    expect(result.USDC).toBe(0n);
    expect(result.EURC).toBe(0n);
  });
});
