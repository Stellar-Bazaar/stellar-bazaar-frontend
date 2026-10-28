import { describe, it, expect } from 'vitest';
import { TransactionBanner } from '../components/TransactionBanner';

describe('TransactionBanner component', () => {
  it('is exported as a defined React component', () => {
    expect(TransactionBanner).toBeDefined();
    expect(typeof TransactionBanner).toBe('function');
  });
});
