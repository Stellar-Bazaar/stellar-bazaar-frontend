import React, { useState, useEffect } from 'react';
import {
  Clock,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Activity,
  Layers,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { OnChainDemandCircle, ContractEventItem } from '../types/contract';
import { SorobanContractService } from '../services/soroban-contract';

interface DemandCirclesSectionProps {
  onOpenCreateCircle: () => void;
  onSelectCircleDetails: (circle: OnChainDemandCircle) => void;
  onSelectCircleForPayment?: (circle: OnChainDemandCircle) => void;
  walletConnected: boolean;
  refreshTrigger: number;
}

export const DemandCirclesSection: React.FC<DemandCirclesSectionProps> = ({
  onOpenCreateCircle,
  onSelectCircleDetails,
  onSelectCircleForPayment,
  walletConnected,
  refreshTrigger,
}) => {
  const [circles, setCircles] = useState<OnChainDemandCircle[]>([]);
  const [events, setEvents] = useState<ContractEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingEvents, setIsSyncingEvents] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const contractConfig = SorobanContractService.getConfig();

  const loadOnChainData = async () => {
    setIsLoading(true);
    try {
      const onChainCircles = await SorobanContractService.getAllCircles();
      setCircles(onChainCircles);
      const syncedEvents = await SorobanContractService.syncEvents();
      setEvents(syncedEvents);
    } catch (err) {
      console.warn('Failed to load on-chain circles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOnChainData();
  }, [refreshTrigger]);

  const handleManualSync = async () => {
    setIsSyncingEvents(true);
    try {
      await loadOnChainData();
    } finally {
      setIsSyncingEvents(false);
    }
  };

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractConfig.contractId);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <section style={{ marginTop: '3.5rem' }}>
      {/* Contract Status Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <ShieldCheck size={24} color="var(--accent-primary-light)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                Soroban DemandCircleRegistry & BazaarDealEngine
              </span>
              <span className="badge badge-success">Protocol 22 Live</span>
              <span className="badge badge-testnet">Stellar Testnet</span>
              <span className="badge badge-primary">Cross-Contract Linked</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registry:</span>
                <code
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'var(--accent-secondary)',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {contractConfig.contractId.slice(0, 10)}...{contractConfig.contractId.slice(-6)}
                </code>
                <button
                  type="button"
                  onClick={handleCopyContract}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  title="Copy Contract Address"
                >
                  {copiedContract ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deal Engine:</span>
                <code
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary-light)',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {(contractConfig.dealEngine?.contractId || contractConfig.contractId).slice(0, 10)}...{(contractConfig.dealEngine?.contractId || contractConfig.contractId).slice(-6)}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href={contractConfig.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <span>Contract Explorer</span>
            <ExternalLink size={13} />
          </a>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncingEvents}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            <RefreshCw size={13} className={isSyncingEvents ? 'spinner' : ''} />
            <span>Sync On-Chain</span>
          </button>
        </div>
      </div>

      {/* Section Title & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Live Demand Circles
            </h2>
            <span className="badge badge-testnet">On-Chain Registry</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Authoritative Soroban contract storage. Buyers aggregate purchase volume; commercial constraints settle trustlessly.
          </p>
        </div>

        <div>
          <button
            type="button"
            id="btn-open-create-circle"
            onClick={onOpenCreateCircle}
            disabled={!walletConnected}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusCircle size={16} />
            <span>Create Demand Circle</span>
          </button>
        </div>
      </div>

      {/* Circle Cards Grid */}
      {isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Querying Soroban contract storage on Stellar Testnet...
          </p>
        </div>
      ) : circles.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Layers size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            No Demand Circles Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Be the first buyer to create a demand circle on the deployed registry contract.
          </p>
          <button
            type="button"
            onClick={onOpenCreateCircle}
            disabled={!walletConnected}
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            <span>Create First Circle</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {circles.map((circle) => {
            const totalPoolXlm = (
              circle.target_quantity * parseFloat(circle.target_price_xlm)
            ).toFixed(2);

            return (
              <div
                key={circle.id}
                id={`circle-card-${circle.id}`}
                className="glass-card interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => onSelectCircleDetails(circle)}
              >
                <div>
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                    }}
                  >
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
                  </div>

                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      color: '#fff',
                      lineHeight: 1.3,
                    }}
                  >
                    {circle.title}
                  </h3>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Creator: <span style={{ fontFamily: 'monospace' }}>{circle.creator.slice(0, 8)}...{circle.creator.slice(-6)}</span>
                  </div>

                  {/* Commercial Metrics Box */}
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Price</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                        {circle.target_price_xlm} XLM
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Volume</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                        {circle.target_quantity} units
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Pool size & Deadline */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={12} />
                      <span style={{ color: circle.isExpired ? '#f87171' : 'var(--text-muted)' }}>
                        {circle.isExpired ? 'Expired' : circle.deadlineDate.split(',')[0]}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>
                      Pool: {totalPoolXlm} XLM
                    </div>
                  </div>
                  {onSelectCircleForPayment && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', marginTop: '0.65rem', width: '100%' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCircleForPayment(circle);
                      }}
                    >
                      <span>Commit Payment Escrow</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contract Events Feed Section */}
      <div style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Activity size={18} color="var(--accent-primary-light)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Live Soroban Event Stream
          </h3>
          <span className="badge badge-testnet">RPC Indexer</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Synchronized contract events consumed directly from Soroban RPC with deduplication and replay safety.
        </p>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          {events.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No contract events recorded yet for this session.
            </div>
          ) : (
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {events.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '0.8rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      {ev.type}
                    </span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>
                      Demand Circle #{ev.circleId || 1}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Ledger #{ev.ledger}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {ev.timestamp}
                    </span>
                    {ev.txHash && (
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${ev.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--accent-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          textDecoration: 'none',
                        }}
                      >
                        <span>Tx</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
