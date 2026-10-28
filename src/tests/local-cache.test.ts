import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setCacheItem,
  getCacheItem,
  removeCacheItem,
  serializeWithBigInt,
  deserializeWithBigInt,
} from '../utils/local-cache';

describe('local-cache', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
      get length() {
        return Object.keys(mockStore).length;
      },
      key: (i: number) => Object.keys(mockStore)[i] || null,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serializes and deserializes BigInt fields accurately', () => {
    const original = {
      priceStroops: 10_000_000n,
      title: 'Coffee Circle',
    };

    const json = serializeWithBigInt(original);
    const restored = deserializeWithBigInt<typeof original>(json);

    expect(restored.priceStroops).toBe(10_000_000n);
    expect(restored.title).toBe('Coffee Circle');
  });

  it('stores and retrieves cached items safely', () => {
    const data = { id: 'C1', targetPrice: 50_000_000n };
    const success = setCacheItem('circle_C1', data, 60000);

    expect(success).toBe(true);

    const cached = getCacheItem<typeof data>('circle_C1');
    expect(cached).toEqual(data);
    expect(cached?.targetPrice).toBe(50_000_000n);
  });

  it('evicts expired items on access', () => {
    const data = { id: 'EXPIRED' };
    // Set with negative TTL so it is already expired
    setCacheItem('expired_item', data, -1000);

    const cached = getCacheItem('expired_item');
    expect(cached).toBeNull();
  });

  it('removes cached item on demand', () => {
    setCacheItem('item_to_remove', 'hello');
    expect(getCacheItem('item_to_remove')).toBe('hello');

    removeCacheItem('item_to_remove');
    expect(getCacheItem('item_to_remove')).toBeNull();
  });
});
