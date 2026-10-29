import React from 'react';

export type NetworkId = 'testnet' | 'futurenet' | 'local';

export interface NetworkProfile {
  id: NetworkId;
  name: string;
  sorobanRpcUrl: string;
  horizonUrl: string;
  passphrase: string;
  color: string;
}

export const NETWORK_PROFILES: Record<NetworkId, NetworkProfile> = {
  testnet: {
    id: 'testnet',
    name: 'Stellar Testnet',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
    color: '#10B981', // green
  },
  futurenet: {
    id: 'futurenet',
    name: 'Stellar Futurenet',
    sorobanRpcUrl: 'https://rpc-futurenet.stellar.org',
    horizonUrl: 'https://horizon-futurenet.stellar.org',
    passphrase: 'Test SDF Future Network ; October 2022',
    color: '#F59E0B', // amber
  },
  local: {
    id: 'local',
    name: 'Local Standalone Node',
    sorobanRpcUrl: 'http://localhost:8000/soroban/rpc',
    horizonUrl: 'http://localhost:8000',
    passphrase: 'Standalone Network ; February 2024',
    color: '#6B7280', // gray
  },
};

export interface NetworkSelectorProps {
  activeNetwork: NetworkId;
  onChangeNetwork: (profile: NetworkProfile) => void;
  className?: string;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  activeNetwork,
  onChangeNetwork,
  className = '',
}) => {
  const current = NETWORK_PROFILES[activeNetwork] || NETWORK_PROFILES.testnet;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value as NetworkId;
    if (selectedId in NETWORK_PROFILES) {
      onChangeNetwork(NETWORK_PROFILES[selectedId]);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
        style={{ backgroundColor: current.color }}
        aria-hidden="true"
      />
      <select
        value={activeNetwork}
        onChange={handleChange}
        aria-label="Select Target Stellar Network"
        className="py-1.5 pl-2.5 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors"
      >
        {Object.values(NETWORK_PROFILES).map((net) => (
          <option key={net.id} value={net.id}>
            {net.name}
          </option>
        ))}
      </select>
    </div>
  );
};

