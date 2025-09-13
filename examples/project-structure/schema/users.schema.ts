import type { SchemaDefinition } from 'pocketvex/types';

export const usersSchema: SchemaDefinition = {
  collections: [
    {
      name: 'users',
      type: 'auth' as const,
      schema: [
        { name: 'name', type: 'text' as const, required: true },
        { name: 'avatar', type: 'file' as const, required: false },
        { name: 'bio', type: 'editor' as const, required: false },
        { name: 'isVerified', type: 'bool' as const, required: false, defaultValue: false },
        { name: 'lastLoginAt', type: 'date' as const, required: false },
      ],
      indexes: [
        { columns: ['name'], unique: true },
        { columns: ['isVerified'] },
        { columns: ['lastLoginAt'] },
      ],
    },
  ],
};
