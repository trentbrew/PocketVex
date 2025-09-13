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
        { name: 'bio', type: 'text' as const, required: false },
        { name: 'created', type: 'date' as const, required: true },
      ],
    },
    {
      name: 'posts',
      type: 'base' as const,
      schema: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'content', type: 'editor' as const, required: true },
        {
          name: 'author',
          type: 'relation' as const,
          options: { collectionId: 'users' },
        },
        { name: 'published', type: 'bool' as const, required: true },
        {
          name: 'tags',
          type: 'select' as const,
          options: { values: ['tech', 'life', 'work'] },
        },
      ],
    },
    {
      name: 'comments',
      type: 'base' as const,
      schema: [
        { name: 'content', type: 'text' as const, required: true },
        {
          name: 'post',
          type: 'relation' as const,
          options: { collectionId: 'posts' },
        },
        {
          name: 'author',
          type: 'relation' as const,
          options: { collectionId: 'users' },
        },
        { name: 'created', type: 'date' as const, required: true },
        { name: 'approved', type: 'bool' as const, required: true },
      ],
    },
  ],
};
