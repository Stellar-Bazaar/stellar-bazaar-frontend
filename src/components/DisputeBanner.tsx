import React from 'react';
import { DisputeDTO } from '../services/indexer-client';

export interface DisputeBannerProps {
  circleId: string;
  status: string;
  dispute?: DisputeDTO | null;
  isAdmin?: boolean;
  isResolving?: boolean;
  onResolveRefund?: () => void;
  onResolveSettle?: () => void;
  className?: string;
}

export const DisputeBanner: React.FC<DisputeBannerProps> = ({
  status,
  dispute,
  isAdmin = false,
  isResolving = false,
  onResolveRefund,
  onResolveSettle,
  className = '',
}) => {
  const isDisputed = status.toUpperCase() === 'DISPUTED';

  if (!isDisputed && !dispute) {
    return null;
  }

  const isResolved = dispute && dispute.status.toUpperCase() === 'RESOLVED';

  if (isResolved) {
    const outcomeText = dispute.resolution_refund_to_buyers
      ? 'Arbitration resolved in favor of buyers: Full escrow refund issued.'
      : 'Arbitration resolved in favor of seller: Payout cleared to seller.';

    return (
      <div
        className={`p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-100 flex items-start gap-3 ${className}`}
        role="status"
      >
        <span className="text-xl shrink-0" aria-hidden="true">
          ✅
        </span>
        <div>
          <h4 className="text-sm font-bold">Dispute Resolved by Protocol Arbitration</h4>
          <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-0.5">{outcomeText}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-100 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0" aria-hidden="true">
          ⚠️
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold tracking-tight">
              Demand Circle Under Arbitration Dispute
            </h4>
            <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
              Escrow Frozen
            </span>
          </div>

          <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
            Settlement is paused during arbitration review. Buyer escrow deposits remain locked
            until resolution.
          </p>

          {dispute && (
            <div className="mt-2.5 p-2 bg-amber-100/70 dark:bg-amber-900/40 rounded-lg text-xs space-y-1">
              <div>
                <span className="font-semibold">Reason:</span> {dispute.dispute_reason}
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-300 font-mono truncate">
                Initiated by: {dispute.initiator_address}
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="mt-3 flex items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-800">
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Arbitrator Actions:
              </span>
              <button
                type="button"
                onClick={onResolveRefund}
                disabled={isResolving}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Refund Buyers
              </button>
              <button
                type="button"
                onClick={onResolveSettle}
                disabled={isResolving}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Release to Seller
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
