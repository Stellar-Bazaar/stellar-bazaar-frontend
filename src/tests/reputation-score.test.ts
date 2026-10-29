import { describe, it, expect } from 'vitest';
import { calculateReputationScore } from '../utils/reputation-score';

describe('calculateReputationScore', () => {
  it('returns baseline novice analysis when merchant has 0 deals', () => {
    const res = calculateReputationScore({
      successfulDeals: 0,
      totalVolumeUnits: 0,
      disputedDeals: 0,
      resolvedInFavor: 0,
    });

    expect(res.score).toBe(50);
    expect(res.tier).toBe('NOVICE');
    expect(res.tierLabel).toBe('Novice Merchant');
    expect(res.fulfillmentRate).toBe(100);
    expect(res.disputeRate).toBe(0);
  });

  it('assigns Sovereign Merchant tier for high-volume flawless track record', () => {
    const res = calculateReputationScore({
      successfulDeals: 25,
      totalVolumeUnits: 3000,
      disputedDeals: 0,
      resolvedInFavor: 0,
    });

    expect(res.score).toBeGreaterThanOrEqual(90);
    expect(res.tier).toBe('SOVEREIGN_MERCHANT');
    expect(res.fulfillmentRate).toBe(100);
    expect(res.tierColor).toBe('#06b6d4');
  });

  it('assigns Top Trader tier for moderate successful activity', () => {
    const res = calculateReputationScore({
      successfulDeals: 8,
      totalVolumeUnits: 600,
      disputedDeals: 0,
      resolvedInFavor: 0,
    });

    expect(res.score).toBeGreaterThanOrEqual(75);
    expect(res.tier).toBe('TOP_TRADER');
  });

  it('applies dispute penalty when merchant has unresolved disputes', () => {
    const pristine = calculateReputationScore({
      successfulDeals: 10,
      totalVolumeUnits: 500,
      disputedDeals: 0,
      resolvedInFavor: 0,
    });

    const withDisputes = calculateReputationScore({
      successfulDeals: 10,
      totalVolumeUnits: 500,
      disputedDeals: 3,
      resolvedInFavor: 0,
    });

    expect(withDisputes.score).toBeLessThan(pristine.score);
    expect(withDisputes.disputeRate).toBeGreaterThan(0);
  });

  it('mitigates dispute penalty when dispute was resolved in favor of seller', () => {
    const withUnresolved = calculateReputationScore({
      successfulDeals: 10,
      totalVolumeUnits: 500,
      disputedDeals: 2,
      resolvedInFavor: 0,
    });

    const withResolvedInFavor = calculateReputationScore({
      successfulDeals: 10,
      totalVolumeUnits: 500,
      disputedDeals: 2,
      resolvedInFavor: 2, // Arbitrator found buyer claim invalid
    });

    expect(withResolvedInFavor.score).toBeGreaterThan(withUnresolved.score);
  });
});

