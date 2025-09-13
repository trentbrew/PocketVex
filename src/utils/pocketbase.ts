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
    try {
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
    } catch (error) {
      throw new Error(
        `Failed to apply operation '${operation.summary}': ${error}`,
      );
    }
  }

  /**
   * Create a new collection
   */
  private async createCollection(collection: SchemaCollection): Promise<void> {
    await this.pb.collections.create({
      id: collection.id,
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
    const collection = await this.pb.collections.getOne(collectionName);
    collection.schema.push(field);
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
    const collection = await this.pb.collections.getOne(collectionName);
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
   * Execute JavaScript code in PocketBase's JavaScript VM
   * This is used for deploying JavaScript VM files
   */
  async executeJavaScript(code: string): Promise<any> {
    try {
      // Use PocketBase's console command API to execute JavaScript
      const response = await this.pb.send('/api/console/exec', {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response;
    } catch (error) {
      // If console API is not available, try alternative approach
      // This might not work in all PocketBase versions
      throw new Error(`Failed to execute JavaScript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
