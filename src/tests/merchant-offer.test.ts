import { describe, it, expect } from 'vitest';
import {
  validateMerchantOffer,
  calculateDiscountBps,
  MerchantOffer,
} from '../types/merchant-offer';

describe('MerchantOffer model & validation', () => {
  const validSeller = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
  const targetPrice = 10_000_000n; // 1.0 XLM
  const circleMaxVol = 500;

  it('validates a correct merchant offer successfully', () => {
    const offer: Partial<MerchantOffer> = {
      sellerAddress: validSeller,
      pricePerUnitStroops: 8_500_000n, // 0.85 XLM (15% discount)
      minVolume: 10,
      maxVolume: 600,
      leadTimeLedgers: 120, // 10 minutes
    };

    const res = validateMerchantOffer(offer, targetPrice, circleMaxVol);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('fails when seller address is invalid Stellar public key', () => {
    const offer: Partial<MerchantOffer> = {
      sellerAddress: '0x123InvalidAddress',
      pricePerUnitStroops: 8_000_000n,
      minVolume: 5,
      maxVolume: 100,
      leadTimeLedgers: 50,
    };

    const res = validateMerchantOffer(offer, targetPrice, circleMaxVol);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('56-character Stellar public key'))).toBe(true);
  });

  it('fails when offer price exceeds target ceiling price', () => {
    const offer: Partial<MerchantOffer> = {
      sellerAddress: validSeller,
      pricePerUnitStroops: 12_000_000n, // 1.2 XLM > 1.0 XLM ceiling
      minVolume: 5,
      maxVolume: 100,
      leadTimeLedgers: 50,
    };

    const res = validateMerchantOffer(offer, targetPrice, circleMaxVol);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('exceed the demand circle target ceiling price'))).toBe(true);
  });

  it('fails when minVolume is greater than maxVolume', () => {
    const offer: Partial<MerchantOffer> = {
      sellerAddress: validSeller,
      pricePerUnitStroops: 9_000_000n,
      minVolume: 200,
      maxVolume: 50,
      leadTimeLedgers: 50,
    };

    const res = validateMerchantOffer(offer, targetPrice, circleMaxVol);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('less than the minimum supply volume'))).toBe(true);
  });

  it('fails when lead time is 0 ledgers', () => {
    const offer: Partial<MerchantOffer> = {
      sellerAddress: validSeller,
      pricePerUnitStroops: 9_000_000n,
      minVolume: 10,
      maxVolume: 50,
      leadTimeLedgers: 0,
    };

    const res = validateMerchantOffer(offer, targetPrice, circleMaxVol);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('lead time must be at least 1 ledger'))).toBe(true);
  });

  it('calculates discount basis points accurately', () => {
    // 10 XLM target, 8 XLM offer => 20% discount = 2000 bps
    expect(calculateDiscountBps(100_000_000n, 80_000_000n)).toBe(2000);

    // 10 XLM target, 9.5 XLM offer => 5% discount = 500 bps
    expect(calculateDiscountBps(100_000_000n, 95_000_000n)).toBe(500);

    // Same price => 0 bps
    expect(calculateDiscountBps(100_000_000n, 100_000_000n)).toBe(0);

    // Higher price => 0 bps
    expect(calculateDiscountBps(100_000_000n, 120_000_000n)).toBe(0);
  });
});

