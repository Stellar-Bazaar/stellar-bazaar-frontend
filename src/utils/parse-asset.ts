/**
 * Safely parses human-readable currency strings into 7-decimal stroop BigInt
 * without floating-point precision loss.
 */

export function parseAssetAmount(input: string): bigint {
  if (!input || typeof input !== 'string') {
    throw new Error('Asset amount input must be a non-empty string');
  }

  // Strip common symbols, commas, and whitespace
  const sanitized = input
    .replace(/[$,€\s]/g, '')
    .replace(/XLM|USDC|EURC/gi, '')
    .trim();

  if (!sanitized) {
    throw new Error('Invalid empty asset amount');
  }

  if (sanitized.startsWith('-')) {
    throw new Error('Asset amount cannot be negative');
  }

  const parts = sanitized.split('.');
  if (parts.length > 2) {
    throw new Error('Invalid number format: multiple decimal points');
  }

  const wholeStr = parts[0] || '0';
  const fracStr = parts[1] || '';

  if (!/^\d+$/.test(wholeStr)) {
    throw new Error(`Invalid whole amount digits: "${wholeStr}"`);
  }

  if (fracStr && !/^\d+$/.test(fracStr)) {
    throw new Error(`Invalid decimal digits: "${fracStr}"`);
  }

  if (fracStr.length > 7) {
    throw new Error(
      `Stellar assets support maximum 7 decimal places, received ${fracStr.length}`
    );
  }

  const paddedFrac = fracStr.padEnd(7, '0');

  const wholeBig = BigInt(wholeStr);
  const fracBig = BigInt(paddedFrac);

  return wholeBig * 10_000_000n + fracBig;
}
