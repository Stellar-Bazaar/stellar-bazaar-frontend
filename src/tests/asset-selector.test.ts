import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { AssetSelector } from '../components/AssetSelector';
import { STELLAR_TESTNET_ASSETS } from '../types/stellar-asset';

describe('AssetSelector component', () => {
  it('is exported and defined as a valid React component', () => {
    expect(AssetSelector).toBeDefined();
    expect(typeof AssetSelector).toBe('function');
  });

  it('instantiates valid JSX with selected asset', () => {
    const handleSelect = vi.fn();
    const element = React.createElement(AssetSelector, {
      selectedAsset: 'USDC',
      onSelectAsset: handleSelect,
      disabled: false,
    });

    expect(element).toBeDefined();
    expect(element.props.selectedAsset).toBe('USDC');
    expect(element.props.disabled).toBe(false);
  });

  it('renders with default disabled false when omitted', () => {
    const element = React.createElement(AssetSelector, {
      selectedAsset: 'XLM',
      onSelectAsset: () => {},
    });

    expect(element.props.disabled).toBeUndefined();
    expect(STELLAR_TESTNET_ASSETS[element.props.selectedAsset].code).toBe('XLM');
  });
});
