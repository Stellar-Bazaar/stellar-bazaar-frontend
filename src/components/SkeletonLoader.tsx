import React from 'react';

export type SkeletonVariant = 'card' | 'balance' | 'offer' | 'row';

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: Math.max(1, count) });

  const renderSingleSkeleton = (key: number) => {
    switch (variant) {
      case 'card':
        return (
          <div
            key={key}
            className={`bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between animate-pulse ${className}`}
            data-testid="skeleton-card"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-slate-800 rounded-full" />
                <div className="h-5 w-16 bg-slate-800 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-slate-750 rounded-lg mb-2" />
              <div className="h-3 w-full bg-slate-800 rounded mb-1" />
              <div className="h-3 w-4/5 bg-slate-800 rounded mb-4" />
            </div>

            <div>
              <div className="h-2 w-full bg-slate-800 rounded-full mb-3" />
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                <div className="h-5 w-20 bg-slate-800 rounded" />
                <div className="h-8 w-24 bg-slate-800 rounded-xl" />
              </div>
            </div>
          </div>
        );

      case 'balance':
        return (
          <div
            key={key}
            className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md animate-pulse flex items-center justify-between ${className}`}
            data-testid="skeleton-balance"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-16 bg-slate-800 rounded" />
                <div className="h-3 w-28 bg-slate-850 rounded" />
              </div>
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-5 w-20 bg-slate-800 rounded ml-auto" />
              <div className="h-3 w-12 bg-slate-850 rounded ml-auto" />
            </div>
          </div>
        );

      case 'offer':
        return (
          <div
            key={key}
            className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg animate-pulse space-y-4 ${className}`}
            data-testid="skeleton-offer"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-28 bg-slate-800 rounded-lg" />
              <div className="h-5 w-20 bg-slate-800 rounded-full" />
            </div>
            <div className="h-12 bg-slate-950/60 rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 bg-slate-800/60 rounded-xl" />
              <div className="h-10 bg-slate-800/60 rounded-xl" />
            </div>
          </div>
        );

      case 'row':
      default:
        return (
          <div
            key={key}
            className={`h-12 w-full bg-slate-800/60 rounded-xl animate-pulse ${className}`}
            data-testid="skeleton-row"
          />
        );
    }
  };

  return (
    <div className="w-full space-y-3" role="status" aria-label="Loading content...">
      {items.map((_, idx) => renderSingleSkeleton(idx))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

