import { usersSchema } from './users.schema.js';
import { postsSchema } from './posts.schema.js';
import type { SchemaDefinition } from 'pocketvex/types';

export const schema: SchemaDefinition = {
  collections: [
    ...usersSchema.collections,
    ...postsSchema.collections,
  ],
};
