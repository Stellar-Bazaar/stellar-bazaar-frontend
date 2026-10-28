import { describe, it, expect } from 'vitest';
import { getStatusBadgeConfig } from '../services/status-badge';

describe('status-badge utility helper', () => {
  it('returns badge-success for OPEN status', () => {
    const config = getStatusBadgeConfig('OPEN');
    expect(config.className).toBe('badge-success');
    expect(config.label).toBe('Open');
  });

  it('returns badge-primary for QUORUM_REACHED status', () => {
    const config = getStatusBadgeConfig('QUORUM_REACHED');
    expect(config.className).toBe('badge-primary');
    expect(config.label).toBe('Quorum Reached');
  });

  it('returns badge-testnet for SETTLED status', () => {
    const config = getStatusBadgeConfig('SETTLED');
    expect(config.className).toBe('badge-testnet');
    expect(config.label).toBe('Settled');
  });

  it('returns badge-demo for CANCELLED and EXPIRED status', () => {
    const cancelled = getStatusBadgeConfig('CANCELLED');
    expect(cancelled.className).toBe('badge-demo');
    const expired = getStatusBadgeConfig('EXPIRED');
    expect(expired.className).toBe('badge-demo');
  });

  it('handles lowercase and mixed-case gracefully', () => {
    const config = getStatusBadgeConfig('open');
    expect(config.className).toBe('badge-success');
  });
});
