import React from 'react';

export type MobileTab = 'circles' | 'create' | 'orders' | 'wallet';

export interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  orderCount?: number;
  hasDispute?: boolean;
  className?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  orderCount = 0,
  hasDispute = false,
  className = '',
}) => {
  return (
    <nav
      role="navigation"
      aria-label="Mobile Bottom Navigation"
      className={`fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-3 py-2 shadow-2xl transition-colors ${className}`}
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Circles Tab */}
        <button
          onClick={() => onSelectTab('circles')}
          className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] rounded-xl transition ${
            activeTab === 'circles'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Demand Circles"
          data-testid="tab-circles"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[10px] tracking-tight">Circles</span>
        </button>

        {/* Create Circle Floating Center Pill */}
        <button
          onClick={() => onSelectTab('create')}
          className="flex flex-col items-center justify-center -mt-4 p-2 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40 hover:scale-105 active:scale-95 transition"
          aria-label="Create Demand Circle"
          data-testid="tab-create"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Orders / Commitments Tab */}
        <button
          onClick={() => onSelectTab('orders')}
          className={`relative flex flex-col items-center justify-center p-1.5 min-w-[56px] rounded-xl transition ${
            activeTab === 'orders'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="My Orders"
          data-testid="tab-orders"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-[10px] tracking-tight">Orders</span>

          {orderCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-cyan-600 text-[9px] font-bold text-white flex items-center justify-center">
              {orderCount}
            </span>
          )}
          {hasDispute && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        {/* Wallet Tab */}
        <button
          onClick={() => onSelectTab('wallet')}
          className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] rounded-xl transition ${
            activeTab === 'wallet'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Wallet and Balances"
          data-testid="tab-wallet"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-[10px] tracking-tight">Wallet</span>
        </button>
      </div>
    </nav>
  );
};
