/**
 * Minimal migration typing for authoring helper-friendly migrations.
 * Note: This is a typing surface only; runtime helpers are left to the CLI/dev server.
 */

export interface MigrationSQL {
  run: (sql: string) => Promise<unknown>;
}

export interface MigrationOps {
  createCollection: (
    name: string,
    opts?: { type?: 'base' | 'auth'; system?: boolean },
  ) => Promise<void>;
  dropCollection: (name: string) => Promise<void>;
  addField: (collection: string, field: any) => Promise<void>;
  updateField: (
    collection: string,
    field: string,
    patch: any,
  ) => Promise<void>;
  deleteField: (collection: string, field: string) => Promise<void>;
  addIndex: (collection: string, sql: string) => Promise<void>;
  deleteIndex: (collection: string, sql: string) => Promise<void>;
}

export interface MigrationContext {
  sql: MigrationSQL;
  op: MigrationOps;
}

export type Migration = (pb: any, ctx: MigrationContext) => Promise<void>;

