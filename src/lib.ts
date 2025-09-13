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

// Export core utilities
export { SchemaDiff } from './utils/diff.js';
export { allow as Rules, pb as PBRules } from './utils/rules.js';

// Note: CLI utilities are available via the main CLI interface
// Use 'pocketvex migrate' and 'pocketvex schema apply' commands
