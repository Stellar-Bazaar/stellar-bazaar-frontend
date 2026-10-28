import React from 'react';
import { AssetCode } from '../types/stellar-asset';
import { formatAssetAmount } from '../utils/format-asset';
import { useModalBackdrop } from '../services/use-modal-backdrop';

export interface SurplusRebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleTitle: string;
  targetUnitPriceStroops: bigint;
  acceptedUnitPriceStroops: bigint;
  buyerCommittedVolume: number;
  totalSettledVolume: number;
  assetCode?: AssetCode;
  isClaiming?: boolean;
  onClaimRebate: () => void;
  className?: string;
}

export const SurplusRebateModal: React.FC<SurplusRebateModalProps> = ({
  isOpen,
  onClose,
  circleTitle,
  targetUnitPriceStroops,
  acceptedUnitPriceStroops,
  buyerCommittedVolume,
  assetCode = 'XLM',
  isClaiming = false,
  onClaimRebate,
  className = '',
}) => {
  const { handleBackdropClick } = useModalBackdrop({ isOpen, onClose });

  if (!isOpen) return null;

  const unitSavings = targetUnitPriceStroops > acceptedUnitPriceStroops
    ? targetUnitPriceStroops - acceptedUnitPriceStroops
    : 0n;

  const buyerRebateAmount = unitSavings * BigInt(buyerCommittedVolume);

  const discountPercent = targetUnitPriceStroops > 0n
    ? Number((unitSavings * 100n) / targetUnitPriceStroops)
    : 0;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="surplus-modal-title"
    >
      <div
        className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              🎉
            </span>
            <h3
              id="surplus-modal-title"
              className="text-base font-bold text-gray-900 dark:text-white"
            >
              Claim Surplus Savings Rebate
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Great news! The accepted seller offer for <strong className="text-gray-900 dark:text-white">{circleTitle}</strong> beat the target price, unlocking surplus escrow savings for committed buyers.
          </p>

          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-800 dark:text-emerald-300">Initial Target Price:</span>
              <span className="font-mono font-semibold text-emerald-900 dark:text-emerald-100">
                {formatAssetAmount(targetUnitPriceStroops, assetCode)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-800 dark:text-emerald-300">Winning Offer Price:</span>
              <span className="font-mono font-bold text-emerald-900 dark:text-emerald-100">
                {formatAssetAmount(acceptedUnitPriceStroops, assetCode)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                Discount Achieved:
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                {discountPercent}% OFF
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Your Refundable Escrow Rebate
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
              +{formatAssetAmount(buyerRebateAmount, assetCode)}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 block mt-0.5">
              Based on {buyerCommittedVolume} committed units
            </span>
          </div>
        </div>

        <div className="p-5 bg-gray-50/50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isClaiming}
            className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClaimRebate}
            disabled={isClaiming || buyerRebateAmount <= 0n}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isClaiming ? 'Claiming in Soroban...' : 'Claim Rebate to Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};
