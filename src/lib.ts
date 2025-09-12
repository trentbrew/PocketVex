/**
 * PocketVex Library Exports
 * Main library interface for programmatic usage
 */

// Export types
export type {
  SchemaDefinition,
  SchemaCollection,
  SchemaField,
  SchemaRules,
  MigrationPlan,
  MigrationOperation,
  PocketBaseConfig,
  DevServerConfig,
} from './types/schema.js';

// Export core classes
export { SchemaDiff } from './utils/diff.js';
export { PocketBaseClient } from './utils/pocketbase.js';
export { DevServer } from './dev-server.js';

// Note: CLI utilities are available via the main CLI interface
// Use 'pocketvex migrate' and 'pocketvex schema apply' commands
