import React, { useState, useEffect } from 'react';

export interface InspectionTimerProps {
  inspectionEndTimestamp: number; // Unix seconds or milliseconds
  onConfirmEarly?: () => void;
  onRaiseDispute?: () => void;
  isConfirming?: boolean;
  className?: string;
}

export function formatRemainingTime(secondsRemaining: number): string {
  if (secondsRemaining <= 0) {
    return 'Inspection Expired (Settlement Ready)';
  }

  const days = Math.floor(secondsRemaining / 86400);
  const hours = Math.floor((secondsRemaining % 86400) / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

export const InspectionTimer: React.FC<InspectionTimerProps> = ({
  inspectionEndTimestamp,
  onConfirmEarly,
  onRaiseDispute,
  isConfirming = false,
  className = '',
}) => {
  // Normalize timestamp to ms
  const endMs =
    inspectionEndTimestamp < 1e11
      ? inspectionEndTimestamp * 1000
      : inspectionEndTimestamp;

  const calculateRemainingSeconds = () =>
    Math.max(0, Math.floor((endMs - Date.now()) / 1000));

  const [secondsRemaining, setSecondsRemaining] = useState(calculateRemainingSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(calculateRemainingSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [endMs]);

  const isExpired = secondsRemaining <= 0;
  const isUrgent = secondsRemaining > 0 && secondsRemaining < 3600; // Less than 1 hour

  return (
    <div
      className={`bg-slate-900 border ${
        isUrgent
          ? 'border-amber-500/80 shadow-amber-900/20'
          : 'border-slate-800 shadow-slate-950/50'
      } rounded-2xl p-4 sm:p-5 shadow-xl text-slate-100 ${className}`}
      data-testid="inspection-timer"
    >
      {/* Header & Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isExpired
                ? 'bg-emerald-400'
                : isUrgent
                ? 'bg-amber-400 animate-ping'
                : 'bg-cyan-400 animate-pulse'
            }`}
          />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Inspection Window Active
          </h4>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
          {formatRemainingTime(secondsRemaining)}
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        {isExpired
          ? 'Inspection period complete. Escrow is unlocked for automatic seller settlement.'
          : 'Inspect delivered items. You can confirm satisfaction early to release escrow or open a dispute before the deadline.'}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
        {onConfirmEarly && (
          <button
            onClick={onConfirmEarly}
            disabled={isConfirming || isExpired}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 transition flex items-center justify-center space-x-1.5"
            data-testid="confirm-early-btn"
          >
            {isConfirming ? (
              <span>Confirming on-chain...</span>
            ) : (
              <span>Confirm Satisfaction</span>
            )}
          </button>
        )}

        {onRaiseDispute && (
          <button
            onClick={onRaiseDispute}
            disabled={isExpired}
            className="py-2 px-3 bg-slate-800 hover:bg-rose-950/50 hover:border-rose-700/80 disabled:opacity-40 border border-slate-700 text-rose-300 rounded-xl text-xs font-semibold transition"
            data-testid="raise-dispute-btn"
          >
            Raise Dispute
          </button>
        )}
      </div>
    </div>
  );
};
