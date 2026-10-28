import { StrKey } from '@stellar/stellar-sdk';
import { PaymentFormValues, PaymentValidationErrors } from '../types/payment';

export const STELLAR_BASE_FEE_STROOPS = '100';
export const STELLAR_BASE_RESERVE_XLM = 1.0; // Standard Stellar minimum account reserve
export const MAX_STELLAR_DECIMALS = 7;

/**
 * Validates a Stellar Public Address (G...) using official Stellar StrKey checksum.
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  if (trimmed.length !== 56 || !trimmed.startsWith('G')) return false;
  return StrKey.isValidEd25519PublicKey(trimmed);
}

/**
 * Validates an XLM payment amount string.
 */
export function validateAmount(
  amountStr: string,
  currentBalanceXlm?: number
): { isValid: boolean; error?: string; parsedAmount?: number } {
  if (!amountStr || !amountStr.trim()) {
    return { isValid: false, error: 'Payment amount is required.' };
  }

  const trimmed = amountStr.trim();
  const num = Number(trimmed);

  if (isNaN(num)) {
    return { isValid: false, error: 'Amount must be a valid number.' };
  }

  if (num <= 0) {
    return { isValid: false, error: 'Amount must be strictly greater than 0 XLM.' };
  }

  // Check precision: Stellar supports up to 7 decimal places (1 stroop = 0.0000001 XLM)
  const parts = trimmed.split('.');
  if (parts.length > 2) {
    return { isValid: false, error: 'Invalid number format.' };
  }
  if (parts.length === 2 && parts[1].length > MAX_STELLAR_DECIMALS) {
    return {
      isValid: false,
      error: `Amount exceeds maximum precision of ${MAX_STELLAR_DECIMALS} decimal places.`,
    };
  }

  if (currentBalanceXlm !== undefined) {
    const maxSendable = Math.max(0, currentBalanceXlm - STELLAR_BASE_RESERVE_XLM);

    if (num > maxSendable) {
      return {
        isValid: false,
        error: `Insufficient spendable balance. You have ${currentBalanceXlm.toFixed(
          4
        )} XLM, but ${STELLAR_BASE_RESERVE_XLM} XLM is reserved for base account storage. Max sendable is ${maxSendable.toFixed(
          4
        )} XLM.`,
      };
    }
  }

  return { isValid: true, parsedAmount: num };
}

/**
 * Validates memo text length.
 */
export function validateMemo(memo: string): { isValid: boolean; error?: string } {
  if (!memo) return { isValid: true };
  const byteLength = new TextEncoder().encode(memo).length;
  if (byteLength > 28) {
    return {
      isValid: false,
      error: `Memo exceeds maximum length of 28 bytes (currently ${byteLength} bytes).`,
    };
  }
  return { isValid: true };
}

/**
 * Validates full payment form input against business rules.
 */
export function validatePaymentForm(
  values: PaymentFormValues,
  sourceAddress?: string | null,
  currentBalanceXlm?: number
): { isValid: boolean; errors: PaymentValidationErrors } {
  const errors: PaymentValidationErrors = {};

  // Destination address validation
  if (!values.destinationAddress || !values.destinationAddress.trim()) {
    errors.destinationAddress = 'Recipient Stellar address is required.';
  } else if (!isValidStellarAddress(values.destinationAddress)) {
    errors.destinationAddress = 'Invalid Stellar public address (must start with "G" and be 56 characters).';
  } else if (sourceAddress && values.destinationAddress.trim() === sourceAddress.trim()) {
    errors.destinationAddress = 'Destination address cannot be your own wallet address.';
  }

  // Amount validation
  const amountCheck = validateAmount(values.amount, currentBalanceXlm);
  if (!amountCheck.isValid) {
    errors.amount = amountCheck.error;
  }

  // Memo validation
  if (values.memo) {
    const memoCheck = validateMemo(values.memo);
    if (!memoCheck.isValid) {
      errors.memo = memoCheck.error;
    }
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}

/**
 * Formats a Stellar public key into a readable shortened form (e.g., GABC...XYZ).
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}


export const STROOPS_PER_XLM = 10_000_000n;

/**
 * Formats an amount in Stroops (10^-7 XLM) into a human-readable decimal XLM string.
 * Handles zero, fractional, and large amounts accurately using BigInt.
 */
export function formatStroops(stroops: bigint | number | string): string {
  const bigStroops = typeof stroops === 'bigint' ? stroops : BigInt(Math.floor(Number(stroops) || 0));
  if (bigStroops === 0n) return '0.0000000';
  const isNegative = bigStroops < 0n;
  const abs = isNegative ? -bigStroops : bigStroops;
  const whole = abs / STROOPS_PER_XLM;
  const fraction = abs % STROOPS_PER_XLM;
  const fractionStr = fraction.toString().padStart(7, '0');
  return `${isNegative ? '-' : ''}${whole.toString()}.${fractionStr}`;
}

/**
 * Converts a decimal XLM string into integer Stroops (bigint).
 */
export function xlmToStroops(xlmStr: string): bigint {
  const trimmed = (xlmStr || '0').trim();
  const [whole = '0', fraction = ''] = trimmed.split('.');
  const paddedFraction = (fraction + '0000000').slice(0, 7);
  const total = BigInt(whole) * STROOPS_PER_XLM + BigInt(paddedFraction);
  return total;
}


/**
 * Validates seller quote lead time in days.
 * Must be a positive integer between 1 and 365 days.
 */
export function validateLeadTimeDays(leadTimeDays: number | string): {
  isValid: boolean;
  error?: string;
  parsedDays?: number;
} {
  const num = typeof leadTimeDays === 'number' ? leadTimeDays : parseInt(String(leadTimeDays).trim(), 10);
  if (isNaN(num)) {
    return { isValid: false, error: 'Lead time must be a valid integer.' };
  }
  if (num <= 0) {
    return { isValid: false, error: 'Lead time must be strictly greater than 0 days.' };
  }
  if (num > 365) {
    return { isValid: false, error: 'Lead time cannot exceed 365 days.' };
  }
  return { isValid: true, parsedDays: num };
}
