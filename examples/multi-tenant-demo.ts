/**
 * Multi-Tenant Application Demo
 * This demo shows how to use the new multi-tenant schema structure
 */

import PocketBase from 'pocketbase';

// Initialize PocketBase client
const pb = new PocketBase('https://pocketvex.pockethost.io');

async function multiTenantDemo() {
  console.log('🚀 Multi-Tenant Application Demo\n');

  try {
    // 1. Create a new app (tenant)
    console.log('📱 Creating a new app...');
    const app = await pb.collection('apps').create({
      name: 'My Awesome App',
      production_url: 'https://myapp.com',
      development_url: 'https://dev.myapp.com',
      github: 'https://github.com/user/myapp',
      meta: {
        description: 'A sample multi-tenant application',
        category: 'productivity',
        tags: ['web', 'mobile', 'api'],
      },
    });
    console.log('✅ App created:', app.name, '(ID:', app.id, ')\n');

    // 2. Create a schema for the app
    console.log('📋 Creating a schema for the app...');
    const schema = await pb.collection('schemas').create({
      app: app.id,
      name: 'products',
      version: '1.0.0',
      schema: {
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
            options: { min: 1, max: 100 },
          },
          {
            name: 'description',
            type: 'text',
            required: false,
            options: { max: 500 },
          },
          {
            name: 'price',
            type: 'number',
            required: true,
            options: { min: 0 },
          },
          {
            name: 'category',
            type: 'select',
            required: true,
            options: {
              values: ['electronics', 'clothing', 'books', 'home'],
            },
          },
          {
            name: 'in_stock',
            type: 'bool',
            required: true,
            options: {},
          },
        ],
      },
    });
    console.log('✅ Schema created:', schema.name, '(ID:', schema.id, ')\n');

    // 3. Create some records using the schema
    console.log('📝 Creating records...');
    const products = [
      {
        app: app.id,
        schema: schema.id,
        data: {
          title: 'Wireless Headphones',
          description:
            'High-quality wireless headphones with noise cancellation',
          price: 199.99,
          category: 'electronics',
          in_stock: true,
        },
      },
      {
        app: app.id,
        schema: schema.id,
        data: {
          title: 'Programming Book',
          description: 'Learn TypeScript in 30 days',
          price: 29.99,
          category: 'books',
          in_stock: true,
        },
      },
      {
        app: app.id,
        schema: schema.id,
        data: {
          title: 'Cotton T-Shirt',
          description: 'Comfortable cotton t-shirt',
          price: 19.99,
          category: 'clothing',
          in_stock: false,
        },
      },
    ];

    const createdProducts = [];
    for (const product of products) {
      const record = await pb.collection('pv_records').create(product);
      createdProducts.push(record);
      console.log('✅ Product created:', record.data.title);
    }
    console.log('');

    // 4. Query records
    console.log('🔍 Querying records...');
    const allProducts = await pb.collection('pv_records').getList(1, 10, {
      filter: `app = "${app.id}" && schema = "${schema.id}"`,
      sort: '-created',
    });

    console.log(`Found ${allProducts.totalItems} products:`);
    allProducts.items.forEach((product) => {
      console.log(`  - ${product.data.title} ($${product.data.price})`);
    });
    console.log('');

    // 5. Query by category
    console.log('🔍 Querying electronics products...');
    const electronics = await pb.collection('pv_records').getList(1, 10, {
      filter: `app = "${app.id}" && schema = "${schema.id}" && data.category = "electronics"`,
      sort: '-created',
    });

    console.log(`Found ${electronics.totalItems} electronics products:`);
    electronics.items.forEach((product) => {
      console.log(`  - ${product.data.title} ($${product.data.price})`);
    });
    console.log('');

    // 6. Update a record
    console.log('✏️ Updating a record...');
    const firstProduct = createdProducts[0];
    const updatedProduct = await pb
      .collection('pv_records')
      .update(firstProduct.id, {
        data: {
          ...firstProduct.data,
          price: 179.99, // Discount!
          description: firstProduct.data.description + ' - Now on sale!',
        },
      });
    console.log(
      '✅ Product updated:',
      updatedProduct.data.title,
      'New price: $' + updatedProduct.data.price,
    );
    console.log('');

    // 7. Create a file attachment
    console.log('📎 Creating file attachment...');
    const fileRecord = await pb.collection('pv_files').create({
      app: app.id,
      schema: schema.id,
      record: firstProduct.id,
      public: true,
      metadata: {
        description: 'Product image',
        alt_text: 'Wireless headphones product photo',
      },
    });
    console.log('✅ File attachment created (ID:', fileRecord.id, ')');
    console.log('');

    // 8. Set some state
    console.log('💾 Setting application state...');
    const stateRecords = [
      {
        key: `app:${app.id}:settings`,
        value: {
          theme: 'dark',
          language: 'en',
          notifications: true,
          auto_save: true,
        },
        holder: app.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      },
      {
        key: `app:${app.id}:stats`,
        value: {
          total_products: createdProducts.length,
          total_schemas: 1,
          last_updated: new Date().toISOString(),
        },
        holder: app.id,
      },
    ];

    for (const state of stateRecords) {
      await pb.collection('pv_state').create(state);
      console.log('✅ State set:', state.key);
    }
    console.log('');

    // 9. Query state
    console.log('🔍 Querying application state...');
    const appSettings = await pb
      .collection('pv_state')
      .getFirstListItem(`key = "app:${app.id}:settings"`);
    console.log('App settings:', appSettings.value);
    console.log('');

    // 10. Summary
    console.log('📊 Demo Summary:');
    console.log(`  - Created app: ${app.name}`);
    console.log(`  - Created schema: ${schema.name}`);
    console.log(`  - Created ${createdProducts.length} product records`);
    console.log(`  - Created 1 file attachment`);
    console.log(`  - Set ${stateRecords.length} state records`);
    console.log('');

    console.log('🎉 Multi-tenant demo completed successfully!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('  ✅ Multi-tenant app isolation');
    console.log('  ✅ Dynamic schema definitions');
    console.log('  ✅ Flexible record storage');
    console.log('  ✅ File attachments');
    console.log('  ✅ Key-value state management');
    console.log('  ✅ Complex queries and filtering');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
if (require.main === module) {
  multiTenantDemo();
}

export { multiTenantDemo };
