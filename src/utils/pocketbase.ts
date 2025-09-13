/**
 * PocketBase client utilities for schema operations
 * Handles authentication, schema fetching, and applying migrations
 */

import PocketBase from 'pocketbase';
import type {
  SchemaDefinition,
  SchemaCollection,
  MigrationOperation,
  PocketBaseConfig,
} from '../types/schema.js';

export class PocketBaseClient {
  public pb: PocketBase;
  private config: PocketBaseConfig;

  constructor(config: PocketBaseConfig) {
    this.config = config;
    this.pb = new PocketBase(config.url);
  }

  /**
   * Authenticate with PocketBase admin credentials
   */
  async authenticate(): Promise<void> {
    try {
      await this.pb.admins.authWithPassword(
        this.config.adminEmail,
        this.config.adminPassword,
      );
    } catch (error) {
      throw new Error(`Failed to authenticate with PocketBase: ${error}`);
    }
  }

  /**
   * Fetch current schema from PocketBase
   */
  async fetchCurrentSchema(): Promise<SchemaDefinition> {
    try {
      const collections = await this.pb.collections.getFullList();

      return {
        collections: collections.map((col: any) => ({
          id: col.id,
          name: col.name,
          type: col.type,
          system: col.system,
          schema:
            col.schema?.map((field: any) => ({
              id: field.id,
              name: field.name,
              type: field.type,
              required: field.required,
              unique: field.unique,
              options: field.options || {},
            })) || [],
          indexes: col.indexes || [],
          rules: {
            list: col.listRule,
            view: col.viewRule,
            create: col.createRule,
            update: col.updateRule,
            delete: col.deleteRule,
          },
        })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch current schema: ${error}`);
    }
  }

  /**
   * Apply a migration operation to PocketBase
   */
  async applyOperation(operation: MigrationOperation): Promise<void> {
    const attemptOperation = async () => {
      switch (operation.kind) {
        case 'createCollection':
          await this.createCollection(operation.payload);
          break;
        case 'updateCollection':
          await this.updateCollection(operation.payload);
          break;
        case 'deleteCollection':
          await this.deleteCollection(operation.payload);
          break;
        case 'addField':
          await this.addField(operation.collection!, operation.payload);
          break;
        case 'updateField':
          await this.updateField(
            operation.collection!,
            operation.field!,
            operation.payload,
          );
          break;
        case 'deleteField':
          await this.deleteField(operation.collection!, operation.field!);
          break;
        case 'addIndex':
          await this.addIndex(operation.collection!, operation.payload);
          break;
        case 'deleteIndex':
          await this.deleteIndex(operation.collection!, operation.payload);
          break;
        case 'updateRules':
          await this.updateRules(operation.collection!, operation.payload);
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.kind}`);
      }
    };

    const maxAttempts = 5;
    let attempt = 0;
    while (true) {
      try {
        await attemptOperation();
        return;
      } catch (error: any) {
        attempt++;
        const status =
          error?.status || error?.data?.code || error?.response?.status;
        const message = error?.message || String(error);
        const isRateLimited =
          status === 429 || /\b429\b|rate limit/i.test(message);
        if (isRateLimited && attempt < maxAttempts) {
          const backoff = Math.min(2000, 250 * Math.pow(2, attempt - 1));
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        throw new Error(
          `Failed to apply operation '${operation.summary}': ${message}`,
        );
      }
    }
  }

  /**
   * Create a new collection
   */
  private async createCollection(collection: SchemaCollection): Promise<void> {
    // Ensure schema fields have IDs
    const schemaWithIds = (collection.schema || []).map((field: any) => ({
      id: field.id || `field_${field.name}_${Date.now()}`,
      name: field.name,
      type: field.type,
      required: field.required || false,
      unique: field.unique || false,
      options: field.options || {},
    }));

    await this.pb.collections.create({
      name: collection.name,
      type: collection.type || 'base',
      system: collection.system || false,
      schema: schemaWithIds,
      indexes: collection.indexes || [],
      listRule: collection.rules?.list || null,
      viewRule: collection.rules?.view || null,
      createRule: collection.rules?.create || null,
      updateRule: collection.rules?.update || null,
      deleteRule: collection.rules?.delete || null,
    });
  }

  /**
   * Update an existing collection
   */
  private async updateCollection(collection: SchemaCollection): Promise<void> {
    const existing = await this.pb.collections.getOne(collection.id!);

    await this.pb.collections.update(collection.id!, {
      ...existing,
      name: collection.name,
      type: collection.type || 'base',
      system: collection.system || false,
      schema: collection.schema || [],
      indexes: collection.indexes || [],
      listRule: collection.rules?.list || null,
      viewRule: collection.rules?.view || null,
      createRule: collection.rules?.create || null,
      updateRule: collection.rules?.update || null,
      deleteRule: collection.rules?.delete || null,
    });
  }

  /**
   * Delete a collection
   */
  private async deleteCollection(collection: SchemaCollection): Promise<void> {
    await this.pb.collections.delete(collection.id!);
  }

  /**
   * Add a field to a collection
   */
  private async addField(collectionName: string, field: any): Promise<void> {
    // First, get the collection by name
    const collections = await this.pb.collections.getFullList();
    const collection = collections.find(
      (col: any) => col.name === collectionName,
    );

    if (!collection) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    // Ensure the field has the correct format
    const fieldWithId = {
      id: field.id || `field_${field.name}_${Date.now()}`,
      name: field.name,
      type: field.type,
      required: field.required || false,
      unique: field.unique || false,
      options: field.options || {},
    };

    // Add the field to the schema
    collection.schema.push(fieldWithId);

    // Update the collection
    await this.pb.collections.update(collection.id, collection);
  }

  /**
   * Update a field in a collection
   */
  private async updateField(
    collectionName: string,
    fieldName: string,
    payload: any,
  ): Promise<void> {
    // First, get the collection by name
    const collections = await this.pb.collections.getFullList();
    const collection = collections.find(
      (col: any) => col.name === collectionName,
    );

    if (!collection) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    const fieldIndex = collection.schema.findIndex(
      (f: any) => f.name === fieldName,
    );

    if (fieldIndex === -1) {
      throw new Error(
        `Field '${fieldName}' not found in collection '${collectionName}'`,
      );
    }

    collection.schema[fieldIndex] = {
      ...collection.schema[fieldIndex],
      ...payload.desired,
    };
    await this.pb.collections.update(collection.id, collection);
  }

  /**
   * Delete a field from a collection
   */
  private async deleteField(
    collectionName: string,
    fieldName: string,
  ): Promise<void> {
    const collection = await this.pb.collections.getOne(collectionName);
    collection.schema = collection.schema.filter(
      (f: any) => f.name !== fieldName,
    );
    await this.pb.collections.update(collection.id, collection);
  }

  /**
   * Add an index to a collection
   */
  private async addIndex(collectionName: string, index: string): Promise<void> {
    const collection = await this.pb.collections.getOne(collectionName);
    if (!collection.indexes) collection.indexes = [];
    collection.indexes.push(index);
    await this.pb.collections.update(collection.id, collection);
  }

  /**
   * Delete an index from a collection
   */
  private async deleteIndex(
    collectionName: string,
    index: string,
  ): Promise<void> {
    const collection = await this.pb.collections.getOne(collectionName);
    if (collection.indexes) {
      collection.indexes = collection.indexes.filter(
        (i: string) => i !== index,
      );
      await this.pb.collections.update(collection.id, collection);
    }
  }

  /**
   * Update collection rules
   */
  private async updateRules(collectionName: string, rules: any): Promise<void> {
    const collection = await this.pb.collections.getOne(collectionName);

    await this.pb.collections.update(collection.id, {
      ...collection,
      listRule: rules.list || null,
      viewRule: rules.view || null,
      createRule: rules.create || null,
      updateRule: rules.update || null,
      deleteRule: rules.delete || null,
    });
  }

  /**
   * Test connection to PocketBase
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      await this.pb.collections.getFullList({ perPage: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Deploy a JavaScript file to PocketBase's filesystem
   * This is used for deploying JavaScript VM files
   */
  async deployJavaScriptFile(
    fileName: string,
    content: string,
    directory: string,
  ): Promise<any> {
    try {
      // Create a FormData object with the file content
      const formData = new FormData();
      const blob = new Blob([content], { type: 'application/javascript' });
      formData.append('file', blob, fileName);

      // Upload the file to PocketBase's filesystem
      const response = await this.pb.send(
        `/api/files/${directory}/${fileName}`,
        {
          method: 'POST',
          body: formData,
        },
      );

      return response;
    } catch (error) {
      // If file upload fails, try alternative approach
      throw new Error(
        `Failed to deploy JavaScript file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Remove a JavaScript file from PocketBase's filesystem
   */
  async removeJavaScriptFile(
    fileName: string,
    directory: string,
  ): Promise<any> {
    try {
      const response = await this.pb.send(
        `/api/files/${directory}/${fileName}`,
        {
          method: 'DELETE',
        },
      );

      return response;
    } catch (error) {
      throw new Error(
        `Failed to remove JavaScript file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}
