import React from 'react';

export interface OfflineBannerProps {
  isOnline: boolean;
  isRpcReachable: boolean;
  onRetry?: () => Promise<void> | void;
  isRetrying?: boolean;
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  isRpcReachable,
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  // If online and RPC is reachable, don't show the banner
  if (isOnline && isRpcReachable) {
    return null;
  }

  const isCompleteOffline = !isOnline;

  const title = isCompleteOffline
    ? 'No Internet Connection'
    : 'Stellar RPC Network Unreachable';

  const message = isCompleteOffline
    ? 'You are currently offline. Viewing cached circle data; transaction signing is paused.'
    : 'Stellar Horizon/Soroban RPC is experiencing latency or downtime. Retrying connection...';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`w-full bg-amber-950/90 border-b border-amber-600/70 text-amber-200 px-4 py-2.5 shadow-md flex items-center justify-between transition-colors z-40 ${className}`}
      data-testid="offline-banner"
    >
      <div className="flex items-center space-x-2.5 max-w-3xl">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-amber-100 mr-1.5">{title}:</span>
          <span className="text-amber-300/90">{message}</span>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="shrink-0 ml-3 px-3 py-1 bg-amber-600/80 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition flex items-center space-x-1"
          data-testid="offline-retry-btn"
        >
          {isRetrying ? (
            <span>Connecting...</span>
          ) : (
            <span>Retry Connection</span>
          )}
        </button>
      )}
    </div>
  );
};

