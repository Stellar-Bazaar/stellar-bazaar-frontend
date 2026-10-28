import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { StellarBrandHeader } from '../components/StellarBrandHeader';

describe('StellarBrandHeader', () => {
  it('is exported and defined as a React component', () => {
    expect(StellarBrandHeader).toBeDefined();
    expect(typeof StellarBrandHeader).toBe('function');
  });

  it('instantiates cleanly in disconnected wallet state', () => {
    const handleConnect = vi.fn();
    const element = React.createElement(StellarBrandHeader, {
      publicKey: null,
      network: 'testnet',
      onConnectWallet: handleConnect,
    });

    expect(element.props.publicKey).toBeNull();
    expect(element.props.network).toBe('testnet');
    expect(element.props.onConnectWallet).toBe(handleConnect);
  });

  it('instantiates cleanly with connected wallet and balance', () => {
    const handleDisconnect = vi.fn();
    const handleNetworkChange = vi.fn();
    const testKey = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

    const element = React.createElement(StellarBrandHeader, {
      publicKey: testKey,
      network: 'futurenet',
      onNetworkChange: handleNetworkChange,
      onDisconnectWallet: handleDisconnect,
      xlmBalance: '4,520.50',
    });

    expect(element.props.publicKey).toBe(testKey);
    expect(element.props.network).toBe('futurenet');
    expect(element.props.xlmBalance).toBe('4,520.50');
  });
});
