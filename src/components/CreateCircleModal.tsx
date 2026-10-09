import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { CreateCircleParams } from '../types/contract';
import { SorobanContractService } from '../services/soroban-contract';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorAddress: string;
  onCircleCreated: (circleId: number, txHash: string) => void;
}

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  creatorAddress,
  onCircleCreated,
}) => {
  const [form, setForm] = useState<CreateCircleParams>({
    title: '',
    metadata_uri: '',
    target_quantity: 50,
    target_price_xlm: '2.5000',
    duration_days: 14,
  });

  const [status, setStatus] = useState<
    'IDLE' | 'SIMULATING' | 'AWAITING_SIGNATURE' | 'SUBMITTING' | 'CONFIRMING' | 'SUCCESS' | 'ERROR'
  >('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultTxHash, setResultTxHash] = useState<string | null>(null);
  const [resultCircleId, setResultCircleId] = useState<number | null>(null);

  if (!isOpen) return null;

  const totalPoolXlm = (
    form.target_quantity * (parseFloat(form.target_price_xlm) || 0)
  ).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatus('SIMULATING');

    try {
      const result = await SorobanContractService.createDemandCircle(
        creatorAddress,
        form,
        (step) => setStatus(step)
      );

      setResultTxHash(result.txHash);
      setResultCircleId(result.circleId);
      setStatus('SUCCESS');
      onCircleCreated(result.circleId, result.txHash);
    } catch (err: any) {
      console.error('Failed to create circle:', err);
      setStatus('ERROR');
      setErrorMessage(err?.message || 'Transaction simulation or submission failed.');
    }
  };

  const handleResetAndClose = () => {
    setStatus('IDLE');
    setErrorMessage(null);
    setResultTxHash(null);
    setResultCircleId(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={handleResetAndClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#0d1122',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          position: 'relative',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
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
            marginBottom: '1.25rem',
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
              <PlusCircle size={20} color="var(--accent-primary-light)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Create Demand Circle</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Deploy collective purchasing demand directly to Soroban Testnet
              </span>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-create-modal"
            onClick={handleResetAndClose}
            aria-label="Close create modal"
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

        {status === 'SUCCESS' ? (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Demand Circle Created On-Chain!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Circle #{resultCircleId} was recorded on the Stellar Testnet ledger in the DemandCircleRegistry contract.
            </p>

            {resultTxHash && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Confirmed Testnet Transaction Hash:
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    wordBreak: 'break-all',
                    color: 'var(--accent-secondary)',
                  }}
                >
                  {resultTxHash}
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${resultTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                  >
                    <span>View on Stellar Expert Explorer</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleResetAndClose}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Done & Refresh Marketplace
            </button>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {errorMessage && (
              <div
                id="create-circle-error"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  color: '#fca5a5',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Product / Title */}
            <div>
              <label
                htmlFor="circle-title"
                style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}
              >
                Product or Commodity Reference (1-64 chars) *
              </label>
              <input
                id="circle-title"
                type="text"
                required
                maxLength={64}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Specialty Rwandan Green Coffee (Bulk 50kg)"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Target Quantity & Unit Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label
                  htmlFor="circle-quantity"
                  style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Target Quantity (Units) *
                </label>
                <input
                  id="circle-quantity"
                  type="number"
                  min="1"
                  max="1000000"
                  required
                  value={form.target_quantity}
                  onChange={(e) => setForm({ ...form, target_quantity: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="circle-price"
                  style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Target Unit Price (XLM) *
                </label>
                <input
                  id="circle-price"
                  type="text"
                  required
                  value={form.target_price_xlm}
                  onChange={(e) => setForm({ ...form, target_price_xlm: e.target.value })}
                  placeholder="2.5000"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Duration & Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label
                  htmlFor="circle-duration"
                  style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Deadline Duration (Days) *
                </label>
                <input
                  id="circle-duration"
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="circle-metadata"
                  style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Metadata URI / IPFS (Optional)
                </label>
                <input
                  id="circle-metadata"
                  type="text"
                  value={form.metadata_uri}
                  onChange={(e) => setForm({ ...form, metadata_uri: e.target.value })}
                  placeholder="ipfs://bafybeibazaar..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Summary preview */}
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Layers size={16} color="var(--accent-primary-light)" />
                <span>Aggregated Demand Commitment:</span>
              </div>
              <span style={{ fontWeight: 700, color: '#fff' }}>
                {totalPoolXlm} XLM <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({form.target_quantity} units)</span>
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              id="btn-submit-create-circle"
              disabled={status !== 'IDLE' && status !== 'ERROR'}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {status === 'SIMULATING' && (
                <>
                  <span className="spinner" />
                  <span>Simulating Soroban Transaction...</span>
                </>
              )}
              {status === 'AWAITING_SIGNATURE' && (
                <>
                  <span className="spinner" />
                  <span>Approve in Connected Wallet...</span>
                </>
              )}
              {status === 'SUBMITTING' && (
                <>
                  <span className="spinner" />
                  <span>Broadcasting to Stellar Testnet...</span>
                </>
              )}
              {status === 'CONFIRMING' && (
                <>
                  <span className="spinner" />
                  <span>Confirming Ledger Inclusion...</span>
                </>
              )}
              {(status === 'IDLE' || status === 'ERROR') && (
                <>
                  <PlusCircle size={18} />
                  <span>Authorize & Deploy Circle</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
