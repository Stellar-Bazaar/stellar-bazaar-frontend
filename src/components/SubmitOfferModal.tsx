import React, { useState } from 'react';
import { useModalBackdrop } from '../services/use-modal-backdrop';
import { parseAssetAmount } from '../utils/parse-asset';
import { formatAssetAmount } from '../utils/format-asset';
import { validateMerchantOffer, MerchantOffer } from '../types/merchant-offer';
import { STELLAR_LEDGER_SECONDS } from '../utils/format-lead-time';

export interface SubmitOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleTitle: string;
  targetPriceStroops: bigint;
  circleMaxVolume: number;
  sellerAddress?: string | null;
  assetCode?: string;
  onSubmitOffer: (offer: Omit<MerchantOffer, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  isSubmitting?: boolean;
}

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({
  isOpen,
  onClose,
  circleId,
  circleTitle,
  targetPriceStroops,
  circleMaxVolume,
  sellerAddress,
  assetCode = 'XLM',
  onSubmitOffer,
  isSubmitting = false,
}) => {
  const [priceInput, setPriceInput] = useState('');
  const [minVolumeInput, setMinVolumeInput] = useState('10');
  const [maxVolumeInput, setMaxVolumeInput] = useState(String(circleMaxVolume || 100));
  const [leadTimeHours, setLeadTimeHours] = useState('24');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { handleBackdropClick } = useModalBackdrop({ isOpen, onClose });

  if (!isOpen) return null;

  const targetPriceFormatted = formatAssetAmount(targetPriceStroops);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!sellerAddress) {
      setErrorMsg('Please connect your merchant wallet first.');
      return;
    }

    try {
      const priceStroops = parseAssetAmount(priceInput);
      const minVolume = parseInt(minVolumeInput, 10);
      const maxVolume = parseInt(maxVolumeInput, 10);
      const hours = parseFloat(leadTimeHours);

      if (isNaN(hours) || hours <= 0) {
        setErrorMsg('Please enter a valid lead time in hours.');
        return;
      }

      // Convert hours to Soroban ledgers (5 seconds per ledger)
      const leadTimeSeconds = Math.round(hours * 3600);
      const leadTimeLedgers = Math.max(1, Math.round(leadTimeSeconds / STELLAR_LEDGER_SECONDS));

      const candidate = {
        circleId,
        sellerAddress,
        pricePerUnitStroops: priceStroops,
        minVolume,
        maxVolume,
        leadTimeLedgers,
      };

      const validation = validateMerchantOffer(candidate, targetPriceStroops, circleMaxVolume);
      if (!validation.valid) {
        setErrorMsg(validation.errors[0]);
        return;
      }

      await onSubmitOffer(candidate);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit merchant bid.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-offer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      data-testid="submit-offer-backdrop"
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 id="submit-offer-title" className="text-lg font-bold text-slate-100">
              Submit Merchant Bid
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Target Context Pill */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Demand Circle
            </span>
            <span className="text-sm font-semibold text-slate-200 truncate block max-w-[200px]">
              {circleTitle}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Target Ceiling
            </span>
            <span className="text-sm font-mono font-bold text-cyan-300">
              {targetPriceFormatted} {assetCode}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bid Price per Unit ({assetCode})
            </label>
            <input
              type="text"
              placeholder={`e.g. 8.50 (must be ≤ ${targetPriceFormatted})`}
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              required
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              data-testid="offer-price-input"
            />
          </div>

          {/* Volume Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Min Supply Units
              </label>
              <input
                type="number"
                min="1"
                value={minVolumeInput}
                onChange={(e) => setMinVolumeInput(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Supply Units
              </label>
              <input
                type="number"
                min="1"
                value={maxVolumeInput}
                onChange={(e) => setMaxVolumeInput(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Lead Time Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Fulfillment Lead Time (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.1"
              value={leadTimeHours}
              onChange={(e) => setLeadTimeHours(e.target.value)}
              required
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !sellerAddress}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition text-sm flex items-center justify-center space-x-2"
              data-testid="submit-offer-btn"
            >
              {isSubmitting ? (
                <span>Submitting to Soroban...</span>
              ) : (
                <span>Publish On-Chain Bid</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
