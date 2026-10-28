import React from 'react';
import { Clock } from 'lucide-react';
import { OnChainDemandCircle } from '../types/contract';
import { getStatusBadgeConfig } from '../services/status-badge';

interface DemandCircleCardProps {
  circle: OnChainDemandCircle;
  onSelect: (circle: OnChainDemandCircle) => void;
}

export const DemandCircleCard: React.FC<DemandCircleCardProps> = React.memo(
  ({ circle, onSelect }) => {
    const totalPoolXlm = (
      circle.target_quantity * parseFloat(circle.target_price_xlm)
    ).toFixed(2);

    const badgeConfig = getStatusBadgeConfig(circle.status);
    const isQuorum = (circle.status as string) === 'QUORUM_REACHED';

    return (
      <div
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
        onClick={() => onSelect(circle)}
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
            <span className={`badge ${badgeConfig.className} ${isQuorum ? 'badge-quorum-pulse' : ''}`}>
              {badgeConfig.label}
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
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Target Pool</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary-light)' }}>
                {circle.target_quantity} units
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Max Unit Price</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
                {circle.target_price_xlm} XLM
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={12} />
            <span>Expires {circle.deadlineDate}</span>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            Est. Pool: {totalPoolXlm} XLM
          </span>
        </div>
      </div>
    );
  }
);

DemandCircleCard.displayName = 'DemandCircleCard';
