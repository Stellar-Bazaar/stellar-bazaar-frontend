import React from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { CopyButton } from './CopyButton';

interface TransactionBannerProps {
  txHash: string;
  network?: string;
  status?: 'CONFIRMED' | 'PENDING' | 'FAILED';
  title?: string;
  onClose?: () => void;
}

export const TransactionBanner: React.FC<TransactionBannerProps> = ({
  txHash,
  network = 'testnet',
  status = 'CONFIRMED',
  title = 'Transaction Confirmed on Stellar Ledger',
  onClose,
}) => {
  const explorerUrl = `https://stellar.expert/explorer/${network.toLowerCase()}/tx/${txHash}`;
  const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="glass-card"
      style={{
        background: status === 'CONFIRMED'
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(127, 29, 29, 0.15) 100%)',
        border: `1px solid ${status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem 1.25rem',
        margin: '1rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        {status === 'CONFIRMED' ? (
          <CheckCircle2 size={20} color="#34d399" style={{ flexShrink: 0 }} />
        ) : (
          <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0 }} />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hash: {shortHash}
            </span>
            <CopyButton text={txHash} size={12} label="Copy transaction hash" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.65rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>Stellar Expert</span>
          <ExternalLink size={12} />
        </a>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss banner"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
