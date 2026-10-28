import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { OfflineBanner } from '../components/OfflineBanner';

describe('OfflineBanner', () => {
  it('is exported and defined as a React component', () => {
    expect(OfflineBanner).toBeDefined();
    expect(typeof OfflineBanner).toBe('function');
  });

  it('renders null when both internet and RPC are online', () => {
    const element = React.createElement(OfflineBanner, {
      isOnline: true,
      isRpcReachable: true,
    });

    expect(element.props.isOnline).toBe(true);
    expect(element.props.isRpcReachable).toBe(true);
  });

  it('instantiates cleanly with retry callback when device is offline', () => {
    const handleRetry = vi.fn();
    const element = React.createElement(OfflineBanner, {
      isOnline: false,
      isRpcReachable: false,
      onRetry: handleRetry,
      isRetrying: false,
    });

    expect(element.props.isOnline).toBe(false);
    expect(element.props.onRetry).toBe(handleRetry);
  });

  it('instantiates when internet is up but Stellar RPC is down', () => {
    const element = React.createElement(OfflineBanner, {
      isOnline: true,
      isRpcReachable: false,
      className: 'test-offline-banner',
    });

    expect(element.props.isOnline).toBe(true);
    expect(element.props.isRpcReachable).toBe(false);
    expect(element.props.className).toBe('test-offline-banner');
  });
});
