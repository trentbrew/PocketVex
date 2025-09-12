#!/usr/bin/env bun
/**
 * Example: Using PocketVex with Live PocketBase Instance
 * Shows how to connect to and work with a real PocketBase instance
 */

import { SchemaDiff, PocketBaseClient, DevServer } from '../dist/lib.js';
import type { SchemaDefinition } from '../dist/lib.js';

// Configuration for your live PocketBase instance
const config = {
  url: 'https://pocketvex.pockethost.io/',
  adminEmail: process.env.PB_ADMIN_EMAIL || 'admin@pocketvex.com',
  adminPassword: process.env.PB_ADMIN_PASS || 'admin123',
};

// Example schema definition
const mySchema: SchemaDefinition = {
  collections: [
    {
      name: 'users',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true, unique: true },
        { name: 'bio', type: 'editor', options: {} },
        {
          name: 'role',
          type: 'select',
          options: { values: ['user', 'admin'] },
        },
      ],
      rules: {
        list: "@request.auth.id != ''",
        view: "@request.auth.id != ''",
        create: "@request.auth.id != ''",
        update: '@request.auth.id = id',
        delete: "@request.auth.role = 'admin'",
      },
    },
    {
      name: 'posts',
      schema: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'editor', options: {} },
        {
          name: 'author',
          type: 'relation',
          options: { collectionId: 'users' },
        },
        { name: 'published', type: 'bool', options: {} },
      ],
      rules: {
        list: '@request.auth.id != ""',
        view: '@request.auth.id != ""',
        create: '@request.auth.id != ""',
        update: 'author = @request.auth.id',
        delete: 'author = @request.auth.id',
      },
    },
  ],
};

async function example() {
  console.log('🚀 PocketVex Live PocketBase Example\n');

  // 1. Connect to PocketBase
  console.log('1. Connecting to PocketBase...');
  const pbClient = new PocketBaseClient(config);

  const isConnected = await pbClient.testConnection();
  if (!isConnected) {
    console.log('❌ Could not connect to PocketBase');
    console.log('💡 Make sure to set your admin credentials:');
    console.log('   export PB_ADMIN_EMAIL="your-email@example.com"');
    console.log('   export PB_ADMIN_PASS="your-password"');
    return;
  }

  console.log('✅ Connected successfully!');

  // 2. Fetch current schema
  console.log('\n2. Fetching current schema...');
  const currentSchema = await pbClient.fetchCurrentSchema();
  console.log(`📋 Found ${currentSchema.collections.length} collections`);

  // 3. Compare schemas
  console.log('\n3. Comparing schemas...');
  const plan = SchemaDiff.buildDiffPlan(mySchema, currentSchema);

  console.log(`✅ Safe operations: ${plan.safe.length}`);
  console.log(`⚠️  Unsafe operations: ${plan.unsafe.length}`);

  // 4. Apply safe changes (if any)
  if (plan.safe.length > 0) {
    console.log('\n4. Applying safe changes...');
    for (const operation of plan.safe) {
      console.log(`   Applying: ${operation.summary}`);
      await pbClient.applyOperation(operation);
    }
    console.log('✅ Safe changes applied!');
  }

  // 5. Show unsafe changes that would need migrations
  if (plan.unsafe.length > 0) {
    console.log('\n5. Unsafe changes requiring migrations:');
    plan.unsafe.forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.summary}`);
    });
    console.log(
      '💡 Run "pocketvex migrate generate" to create migration files',
    );
  }

  // 6. Start development server (optional)
  console.log('\n6. Starting development server...');
  const devServer = new DevServer({
    ...config,
    watchPaths: ['schema/**/*.ts'],
    autoApply: true,
    generateMigrations: true,
    migrationPath: './migrations',
  });

  console.log('🔄 Development server started with file watching');
  console.log('💡 Edit schema files to see changes applied automatically');

  // Keep the server running
  await devServer.start();
}

// Run the example
example().catch(console.error);
