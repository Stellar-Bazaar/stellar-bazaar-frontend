import { describe, it, expect } from 'vitest';
import { formatAssetAmount } from '../utils/format-asset';

describe('formatAssetAmount utility', () => {
  it('formats standard XLM values with suffix', () => {
    // 10 XLM = 100,000,000 stroops
    expect(formatAssetAmount(100_000_000n, 'XLM')).toBe('10.00 XLM');
    // 0.5 XLM = 5,000,000 stroops
    expect(formatAssetAmount(5_000_000n, 'XLM')).toBe('0.50 XLM');
  });

  it('formats USDC values with $ prefix', () => {
    // 2.55 USDC = 25,500,000 stroops
    expect(formatAssetAmount(25_500_000n, 'USDC')).toBe('$2.55');
    // 100 USDC = 1,000,000,000 stroops
    expect(formatAssetAmount(1_000_000_000n, 'USDC')).toBe('$100.00');
  });

  it('formats EURC values with € prefix', () => {
    // 49.99 EURC
    expect(formatAssetAmount(499_900_000n, 'EURC')).toBe('€49.99');
  });

  it('formats large values with thousand separators', () => {
    // 1,000,000 USDC = 10,000,000,000,000 stroops
    expect(formatAssetAmount(10_000_000_000_000n, 'USDC')).toBe('$1,000,000.00');
  });

  it('handles custom min and max decimals', () => {
    // 1.2345678 XLM
    expect(
      formatAssetAmount(12_345_678n, 'XLM', { minDecimals: 4, maxDecimals: 4 })
    ).toBe('1.2345 XLM');
  });

  it('safely handles zero, null, and undefined values', () => {
    expect(formatAssetAmount(0n, 'XLM')).toBe('0.00 XLM');
    expect(formatAssetAmount(null, 'USDC')).toBe('0.00');
    expect(formatAssetAmount(undefined, 'EURC')).toBe('0.00');
    expect(formatAssetAmount('invalid', 'XLM')).toBe('0.00');
  });
});
