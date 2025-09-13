import type { Migration } from 'pocketvex/types';

export const up: Migration = async (pb, { op }) => {
  await op.createCollection('products', { type: 'base' });
  await op.addField('products', { name: 'name', type: 'text', required: true });
  await op.addField('products', { name: 'price', type: 'number', required: true });
  await op.addIndex('products', 'CREATE INDEX `idx_products_price` ON `products`(`price`)');
};

export const down: Migration = async (pb, { op }) => {
  await op.dropCollection('products');
};

