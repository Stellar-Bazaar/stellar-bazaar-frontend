import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { WalletType, WalletOption } from '../types/wallet';
import { WalletManager } from '../services/wallet-manager';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (type: WalletType) => Promise<void>;
  isConnecting: boolean;
  activeWalletType: WalletType | null;
  errorMessage: string | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSelectWallet,
  isConnecting,
  activeWalletType,
  errorMessage,
}) => {
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [pendingWallet, setPendingWallet] = useState<WalletType | null>(null);

  useEffect(() => {
    if (isOpen) {
      WalletManager.getAvailableWallets().then(setWallets);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWalletClick = async (type: WalletType) => {
    setPendingWallet(type);
    try {
      await onSelectWallet(type);
    } finally {
      setPendingWallet(null);
    }
  };

  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'FREIGHTER':
        return <ShieldCheck size={22} color="var(--accent-primary-light)" />;
      case 'XBULL':
        return <Layers size={22} color="#f97316" />;
      case 'ALBEDO':
        return <Globe size={22} color="#06b6d4" />;
      case 'HANA':
        return <Cpu size={22} color="#a855f7" />;
      case 'COMPANION':
        return <Zap size={22} color="#10b981" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#0f1324',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          position: 'relative',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Wallet size={20} color="var(--accent-primary-light)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Connect Stellar Wallet</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Multi-wallet selection for Stellar Testnet
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            id="wallet-modal-error"
            style={{
              background: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              marginBottom: '1rem',
              color: '#fca5a5',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Wallet Connection Error:</strong>
              <div style={{ marginTop: '2px' }}>{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Wallet Options List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflowY: 'auto',
            paddingRight: '0.25rem',
          }}
        >
          {wallets.map((wallet) => {
            const isCurrentActive = activeWalletType === wallet.id;
            const isCurrentPending = pendingWallet === wallet.id && isConnecting;

            return (
              <div
                key={wallet.id}
                id={`wallet-option-${wallet.id.toLowerCase()}`}
                style={{
                  border: isCurrentActive
                    ? '1px solid var(--accent-primary)'
                    : '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  background: isCurrentActive
                    ? 'rgba(99, 102, 241, 0.08)'
                    : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      flexShrink: 0,
                    }}
                  >
                    {getWalletIcon(wallet.id)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{wallet.name}</span>
                      {wallet.badge && (
                        <span
                          className={`badge ${
                            wallet.id === 'FREIGHTER'
                              ? 'badge-primary'
                              : wallet.id === 'COMPANION'
                              ? 'badge-success'
                              : 'badge-testnet'
                          }`}
                          style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                        >
                          {wallet.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                      {wallet.description}
                    </p>

                    {!wallet.isAvailable && wallet.installUrl && (
                      <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>Not detected in browser</span>
                        <a
                          href={wallet.installUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--accent-primary-light)',
                            textDecoration: 'underline',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <span>Install</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <div>
                  {isCurrentActive ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: 'var(--success)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.5rem 0.85rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <CheckCircle size={14} />
                      <span>Connected</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id={`btn-connect-${wallet.id.toLowerCase()}`}
                      onClick={() => handleWalletClick(wallet.id)}
                      disabled={isConnecting}
                      className={wallet.id === 'FREIGHTER' ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{
                        padding: '0.45rem 0.95rem',
                        fontSize: '0.825rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isCurrentPending ? (
                        <>
                          <span className="spinner" style={{ width: '12px', height: '12px' }} />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>Target Network: <strong>Stellar Testnet</strong></span>
          <span>Soroban Smart Contracts Ready</span>
        </div>
      </div>
    </div>
  );
};
