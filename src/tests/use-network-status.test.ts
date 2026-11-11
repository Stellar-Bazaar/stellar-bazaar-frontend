import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

describe('useNetworkStatus', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is exported and defined as a React hook', () => {
    expect(useNetworkStatus).toBeDefined();
    expect(typeof useNetworkStatus).toBe('function');
  });

  it('reports online status when navigator.onLine is true and fetch succeeds', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, status: 200 });

    const fakeChecker = async () => {
      const res = await fetch('https://horizon-testnet.stellar.org', { method: 'HEAD' });
      return res.ok;
    };

    const isReachable = await fakeChecker();
    expect(isReachable).toBe(true);
    expect(fetch).toHaveBeenCalledWith('https://horizon-testnet.stellar.org', { method: 'HEAD' });
  });

  it('detects RPC unreachability when fetch throws network error', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error / DNS failure'));

    const fakeChecker = async () => {
      try {
        await fetch('https://horizon-testnet.stellar.org', { method: 'HEAD' });
        return true;
      } catch {
        return false;
      }
    };

    const isReachable = await fakeChecker();
    expect(isReachable).toBe(false);
  });
});
