import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { AccountBalanceCard, AccountBalanceMap } from '../components/AccountBalanceCard';

describe('AccountBalanceCard component', () => {
  const dummyBalances: AccountBalanceMap = {
    XLM: 10_000_000_000n, // 1000 XLM
    USDC: 250_000_000n,    // 25 USDC
    EURC: 100_000_000n,    // 10 EURC
  };

  it('is exported and defined as a React component', () => {
    expect(AccountBalanceCard).toBeDefined();
    expect(typeof AccountBalanceCard).toBe('function');
  });

  it('instantiates cleanly for disconnected wallet state', () => {
    const element = React.createElement(AccountBalanceCard, {
      publicKey: null,
      balances: dummyBalances,
    });

    expect(element).toBeDefined();
    expect(element.props.publicKey).toBeNull();
  });

  it('instantiates with connected wallet and balance map', () => {
    const handleRefresh = vi.fn();
    const handleFund = vi.fn();

    const element = React.createElement(AccountBalanceCard, {
      publicKey: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      balances: dummyBalances,
      isLoading: false,
      isFunding: false,
      onRefresh: handleRefresh,
      onFundTestnet: handleFund,
    });

    expect(element).toBeDefined();
    expect(element.props.publicKey).toBe('GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
    expect(element.props.balances.XLM).toBe(10_000_000_000n);
    expect(element.props.balances.USDC).toBe(250_000_000n);
    expect(element.props.balances.EURC).toBe(100_000_000n);
  });
});
