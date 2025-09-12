#!/usr/bin/env bun
/**
 * PocketVex Demo Script
 * Demonstrates the schema migration system capabilities
 */

import chalk from 'chalk';
import { SchemaDiff } from './src/utils/diff.js';
import { schema as exampleSchema } from './src/schema/example.js';
import { schema as looplensSchema } from './schema/looplens.schema.js';

console.log(chalk.blue('🚀 PocketVex Schema Migration System Demo\n'));

// Demo 1: Show schema structure
console.log(chalk.yellow('📋 Demo 1: Schema Structure'));
console.log(chalk.gray('Example schema contains:'));
console.log(chalk.gray(`  - ${exampleSchema.collections.length} collections`));
exampleSchema.collections.forEach(col => {
  console.log(chalk.gray(`    • ${col.name} (${col.schema?.length || 0} fields)`));
});

console.log(chalk.gray('\nLoopLens schema contains:'));
console.log(chalk.gray(`  - ${looplensSchema.collections.length} collections`));
looplensSchema.collections.forEach(col => {
  console.log(chalk.gray(`    • ${col.name} (${col.schema?.length || 0} fields)`));
});

// Demo 2: Schema comparison
console.log(chalk.yellow('\n📊 Demo 2: Schema Comparison'));
const plan = SchemaDiff.buildDiffPlan(looplensSchema, exampleSchema);

console.log(chalk.green(`Safe operations: ${plan.safe.length}`));
plan.safe.forEach((op, index) => {
  console.log(chalk.green(`  ${index + 1}. ${op.summary}`));
});

console.log(chalk.red(`\nUnsafe operations: ${plan.unsafe.length}`));
plan.unsafe.forEach((op, index) => {
  console.log(chalk.red(`  ${index + 1}. ${op.summary}`));
  if (op.requiresDataMigration) {
    console.log(chalk.gray(`     ⚠️  Requires data migration`));
  }
});

// Demo 3: Show what would be applied
console.log(chalk.yellow('\n🔄 Demo 3: What Would Be Applied'));
if (plan.safe.length > 0) {
  console.log(chalk.green('Safe changes would be applied automatically:'));
  plan.safe.forEach(op => {
    console.log(chalk.green(`  ✅ ${op.summary}`));
  });
}

if (plan.unsafe.length > 0) {
  console.log(chalk.yellow('\nUnsafe changes would generate migration files:'));
  plan.unsafe.forEach(op => {
    console.log(chalk.yellow(`  ⚠️  ${op.summary}`));
  });
  console.log(chalk.gray('\n💡 Run "bun run migrate generate" to create migration files'));
}

// Demo 4: Show usage examples
console.log(chalk.yellow('\n🛠️  Demo 4: Usage Examples'));
console.log(chalk.gray('Development workflow:'));
console.log(chalk.gray('  1. Start dev server: bun run dev --watch'));
console.log(chalk.gray('  2. Edit schema files in schema/ directory'));
console.log(chalk.gray('  3. Safe changes apply automatically'));
console.log(chalk.gray('  4. Unsafe changes generate migration files'));
console.log(chalk.gray('  5. Review and run migrations in production'));

console.log(chalk.gray('\nAvailable commands:'));
console.log(chalk.gray('  bun run dev --watch     # Start development server'));
console.log(chalk.gray('  bun run schema:apply    # Apply safe changes'));
console.log(chalk.gray('  bun run schema:diff     # Show differences'));
console.log(chalk.gray('  bun run migrate generate # Generate migration'));
console.log(chalk.gray('  bun run migrate up      # Run migrations'));
console.log(chalk.gray('  bun run status          # Check connection'));

console.log(chalk.gray('\nEnvironment setup:'));
console.log(chalk.gray('  export PB_URL="http://127.0.0.1:8090"'));
console.log(chalk.gray('  export PB_ADMIN_EMAIL="admin@example.com"'));
console.log(chalk.gray('  export PB_ADMIN_PASS="admin123"'));

console.log(chalk.green('\n✅ Demo complete! PocketVex is ready to use.'));
console.log(chalk.blue('📖 See README.md for detailed documentation.'));
