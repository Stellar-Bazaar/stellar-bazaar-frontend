/**
 * Cooperative savings calculator for Stellar Bazaar demand circles.
 * Performs lossless BigInt stroop arithmetic for retail ceilings, wholesale bids,
 * protocol fee deductions, and net buyer surplus rebate distribution.
 */

export interface CircleSavingsAnalysis {
  totalRetailStroops: bigint;
  totalWholesaleStroops: bigint;
  grossSavingsStroops: bigint;
  protocolFeeStroops: bigint;
  netSurplusPoolStroops: bigint;
  savingsPercentage: number;
}

export interface BuyerSavingsBreakdown {
  buyerCommittedUnits: number;
  buyerDepositStroops: bigint;
  buyerActualCostStroops: bigint;
  buyerSurplusRebateStroops: bigint;
  buyerSavingsPercentage: number;
}

/**
 * Calculates circle-wide aggregate savings metrics.
 */
export function calculateCircleSavings(
  targetUnitPriceStroops: bigint,
  acceptedUnitPriceStroops: bigint,
  totalSettledUnits: number,
  protocolFeeBps: number = 100 // 100 bps = 1%
): CircleSavingsAnalysis {
  if (totalSettledUnits <= 0 || targetUnitPriceStroops <= 0n) {
    return {
      totalRetailStroops: 0n,
      totalWholesaleStroops: 0n,
      grossSavingsStroops: 0n,
      protocolFeeStroops: 0n,
      netSurplusPoolStroops: 0n,
      savingsPercentage: 0,
    };
  }

  const unitsBigInt = BigInt(totalSettledUnits);
  const totalRetailStroops = targetUnitPriceStroops * unitsBigInt;

  // If accepted price is greater than or equal to target, no savings
  if (acceptedUnitPriceStroops >= targetUnitPriceStroops) {
    const totalWholesaleStroops = acceptedUnitPriceStroops * unitsBigInt;
    return {
      totalRetailStroops,
      totalWholesaleStroops,
      grossSavingsStroops: 0n,
      protocolFeeStroops: 0n,
      netSurplusPoolStroops: 0n,
      savingsPercentage: 0,
    };
  }

  const totalWholesaleStroops = acceptedUnitPriceStroops * unitsBigInt;
  const grossSavingsStroops = totalRetailStroops - totalWholesaleStroops;

  // Protocol fee on settled deal volume
  const feeBpsBigInt = BigInt(Math.max(0, protocolFeeBps));
  const protocolFeeStroops = (totalWholesaleStroops * feeBpsBigInt) / 10_000n;

  // Net surplus pool available for buyer rebates
  const netSurplusPoolStroops = grossSavingsStroops;

  const pct = Number((grossSavingsStroops * 10_000n) / totalRetailStroops) / 100;

  return {
    totalRetailStroops,
    totalWholesaleStroops,
    grossSavingsStroops,
    protocolFeeStroops,
    netSurplusPoolStroops,
    savingsPercentage: pct,
  };
}

/**
 * Calculates a specific buyer's individual surplus rebate and savings breakdown.
 */
export function calculateBuyerSavings(
  targetUnitPriceStroops: bigint,
  acceptedUnitPriceStroops: bigint,
  buyerCommittedUnits: number
): BuyerSavingsBreakdown {
  if (buyerCommittedUnits <= 0 || targetUnitPriceStroops <= 0n) {
    return {
      buyerCommittedUnits: 0,
      buyerDepositStroops: 0n,
      buyerActualCostStroops: 0n,
      buyerSurplusRebateStroops: 0n,
      buyerSavingsPercentage: 0,
    };
  }

  const units = BigInt(buyerCommittedUnits);
  const buyerDepositStroops = targetUnitPriceStroops * units;

  if (acceptedUnitPriceStroops >= targetUnitPriceStroops) {
    return {
      buyerCommittedUnits,
      buyerDepositStroops,
      buyerActualCostStroops: buyerDepositStroops,
      buyerSurplusRebateStroops: 0n,
      buyerSavingsPercentage: 0,
    };
  }

  const buyerActualCostStroops = acceptedUnitPriceStroops * units;
  const buyerSurplusRebateStroops = buyerDepositStroops - buyerActualCostStroops;

  const pct = Number((buyerSurplusRebateStroops * 10_000n) / buyerDepositStroops) / 100;

  return {
    buyerCommittedUnits,
    buyerDepositStroops,
    buyerActualCostStroops,
    buyerSurplusRebateStroops,
    buyerSavingsPercentage: pct,
  };
}

