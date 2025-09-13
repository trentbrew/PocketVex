/**
 * Main Schema for PocketVex Dev Server Testing
 * This file will be watched for changes
 */

export const schema = {
  collections: [
    {
      name: 'users',
      type: 'auth' as const, // Keep as auth to match existing
      rules: {
        list: '1=2',
        view: 'id = @request.auth.id || @request.auth.role = "admin"',
        create: '1=1',
        update: 'id = @request.auth.id || @request.auth.role = "admin"',
        delete: '@request.auth.role = "admin"',
      },
      schema: [
        { name: 'name', type: 'text' as const, required: false }, // Keep as optional to avoid data loss
        { name: 'avatar', type: 'file' as const },
        { name: 'bio', type: 'editor' as const, required: false }, // Keep as editor to match existing
        { name: 'role', type: 'select' as const, required: false }, // Keep existing field
        { name: 'website', type: 'url' as const, required: false },
        { name: 'nickname', type: 'text' as const, required: false },
        { name: 'age', type: 'number' as const, required: false },
      ],
    },
    {
      name: 'posts',
      type: 'base' as const,
      rules: {
        list: '1=1',
        view: '1=1',
        create: '@request.auth.id != ""',
        update: '@request.auth.role = "admin"',
        delete: '@request.auth.role = "admin"',
      },
      schema: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'content', type: 'editor' as const, required: true },
        { name: 'published', type: 'bool' as const, required: true },
        {
          name: 'tags',
          type: 'select' as const,
          options: {
            values: ['tech', 'life', 'work'],
            maxSelect: 3,
          },
        },
      ],
    },
    {
      name: 'comments',
      type: 'base' as const,
      rules: {
        list: '1=1',
        view: '1=1',
        create: '@request.auth.id != ""',
        update: '@request.auth.role = "admin"',
        delete: '@request.auth.role = "admin"',
      },
      schema: [
        { name: 'content', type: 'text' as const, required: true },
        { name: 'approved', type: 'bool' as const, required: true },
      ],
    },
    // Keep existing collections to avoid data loss
    {
      name: 'courses',
      type: 'base' as const,
      rules: {
        list: 'status = "published" || author = @request.auth.id || @request.auth.role = "admin"',
        view: 'status = "published" || author = @request.auth.id || @request.auth.role = "admin"',
        create: '@request.auth.role = "admin" || @request.auth.role = "editor"',
        update: 'author = @request.auth.id || @request.auth.role = "admin"',
        delete: 'author = @request.auth.id || @request.auth.role = "admin"',
      },
      schema: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'slug', type: 'text' as const, required: true, unique: true },
        { name: 'description', type: 'text' as const },
        { name: 'overview', type: 'editor' as const },
        { name: 'level', type: 'select' as const },
        { name: 'visibility', type: 'select' as const },
        { name: 'coverImage', type: 'file' as const },
        { name: 'author', type: 'relation' as const },
        { name: 'order', type: 'number' as const },
        { name: 'status', type: 'select' as const },
      ],
    },
    {
      name: 'modules',
      type: 'base' as const,
      rules: {
        list: 'isPublished = true || course.author = @request.auth.id || @request.auth.role = "admin"',
        view: 'isPublished = true || course.author = @request.auth.id || @request.auth.role = "admin"',
        create: '@request.auth.role = "admin" || @request.auth.role = "editor"',
        update:
          'course.author = @request.auth.id || @request.auth.role = "admin"',
        delete:
          'course.author = @request.auth.id || @request.auth.role = "admin"',
      },
      schema: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'description', type: 'text' as const },
        { name: 'course', type: 'relation' as const, required: true },
        { name: 'order', type: 'number' as const, required: true },
        { name: 'isPublished', type: 'bool' as const },
      ],
    },
    {
      name: 'lessons',
      type: 'base' as const,
      rules: {
        list: 'isPublished = true || module.course.author = @request.auth.id || @request.auth.role = "admin"',
        view: 'isPublished = true || module.course.author = @request.auth.id || @request.auth.role = "admin"',
        create: '@request.auth.role = "admin" || @request.auth.role = "editor"',
        update:
          'module.course.author = @request.auth.id || @request.auth.role = "admin"',
        delete:
          'module.course.author = @request.auth.id || @request.auth.role = "admin"',
      },
      schema: [
        { name: 'title', type: 'text' as const, required: true },
        { name: 'content', type: 'editor' as const },
        { name: 'module', type: 'relation' as const, required: true },
        { name: 'order', type: 'number' as const, required: true },
        { name: 'duration', type: 'number' as const },
        { name: 'isPublished', type: 'bool' as const },
      ],
    },
  ],
};
