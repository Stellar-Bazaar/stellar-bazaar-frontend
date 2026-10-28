import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { NetworkSelector, NETWORK_PROFILES } from '../components/NetworkSelector';

describe('NetworkSelector component', () => {
  it('defines valid network profiles with cryptographic passphrases', () => {
    expect(NETWORK_PROFILES.testnet.passphrase).toBe('Test SDF Network ; September 2015');
    expect(NETWORK_PROFILES.futurenet.passphrase).toBe('Test SDF Future Network ; October 2022');
    expect(NETWORK_PROFILES.local.passphrase).toBe('Standalone Network ; February 2024');
  });

  it('is exported and defined as a React component', () => {
    expect(NetworkSelector).toBeDefined();
    expect(typeof NetworkSelector).toBe('function');
  });

  it('instantiates with active testnet network', () => {
    const handleChange = vi.fn();
    const element = React.createElement(NetworkSelector, {
      activeNetwork: 'testnet',
      onChangeNetwork: handleChange,
    });

    expect(element).toBeDefined();
    expect(element.props.activeNetwork).toBe('testnet');
  });
});
