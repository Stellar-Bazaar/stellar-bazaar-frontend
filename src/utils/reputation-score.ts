/**
 * Seller reputation scoring and tier calculation engine for Stellar Bazaar.
 * Weights on-chain Soroban deal completion, escrow volume, and dispute records.
 */

export type ReputationTier =
  | 'NOVICE'
  | 'VERIFIED'
  | 'TOP_TRADER'
  | 'SOVEREIGN_MERCHANT';

export interface SellerStats {
  successfulDeals: number;
  totalVolumeUnits: number;
  disputedDeals: number;
  resolvedInFavor: number;
}

export interface ReputationAnalysis {
  score: number; // 0 - 100
  tier: ReputationTier;
  tierLabel: string;
  fulfillmentRate: number; // 0 - 100%
  disputeRate: number; // 0 - 100%
  tierColor: string;
}

export function calculateReputationScore(stats: SellerStats): ReputationAnalysis {
  const { successfulDeals, totalVolumeUnits, disputedDeals, resolvedInFavor } = stats;
  const totalDeals = successfulDeals + disputedDeals;

  if (totalDeals === 0) {
    return {
      score: 50,
      tier: 'NOVICE',
      tierLabel: 'Novice Merchant',
      fulfillmentRate: 100,
      disputeRate: 0,
      tierColor: '#94a3b8', // slate
    };
  }

  // Base fulfillment rate (0 - 70 points contribution)
  const fulfillmentRate = (successfulDeals / totalDeals) * 100;
  let basePoints = (fulfillmentRate * 0.7);

  // Dispute mitigation: If disputes were resolved in seller's favor, recover half penalty
  const unresolvedDisputes = Math.max(0, disputedDeals - resolvedInFavor);
  const disputePenalty = unresolvedDisputes * 15;
  basePoints = Math.max(0, basePoints - disputePenalty);

  // Volume bonus (0 - 20 points contribution)
  let volumePoints = 0;
  if (totalVolumeUnits >= 2500) {
    volumePoints = 20;
  } else if (totalVolumeUnits >= 500) {
    volumePoints = 14;
  } else if (totalVolumeUnits >= 100) {
    volumePoints = 8;
  } else if (totalVolumeUnits > 0) {
    volumePoints = 3;
  }

  // Experience bonus (0 - 10 points contribution)
  const experiencePoints = Math.min(10, successfulDeals * 0.5);

  const rawScore = Math.round(basePoints + volumePoints + experiencePoints);
  const score = Math.min(100, Math.max(0, rawScore));

  const disputeRate = (disputedDeals / totalDeals) * 100;

  // Determine tier based on score, deal volume, and faultless delivery
  let tier: ReputationTier = 'NOVICE';
  let tierLabel = 'Novice Merchant';
  let tierColor = '#94a3b8';

  if (score >= 90 && successfulDeals >= 20 && unresolvedDisputes === 0) {
    tier = 'SOVEREIGN_MERCHANT';
    tierLabel = 'Sovereign Merchant';
    tierColor = '#06b6d4'; // neon cyan
  } else if (score >= 75 && successfulDeals >= 5) {
    tier = 'TOP_TRADER';
    tierLabel = 'Top Trader';
    tierColor = '#10b981'; // emerald
  } else if (score >= 60 && successfulDeals >= 1) {
    tier = 'VERIFIED';
    tierLabel = 'Verified Merchant';
    tierColor = '#3b82f6'; // blue
  }

  return {
    score,
    tier,
    tierLabel,
    fulfillmentRate: Math.round(fulfillmentRate * 10) / 10,
    disputeRate: Math.round(disputeRate * 10) / 10,
    tierColor,
  };
}
