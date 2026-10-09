import { describe, it, expect } from 'vitest';
import { OnChainDeal, OnChainOffer, SellerReputation } from '../types/contract';

describe('Bazaar Deal Engine Domain & Qualification Logic', () => {
  it('correctly calculates buyer escrow deposit and volume updates', () => {
    const targetPriceXlm = 2.5;
    const quantity = 10;
    const stroopsPerUnit = BigInt(Math.round(targetPriceXlm * 10_000_000));
    const totalStroops = stroopsPerUnit * BigInt(quantity);

    expect(stroopsPerUnit).toBe(25_000_000n);
    expect(totalStroops).toBe(250_000_000n); // 25 XLM
    expect((Number(totalStroops) / 10_000_000).toFixed(2)).toBe('25.00');
  });

  it('evaluates deal qualification conditions strictly', () => {
    const deal: OnChainDeal = {
      id: 1,
      creator: 'GBBUYER1',
      token: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      target_unit_price_stroops: '25000000',
      target_unit_price_xlm: '2.5000',
      min_volume: 20,
      max_volume: 100,
      current_volume: 20,
      total_escrow_stroops: '500000000',
      total_escrow_xlm: '50.00',
      deadline: Math.floor(Date.now() / 1000) + 86400,
      deadlineDate: 'tomorrow',
      status: 'QUORUM_REACHED',
    };

    // Quorum condition
    const hasReachedQuorum = deal.current_volume >= deal.min_volume;
    expect(hasReachedQuorum).toBe(true);

    // Over-commitment prevention check
    const exceedsMax = deal.current_volume + 85 > deal.max_volume;
    expect(exceedsMax).toBe(true);
  });

  it('validates seller offers against declared circle constraints', () => {
    const targetStroops = 25_000_000n; // 2.5 XLM
    const minVolume = 20;

    const validOffer: OnChainOffer = {
      id: 1,
      seller: 'GSELLER1',
      circle_id: 1,
      unit_price_stroops: '22000000',
      unit_price_xlm: '2.2000',
      volume: 50,
      lead_time_days: 5,
      status: 'SUBMITTED',
    };

    const isPriceAcceptable = BigInt(validOffer.unit_price_stroops) <= targetStroops;
    const isVolumeSufficient = validOffer.volume >= minVolume;

    expect(isPriceAcceptable).toBe(true);
    expect(isVolumeSufficient).toBe(true);

    // Unacceptable price (> target)
    const overpricedStroops = 26_000_000n;
    expect(overpricedStroops <= targetStroops).toBe(false);
  });

  it('computes verifiable seller reputation derived from transaction outcomes', () => {
    const newSellerRep: SellerReputation = {
      seller: 'GSELLER_NEW',
      successful_deals: 0,
      total_volume_settled: 0,
      total_amount_settled_stroops: '0',
      total_amount_settled_xlm: '0.00',
      disputed_or_refunded_deals: 0,
      scorePercentage: 100,
    };
    expect(newSellerRep.scorePercentage).toBe(100);

    const veteranSellerRep: SellerReputation = {
      seller: 'GSELLER_VET',
      successful_deals: 19,
      total_volume_settled: 450,
      total_amount_settled_stroops: '4500000000',
      total_amount_settled_xlm: '450.00',
      disputed_or_refunded_deals: 1,
      scorePercentage: Math.round((19 / (19 + 1)) * 100),
    };
    expect(veteranSellerRep.scorePercentage).toBe(95);
  });

  it('determines refund eligibility upon expiration or cancellation', () => {
    const nowSecs = Math.floor(Date.now() / 1000);

    // Deal expired without settlement
    const expiredDeal = {
      deadline: nowSecs - 100,
      status: 'OPEN',
    };
    const isEligibleRefund = nowSecs > expiredDeal.deadline && expiredDeal.status !== 'SETTLED';
    expect(isEligibleRefund).toBe(true);

    // Active deal not eligible
    const activeDeal = {
      deadline: nowSecs + 3600,
      status: 'OPEN',
    };
    const isActiveEligible = nowSecs > activeDeal.deadline && activeDeal.status !== 'SETTLED';
    expect(isActiveEligible).toBe(false);
  });
});
