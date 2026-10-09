import React, { useState } from 'react';
import { ShoppingBag, Wallet, Copy, Check, LogOut } from 'lucide-react';
import { WalletAccount, WalletStatus } from '../types/wallet';
import { shortenAddress } from '../services/validation';

interface NavbarProps {
  walletAccount: WalletAccount | null;
  walletStatus: WalletStatus;
  onOpenConnectModal: () => void;
  onDisconnect: () => void;
  onCopyAddress: (address: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  walletAccount,
  walletStatus,
  onOpenConnectModal,
  onDisconnect,
  onCopyAddress,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAccount?.address) {
      onCopyAddress(walletAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(11, 13, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <ShoppingBag size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                STELLAR BAZAAR
              </span>
              <span className="badge badge-testnet">TESTNET</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Demand-Driven Co-Op Marketplace
            </p>
          </div>
        </div>

        {/* Wallet controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {walletStatus === 'CONNECTED' && walletAccount ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.35rem 0.65rem 0.35rem 0.85rem',
              }}
            >
              <div className="pulse-dot" title="Connected to Stellar Testnet" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    letterSpacing: '0.02em',
                  }}
                  id="connected-address-display"
                >
                  {shortenAddress(walletAccount.address, 5)}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-success)' }}>
                  {walletAccount.type === 'FREIGHTER' ? 'Freighter Wallet' : 'Testnet Companion'}
                </span>
              </div>

              {/* Copy Address Button */}
              <button
                type="button"
                id="btn-copy-address"
                onClick={handleCopy}
                title="Copy full public address"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? 'var(--accent-success)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>

              {/* Disconnect Button */}
              <button
                type="button"
                id="btn-disconnect-wallet"
                onClick={onDisconnect}
                title="Disconnect wallet"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="btn-connect-wallet"
              className="btn btn-primary"
              onClick={onOpenConnectModal}
              disabled={walletStatus === 'CONNECTING'}
            >
              {walletStatus === 'CONNECTING' ? (
                <>
                  <span className="spinner" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet size={18} />
                  <span>Connect Freighter</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
