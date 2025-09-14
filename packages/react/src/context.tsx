/**
 * React context for PocketVex client
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { PVClient } from '@pocketvex/live-core';

const PVClientContext = createContext<PVClient | null>(null);

export interface PVClientProviderProps {
  client: PVClient;
  children: ReactNode;
}

/**
 * Provider component for PocketVex client
 */
export function PVClientProvider({ client, children }: PVClientProviderProps) {
  return (
    <PVClientContext.Provider value={client}>
      {children}
    </PVClientContext.Provider>
  );
}

/**
 * Hook to get the PocketVex client from context
 */
export function usePVClient(): PVClient {
  const client = useContext(PVClientContext);
  if (!client) {
    throw new Error('usePVClient must be used within a PVClientProvider');
  }
  return client;
}
