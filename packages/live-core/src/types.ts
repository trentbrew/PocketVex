/**
 * Core types for PocketVex Live State Management
 */

export type PVQueryKey = string | [string, PVQueryParams];

export type PVQueryParams = {
  collection: string;
  filter?: string;
  sort?: string;
  limit?: number;
  expand?: string;
};

export type PVPolicy = 'live' | 'swr' | 'manual';

export type PVQueryState<T = unknown> = {
  data: T | undefined;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: unknown;
  updatedAt: number;
};

export type Subscriber<T> = (state: PVQueryState<T>) => void;

export type QueryEntry<T> = {
  key: string;
  params: PVQueryParams;
  state: PVQueryState<T>;
  subs: Set<Subscriber<T>>;
  refCount: number;
  ids?: string[]; // for local re-sort
  _stop?: () => void;
  _lastSeen?: number;
};

export type Entity = Record<string, any>;
export type EntityStore = Map<string, Map<string, Entity>>;

export interface PVClient {
  query<T = any>(key: PVQueryKey, opts?: { policy?: PVPolicy }): void;
  get<T = any>(key: PVQueryKey): PVQueryState<T>;
  subscribe<T = any>(key: PVQueryKey, cb: Subscriber<T>): () => void;
  invalidate(keys?: PVQueryKey | PVQueryKey[]): void;

  // CRUD operations
  create(collection: string, data: any): Promise<any>;
  update(collection: string, id: string, data: any): Promise<any>;
  delete(collection: string, id: string): Promise<void>;
}

export interface PVClientConfig {
  url: string;
  auth?: () => string | undefined;
  sdk?: any; // PocketBase instance
  onError?: (err: unknown) => void;
}
