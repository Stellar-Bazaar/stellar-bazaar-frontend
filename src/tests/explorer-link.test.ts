import { describe, it, expect } from 'vitest';
import React from 'react';
import { ExplorerLink, buildExplorerUrl } from '../components/ExplorerLink';

describe('ExplorerLink and buildExplorerUrl', () => {
  it('builds valid Stellar.Expert testnet URLs for transactions', () => {
    const hash = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
    expect(buildExplorerUrl('tx', hash, 'testnet')).toBe(
      `https://stellar.expert/explorer/testnet/tx/${hash}`
    );
  });

  it('builds valid Stellar.Expert URLs for accounts and contracts', () => {
    const account = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    expect(buildExplorerUrl('account', account, 'public')).toBe(
      `https://stellar.expert/explorer/public/account/${account}`
    );

    const contract = 'CDCK6A2QB5QTILDWILUQGAUWXI543TK63WN2OKG7WEWHBAMGZ6ESKY4G';
    expect(buildExplorerUrl('contract', contract, 'testnet')).toBe(
      `https://stellar.expert/explorer/testnet/contract/${contract}`
    );
  });

  it('builds valid ledger explorer URL', () => {
    expect(buildExplorerUrl('ledger', '142050', 'testnet')).toBe(
      'https://stellar.expert/explorer/testnet/ledger/142050'
    );
  });

  it('instantiates valid ExplorerLink element', () => {
    const element = React.createElement(ExplorerLink, {
      type: 'contract',
      value: 'CDCK6A2QB5QTILDWILUQGAUWXI543TK63WN2OKG7WEWHBAMGZ6ESKY4G',
      network: 'testnet',
      truncate: true,
      showIcon: true,
    });

    expect(element).toBeDefined();
    expect(element.props.type).toBe('contract');
    expect(element.props.network).toBe('testnet');
  });
});

