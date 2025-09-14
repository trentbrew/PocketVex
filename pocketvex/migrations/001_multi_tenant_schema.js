/**
 * Migration: Multi-Tenant Application Schema
 * This migration creates the complete multi-tenant application structure
 */

export default {
  async up(db) {
    console.log('🚀 Creating multi-tenant application schema...');

    // Create apps collection
    await db.collections.create({
      id: 'a1b2c3d4e5f6g7h',
      name: 'apps',
      type: 'base',
      system: false,
      schema: [
        {
          id: 'apfowner00000001',
          name: 'owner',
          type: 'relation',
          required: true,
          presentable: false,
          options: {
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          id: 'apfname000000001',
          name: 'name',
          type: 'text',
          required: true,
          presentable: true,
          options: {
            min: 1,
            max: 120,
            pattern: '^[A-Za-z0-9_\\-. ]+$',
          },
        },
        {
          id: 'apfprodurl000001',
          name: 'production_url',
          type: 'url',
          required: false,
          presentable: true,
          options: {
            onlyDomains: null,
            exceptDomains: null,
          },
        },
        {
          id: 'apfdevurl0000001',
          name: 'development_url',
          type: 'url',
          required: false,
          presentable: true,
          options: {
            onlyDomains: null,
            exceptDomains: null,
          },
        },
        {
          id: 'apfgithub0000001',
          name: 'github',
          type: 'url',
          required: false,
          presentable: true,
          options: {
            onlyDomains: null,
            exceptDomains: null,
          },
        },
        {
          id: 'apfmeta000000001',
          name: 'meta',
          type: 'json',
          required: false,
          presentable: false,
          options: {},
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX `apps_owner_name_unique` ON `apps` (`owner`, `name`)',
        'CREATE INDEX `apps_owner_idx` ON `apps` (`owner`)',
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {},
    });

    // Create app_members collection
    await db.collections.create({
      id: 'b1c2d3e4f5g6h7i',
      name: 'app_members',
      type: 'base',
      system: false,
      schema: [
        {
          id: 'amfapp0000000001',
          name: 'app',
          type: 'relation',
          required: true,
          presentable: false,
          options: {
            collectionId: 'a1b2c3d4e5f6g7h',
            cascadeDelete: true,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          id: 'amfuser0000000001',
          name: 'user',
          type: 'relation',
          required: true,
          presentable: false,
          options: {
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          id: 'amfrole0000000001',
          name: 'role',
          type: 'select',
          required: true,
          presentable: true,
          options: {
            maxSelect: 1,
            values: ['owner', 'admin', 'editor', 'viewer'],
          },
        },
        {
          id: 'amfstatus00000001',
          name: 'status',
          type: 'select',
          required: true,
          presentable: true,
          options: {
            maxSelect: 1,
            values: ['pending', 'active', 'removed'],
          },
        },
        {
          id: 'amfinvby000000001',
          name: 'invitedBy',
          type: 'relation',
          required: false,
          presentable: false,
          options: {
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX `app_members_unique` ON `app_members` (`app`, `user`)',
        'CREATE INDEX `app_members_app_idx` ON `app_members` (`app`)',
        'CREATE INDEX `app_members_user_idx` ON `app_members` (`user`)',
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {},
    });

    // Create schemas collection
    await db.collections.create({
      id: 'c1d2e3f4g5h6i7j',
      name: 'schemas',
      type: 'base',
      system: false,
      schema: [
        {
          id: 'schfapp0000000001',
          name: 'app',
          type: 'relation',
          required: true,
          presentable: false,
          options: {
            collectionId: 'a1b2c3d4e5f6g7h',
            cascadeDelete: true,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          id: 'schfname000000001',
          name: 'name',
          type: 'text',
          required: true,
          presentable: true,
          options: {
            min: 1,
            max: 120,
            pattern: '^[A-Za-z0-9_\\-.]+$',
          },
        },
        {
          id: 'schfver0000000001',
          name: 'version',
          type: 'text',
          required: false,
          presentable: true,
          options: {
            min: 0,
            max: 64,
            pattern: '',
          },
        },
        {
          id: 'schfschema0000001',
          name: 'schema',
          type: 'json',
          required: true,
          presentable: false,
          options: {},
        },
        {
          id: 'schfcby0000000001',
          name: 'createdBy',
          type: 'relation',
          required: true,
          presentable: false,
          options: {
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX `schemas_app_name_unique` ON `schemas` (`app`, `name`)',
        'CREATE INDEX `schemas_app_idx` ON `schemas` (`app`)',
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {},
    });

    // Create pv_records collection
    await db.collections.create({
      id: 'd1e2f3g4h5i6j7k',
      name: 'pv_records',
      type: 'base',
      system: false,
      schema: [
        {
          id: 'pvrfapp0000000001',
          name: 'app',
          type: 'relation',
          required: true,
          presentable: false,
          options: {
            collectionId: 'a1b2c3d4e5f6g7h',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          id: 'pvrfschema0000001',
          name: 'schema',
          type: 'relation',
          required: true,
          presentable: true,
          options: {
            collectionId: 'c1d2e3f4g5h6i7j',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          id: 'pvrfdata000000001',
          name: 'data',
          type: 'json',
          required: true,
          presentable: false,
          options: {},
        },
        {
          id: 'pvrfcby0000000001',
          name: 'createdBy',
          type: 'relation',
          required: true,
          presentable: false,
          options: {
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
      ],
      indexes: [
        'CREATE INDEX `idx_pv_records_app_schema_created` ON `pv_records` (`app`, `schema`, `created`)',
        'CREATE INDEX `idx_pv_records_createdBy` ON `pv_records` (`createdBy`)',
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {},
    });

    // Create pv_files collection
    await db.collections.create({
      id: 'e1f2g3h4i5j6k7l',
      name: 'pv_files',
      type: 'base',
      system: false,
      schema: [
        {
          id: 'pvfapp00000000001',
          name: 'app',
          type: 'relation',
          required: true,
          presentable: false,
          options: {
            collectionId: 'a1b2c3d4e5f6g7h',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          id: 'pvfschema00000001',
          name: 'schema',
          type: 'relation',
          required: true,
          presentable: true,
          options: {
            collectionId: 'c1d2e3f4g5h6i7j',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          id: 'pvfrecord00000001',
          name: 'record',
          type: 'relation',
          required: false,
          presentable: false,
          options: {
            collectionId: 'd1e2f3g4h5i6j7k',
            cascadeDelete: true,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          id: 'pvffile0000000001',
          name: 'file',
          type: 'file',
          required: true,
          presentable: true,
          options: {
            maxSelect: 1,
            maxSize: 26214400,
            mimeTypes: [],
            thumbs: [],
            protected: false,
          },
        },
        {
          id: 'pvfpublic00000001',
          name: 'public',
          type: 'bool',
          required: false,
          presentable: true,
          options: {},
        },
        {
          id: 'pvfmeta0000000001',
          name: 'metadata',
          type: 'json',
          required: false,
          presentable: false,
          options: {},
        },
      ],
      indexes: [
        'CREATE INDEX `pv_files_app_idx` ON `pv_files` (`app`)',
        'CREATE INDEX `pv_files_schema_idx` ON `pv_files` (`schema`)',
        'CREATE INDEX `pv_files_record_idx` ON `pv_files` (`record`)',
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {},
    });

    // Create pv_state collection
    await db.collections.create({
      id: 'f1g2h3i4j5k6l7m',
      name: 'pv_state',
      type: 'base',
      system: false,
      schema: [
        {
          id: 'pvskey0000000001',
          name: 'key',
          type: 'text',
          required: true,
          presentable: true,
          options: {
            min: 1,
            max: 255,
            pattern: '',
          },
        },
        {
          id: 'pvsvalue000000001',
          name: 'value',
          type: 'json',
          required: true,
          presentable: false,
          options: {},
        },
        {
          id: 'pvsholder00000001',
          name: 'holder',
          type: 'text',
          required: false,
          presentable: false,
          options: {
            min: 0,
            max: 255,
            pattern: '',
          },
        },
        {
          id: 'pvsexpires0000001',
          name: 'expires',
          type: 'date',
          required: false,
          presentable: true,
          options: {
            min: '',
            max: '',
          },
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX `pv_state_key_unique` ON `pv_state` (`key`)',
        'CREATE INDEX `pv_state_expires_idx` ON `pv_state` (`expires`)',
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {},
    });

    console.log('✅ Multi-tenant application schema created successfully!');
  },

  async down(db) {
    console.log('🗑️ Dropping multi-tenant application schema...');

    // Drop collections in reverse order to handle dependencies
    const collections = [
      'pv_state',
      'pv_files',
      'pv_records',
      'schemas',
      'app_members',
      'apps',
    ];

    for (const collectionName of collections) {
      try {
        await db.collections.delete(collectionName);
        console.log(`✅ Dropped collection: ${collectionName}`);
      } catch (error) {
        console.log(
          `⚠️ Collection ${collectionName} may not exist:`,
          error.message,
        );
      }
    }

    console.log('✅ Multi-tenant application schema dropped successfully!');
  },
};
