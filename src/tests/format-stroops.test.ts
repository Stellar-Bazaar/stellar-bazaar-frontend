import { describe, it, expect } from 'vitest';
import { formatStroops, xlmToStroops } from '../services/validation';

describe('formatStroops helper', () => {
  it('formats zero correctly', () => {
    expect(formatStroops(0)).toBe('0.0000000');
    expect(formatStroops(0n)).toBe('0.0000000');
    expect(formatStroops('0')).toBe('0.0000000');
  });

  it('formats whole XLM amounts correctly', () => {
    expect(formatStroops(10_000_000n)).toBe('1.0000000');
    expect(formatStroops(50_000_000)).toBe('5.0000000');
  });

  it('formats fractional and micro-Stroop amounts', () => {
    expect(formatStroops(1n)).toBe('0.0000001');
    expect(formatStroops(2_500_000n)).toBe('0.2500000');
    expect(formatStroops(12_345_678n)).toBe('1.2345678');
  });

  it('handles negative Stroop amounts', () => {
    expect(formatStroops(-10_000_000n)).toBe('-1.0000000');
    expect(formatStroops(-500_000n)).toBe('-0.0500000');
  });

  it('converts decimal XLM to Stroops correctly', () => {
    expect(xlmToStroops('1')).toBe(10_000_000n);
    expect(xlmToStroops('2.5')).toBe(25_000_000n);
    expect(xlmToStroops('0.0000001')).toBe(1n);
    expect(xlmToStroops('0')).toBe(0n);
  });
});
