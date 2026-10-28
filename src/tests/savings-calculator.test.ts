import { describe, it, expect } from 'vitest';
import {
  calculateCircleSavings,
  calculateBuyerSavings,
} from '../utils/savings-calculator';

describe('savings-calculator', () => {
  const targetPrice = 10_000_000n; // 1.0 XLM
  const wholesalePrice = 8_000_000n; // 0.8 XLM (20% discount)

  describe('calculateCircleSavings', () => {
    it('calculates aggregate savings accurately across 1000 units', () => {
      // 1000 units * 1.0 XLM = 10,000,000,000 stroops (1000 XLM)
      // 1000 units * 0.8 XLM = 8,000,000,000 stroops (800 XLM)
      // Gross savings = 2,000,000,000 stroops (200 XLM) = 20%
      // Protocol fee (100 bps = 1%) on 800 XLM = 80,000,000 stroops (8 XLM)
      const res = calculateCircleSavings(targetPrice, wholesalePrice, 1000, 100);

      expect(res.totalRetailStroops).toBe(10_000_000_000n);
      expect(res.totalWholesaleStroops).toBe(8_000_000_000n);
      expect(res.grossSavingsStroops).toBe(2_000_000_000n);
      expect(res.protocolFeeStroops).toBe(80_000_000n);
      expect(res.savingsPercentage).toBe(20);
    });

    it('returns zero savings when clearing price equals target ceiling', () => {
      const res = calculateCircleSavings(targetPrice, targetPrice, 500);

      expect(res.grossSavingsStroops).toBe(0n);
      expect(res.savingsPercentage).toBe(0);
      expect(res.protocolFeeStroops).toBe(0n);
    });

    it('handles zero settled units safely', () => {
      const res = calculateCircleSavings(targetPrice, wholesalePrice, 0);
      expect(res.grossSavingsStroops).toBe(0n);
      expect(res.savingsPercentage).toBe(0);
    });
  });

  describe('calculateBuyerSavings', () => {
    it('calculates individual buyer rebate and actual cost accurately', () => {
      // Buyer committed 50 units
      // Deposited: 50 * 1.0 XLM = 500,000,000 stroops
      // Actual cost: 50 * 0.8 XLM = 400,000,000 stroops
      // Rebate: 100,000,000 stroops (10 XLM) = 20%
      const res = calculateBuyerSavings(targetPrice, wholesalePrice, 50);

      expect(res.buyerCommittedUnits).toBe(50);
      expect(res.buyerDepositStroops).toBe(500_000_000n);
      expect(res.buyerActualCostStroops).toBe(400_000_000n);
      expect(res.buyerSurplusRebateStroops).toBe(100_000_000n);
      expect(res.buyerSavingsPercentage).toBe(20);
    });

    it('returns zero rebate when clearing price matches deposit price', () => {
      const res = calculateBuyerSavings(targetPrice, targetPrice, 50);

      expect(res.buyerSurplusRebateStroops).toBe(0n);
      expect(res.buyerSavingsPercentage).toBe(0);
      expect(res.buyerActualCostStroops).toBe(res.buyerDepositStroops);
    });

    it('handles zero committed units safely', () => {
      const res = calculateBuyerSavings(targetPrice, wholesalePrice, 0);
      expect(res.buyerSurplusRebateStroops).toBe(0n);
      expect(res.buyerSavingsPercentage).toBe(0);
    });
  });
});
