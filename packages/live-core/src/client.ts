/**
 * PocketVex Live Client Implementation
 */

import PocketBase from 'pocketbase';
import type {
  PVClient,
  PVClientConfig,
  PVQueryKey,
  PVQueryState,
  QueryEntry,
  EntityStore,
  Subscriber,
  PVPolicy,
} from './types.js';
import {
  keyOf,
  parseKey,
  cmpFromSort,
  debounce,
  getListData,
} from './utils.js';

export function createPVClient(cfg: PVClientConfig): PVClient {
  const pb = cfg.sdk ?? new PocketBase(cfg.url);

  // Core state
  const entities: EntityStore = new Map();
  const queries: Map<string, QueryEntry<any>> = new Map();
  const pendingRefetch = new Map<string, number>(); // debounce tracking

  // Dedupe realtime subscriptions by collection+filter
  const liveSubs: Map<string, { stop: () => void; ref: number }> = new Map();

  // Track auth token to handle flips (re-auth / logout)
  let lastAuthToken: string | undefined = undefined;
  const readAuthToken = () => {
    try {
      // prefer user-supplied getter
      const viaCfg = cfg.auth?.();
      if (viaCfg !== undefined) return viaCfg;
      // fallback to PocketBase authStore if present
      // @ts-expect-error optional runtime prop
      return pb?.authStore?.token as string | undefined;
    } catch {
      return undefined;
    }
  };

  /**
   * Ensure a collection exists in the entity store
   */
  const ensureCollection = (c: string) => {
    if (!entities.has(c)) entities.set(c, new Map());
    return entities.get(c)!;
  };

  /**
   * Update query state and notify subscribers
   */
  const setState = <T>(
    entry: QueryEntry<T>,
    next: Partial<PVQueryState<T>>,
  ) => {
    entry.state = { ...entry.state, ...next, updatedAt: Date.now() };
    for (const fn of entry.subs) fn(entry.state);
  };

  /**
   * Debounced refetch to prevent burst updates
   */
  const scheduleRefetch = debounce((entry: QueryEntry<any>) => {
    pendingRefetch.delete(entry.key);
    fetchOnce(entry).catch(cfg.onError);
  }, 25); // 25ms delay feels "live" without thrashing

  /**
   * Local re-sort for simple cases (avoids refetch)
   */
  const maybeReorder = (entry: QueryEntry<any>) => {
    const cmp = cmpFromSort(entry.params.sort);
    if (!cmp || !entry.ids) return;

    const bucket = entities.get(entry.params.collection);
    if (!bucket) return;

    entry.ids.sort((ia, ib) => cmp(bucket.get(ia)!, bucket.get(ib)!));
    entry.state.data = getListData(entry, bucket);
    setState(entry, { data: entry.state.data });
  };

  /**
   * Fetch data for a query
   */
  const fetchOnce = async <T>(entry: QueryEntry<T>) => {
    try {
      setState(entry, {
        status: entry.state.status === 'idle' ? 'loading' : entry.state.status,
      });

      const { collection, filter, sort, limit, expand } = entry.params;
      const list = await pb.collection(collection).getList(1, limit ?? 50, {
        filter,
        sort,
        expand,
      });

      // Normalize entities
      const bucket = ensureCollection(collection);
      for (const r of list.items) {
        bucket.set(r.id, r);
      }

      // Store IDs for local re-sort
      entry.ids = list.items.map((r) => r.id);
      entry._lastSeen = Date.now();

      setState<T>(entry, {
        status: 'success',
        data: list.items as any,
      });
    } catch (e) {
      setState(entry, { status: 'error', error: e });
      cfg.onError?.(e);
    }
  };

  /**
   * Subscribe to real-time updates for a collection
   */
  const subscribeLive = <T>(entry: QueryEntry<T>) => {
    const { collection, filter } = entry.params;
    const liveKey = `${collection}::${filter ?? '*'}`;

    let live = liveSubs.get(liveKey);
    if (!live) {
      let stopped = false;

      // Use server-side filter when available (PB 0.21+)
      const subOptions = filter ? { filter } : {};

      pb.collection(collection)
        .subscribe(
          '*',
          (ev) => {
            if (stopped) return;

            const bucket = ensureCollection(collection);
            if (ev.action === 'delete') {
              bucket.delete(ev.record.id);
            } else {
              bucket.set(ev.record.id, ev.record);
            }

            // Re-evaluate affected queries: local reorder then schedule a refetch burst-coalesced
            for (const q of queries.values()) {
              if (q.params.collection !== collection) continue;

              // Try local re-sort first
              maybeReorder(q);

              // If local re-sort didn't work, schedule refetch
              if (q.state.status !== 'loading') {
                scheduleRefetch(q);
              }
            }
          },
          subOptions,
        )
        .catch(cfg.onError);

      live = {
        ref: 0,
        stop: () => {
          stopped = true;
          pb.collection(collection)
            .unsubscribe('*')
            .catch(() => {});
        },
      };
      liveSubs.set(liveKey, live);
    }

    live.ref++;
    entry._stop = () => {
      const cur = liveSubs.get(liveKey);
      if (!cur) return;
      cur.ref--;
      if (cur.ref <= 0) {
        cur.stop();
        liveSubs.delete(liveKey);
      }
    };
  };

  /**
   * Ensure a query entry exists
   */
  const ensureQuery = <T>(k: PVQueryKey): QueryEntry<T> => {
    const key = keyOf(k);
    let q = queries.get(key);
    if (!q) {
      const params =
        Array.isArray(k) && typeof k[1] === 'object'
          ? (k[1] as any)
          : parseKey(String(k));

      q = {
        key,
        params,
        state: { data: undefined, status: 'idle', updatedAt: 0 },
        subs: new Set(),
        refCount: 0,
      };
      queries.set(key, q);
    }
    return q as QueryEntry<T>;
  };

  /**
   * Garbage collection for unused queries
   */
  const gc = () => {
    const now = Date.now();
    const ttl = 5 * 60 * 1000; // 5 minutes

    for (const [key, entry] of queries.entries()) {
      if (entry.refCount === 0 && now - entry.state.updatedAt > ttl) {
        entry._stop?.();
        queries.delete(key);
      }
    }
  };

  // Run GC every minute
  setInterval(gc, 60000);

  /**
   * Reconnect + auth flip handlers
   * - When the auth token changes, tear down live subs and invalidate queries.
   * - When the app regains connectivity, invalidate queries to backfill.
   */
  const resubscribeAll = () => {
    // stop all live subs
    for (const [, live] of liveSubs) {
      try {
        live.stop();
      } catch {}
    }
    liveSubs.clear();
    // re-attach for all live queries
    for (const q of queries.values()) {
      if (!q._stop) continue; // only those that had live
      subscribeLive(q);
    }
  };

  const invalidateAll = () => {
    for (const q of queries.values()) {
      fetchOnce(q).catch(cfg.onError);
    }
  };

  // Poll auth token changes lightly
  lastAuthToken = readAuthToken();
  setInterval(() => {
    const current = readAuthToken();
    if (current !== lastAuthToken) {
      lastAuthToken = current;
      // Auth changed: resubscribe + invalidate
      resubscribeAll();
      invalidateAll();
    }
  }, 3000);

  // Online event backfill
  if (
    typeof window !== 'undefined' &&
    typeof window.addEventListener === 'function'
  ) {
    window.addEventListener('online', () => {
      invalidateAll();
    });
  }

  /**
   * Public API
   */
  const api: PVClient = {
    query<T>(k: PVQueryKey, opts?: { policy?: PVPolicy }) {
      const entry = ensureQuery<T>(k);

      if ((opts?.policy ?? 'live') === 'live') {
        if (!entry._stop) subscribeLive(entry);
      }

      fetchOnce(entry).catch(cfg.onError);
    },

    get<T>(k: PVQueryKey) {
      const entry = ensureQuery<T>(k);
      return entry.state as PVQueryState<T>;
    },

    subscribe<T>(k: PVQueryKey, cb: Subscriber<T>) {
      const entry = ensureQuery<T>(k);
      entry.refCount++;
      entry.subs.add(cb as Subscriber<any>);

      cb(entry.state as PVQueryState<T>);

      return () => {
        entry.subs.delete(cb as Subscriber<any>);
        entry.refCount--;
        if (entry.refCount <= 0) {
          entry._stop?.();
          // Don't delete immediately - let GC handle it
        }
      };
    },

    invalidate(keys) {
      const arr = Array.isArray(keys)
        ? keys
        : keys
        ? [keys]
        : Array.from(queries.keys());
      for (const k of arr) {
        const entry = queries.get(Array.isArray(k) ? keyOf(k) : String(k));
        if (entry) fetchOnce(entry).catch(cfg.onError);
      }
    },

    async create(collection, data) {
      const rec = await pb.collection(collection).create(data);
      ensureCollection(collection).set(rec.id, rec);
      return rec;
    },

    async update(collection, id, data) {
      const rec = await pb.collection(collection).update(id, data);
      ensureCollection(collection).set(rec.id, rec);
      return rec;
    },

    async delete(collection, id) {
      await pb.collection(collection).delete(id);
      ensureCollection(collection).delete(id);
    },
  };

  return api;
}
