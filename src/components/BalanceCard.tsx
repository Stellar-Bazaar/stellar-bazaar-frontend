import React from 'react';
import { RefreshCw, Coins, AlertCircle, ArrowUpRight } from 'lucide-react';
import { AccountBalanceState } from '../types/wallet';

interface BalanceCardProps {
  balanceState: AccountBalanceState;
  onRefresh: () => void;
  onFundWithFaucet?: () => void;
  isFunding?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balanceState,
  onRefresh,
  onFundWithFaucet,
  isFunding = false,
}) => {
  const { xlm, balances, isFunded, lastFetchedAt, isLoading, error } = balanceState;

  // Format timestamp
  const formattedTime = lastFetchedAt
    ? lastFetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Never';

  const otherAssets = balances.filter((b) => !b.isNative);

  return (
    <div className="glass-card" id="balance-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Coins size={20} color="var(--accent-primary-light)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Stellar Testnet Balances</h2>
        </div>
        <button
          type="button"
          id="btn-refresh-balance"
          onClick={onRefresh}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          title="Refresh balance from Stellar Testnet"
        >
          <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main XLM Native Balance Display */}
      <div
        style={{
          background: 'rgba(15, 19, 36, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Native Stellar Lumens
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginTop: '0.25rem' }}>
          <span
            id="xlm-balance-display"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            {Number(xlm).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 7 })}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary-light)' }}>
            XLM
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Network: Stellar Testnet
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }} id="last-fetched-timestamp">
            Last fetched: {formattedTime}
          </span>
        </div>
      </div>

      {/* Unfunded Account Alert & Quick Faucet Action */}
      {!isFunded && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600 }}>
                Unfunded Testnet Account
              </p>
              <p style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '0.2rem' }}>
                This account has not been activated on Stellar Testnet yet. Use Stellar Friendbot to receive 10,000 Testnet XLM instantly.
              </p>
              {onFundWithFaucet && (
                <button
                  type="button"
                  id="btn-fund-faucet"
                  onClick={onFundWithFaucet}
                  disabled={isFunding}
                  className="btn btn-primary"
                  style={{ marginTop: '0.75rem', padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                >
                  {isFunding ? (
                    <>
                      <span className="spinner" />
                      <span>Requesting Friendbot...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={14} />
                      <span>Fund with Friendbot (+10,000 XLM)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Network or RPC Error */}
      {error && isFunded && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            marginBottom: '1rem',
            fontSize: '0.825rem',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Trustline Assets Breakdown */}
      {otherAssets.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Issued Assets / Trustlines
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {otherAssets.map((asset, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{asset.assetCode}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{asset.balance}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
