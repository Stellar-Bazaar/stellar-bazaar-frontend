import React from 'react';
import {
  calculateReputationScore,
  SellerStats,
  ReputationTier,
} from '../utils/reputation-score';

export interface ReputationBadgeProps {
  stats: SellerStats;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  stats,
  showScore = true,
  size = 'md',
  className = '',
}) => {
  const analysis = calculateReputationScore(stats);

  const getTierStyles = (tier: ReputationTier) => {
    switch (tier) {
      case 'SOVEREIGN_MERCHANT':
        return {
          bg: 'bg-cyan-950/80',
          border: 'border-cyan-500/80',
          text: 'text-cyan-300',
          glow: 'shadow-sm shadow-cyan-500/30',
        };
      case 'TOP_TRADER':
        return {
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-500/80',
          text: 'text-emerald-300',
          glow: 'shadow-sm shadow-emerald-500/30',
        };
      case 'VERIFIED':
        return {
          bg: 'bg-blue-950/80',
          border: 'border-blue-500/80',
          text: 'text-blue-300',
          glow: '',
        };
      case 'NOVICE':
      default:
        return {
          bg: 'bg-slate-800/80',
          border: 'border-slate-700/80',
          text: 'text-slate-400',
          glow: '',
        };
    }
  };

  const style = getTierStyles(analysis.tier);
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3.5 py-1.5 space-x-2',
  }[size];

  const tooltipText = `${analysis.tierLabel} • Score: ${analysis.score}/100 • ${stats.successfulDeals} deals (${analysis.fulfillmentRate}% fulfillment)`;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style.bg} ${style.border} ${style.text} ${style.glow} ${sizeClasses} ${className} transition select-none`}
      title={tooltipText}
      aria-label={tooltipText}
      data-testid="reputation-badge"
    >
      {/* Dynamic Tier Icon */}
      {analysis.tier === 'SOVEREIGN_MERCHANT' && (
        <svg className="w-3.5 h-3.5 shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
        </svg>
      )}
      {analysis.tier === 'TOP_TRADER' && (
        <svg className="w-3.5 h-3.5 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {analysis.tier === 'VERIFIED' && (
        <svg className="w-3.5 h-3.5 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {analysis.tier === 'NOVICE' && (
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      )}

      <span>{analysis.tierLabel}</span>

      {showScore && (
        <span className="font-mono opacity-80 pl-0.5">
          {analysis.score}
        </span>
      )}
    </span>
  );
};

