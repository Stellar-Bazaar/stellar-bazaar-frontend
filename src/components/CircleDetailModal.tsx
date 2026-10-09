import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import { OnChainDemandCircle } from '../types/contract';
import { SorobanContractService } from '../services/soroban-contract';

interface CircleDetailModalProps {
  circle: OnChainDemandCircle | null;
  onClose: () => void;
  onSelectForPayment?: (circle: OnChainDemandCircle) => void;
}

export const CircleDetailModal: React.FC<CircleDetailModalProps> = ({
  circle,
  onClose,
  onSelectForPayment,
}) => {
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedCreator, setCopiedCreator] = useState(false);

  if (!circle) return null;

  const contractConfig = SorobanContractService.getConfig();

  const handleCopy = (text: string, type: 'contract' | 'creator') => {
    navigator.clipboard.writeText(text);
    if (type === 'contract') {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    } else {
      setCopiedCreator(true);
      setTimeout(() => setCopiedCreator(false), 2000);
    }
  };

  const totalPoolXlm = (
    circle.target_quantity * parseFloat(circle.target_price_xlm)
  ).toFixed(2);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
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
          maxWidth: '600px',
          width: '100%',
          backgroundColor: '#0c1020',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          position: 'relative',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary">Circle #{circle.id}</span>
              <span
                className={`badge ${
                  circle.status === 'OPEN'
                    ? 'badge-success'
                    : circle.status === 'CLOSED'
                    ? 'badge-testnet'
                    : 'badge-demo'
                }`}
              >
                {circle.status}
              </span>
              <span className="badge badge-testnet">Authoritative Soroban State</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{circle.title}</h2>
          </div>
          <button
            type="button"
            id="btn-close-detail-modal"
            onClick={onClose}
            aria-label="Close detail modal"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Key Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Target Unit Price
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                {circle.target_price_xlm} XLM
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {circle.target_price_stroops} stroops
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Target Quantity
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                {circle.target_quantity} units
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aggregate demand</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Total Pool Potential
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                {totalPoolXlm} XLM
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gross volume</div>
            </div>
          </div>

          {/* Timing details */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Created On-Chain:</span>
              <span>{circle.createdDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bidding Deadline:</span>
              <span style={{ color: circle.isExpired ? '#f87171' : '#34d399', fontWeight: 600 }}>
                {circle.deadlineDate} {circle.isExpired && '(Expired)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Metadata URI / IPFS:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{circle.metadata_uri}</span>
            </div>
          </div>

          {/* On-Chain Addresses */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {/* Creator Address */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Circle Creator Address
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: 'var(--text-normal)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {circle.creator}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(circle.creator, 'creator')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    title="Copy Address"
                  >
                    {copiedCreator ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${circle.creator}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
                    title="View on Explorer"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Smart Contract ID */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Registry Contract ID
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: 'var(--accent-primary-light)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {contractConfig.contractId}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(contractConfig.contractId, 'contract')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    title="Copy Contract Address"
                  >
                    {copiedContract ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={contractConfig.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
                    title="View Contract on Explorer"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            {onSelectForPayment && (
              <button
                type="button"
                onClick={() => {
                  onSelectForPayment(circle);
                  onClose();
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                <span>Commit Payment to Circle</span>
              </button>
            )}
            <a
              href={contractConfig.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <span>Explore Contract</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
