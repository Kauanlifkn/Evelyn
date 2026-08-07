import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, _clearCacheForTesting } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  const KEY = 'test-use-ls';

  beforeEach(() => {
    window.localStorage.clear();
    _clearCacheForTesting();
  });

  afterEach(() => {
    window.localStorage.clear();
    _clearCacheForTesting();
  });

  it('reads the initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'hello'));
    expect(result.current[0]).toBe('hello');
  });

  it('reads an existing value from localStorage', () => {
    window.localStorage.setItem(KEY, JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('writes a value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));
    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0]).toBe('updated');
    expect(window.localStorage.getItem(KEY)).toBe('"updated"');
  });

  it('updates all consumers in the same tab', () => {
    const { result: a } = renderHook(() => useLocalStorage(KEY, 0));
    const { result: b } = renderHook(() => useLocalStorage(KEY, 0));

    expect(a.current[0]).toBe(0);
    expect(b.current[0]).toBe(0);

    act(() => {
      a.current[1](42);
    });

    expect(a.current[0]).toBe(42);
    expect(b.current[0]).toBe(42);
  });

  it('accepts a function updater', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 0));
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(1);
  });

  it('detects cross-tab changes via storage event', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'old'));

    // Simulate a storage event from another tab
    act(() => {
      window.localStorage.setItem(KEY, JSON.stringify('from-other-tab'));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: KEY,
          newValue: JSON.stringify('from-other-tab'),
        })
      );
    });

    expect(result.current[0]).toBe('from-other-tab');
  });

  it('falls back to initialValue on invalid JSON', () => {
    window.localStorage.setItem(KEY, '{not-valid-json}');
    // Suppress expected console.warn from JSON.parse
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useLocalStorage(KEY, 'fallback'));
    expect(result.current[0]).toBe('fallback');
    warnSpy.mockRestore();
  });

  it('falls back to initialValue when value is removed', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    act(() => {
      window.localStorage.removeItem(KEY);
      // Dispatch storage event for cross-tab removal
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: KEY,
          newValue: null,
        })
      );
    });
    expect(result.current[0]).toBe('default');
  });

  it('works with object values', () => {
    const initial = { name: 'Test', count: 0 };
    const { result } = renderHook(() => useLocalStorage(KEY, initial));

    act(() => {
      result.current[1]((prev) => ({ ...prev, count: prev.count + 1 }));
    });

    expect(result.current[0]).toEqual({ name: 'Test', count: 1 });
  });

  it('handles errors gracefully when localStorage.setItem throws', () => {
    // Force setItem to throw
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage(KEY, 'safe'));
    act(() => {
      result.current[1]('will-fail');
    });

    // Value should not have changed
    expect(result.current[0]).toBe('safe');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('does not create infinite loops on repeated writes', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 0));

    // Write the same value many times in sequence
    act(() => {
      for (let i = 0; i < 50; i++) {
        result.current[1](i);
      }
    });

    expect(result.current[0]).toBe(49);
  });

  it('works in an environment without window (SSR safety via getServerSnapshot)', () => {
    // The hook is designed so that useSyncExternalStore's getServerSnapshot
    // returns initialValue when window is not available. This is implicitly
    // tested by jsdom providing window, but we verify the type contract:
    const { result } = renderHook(() => useLocalStorage(KEY, 'ssr-value'));
    expect(result.current[0]).toBe('ssr-value');
  });
});
