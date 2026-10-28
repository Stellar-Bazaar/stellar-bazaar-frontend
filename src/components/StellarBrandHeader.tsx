import React from 'react';
import { NetworkSelector, NetworkId, NetworkProfile } from './NetworkSelector';
import { ThemeToggle } from './ThemeToggle';
import { KeyboardShortcutBadge } from './KeyboardShortcutBadge';

export interface StellarBrandHeaderProps {
  publicKey?: string | null;
  network?: NetworkId;
  onNetworkChange?: (network: NetworkId) => void;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
  onOpenSearch?: () => void;
  xlmBalance?: string;
}

export const StellarBrandHeader: React.FC<StellarBrandHeaderProps> = ({
  publicKey,
  network = 'testnet',
  onNetworkChange,
  onConnectWallet,
  onDisconnectWallet,
  onOpenSearch,
  xlmBalance,
}) => {
  const truncatedAddress = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : null;

  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M3 12h3m12 0h3M12 3v3m0 12v3M5.636 5.636l2.122 2.122m8.484 8.484l2.122 2.122M5.636 18.364l2.122-2.122m8.484-8.484l2.122-2.122" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                STELLAR BAZAAR
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                Soroban
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-0.5">
              Cooperative Demand Circles
            </span>
          </div>
        </div>

        {/* Global Search Shortcut Pill */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-400 text-xs transition"
            aria-label="Search demand circles (Ctrl+K)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search circles...</span>
            <KeyboardShortcutBadge shortcut={{ key: 'k', ctrlOrMeta: true }} />
          </button>
        )}

        {/* Right Action Stack */}
        <div className="flex items-center space-x-3">
          {/* Network Selector */}
          <NetworkSelector
            activeNetwork={network}
            onChangeNetwork={(profile: NetworkProfile) => {
              if (onNetworkChange) {
                onNetworkChange(profile.id);
              }
            }}
          />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Connected Wallet or Connect Action */}
          {publicKey ? (
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {xlmBalance && (
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline mr-1">
                  {xlmBalance} XLM
                </span>
              )}
              <span
                className="text-xs font-mono text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-750"
                title={publicKey}
              >
                {truncatedAddress}
              </span>
              {onDisconnectWallet && (
                <button
                  onClick={onDisconnectWallet}
                  title="Disconnect wallet"
                  className="text-slate-400 hover:text-red-400 text-xs transition ml-1"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-900/30 transition flex items-center space-x-1.5"
              data-testid="connect-wallet-btn"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
