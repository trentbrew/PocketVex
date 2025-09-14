/**
 * React hooks for PocketVex live state management
 */

import { useSyncExternalStore, useMemo, useRef } from 'react';
import type { PVClient, PVQueryKey, PVQueryState } from '@pocketvex/live-core';
import { usePVClient } from './context.js';

/**
 * Main hook for subscribing to PocketVex queries
 */
export function usePVQuery<T = any, S = PVQueryState<T>>(
  client: PVClient,
  key: PVQueryKey,
  opts?: {
    policy?: 'live' | 'swr' | 'manual';
    selector?: (s: PVQueryState<T>) => S;
    equalityFn?: (a: S, b: S) => boolean;
  },
): S {
  // Ensure query is started
  client.query<T>(key, { policy: opts?.policy ?? 'live' });

  const subscribe = (onChange: () => void) =>
    client.subscribe<T>(key, () => onChange());

  const getSnapshot = () => client.get<T>(key);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Apply selector with equality check to prevent unnecessary rerenders
  const selector =
    opts?.selector ?? (((x: any) => x) as (s: PVQueryState<T>) => S);
  const equalityFn = opts?.equalityFn ?? Object.is;

  const ref = useRef<S>(selector(state));
  const next = selector(state);

  if (!equalityFn(ref.current, next)) {
    ref.current = next;
  }

  return ref.current;
}

/**
 * Convenience hook for just the data (with stable equality)
 */
export function usePVData<T = any>(client: PVClient, key: PVQueryKey) {
  return usePVQuery<T, T | undefined>(client, key, {
    selector: (s) => s.data,
    equalityFn: (a, b) => a === b,
  });
}

/**
 * Hook for single record queries
 */
export function usePVRecord<T = any>(
  client: PVClient,
  collection: string,
  id: string,
) {
  return usePVQuery<T>(
    client,
    ['pv:record', { collection, filter: `id = "${id}"`, limit: 1 }],
    { policy: 'live' },
  );
}

/**
 * Hook for list queries with common parameters
 */
export function usePVList<T = any>(
  client: PVClient,
  collection: string,
  params?: { filter?: string; sort?: string; limit?: number; expand?: string },
) {
  return usePVQuery<T[]>(client, ['pv:list', { collection, ...params }], {
    policy: 'live',
  });
}

/**
 * Hook for query status only (useful for loading states)
 */
export function usePVStatus<T = any>(client: PVClient, key: PVQueryKey) {
  return usePVQuery<T, 'idle' | 'loading' | 'success' | 'error'>(client, key, {
    selector: (s) => s.status,
    equalityFn: (a, b) => a === b,
  });
}

/**
 * Hook for query error only
 */
export function usePVError<T = any>(client: PVClient, key: PVQueryKey) {
  return usePVQuery<T, unknown | undefined>(client, key, {
    selector: (s) => s.error,
    equalityFn: (a, b) => a === b,
  });
}

/**
 * Hook for invalidating queries
 */
export function usePVInvalidate(client: PVClient) {
  return useMemo(
    () => ({
      invalidate: (keys?: PVQueryKey | PVQueryKey[]) => client.invalidate(keys),
      invalidateAll: () => client.invalidate(),
    }),
    [client],
  );
}

/**
 * Hook for CRUD operations
 */
export function usePVMutation(client: PVClient) {
  return useMemo(
    () => ({
      create: (collection: string, data: any) =>
        client.create(collection, data),
      update: (collection: string, id: string, data: any) =>
        client.update(collection, id, data),
      delete: (collection: string, id: string) => client.delete(collection, id),
    }),
    [client],
  );
}

/**
 * Context-based convenience variants (no explicit client param)
 */
export function usePVQueryCtx<T = any, S = PVQueryState<T>>(
  key: PVQueryKey,
  opts?: {
    policy?: 'live' | 'swr' | 'manual';
    selector?: (s: PVQueryState<T>) => S;
    equalityFn?: (a: S, b: S) => boolean;
  },
): S {
  const client = usePVClient();
  return usePVQuery<T, S>(client, key, opts);
}

export function usePVDataCtx<T = any>(key: PVQueryKey) {
  const client = usePVClient();
  return usePVData<T>(client, key);
}

export function usePVRecordCtx<T = any>(collection: string, id: string) {
  const client = usePVClient();
  return usePVRecord<T>(client, collection, id);
}

export function usePVListCtx<T = any>(
  collection: string,
  params?: { filter?: string; sort?: string; limit?: number; expand?: string },
) {
  const client = usePVClient();
  return usePVList<T>(client, collection, params);
}

export function usePVStatusCtx<T = any>(key: PVQueryKey) {
  const client = usePVClient();
  return usePVStatus<T>(client, key);
}

export function usePVErrorCtx<T = any>(key: PVQueryKey) {
  const client = usePVClient();
  return usePVError<T>(client, key);
}

export function usePVInvalidateCtx() {
  const client = usePVClient();
  return usePVInvalidate(client);
}

export function usePVMutationCtx() {
  const client = usePVClient();
  return usePVMutation(client);
}
