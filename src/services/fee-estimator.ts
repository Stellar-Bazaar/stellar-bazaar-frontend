/**
 * Stellar Network Fee Estimation Service
 * Queries Horizon /fee-stats to provide dynamic base fee recommendations based on recent ledger inclusion history.
 */

export interface HorizonFeeStatsResponse {
  last_ledger: string;
  last_ledger_base_fee: string;
  ledger_capacity_usage: string;
  fee_charged: {
    max: string;
    min: string;
    mode: string;
    p10: string;
    p20: string;
    p30: string;
    p40: string;
    p50: string;
    p60: string;
    p70: string;
    p80: string;
    p90: string;
    p95: string;
    p99: string;
  };
}

export interface FeeRecommendation {
  low: number;
  medium: number;
  high: number;
  baseFee: number;
  ledgerCapacityUsage: number;
}

export const FALLBACK_FEE_RECOMMENDATION: FeeRecommendation = {
  low: 100,
  medium: 200,
  high: 500,
  baseFee: 100,
  ledgerCapacityUsage: 0.05,
};

/**
 * Pure parser extracting fee recommendations from Horizon fee-stats payload
 */
export function parseFeeStats(data: Partial<HorizonFeeStatsResponse>): FeeRecommendation {
  if (!data || !data.fee_charged) {
    return FALLBACK_FEE_RECOMMENDATION;
  }

  const base = Number(data.last_ledger_base_fee) || 100;
  const p50 = Number(data.fee_charged.p50) || base;
  const p90 = Number(data.fee_charged.p90) || base * 2;
  const mode = Number(data.fee_charged.mode) || base;
  const capacity = parseFloat(data.ledger_capacity_usage || '0');

  return {
    low: Math.max(base, mode),
    medium: Math.max(base, p50),
    high: Math.max(p50, p90),
    baseFee: base,
    ledgerCapacityUsage: isNaN(capacity) ? 0 : capacity,
  };
}

/**
 * Fetches dynamic fee stats from the target Horizon node
 */
export async function fetchFeeStats(
  horizonUrl: string = 'https://horizon-testnet.stellar.org'
): Promise<FeeRecommendation> {
  try {
    const resp = await fetch(`${horizonUrl.replace(/\/$/, '')}/fee-stats`);
    if (!resp.ok) {
      return FALLBACK_FEE_RECOMMENDATION;
    }
    const data = await resp.json();
    return parseFeeStats(data);
  } catch {
    return FALLBACK_FEE_RECOMMENDATION;
  }
}
