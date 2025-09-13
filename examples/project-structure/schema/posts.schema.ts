import type { SchemaDefinition } from 'pocketvex/types';

export const postsSchema: SchemaDefinition = {
  collections: [
    {
      name: 'posts',
      type: 'base' as const,
      schema: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'content', type: 'editor' as const, required: true },
        { name: 'author', type: 'relation' as const, required: true, options: { collectionId: 'users' } },
        { name: 'tags', type: 'json' as const, required: false },
        { name: 'isPublished', type: 'bool' as const, required: false, defaultValue: false },
        { name: 'publishedAt', type: 'date' as const, required: false },
      ],
      indexes: [
        { columns: ['title'], unique: true },
        { columns: ['author'] },
        { columns: ['isPublished'] },
        { columns: ['publishedAt'] },
      ],
    },
  ],
};
