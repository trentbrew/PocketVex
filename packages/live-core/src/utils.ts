/**
 * Utility functions for PocketVex Live Core
 */

import type { PVQueryKey, PVQueryParams, Entity, QueryEntry } from './types.js';

/**
 * Convert a query key to a string for caching
 */
export function keyOf(k: PVQueryKey): string {
  return Array.isArray(k) ? `${k[0]}::${JSON.stringify(k[1])}` : String(k);
}

/**
 * Parse a simple string key into query params
 */
export function parseKey(key: string): PVQueryParams {
  const [collection] = key.split(':');
  return { collection };
}

/**
 * Create a comparison function from a sort string
 */
export function cmpFromSort(
  sort?: string,
): ((a: Entity, b: Entity) => number) | undefined {
  if (!sort) return undefined;

  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;

  return (a: Entity, b: Entity) => {
    const va = a[field];
    const vb = b[field];

    if (va === vb) return 0;
    return (va > vb ? 1 : -1) * (desc ? -1 : 1);
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay) as unknown as number;
  };
}

/**
 * Check if two arrays are equal (shallow comparison)
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * Get list data from query entry
 */
export function getListData<T>(
  entry: QueryEntry<T>,
  entities: Map<string, Entity>,
): T[] {
  if (!entry.ids) return [];

  return entry.ids.map((id) => entities.get(id)).filter(Boolean) as T[];
}
