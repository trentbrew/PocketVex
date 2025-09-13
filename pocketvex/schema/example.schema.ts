/**
 * Example Schema for PocketVex Dev Server Testing
 * This file will be watched for changes
 */

export const schema = {
  collections: [
    {
      name: 'users',
      type: 'base' as const,
      schema: [
        { name: 'name', type: 'text' as const, required: true },
        { name: 'email', type: 'email' as const, required: true, unique: true },
        { name: 'avatar', type: 'file' as const },
        { name: 'created', type: 'date' as const, required: true },
      ],
    },
    {
      name: 'posts',
      type: 'base' as const,
      schema: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'content', type: 'editor' as const, required: true },
        { name: 'author', type: 'relation' as const, options: { collectionId: 'users' } },
        { name: 'published', type: 'bool' as const, required: true },
        { name: 'tags', type: 'select' as const, options: { values: ['tech', 'life', 'work'] } },
      ],
    },
  ],
};