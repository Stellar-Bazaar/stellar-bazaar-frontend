import React from 'react';
import { formatAssetAmount } from '../utils/format-asset';
import { CopyButton } from './CopyButton';

export interface AccountBalanceMap {
  XLM: bigint;
  USDC: bigint;
  EURC: bigint;
}

export interface AccountBalanceCardProps {
  publicKey: string | null;
  balances: AccountBalanceMap;
  isLoading?: boolean;
  isFunding?: boolean;
  onRefresh?: () => void;
  onFundTestnet?: () => void;
  className?: string;
}

export const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  publicKey,
  balances,
  isLoading = false,
  isFunding = false,
  onRefresh,
  onFundTestnet,
  className = '',
}) => {
  if (!publicKey) {
    return (
      <div className={`p-4 bg-gray-50 dark:bg-gray-800/60 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        Connect your Stellar wallet to view balances and trustlines.
      </div>
    );
  }

  const shortenedAddress = `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`;

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Stellar Testnet Account
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
              {shortenedAddress}
            </span>
            <CopyButton text={publicKey} label="Copy address" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh balances"
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              aria-label="Refresh balances"
            >
              🔄
            </button>
          )}
          {onFundTestnet && (
            <button
              onClick={onFundTestnet}
              disabled={isFunding || isLoading}
              className="px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isFunding ? 'Funding...' : '🚀 Friendbot'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3">
        <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block">
            Native XLM
          </span>
          <span className="text-base font-bold text-gray-900 dark:text-white mt-0.5 block truncate">
            {isLoading ? '...' : formatAssetAmount(balances.XLM, 'XLM')}
          </span>
        </div>

        <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block">
            USD Coin (USDC)
          </span>
          <span className="text-base font-bold text-blue-900 dark:text-blue-100 mt-0.5 block truncate">
            {isLoading ? '...' : formatAssetAmount(balances.USDC, 'USDC')}
          </span>
        </div>

        <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">
            Euro Coin (EURC)
          </span>
          <span className="text-base font-bold text-indigo-900 dark:text-indigo-100 mt-0.5 block truncate">
            {isLoading ? '...' : formatAssetAmount(balances.EURC, 'EURC')}
          </span>
        </div>
      </div>
    </div>
  );
};
