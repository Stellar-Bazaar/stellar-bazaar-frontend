import { describe, it, expect } from 'vitest';
import { parseAssetAmount } from '../utils/parse-asset';
import { formatAssetAmount } from '../utils/format-asset';

describe('parseAssetAmount utility', () => {
  it('parses whole number strings into 7-decimal stroops', () => {
    expect(parseAssetAmount('1')).toBe(10_000_000n);
    expect(parseAssetAmount('100')).toBe(1_000_000_000n);
    expect(parseAssetAmount('0')).toBe(0n);
  });

  it('parses fractional decimal strings with full precision', () => {
    expect(parseAssetAmount('0.1')).toBe(1_000_000n);
    expect(parseAssetAmount('0.0000001')).toBe(1n);
    expect(parseAssetAmount('49.99')).toBe(499_900_000n);
    expect(parseAssetAmount('2.5500000')).toBe(25_500_000n);
  });

  it('strips currency symbols and commas cleanly', () => {
    expect(parseAssetAmount('$1,250.00')).toBe(12_500_000_000n);
    expect(parseAssetAmount('€50.25')).toBe(502_500_000n);
    expect(parseAssetAmount('100.00 XLM')).toBe(1_000_000_000n);
  });

  it('rejects more than 7 decimal places', () => {
    expect(() => parseAssetAmount('1.12345678')).toThrow(
      /maximum 7 decimal places/
    );
  });

  it('rejects negative numbers and invalid strings', () => {
    expect(() => parseAssetAmount('-50')).toThrow(/cannot be negative/);
    expect(() => parseAssetAmount('1.2.3')).toThrow(/multiple decimal points/);
    expect(() => parseAssetAmount('abc')).toThrow(/Invalid whole amount digits/);
    expect(() => parseAssetAmount('')).toThrow(/non-empty string/);
  });

  it('demonstrates exact roundtrip parity with formatAssetAmount', () => {
    const originalStroops = 750_250_000n; // 75.025 XLM
    const formatted = formatAssetAmount(originalStroops, 'XLM', { minDecimals: 3, maxDecimals: 3 });
    const parsed = parseAssetAmount(formatted);
    expect(parsed).toBe(originalStroops);
  });
});
