/**
 * Basic schema example for PocketVex
 * Demonstrates common patterns and best practices
 */

import type { SchemaDefinition } from '../src/types/schema.js';

export const schema: SchemaDefinition = {
  collections: [
    {
      id: 'users_001',
      name: 'users',
      type: 'base',
      indexes: [
        'CREATE UNIQUE INDEX idx_users_email ON users (email)',
        'CREATE INDEX idx_users_created ON users (created)',
      ],
      rules: {
        list: "@request.auth.id != ''",
        view: "@request.auth.id != ''",
        create: "@request.auth.id != ''",
        update: '@request.auth.id = id',
        delete: "@request.auth.role = 'admin'",
      },
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true,
          options: { min: 1, max: 100 },
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          unique: true,
          options: { max: 255 },
        },
        {
          name: 'role',
          type: 'select',
          options: {
            maxSelect: 1,
            values: ['user', 'admin', 'moderator'],
          },
        },
        {
          name: 'avatar',
          type: 'file',
          options: {
            maxSelect: 1,
            maxSize: 5 * 1024 * 1024, // 5MB
          },
        },
        {
          name: 'isActive',
          type: 'bool',
          options: {},
        },
        {
          name: 'lastLogin',
          type: 'date',
        },
        {
          name: 'bio',
          type: 'richText',
          options: {},
        },
      ],
    },
    {
      id: 'posts_001',
      name: 'posts',
      type: 'base',
      indexes: [
        'CREATE INDEX idx_posts_author ON posts (author)',
        'CREATE INDEX idx_posts_status_created ON posts (status, created)',
        'CREATE INDEX idx_posts_slug ON posts (slug)',
      ],
      rules: {
        list: "status = 'published' || author = @request.auth.id",
        view: "status = 'published' || author = @request.auth.id",
        create: "@request.auth.id != ''",
        update: 'author = @request.auth.id',
        delete: "author = @request.auth.id || @request.auth.role = 'admin'",
      },
      schema: [
        {
          name: 'title',
          type: 'text',
          required: true,
          options: { min: 1, max: 200 },
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          options: { pattern: '^[a-z0-9-]+$' },
        },
        {
          name: 'content',
          type: 'richText',
          options: {},
        },
        {
          name: 'excerpt',
          type: 'text',
          options: { max: 500 },
        },
        {
          name: 'author',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users_001',
            maxSelect: 1,
          },
        },
        {
          name: 'status',
          type: 'select',
          options: {
            maxSelect: 1,
            values: ['draft', 'published', 'archived'],
          },
        },
        {
          name: 'tags',
          type: 'select',
          options: {
            maxSelect: 10,
            values: ['tech', 'business', 'lifestyle', 'travel', 'food'],
          },
        },
        {
          name: 'featuredImage',
          type: 'file',
          options: {
            maxSelect: 1,
            maxSize: 10 * 1024 * 1024, // 10MB
          },
        },
        {
          name: 'viewCount',
          type: 'number',
          options: { min: 0 },
        },
        {
          name: 'publishedAt',
          type: 'date',
        },
      ],
    },
    {
      id: 'comments_001',
      name: 'comments',
      type: 'base',
      indexes: [
        'CREATE INDEX idx_comments_post ON comments (post)',
        'CREATE INDEX idx_comments_author ON comments (author)',
        'CREATE INDEX idx_comments_created ON comments (created)',
      ],
      rules: {
        list: "@request.auth.id != ''",
        view: "@request.auth.id != ''",
        create: "@request.auth.id != ''",
        update: 'author = @request.auth.id',
        delete: "author = @request.auth.id || @request.auth.role = 'admin'",
      },
      schema: [
        {
          name: 'content',
          type: 'text',
          required: true,
          options: { min: 1, max: 1000 },
        },
        {
          name: 'post',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'posts_001',
            maxSelect: 1,
            cascadeDelete: true,
          },
        },
        {
          name: 'author',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users_001',
            maxSelect: 1,
          },
        },
        {
          name: 'parent',
          type: 'relation',
          options: {
            collectionId: 'comments_001',
            maxSelect: 1,
          },
        },
        {
          name: 'isApproved',
          type: 'bool',
          options: {},
        },
        {
          name: 'likes',
          type: 'number',
          options: { min: 0 },
        },
      ],
    },
  ],
};
