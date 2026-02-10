type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const found = memoryCache.get(key);
  if (!found) {
    return null;
  }

  if (Date.now() > found.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return found.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearCache(): void {
  memoryCache.clear();
}
