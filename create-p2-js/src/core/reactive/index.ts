import { useState, useEffect, useCallback } from 'react';
import { createStore } from '../store';

// Enhanced reactive primitives
export const createSignal = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  
  const get = useCallback(() => value, [value]);
  const set = useCallback((newValue: T) => setValue(newValue), []);
  
  return [get, set] as const;
};

// Smart effect system
export const createEffect = (fn: () => void, deps: any[] = []) => {
  useEffect(() => {
    fn();
  }, deps);
};

// Resource management with caching
interface ResourceOptions {
  initialValue?: any;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
}

export const createResource = <T>(
  fetcher: () => Promise<T>,
  options: ResourceOptions = {}
) => {
  const {
    initialValue = null,
    staleTime = 0,
    gcTime = 5 * 60 * 1000,
    retry = 3
  } = options;

  const [resource, setResource] = useState<T | null>(initialValue);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const store = createStore();

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < retry) {
      try {
        const data = await fetcher();
        setResource(data);
        
        // Store with timestamp for stale time checking
        const cacheKey = String(Date.now());
        await store.set(cacheKey, {
          data,
          timestamp: Date.now(),
          staleTime,
          gcTime
        });
        
        setIsLoading(false);
        return data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        attempts++;
        if (attempts === retry) {
          setError(lastError);
          setIsLoading(false);
          throw lastError;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }
  }, [fetcher, staleTime, gcTime, retry]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    resource,
    error,
    isLoading,
    load
  };
};

// Performance tracking
export const trackUsage = (type: string, value: any) => {
  // Implement usage tracking
  console.log(`Usage tracked: ${type}`, value);
};

// Optimization utilities
export const optimizeUpdate = <T>(oldValue: T, newValue: T): boolean => {
  return JSON.stringify(oldValue) !== JSON.stringify(newValue);
};

// Effect tracking
export const trackEffect = (fn: () => void) => {
  performance.mark('effect-start');
  fn();
  performance.mark('effect-end');
  performance.measure('effect-duration', 'effect-start', 'effect-end');
};
