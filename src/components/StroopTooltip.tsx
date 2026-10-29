import React, { useState } from 'react';
import { formatAssetAmount } from '../utils/format-asset';

export interface StroopTooltipProps {
  stroops: bigint | number | string;
  showStroopsPrimary?: boolean;
  className?: string;
}

export const StroopTooltip: React.FC<StroopTooltipProps> = ({
  stroops,
  showStroopsPrimary = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  let stroopsBig: bigint;
  try {
    if (typeof stroops === 'bigint') {
      stroopsBig = stroops;
    } else if (typeof stroops === 'number') {
      stroopsBig = BigInt(Math.trunc(stroops));
    } else {
      stroopsBig = BigInt(stroops.toString().trim());
    }
  } catch {
    stroopsBig = 0n;
  }

  const stroopFormatted = stroopsBig.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const xlmFormatted = formatAssetAmount(stroopsBig, 'XLM', { minDecimals: 7, maxDecimals: 7 });

  const primaryText = showStroopsPrimary
    ? `${stroopFormatted} Stroops`
    : formatAssetAmount(stroopsBig, 'XLM', { minDecimals: 2, maxDecimals: 4 });

  return (
    <span
      className={`relative inline-flex items-center gap-1 group cursor-help ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      tabIndex={0}
      role="tooltip"
      aria-label={`${stroopFormatted} Stroops equals ${xlmFormatted}`}
    >
      <span className="font-mono">{primaryText}</span>
      <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/60 px-1 py-0.5 rounded-sm">
        ℹ️
      </span>

      {isOpen && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-900 text-white dark:bg-gray-800 border border-gray-700 text-center rounded-lg shadow-xl text-xs z-30 pointer-events-none"
          role="status"
        >
          <span className="font-mono font-bold block text-blue-300">
            {stroopFormatted} Stroops
          </span>
          <span className="text-[11px] text-gray-300 block mt-0.5">
            = {xlmFormatted}
          </span>
          <span className="text-[10px] text-gray-400 block pt-1 mt-1 border-t border-gray-700/60">
            1 XLM = 10,000,000 Stroops
          </span>
        </span>
      )}
    </span>
  );
};

