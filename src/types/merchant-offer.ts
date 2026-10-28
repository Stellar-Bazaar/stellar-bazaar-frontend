/**
 * Domain model and validation logic for Stellar Bazaar merchant offers.
 * Ensures offers conform to Soroban smart contract constraints (Bazaar Deal Engine).
 */

export interface MerchantOffer {
  id: string;
  circleId: string;
  sellerAddress: string;
  pricePerUnitStroops: bigint;
  minVolume: number;
  maxVolume: number;
  leadTimeLedgers: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: number;
}

export interface ValidateOfferResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a proposed merchant offer against smart contract constraints and circle parameters.
 */
export function validateMerchantOffer(
  offer: Partial<MerchantOffer>,
  targetPriceStroops: bigint,
  circleMaxVolume: number
): ValidateOfferResult {
  const errors: string[] = [];

  // Seller address validation (Stellar G-address format)
  if (!offer.sellerAddress || !/^G[A-Z0-9]{55}$/.test(offer.sellerAddress)) {
    errors.push('Seller address must be a valid 56-character Stellar public key (starting with G).');
  }

  // Price validation
  if (offer.pricePerUnitStroops === undefined || offer.pricePerUnitStroops <= 0n) {
    errors.push('Offer price per unit must be greater than 0 stroops.');
  } else if (targetPriceStroops > 0n && offer.pricePerUnitStroops > targetPriceStroops) {
    errors.push('Offer price cannot exceed the demand circle target ceiling price.');
  }

  // Volume range validation
  if (!offer.minVolume || offer.minVolume <= 0) {
    errors.push('Minimum supply volume must be at least 1 unit.');
  }

  if (!offer.maxVolume || offer.maxVolume <= 0) {
    errors.push('Maximum supply volume must be at least 1 unit.');
  } else if (offer.minVolume && offer.maxVolume < offer.minVolume) {
    errors.push('Maximum supply volume cannot be less than the minimum supply volume.');
  }

  if (circleMaxVolume > 0 && offer.maxVolume && offer.maxVolume > circleMaxVolume * 2) {
    errors.push(`Maximum supply volume exceeds reasonable circle parameters (limit: ${circleMaxVolume * 2}).`);
  }

  // Lead time validation
  if (offer.leadTimeLedgers === undefined || offer.leadTimeLedgers <= 0) {
    errors.push('Fulfillment lead time must be at least 1 ledger (~5 seconds).');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates discount in basis points (1 bps = 0.01%) relative to target price.
 */
export function calculateDiscountBps(
  targetPriceStroops: bigint,
  offerPriceStroops: bigint
): number {
  if (targetPriceStroops <= 0n || offerPriceStroops >= targetPriceStroops) {
    return 0;
  }
  const delta = targetPriceStroops - offerPriceStroops;
  const bps = (delta * 10_000n) / targetPriceStroops;
  return Number(bps);
}
