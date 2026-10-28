import React from 'react';

export type ExplorerEntityType = 'tx' | 'account' | 'contract' | 'ledger';
export type StellarNetwork = 'testnet' | 'public' | 'futurenet';

/**
 * Builds external blockchain explorer URL for Stellar.Expert
 */
export function buildExplorerUrl(
  type: ExplorerEntityType,
  identifier: string,
  network: StellarNetwork = 'testnet'
): string {
  const cleanId = identifier.trim();
  const net = network.toLowerCase();
  return `https://stellar.expert/explorer/${net}/${type}/${cleanId}`;
}

export interface ExplorerLinkProps {
  type: ExplorerEntityType;
  value: string;
  network?: StellarNetwork;
  label?: string;
  truncate?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const ExplorerLink: React.FC<ExplorerLinkProps> = ({
  type,
  value,
  network = 'testnet',
  label,
  truncate = true,
  showIcon = true,
  className = '',
}) => {
  if (!value) return null;

  const url = buildExplorerUrl(type, value, network);
  const displayValue = label
    ? label
    : truncate && value.length > 14
    ? `${value.slice(0, 6)}...${value.slice(-6)}`
    : value;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-mono text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors ${className}`}
      title={`View ${type} on Stellar.Expert (${network})`}
      aria-label={`View ${type} ${value} on Stellar.Expert`}
    >
      <span>{displayValue}</span>
      {showIcon && (
        <span className="text-[10px] leading-none" aria-hidden="true">
          ↗
        </span>
      )}
    </a>
  );
};
