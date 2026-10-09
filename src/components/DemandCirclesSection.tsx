import React from 'react';
import { Users, Clock, Tag, ArrowUpRight } from 'lucide-react';
import { DemandCircleDemo } from '../types/bazaar';

interface DemandCirclesSectionProps {
  onSelectCircleForPayment?: (circle: DemandCircleDemo) => void;
}

const DEMO_CIRCLES: DemandCircleDemo[] = [
  {
    id: 'circle-solar-2026',
    title: 'Commercial Solar Inverters 5kW',
    category: 'Renewable Energy',
    description:
      'Aggregated business demand pool for high-efficiency solar grid-tie inverters. Bulk pricing unlocks at 25 units.',
    targetUnitPriceXlm: 120.0,
    marketPriceXlm: 185.0,
    minVolume: 25,
    currentVolume: 19,
    maxVolume: 50,
    participantsCount: 8,
    deadlineHours: 48,
    status: 'OPEN',
    sellerQuotesCount: 3,
    bestSellerQuoteXlm: 115.0,
  },
  {
    id: 'circle-iot-sensors',
    title: 'Precision Soil Moisture LoRaWAN Sensors',
    category: 'AgriTech Hardware',
    description:
      'Cooperative farm sensor purchase. Soroban escrow releases milestone funds upon verified supplier batch shipment.',
    targetUnitPriceXlm: 45.0,
    marketPriceXlm: 70.0,
    minVolume: 100,
    currentVolume: 100,
    maxVolume: 200,
    participantsCount: 22,
    deadlineHours: 12,
    status: 'QUORUM_REACHED',
    sellerQuotesCount: 5,
    bestSellerQuoteXlm: 42.5,
  },
  {
    id: 'circle-coffee-roast',
    title: 'Direct-Trade Specialty Green Coffee Beans',
    category: 'Commodities',
    description:
      'Independent cafe roaster collective purchasing single-origin green coffee bags directly from producers.',
    targetUnitPriceXlm: 80.0,
    marketPriceXlm: 110.0,
    minVolume: 40,
    currentVolume: 34,
    maxVolume: 80,
    participantsCount: 14,
    deadlineHours: 96,
    status: 'OPEN',
    sellerQuotesCount: 2,
    bestSellerQuoteXlm: 78.0,
  },
];

export const DemandCirclesSection: React.FC<DemandCirclesSectionProps> = ({
  onSelectCircleForPayment,
}) => {
  return (
    <section style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Active Demand Circles
            </h2>
            <span className="badge badge-demo">Demonstration Content</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Buyers combine aggregate demand volume. Suppliers compete on unit price. Contracts settle milestones.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {DEMO_CIRCLES.map((circle) => {
          const progressPercent = Math.min(100, Math.round((circle.currentVolume / circle.minVolume) * 100));
          const discountPercent = Math.round(
            ((circle.marketPriceXlm - circle.targetUnitPriceXlm) / circle.marketPriceXlm) * 100
          );

          return (
            <div
              key={circle.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {circle.category}
                  </span>
                  <span
                    className={`badge ${circle.status === 'QUORUM_REACHED' ? 'badge-success' : 'badge-testnet'}`}
                  >
                    {circle.status === 'QUORUM_REACHED' ? 'Quorum Reached' : 'Aggregating'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  {circle.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  {circle.description}
                </p>

                {/* Pricing comparison */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Target Unit Price</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {circle.targetUnitPriceXlm} XLM
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                        {circle.marketPriceXlm} XLM
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      padding: '0.3rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    -{discountPercent}%
                  </div>
                </div>

                {/* Quorum Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Volume: <strong style={{ color: 'var(--text-main)' }}>{circle.currentVolume}</strong> / {circle.minVolume} units
                    </span>
                    <span style={{ fontWeight: 600, color: progressPercent >= 100 ? '#34d399' : 'var(--accent-primary-light)' }}>
                      {progressPercent}% Quorum
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background:
                          progressPercent >= 100
                            ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                            : 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Metadata details */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.775rem',
                    color: 'var(--text-dim)',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} /> {circle.participantsCount} Buyers
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} /> {circle.deadlineHours}h Remaining
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tag size={14} /> {circle.sellerQuotesCount} Seller Bids
                  </span>
                </div>
              </div>

              {/* Action trigger */}
              <div style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  onClick={() => onSelectCircleForPayment && onSelectCircleForPayment(circle)}
                >
                  <span>Commit Escrow Deposit</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
