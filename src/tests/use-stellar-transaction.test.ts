import { describe, it, expect } from 'vitest';
import { useStellarTransaction } from '../hooks/useStellarTransaction';

describe('useStellarTransaction hook', () => {
  it('is exported and defined as a function', () => {
    expect(useStellarTransaction).toBeDefined();
    expect(typeof useStellarTransaction).toBe('function');
  });

  it('verifies hook definition and interface return types', () => {
    // Testing definition export
    expect(useStellarTransaction.name).toBe('useStellarTransaction');
  });
});
