/**
 * Example Course Management Schema
 * Example schema for a course management system
 */

import type { SchemaDefinition } from '../src/types/schema.js';

export const schema: SchemaDefinition = {
  collections: [
    {
      id: 'crs01lplens001x',
      name: 'courses',
      type: 'base',
      indexes: [
        'CREATE UNIQUE INDEX idx_courses_slug ON courses (slug)',
        'CREATE INDEX idx_courses_status_visibility ON courses (status, visibility)',
        'CREATE INDEX idx_courses_author ON courses (author)',
      ],
      rules: {
        list: "status = 'published' && visibility = 'public' || @request.auth.role ?~ '(instructor|admin)' || author = @request.auth.id",
        view: "@request.auth.id != ''",
        create: "@request.auth.role ?~ '(instructor|admin)'",
        update: "author = @request.auth.id || @request.auth.role = 'admin'",
        delete: "@request.auth.role = 'admin'",
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
          options: { pattern: '^[a-z0-9-]{3,}$' },
        },
        {
          name: 'description',
          type: 'text',
          options: { max: 5000 },
        },
        {
          name: 'overview',
          type: 'richText',
          options: {},
        },
        {
          name: 'level',
          type: 'select',
          options: {
            maxSelect: 1,
            values: ['beginner', 'intermediate', 'advanced'],
          },
        },
        {
          name: 'visibility',
          type: 'select',
          options: {
            maxSelect: 1,
            values: ['public', 'private', 'unlisted'],
          },
        },
        {
          name: 'coverImage',
          type: 'file',
          options: {
            maxSelect: 1,
            maxSize: 50 * 1024 * 1024,
          },
        },
        {
          name: 'author',
          type: 'relation',
          options: {
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
        },
        {
          name: 'order',
          type: 'number',
        },
        {
          name: 'status',
          type: 'select',
          options: {
            maxSelect: 1,
            values: ['draft', 'published'],
          },
        },
      ],
    },
    {
      id: 'mod01lplens001x',
      name: 'modules',
      type: 'base',
      indexes: [
        'CREATE INDEX idx_modules_course ON modules (course)',
        'CREATE INDEX idx_modules_order ON modules (course, order)',
      ],
      rules: {
        list: "@request.auth.id != ''",
        view: "@request.auth.id != ''",
        create: "@request.auth.role ?~ '(instructor|admin)'",
        update: "@request.auth.role ?~ '(instructor|admin)'",
        delete: "@request.auth.role = 'admin'",
      },
      schema: [
        {
          name: 'title',
          type: 'text',
          required: true,
          options: { min: 1, max: 200 },
        },
        {
          name: 'description',
          type: 'text',
          options: { max: 2000 },
        },
        {
          name: 'course',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'crs01lplens001x',
            maxSelect: 1,
            cascadeDelete: true,
          },
        },
        {
          name: 'order',
          type: 'number',
          required: true,
        },
        {
          name: 'isPublished',
          type: 'bool',
          options: {},
        },
      ],
    },
  ],
};
