/**
 * TypeScript definitions for PocketBase schema
 * Provides type safety for schema definitions and migrations
 */

export interface SchemaField {
  id?: string;
  name: string;
  type:
    | 'text'
    | 'number'
    | 'bool'
    | 'email'
    | 'url'
    | 'date'
    | 'select'
    | 'json'
    | 'file'
    | 'relation';
  required?: boolean;
  unique?: boolean;
  options?: {
    min?: number;
    max?: number;
    pattern?: string;
    values?: string[];
    maxSelect?: number;
    maxSize?: number;
    collectionId?: string;
    cascadeDelete?: boolean;
    [key: string]: any;
  };
}

export interface SchemaRules {
  list?: string;
  view?: string;
  create?: string;
  update?: string;
  delete?: string;
}

export interface SchemaCollection {
  id?: string;
  name: string;
  type?: 'base' | 'auth';
  system?: boolean;
  schema?: SchemaField[];
  indexes?: string[];
  rules?: SchemaRules;
}

export interface SchemaDefinition {
  collections: SchemaCollection[];
}

export interface MigrationPlan {
  safe: MigrationOperation[];
  unsafe: MigrationOperation[];
}

export interface MigrationOperation {
  kind:
    | 'createCollection'
    | 'updateCollection'
    | 'deleteCollection'
    | 'addField'
    | 'updateField'
    | 'deleteField'
    | 'renameField'
    | 'addIndex'
    | 'deleteIndex'
    | 'updateRules'
    | 'typeChange';
  summary: string;
  collection?: string;
  field?: string;
  payload: any;
  requiresDataMigration?: boolean;
}

export interface PocketBaseConfig {
  url: string;
  adminEmail: string;
  adminPassword: string;
}

export interface DevServerConfig extends PocketBaseConfig {
  watchPaths: string[];
  autoApply: boolean;
  generateMigrations: boolean;
  migrationPath: string;
}
