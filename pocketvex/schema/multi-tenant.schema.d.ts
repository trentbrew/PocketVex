/**
 * TypeScript definitions for Multi-Tenant Application Schema
 */

export interface App {
  id: string;
  owner: string; // User ID
  name: string;
  production_url?: string;
  development_url?: string;
  github?: string;
  meta?: Record<string, any>;
  created: string;
  updated: string;
}

export interface AppMember {
  id: string;
  app: string; // App ID
  user: string; // User ID
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'active' | 'removed';
  invitedBy?: string; // User ID
  created: string;
  updated: string;
}

export interface Schema {
  id: string;
  app: string; // App ID
  name: string;
  version?: string;
  schema: Record<string, any>; // Dynamic schema definition
  createdBy: string; // User ID
  created: string;
  updated: string;
}

export interface PVRecord {
  id: string;
  app: string; // App ID
  schema: string; // Schema ID
  data: Record<string, any>; // Dynamic data based on schema
  createdBy: string; // User ID
  created: string;
  updated: string;
}

export interface PVFile {
  id: string;
  app: string; // App ID
  schema: string; // Schema ID
  record?: string; // PVRecord ID
  file: string; // File ID
  public?: boolean;
  metadata?: Record<string, any>;
  created: string;
  updated: string;
}

export interface PVState {
  id: string;
  key: string;
  value: Record<string, any>;
  holder?: string;
  expires?: string;
  created: string;
  updated: string;
}

// Collection type definitions
export type AppCollection = App;
export type AppMemberCollection = AppMember;
export type SchemaCollection = Schema;
export type PVRecordCollection = PVRecord;
export type PVFileCollection = PVFile;
export type PVStateCollection = PVState;

// Multi-tenant schema structure
export interface MultiTenantSchema {
  collections: Array<{
    id: string;
    name: string;
    type: 'base';
    system: boolean;
    schema: Array<{
      id: string;
      name: string;
      type: string;
      required: boolean;
      presentable: boolean;
      options: Record<string, any>;
    }>;
    indexes: string[];
    listRule: string | null;
    viewRule: string | null;
    createRule: string | null;
    updateRule: string | null;
    deleteRule: string | null;
    options: Record<string, any>;
  }>;
}
