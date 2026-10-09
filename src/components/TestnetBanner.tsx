import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export const TestnetBanner: React.FC = () => {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
        padding: '0.65rem 1.25rem',
        fontSize: '0.85rem',
        color: '#fef3c7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        textAlign: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
        <AlertTriangle size={16} color="#fbbf24" />
        <span>STELLAR TESTNET ENVIRONMENT:</span>
      </div>
      <span style={{ color: '#fde68a' }}>
        This application operates strictly on the Stellar Testnet. All XLM tokens and transactions are test assets with zero real-world financial value.
      </span>
      <a
        href="https://laboratory.stellar.org/#account-creator?network=test"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#fbbf24',
          textDecoration: 'underline',
          fontWeight: 500,
        }}
      >
        Stellar Testnet Faucet <ExternalLink size={12} />
      </a>
    </div>
  );
};
