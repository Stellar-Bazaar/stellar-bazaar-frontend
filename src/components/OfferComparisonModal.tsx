import React from 'react';
import { MerchantOffer } from '../types/merchant-offer';
import { OfferCard } from './OfferCard';
import { useModalBackdrop } from '../services/use-modal-backdrop';

export interface OfferComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleTitle: string;
  targetPriceStroops: bigint;
  offers: MerchantOffer[];
  assetCode?: string;
  isCircleCreator?: boolean;
  onAcceptOffer?: (offerId: string) => void;
  isAccepting?: boolean;
}

export const OfferComparisonModal: React.FC<OfferComparisonModalProps> = ({
  isOpen,
  onClose,
  circleTitle,
  targetPriceStroops,
  offers,
  assetCode = 'XLM',
  isCircleCreator = false,
  onAcceptOffer,
  isAccepting = false,
}) => {
  const { handleBackdropClick } = useModalBackdrop({ isOpen, onClose });

  if (!isOpen) return null;

  // Identify standout offers
  let bestPriceId: string | null = null;
  let fastestLeadTimeId: string | null = null;

  if (offers.length > 0) {
    const sortedByPrice = [...offers].sort((a, b) =>
      a.pricePerUnitStroops < b.pricePerUnitStroops ? -1 : 1
    );
    bestPriceId = sortedByPrice[0].id;

    const sortedByLead = [...offers].sort((a, b) =>
      a.leadTimeLedgers < b.leadTimeLedgers ? -1 : 1
    );
    fastestLeadTimeId = sortedByLead[0].id;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      data-testid="offer-comparison-backdrop"
    >
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 id="comparison-title" className="text-xl font-bold text-slate-100">
                Merchant Offer Comparison
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluating bids for: <span className="text-cyan-300 font-semibold">{circleTitle}</span> ({offers.length} bid{offers.length !== 1 ? 's' : ''})
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto py-6 space-y-4 pr-1">
          {offers.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-850">
              <span className="text-3xl block mb-2">📦</span>
              <h3 className="text-sm font-semibold text-slate-300">No Merchant Bids Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Verified merchants will submit supply bids below the target ceiling once quorum builds.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((offer) => {
                const isBestPrice = offer.id === bestPriceId;
                const isFastest = offer.id === fastestLeadTimeId;

                return (
                  <div key={offer.id} className="relative flex flex-col">
                    {/* Standout Badges */}
                    <div className="absolute -top-2.5 right-4 z-10 flex space-x-1.5">
                      {isBestPrice && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-cyan-500 text-slate-950 shadow-md">
                          Best Price
                        </span>
                      )}
                      {isFastest && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500 text-slate-950 shadow-md">
                          Fastest
                        </span>
                      )}
                    </div>

                    <OfferCard
                      offer={offer}
                      targetPriceStroops={targetPriceStroops}
                      assetCode={assetCode}
                      isCircleCreator={isCircleCreator}
                      onAcceptOffer={onAcceptOffer}
                      isAccepting={isAccepting}
                      className={isBestPrice ? 'border-cyan-500/50' : ''}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 shrink-0 flex items-center justify-between text-xs text-slate-400">
          <span>
            Accepted bids lock in wholesale pricing and start fulfillment escrow.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
