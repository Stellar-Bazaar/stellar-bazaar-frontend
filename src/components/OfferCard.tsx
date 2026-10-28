import React from 'react';
import { MerchantOffer, calculateDiscountBps } from '../types/merchant-offer';
import { SellerStats } from '../utils/reputation-score';
import { ReputationBadge } from './ReputationBadge';
import { formatLeadTime } from '../utils/format-lead-time';
import { formatAssetAmount } from '../utils/format-asset';
import { CopyButton } from './CopyButton';

export interface OfferCardProps {
  offer: MerchantOffer;
  targetPriceStroops: bigint;
  assetCode?: string;
  sellerStats?: SellerStats;
  isCircleCreator?: boolean;
  onAcceptOffer?: (offerId: string) => void;
  isAccepting?: boolean;
  className?: string;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  targetPriceStroops,
  assetCode = 'XLM',
  sellerStats,
  isCircleCreator = false,
  onAcceptOffer,
  isAccepting = false,
  className = '',
}) => {
  const discountBps = calculateDiscountBps(targetPriceStroops, offer.pricePerUnitStroops);
  const discountPct = (discountBps / 100).toFixed(1);

  const formattedPrice = formatAssetAmount(offer.pricePerUnitStroops);
  const formattedTarget = formatAssetAmount(targetPriceStroops);
  const humanLeadTime = formatLeadTime(offer.leadTimeLedgers, { includeLedgerCount: true });

  const defaultStats: SellerStats = sellerStats || {
    successfulDeals: 1,
    totalVolumeUnits: offer.minVolume,
    disputedDeals: 0,
    resolvedInFavor: 0,
  };

  const truncatedAddress = `${offer.sellerAddress.slice(0, 4)}...${offer.sellerAddress.slice(-4)}`;

  return (
    <div
      className={`bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between ${className}`}
      data-testid="offer-card"
    >
      {/* Top row: Seller Address + Reputation Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <span className="font-mono text-xs text-cyan-300 font-medium">
              {truncatedAddress}
            </span>
            <CopyButton text={offer.sellerAddress} label="Copy seller address" />
          </div>
        </div>
        <ReputationBadge stats={defaultStats} size="sm" />
      </div>

      {/* Pricing Comparison */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 mb-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Offered Price</span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {formattedPrice}
            </span>
            <span className="text-xs text-slate-400 font-semibold">{assetCode}</span>
          </div>
        </div>

        {discountBps > 0 && (
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-slate-400 line-through">
              {formattedTarget} {assetCode}
            </span>
            <span className="mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/60 text-emerald-300">
              -{discountPct}%
            </span>
          </div>
        )}
      </div>

      {/* Metrics Row: Volume & Lead Time */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-5">
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-750">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
            Capacity
          </span>
          <span className="font-semibold text-slate-200">
            {offer.minVolume} - {offer.maxVolume} units
          </span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-750">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
            Lead Time
          </span>
          <span className="font-semibold text-slate-200 truncate block">
            {humanLeadTime}
          </span>
        </div>
      </div>

      {/* Bottom Action / Status */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {offer.status}
        </span>

        {isCircleCreator && offer.status === 'PENDING' && onAcceptOffer && (
          <button
            onClick={() => onAcceptOffer(offer.id)}
            disabled={isAccepting}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-cyan-900/30 transition flex items-center space-x-1.5"
            data-testid="accept-offer-btn"
          >
            {isAccepting ? (
              <span>Accepting...</span>
            ) : (
              <span>Accept Bid</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
