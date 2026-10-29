import React from 'react';
import { formatAssetAmount } from '../utils/format-asset';

export interface SavingsIndicatorProps {
  savingsPercentage: number;
  savedAmountStroops?: bigint;
  assetCode?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SavingsIndicator: React.FC<SavingsIndicatorProps> = ({
  savingsPercentage,
  savedAmountStroops,
  assetCode = 'XLM',
  size = 'md',
  className = '',
}) => {
  if (savingsPercentage <= 0 && (!savedAmountStroops || savedAmountStroops <= 0n)) {
    return null;
  }

  const formattedSaved = savedAmountStroops
    ? formatAssetAmount(savedAmountStroops)
    : null;

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3.5 py-1.5 space-x-2',
  }[size];

  const pctLabel = `${savingsPercentage.toFixed(1)}%`;

  return (
    <div
      className={`inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/70 text-emerald-300 shadow-sm shadow-emerald-500/20 font-semibold ${sizeStyles} ${className} select-none`}
      data-testid="savings-indicator"
    >
      {/* Upward savings sparkline arrow */}
      <svg
        className="w-3.5 h-3.5 shrink-0 text-emerald-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>

      <span className="font-bold tracking-tight">{pctLabel} Saved</span>

      {formattedSaved && (
        <span className="font-mono text-emerald-200/90 text-[11px] pl-1 border-l border-emerald-700/60">
          +{formattedSaved} {assetCode}
        </span>
      )}
    </div>
  );
};

