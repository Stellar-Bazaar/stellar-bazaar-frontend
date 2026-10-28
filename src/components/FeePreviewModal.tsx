import React from 'react';
import { StellarSimulationResult, calculateTotalFee } from '../services/simulation-parser';
import { formatAssetAmount } from '../utils/format-asset';
import { useModalBackdrop } from '../services/use-modal-backdrop';

export interface FeePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  simulation: StellarSimulationResult;
  baseFeeStroops?: number;
  isSubmitting?: boolean;
  onConfirmSubmit: () => void;
  className?: string;
}

export const FeePreviewModal: React.FC<FeePreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  simulation,
  baseFeeStroops = 100,
  isSubmitting = false,
  onConfirmSubmit,
  className = '',
}) => {
  const { handleBackdropClick } = useModalBackdrop({ isOpen, onClose });

  if (!isOpen) return null;

  const totalFeeStroops = calculateTotalFee(baseFeeStroops, simulation.minResourceFeeStroops);

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fee-preview-modal-title"
    >
      <div
        className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              ⚡
            </span>
            <h3
              id="fee-preview-modal-title"
              className="text-base font-bold text-gray-900 dark:text-white"
            >
              Transaction Fee Preview
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
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Action
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {title}
            </span>
          </div>

          {simulation.success ? (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-800 dark:text-blue-300">Base Inclusion Fee:</span>
                <span className="font-mono font-medium text-blue-900 dark:text-blue-100">
                  {formatAssetAmount(BigInt(baseFeeStroops), 'XLM', { minDecimals: 7, maxDecimals: 7 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-800 dark:text-blue-300">Soroban Resource Fee:</span>
                <span className="font-mono font-medium text-blue-900 dark:text-blue-100">
                  {formatAssetAmount(simulation.minResourceFeeStroops, 'XLM', { minDecimals: 7, maxDecimals: 7 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-blue-200/60 dark:border-blue-800/60">
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  Total Transaction Fee:
                </span>
                <span className="font-mono font-black text-blue-700 dark:text-blue-300">
                  {formatAssetAmount(totalFeeStroops, 'XLM', { minDecimals: 5, maxDecimals: 7 })}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
              <strong className="block font-bold mb-1">Simulation Warning:</strong>
              {simulation.errorDetails || 'Transaction simulation failed.'}
            </div>
          )}

          {simulation.success && (
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-[10px] text-gray-400 dark:text-gray-400 uppercase font-semibold block">
                  CPU
                </span>
                <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 mt-0.5 block truncate">
                  {simulation.cpuInstructions.toString()}
                </span>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-[10px] text-gray-400 dark:text-gray-400 uppercase font-semibold block">
                  Memory
                </span>
                <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 mt-0.5 block truncate">
                  {simulation.ramBytes.toString()} B
                </span>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-[10px] text-gray-400 dark:text-gray-400 uppercase font-semibold block">
                  Signatures
                </span>
                <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">
                  {simulation.authCount} Required
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-gray-50/50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmSubmit}
            disabled={isSubmitting || !simulation.success}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? 'Submitting to Stellar...' : 'Confirm & Sign'}
          </button>
        </div>
      </div>
    </div>
  );
};
