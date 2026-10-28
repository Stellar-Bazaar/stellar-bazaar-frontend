import { AssetCode, getAssetByCode } from '../types/stellar-asset';

export interface FormatAssetOptions {
  includeSymbol?: boolean;
  includeCode?: boolean;
  maxDecimals?: number;
  minDecimals?: number;
  useGrouping?: boolean;
}

/**
 * Formats a 7-decimal stroop integer value into a human-readable asset amount.
 */
export function formatAssetAmount(
  amountStroops: bigint | number | string | null | undefined,
  assetCode: AssetCode | string = 'XLM',
  options: FormatAssetOptions = {}
): string {
  if (amountStroops === null || amountStroops === undefined) {
    return '0.00';
  }

  let stroopsBig: bigint;
  try {
    if (typeof amountStroops === 'bigint') {
      stroopsBig = amountStroops;
    } else if (typeof amountStroops === 'number') {
      stroopsBig = BigInt(Math.trunc(amountStroops));
    } else {
      stroopsBig = BigInt(amountStroops.trim());
    }
  } catch {
    return '0.00';
  }

  const isNegative = stroopsBig < 0n;
  const absStroops = isNegative ? -stroopsBig : stroopsBig;

  const whole = absStroops / 10_000_000n;
  const fraction = absStroops % 10_000_000n;

  const fractionStr = fraction.toString().padStart(7, '0');

  const maxDecimals = options.maxDecimals ?? 4;
  const minDecimals = options.minDecimals ?? 2;

  // Trim to maxDecimals
  let trimmedFraction = fractionStr.slice(0, maxDecimals);

  // Remove trailing zeros down to minDecimals
  while (trimmedFraction.length > minDecimals && trimmedFraction.endsWith('0')) {
    trimmedFraction = trimmedFraction.slice(0, -1);
  }

  // Ensure at least minDecimals
  if (trimmedFraction.length < minDecimals) {
    trimmedFraction = trimmedFraction.padEnd(minDecimals, '0');
  }

  const useGrouping = options.useGrouping ?? true;
  const wholeFormatted = useGrouping
    ? whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : whole.toString();

  const numStr = `${isNegative ? '-' : ''}${wholeFormatted}.${trimmedFraction}`;

  const asset = getAssetByCode(assetCode);
  const includeSymbol = options.includeSymbol ?? true;
  const includeCode = options.includeCode ?? false;

  let prefix = '';
  let suffix = '';

  if (includeSymbol && asset) {
    if (asset.code === 'USDC') {
      prefix = '$';
    } else if (asset.code === 'EURC') {
      prefix = '€';
    } else if (asset.code === 'XLM') {
      suffix = ' XLM';
    }
  }

  if (includeCode && (!suffix || !suffix.includes(assetCode.toUpperCase()))) {
    suffix = ` ${assetCode.toUpperCase()}`;
  }

  return `${prefix}${numStr}${suffix}`;
}
