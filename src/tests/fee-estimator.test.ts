import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseFeeStats,
  fetchFeeStats,
  FALLBACK_FEE_RECOMMENDATION,
  HorizonFeeStatsResponse,
} from '../services/fee-estimator';

describe('fee-estimator service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly parses realistic Horizon fee stats payload', () => {
    const mockData: Partial<HorizonFeeStatsResponse> = {
      last_ledger: '142050',
      last_ledger_base_fee: '100',
      ledger_capacity_usage: '0.45',
      fee_charged: {
        min: '100',
        max: '50000',
        mode: '100',
        p10: '100',
        p20: '100',
        p30: '100',
        p40: '100',
        p50: '150',
        p60: '200',
        p70: '250',
        p80: '300',
        p90: '500',
        p95: '1000',
        p99: '5000',
      },
    };

    const rec = parseFeeStats(mockData);
    expect(rec.baseFee).toBe(100);
    expect(rec.low).toBe(100);
    expect(rec.medium).toBe(150);
    expect(rec.high).toBe(500);
    expect(rec.ledgerCapacityUsage).toBe(0.45);
  });

  it('falls back to safe defaults on empty or invalid payload', () => {
    const rec = parseFeeStats({});
    expect(rec.baseFee).toBe(FALLBACK_FEE_RECOMMENDATION.baseFee);
    expect(rec.low).toBe(FALLBACK_FEE_RECOMMENDATION.low);
    expect(rec.medium).toBe(FALLBACK_FEE_RECOMMENDATION.medium);
    expect(rec.high).toBe(FALLBACK_FEE_RECOMMENDATION.high);
  });

  it('fetches fee stats over HTTP when endpoint is available', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        last_ledger_base_fee: '100',
        fee_charged: { mode: '100', p50: '250', p90: '800' },
      }),
    } as Response);

    const rec = await fetchFeeStats('https://horizon-testnet.stellar.org');
    expect(rec.medium).toBe(250);
    expect(rec.high).toBe(800);
  });

  it('returns fallback gracefully on HTTP error or network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network timeout'));

    const rec = await fetchFeeStats('https://horizon-testnet.stellar.org');
    expect(rec.low).toBe(FALLBACK_FEE_RECOMMENDATION.low);
    expect(rec.medium).toBe(FALLBACK_FEE_RECOMMENDATION.medium);
  });
});

