'use client';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * useLocalStorage — SSR-safe hook that syncs with localStorage.
 *
 * - Same-tab writes trigger an immediate re-render in all consumers.
 * - Cross-tab changes are detected via the native `storage` event.
 * - Invalid JSON in localStorage falls back to `initialValue`.
 * - `getServerSnapshot` always returns `initialValue` (no hydration mismatch).
 * - Uses a single listener per `key` shared via a module-level registry,
 *   so multiple consumers of the same key stay in sync without loops.
 * - Parsed values are cached by raw string so that object identity is
 *   stable across getSnapshot calls, preventing useSyncExternalStore loops.
 */

// ---- module-level snapshot cache ----
// Prevents JSON.parse from creating new object references on every getSnapshot
// call, which would cause useSyncExternalStore to infinitely re-render.

const snapshotCache = new Map<string, { raw: string; value: unknown }>();

function readCachedValue<T>(key: string, initialValue: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    const rawStr = raw ?? '';
    const cached = snapshotCache.get(key);
    if (cached && cached.raw === rawStr) {
      return cached.value as T;
    }
    const value = raw !== null ? (JSON.parse(raw) as T) : initialValue;
    snapshotCache.set(key, { raw: rawStr, value });
    return value;
  } catch {
    return initialValue;
  }
}

// ---- module-level listener registry ----

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function emitChange(key: string) {
  // Invalidate the snapshot cache for this key so the next getSnapshot
  // call reads fresh data from localStorage.
  snapshotCache.delete(key);
  const set = listeners.get(key);
  if (set) set.forEach((fn) => fn());
}

function subscribeToKey(key: string, callback: Listener): () => void {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(callback);

  // Listen for cross-tab `storage` events (fires in *other* tabs).
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) emitChange(key);
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.get(key)!.delete(callback);
    if (listeners.get(key)!.size === 0) {
      listeners.delete(key);
    }
    window.removeEventListener('storage', onStorage);
  };
}

// ---- hook ----

/**
 * Clear the internal snapshot cache.
 * Exported for testing purposes only.
 */
export function _clearCacheForTesting() {
  snapshotCache.clear();
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const getSnapshot = useCallback(
    () => readCachedValue(key, initialValue),
    [key, initialValue]
  );

  const getServerSnapshot = useCallback(
    () => initialValue,
    [initialValue]
  );

  const subscribe = useCallback(
    (callback: Listener) => subscribeToKey(key, callback),
    [key]
  );

  const storedValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const current = readCachedValue(key, initialValue);
        const resolved =
          newValue instanceof Function ? newValue(current) : newValue;
        window.localStorage.setItem(key, JSON.stringify(resolved));
        // Notify same-tab consumers.
        emitChange(key);
        // Cross-tab notification is handled by the storage event listener
        // registered in subscribeToKey().
      } catch (error) {
        console.warn(`Error writing localStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [storedValue, setValue];
}
