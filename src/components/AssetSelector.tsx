import React from 'react';
import {
  AssetCode,
  StellarAsset,
  getSupportedAssetsList,
  getAssetByCode,
} from '../types/stellar-asset';

export interface AssetSelectorProps {
  selectedAsset: AssetCode;
  onSelectAsset: (asset: StellarAsset) => void;
  disabled?: boolean;
  className?: string;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  selectedAsset,
  onSelectAsset,
  disabled = false,
  className = '',
}) => {
  const assets = getSupportedAssetsList();
  const currentAsset = getAssetByCode(selectedAsset) || assets[0];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const asset = getAssetByCode(e.target.value);
    if (asset) {
      onSelectAsset(asset);
    }
  };

  return (
    <div className={`asset-selector-container ${className}`}>
      <label
        htmlFor="asset-select-input"
        className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
      >
        Settlement Asset (SAC)
      </label>
      <div className="relative flex items-center">
        <div
          className="absolute left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs pointer-events-none"
          style={{ backgroundColor: currentAsset.iconBgColor }}
          aria-hidden="true"
        >
          {currentAsset.symbol}
        </div>
        <select
          id="asset-select-input"
          value={selectedAsset}
          onChange={handleChange}
          disabled={disabled}
          className="w-full pl-11 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          aria-label="Select Settlement Asset"
        >
          {assets.map((asset) => (
            <option key={asset.code} value={asset.code}>
              {asset.code} - {asset.name} {asset.isNative ? '(Native)' : '(SAC Token)'}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 truncate">
        Soroban SAC ID: <code className="font-mono">{currentAsset.sorobanContractId.slice(0, 8)}...{currentAsset.sorobanContractId.slice(-6)}</code>
      </p>
    </div>
  );
};
