/**
 * Type-safe storage cache manager with TTL eviction and BigInt serialization support.
 * Enables offline viewing of Stellar Bazaar demand circles and account balances.
 */

export interface CacheEnvelope<T> {
  value: T;
  cachedAt: number;
  expiresAt: number | null; // null = never expires
  version: number;
}

const CACHE_VERSION = 1;
const PREFIX = 'sb_cache_';

/**
 * Custom JSON serializer supporting BigInt primitives.
 */
export function serializeWithBigInt(data: any): string {
  return JSON.stringify(data, (_, value) => {
    if (typeof value === 'bigint') {
      return { __type: 'bigint', value: value.toString() };
    }
    return value;
  });
}

/**
 * Custom JSON deserializer restoring BigInt primitives.
 */
export function deserializeWithBigInt<T>(json: string): T {
  return JSON.parse(json, (_, value) => {
    if (value && typeof value === 'object' && value.__type === 'bigint') {
      return BigInt(value.value);
    }
    return value;
  });
}

function getStorage(type: 'local' | 'session'): Storage | null {
  try {
    if (type === 'local') {
      if (typeof localStorage !== 'undefined') return localStorage;
      if (typeof window !== 'undefined') return window.localStorage;
    } else {
      if (typeof sessionStorage !== 'undefined') return sessionStorage;
      if (typeof window !== 'undefined') return window.sessionStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Stores an item in cache with optional TTL in milliseconds.
 */
export function setCacheItem<T>(
  key: string,
  value: T,
  ttlMs?: number,
  storageType: 'local' | 'session' = 'local'
): boolean {
  const storage = getStorage(storageType);
  if (!storage) return false;

  const now = Date.now();
  const envelope: CacheEnvelope<T> = {
    value,
    cachedAt: now,
    expiresAt: ttlMs !== undefined ? now + ttlMs : null,
    version: CACHE_VERSION,
  };

  try {
    const serialized = serializeWithBigInt(envelope);
    storage.setItem(`${PREFIX}${key}`, serialized);
    return true;
  } catch {
    // Gracefully handle storage quota exceeded
    return false;
  }
}

/**
 * Retrieves an item from cache, returning null if missing or expired.
 */
export function getCacheItem<T>(
  key: string,
  storageType: 'local' | 'session' = 'local'
): T | null {
  const storage = getStorage(storageType);
  if (!storage) return null;

  try {
    const raw = storage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;

    const envelope = deserializeWithBigInt<CacheEnvelope<T>>(raw);

    // Evict if expired
    if (envelope.expiresAt !== null && Date.now() > envelope.expiresAt) {
      storage.removeItem(`${PREFIX}${key}`);
      return null;
    }

    return envelope.value;
  } catch {
    return null;
  }
}

/**
 * Removes an item from cache.
 */
export function removeCacheItem(
  key: string,
  storageType: 'local' | 'session' = 'local'
): void {
  const storage = getStorage(storageType);
  if (!storage) return;
  try {
    storage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Ignore
  }
}

/**
 * Purges expired items from cache storage.
 */
export function clearExpiredCache(
  storageType: 'local' | 'session' = 'local'
): number {
  const storage = getStorage(storageType);
  if (!storage) return 0;

  let purgedCount = 0;
  const now = Date.now();

  try {
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(PREFIX)) {
        keys.push(k);
      }
    }

    for (const fullKey of keys) {
      const raw = storage.getItem(fullKey);
      if (!raw) continue;
      try {
        const envelope = JSON.parse(raw);
        if (envelope.expiresAt !== null && now > envelope.expiresAt) {
          storage.removeItem(fullKey);
          purgedCount++;
        }
      } catch {
        storage.removeItem(fullKey);
        purgedCount++;
      }
    }
  } catch {
    // Ignore
  }

  return purgedCount;
}
