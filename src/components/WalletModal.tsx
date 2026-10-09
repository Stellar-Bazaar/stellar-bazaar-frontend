import React, { useState, useEffect } from 'react';
import { X, Wallet, ShieldCheck, Zap, AlertTriangle, ExternalLink } from 'lucide-react';
import { FreighterWalletService } from '../services/freighter-wallet';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectFreighter: () => Promise<void>;
  onConnectCompanion: () => Promise<void>;
  isConnecting: boolean;
  errorMessage: string | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onConnectFreighter,
  onConnectCompanion,
  isConnecting,
  errorMessage,
}) => {
  const [freighterAvailable, setFreighterAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      FreighterWalletService.isAvailable().then((res) => {
        setFreighterAvailable(res);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#121629',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Wallet size={22} color="var(--accent-primary-light)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Connect Stellar Wallet</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Connect your Stellar Testnet wallet to authorize transactions, verify real balances, and participate in Demand Circles.
        </p>

        {errorMessage && (
          <div
            id="wallet-modal-error"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              color: '#fca5a5',
              fontSize: '0.825rem',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Option 1: Freighter Extension */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={20} color="var(--accent-primary-light)" />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Freighter Wallet</span>
              </div>
              <span className="badge badge-testnet">Official Extension</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              The official Stellar browser extension. Signs transactions securely in your browser.
            </p>

            {freighterAvailable === false ? (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
                  <AlertTriangle size={14} />
                  <span>Freighter extension not detected</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#fde68a', marginTop: '0.25rem' }}>
                  Please install Freighter from the Chrome / Firefox web store.
                </p>
                <a
                  href="https://www.freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}
                >
                  <span>Install Freighter Wallet</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ) : null}

            <button
              type="button"
              id="btn-modal-connect-freighter"
              onClick={onConnectFreighter}
              disabled={isConnecting}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {isConnecting ? (
                <>
                  <span className="spinner" />
                  <span>Connecting Freighter...</span>
                </>
              ) : (
                <span>Connect via Freighter</span>
              )}
            </button>
          </div>

          {/* Option 2: Testnet Companion / Sandbox preview */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Zap size={20} color="var(--accent-secondary)" />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Testnet Companion Mode</span>
              </div>
              <span className="badge badge-success">Zero-Friction</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Generates a real Stellar Testnet keypair funded by Friendbot. Submits genuine on-chain Testnet transactions without requiring the extension.
            </p>

            <button
              type="button"
              id="btn-modal-connect-companion"
              onClick={onConnectCompanion}
              disabled={isConnecting}
              className="btn btn-secondary"
              style={{ width: '100%', borderColor: 'rgba(6, 182, 212, 0.4)', color: 'var(--accent-secondary)' }}
            >
              {isConnecting ? (
                <>
                  <span className="spinner" />
                  <span>Initializing Testnet Companion...</span>
                </>
              ) : (
                <span>Use Testnet Companion Signer</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
