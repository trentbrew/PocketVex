/**
 * TypeScript Type Generator for PocketBase Schema
 * Generates TypeScript types based on PocketBase collections and fields
 */

import type { SchemaDefinition, SchemaCollection, SchemaField } from '../types/schema.js';

export class TypeGenerator {
  /**
   * Generate TypeScript types from schema definition
   */
  static generateTypes(schema: SchemaDefinition): string {
    const imports = this.generateImports();
    const baseTypes = this.generateBaseTypes();
    const collectionTypes = this.generateCollectionTypes(schema);
    const utilityTypes = this.generateUtilityTypes();
    
    return [
      imports,
      baseTypes,
      collectionTypes,
      utilityTypes,
    ].join('\n\n');
  }
  
  /**
   * Generate import statements
   */
  private static generateImports(): string {
    return `/**
 * Generated TypeScript types for PocketBase collections
 * Auto-generated from schema definition
 */

import type { PocketBaseRecord } from './pocketbase-js.js';`;
  }
  
  /**
   * Generate base types
   */
  private static generateBaseTypes(): string {
    return `// Base PocketBase types
export interface BaseRecord {
  id: string;
  created: string;
  updated: string;
}

export interface AuthRecord extends BaseRecord {
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  lastResetSentAt?: string;
  lastVerificationSentAt?: string;
}`;
  }
  
  /**
   * Generate collection-specific types
   */
  private static generateCollectionTypes(schema: SchemaDefinition): string {
    const types: string[] = [];
    
    for (const collection of schema.collections) {
      const typeName = this.toPascalCase(collection.name);
      const fields = this.generateFieldTypes(collection.schema || []);
      const rules = this.generateRuleTypes(collection.rules);
      
      types.push(`// ${collection.name} collection
export interface ${typeName}Record extends ${collection.type === 'auth' ? 'AuthRecord' : 'BaseRecord'} {
${fields}
}

export interface ${typeName}Create {
${this.generateCreateFields(collection.schema || [])}
}

export interface ${typeName}Update {
${this.generateUpdateFields(collection.schema || [])}
}

export interface ${typeName}Rules {
${rules}
}`);
    }
    
    return types.join('\n\n');
  }
  
  /**
   * Generate field types for a collection
   */
  private static generateFieldTypes(fields: SchemaField[]): string {
    return fields
      .map(field => {
        const type = this.getTypeScriptType(field);
        const optional = field.required ? '' : '?';
        return `  ${field.name}${optional}: ${type};`;
      })
      .join('\n');
  }
  
  /**
   * Generate create fields (all optional except required)
   */
  private static generateCreateFields(fields: SchemaField[]): string {
    return fields
      .map(field => {
        const type = this.getTypeScriptType(field);
        const optional = field.required ? '' : '?';
        return `  ${field.name}${optional}: ${type};`;
      })
      .join('\n');
  }
  
  /**
   * Generate update fields (all optional)
   */
  private static generateUpdateFields(fields: SchemaField[]): string {
    return fields
      .map(field => {
        const type = this.getTypeScriptType(field);
        return `  ${field.name}?: ${type};`;
      })
      .join('\n');
  }
  
  /**
   * Generate rule types
   */
  private static generateRuleTypes(rules?: any): string {
    if (!rules) {
      return `  list?: string;
  view?: string;
  create?: string;
  update?: string;
  delete?: string;`;
    }
    
    return Object.entries(rules)
      .map(([key, value]) => `  ${key}?: string;`)
      .join('\n');
  }
  
  /**
   * Generate utility types
   */
  private static generateUtilityTypes(): string {
    return `// Utility types for API responses
export interface PocketBaseResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface PocketBaseListParams {
  page?: number;
  perPage?: number;
  sort?: string;
  filter?: string;
  fields?: string;
  expand?: string;
}

// Collection name to type mapping
export type CollectionName = ${this.generateCollectionNames()};

export type CollectionRecord<T extends CollectionName> = 
${this.generateCollectionRecordMapping()};

// API client types
export interface PocketBaseClient {
  collection<T extends CollectionName>(name: T): PocketBaseCollection<T>;
}

export interface PocketBaseCollection<T extends CollectionName> {
  getList(params?: PocketBaseListParams): Promise<PocketBaseResponse<CollectionRecord<T>>>;
  getOne(id: string, params?: { expand?: string; fields?: string }): Promise<CollectionRecord<T>>;
  create(data: any): Promise<CollectionRecord<T>>;
  update(id: string, data: any): Promise<CollectionRecord<T>>;
  delete(id: string): Promise<boolean>;
  getFullList(params?: Omit<PocketBaseListParams, 'page' | 'perPage'>): Promise<CollectionRecord<T>[]>;
  getFirstListItem(filter: string, params?: { expand?: string; fields?: string }): Promise<CollectionRecord<T>>;
  subscribe(id: string, callback: (data: any) => void): () => void;
  subscribeList(callback: (data: any) => void): () => void;
}`;
  }
  
  /**
   * Generate collection names union type
   */
  private static generateCollectionNames(): string {
    // This would be populated from the actual schema
    return `'users' | 'posts' | 'comments' | 'courses' | 'modules' | 'lessons'`;
  }
  
  /**
   * Generate collection record mapping
   */
  private static generateCollectionRecordMapping(): string {
    return `  T extends 'users' ? UsersRecord :
  T extends 'posts' ? PostsRecord :
  T extends 'comments' ? CommentsRecord :
  T extends 'courses' ? CoursesRecord :
  T extends 'modules' ? ModulesRecord :
  T extends 'lessons' ? LessonsRecord :
  never;`;
  }
  
  /**
   * Convert string to PascalCase
   */
  private static toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
  
  /**
   * Get TypeScript type for a field
   */
  private static getTypeScriptType(field: SchemaField): string {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'select':
        return 'string';
      
      case 'number':
        return 'number';
      
      case 'bool':
        return 'boolean';
      
      case 'date':
        return 'string'; // ISO date string
      
      case 'json':
        return 'any';
      
      case 'file':
        return 'string | string[]'; // File URLs
      
      case 'relation':
        return 'string'; // Related record ID
      
      case 'editor':
        return 'string'; // HTML content
      
      default:
        return 'any';
    }
  }
  
  /**
   * Generate types for a specific collection
   */
  static generateCollectionType(collection: SchemaCollection): string {
    const typeName = this.toPascalCase(collection.name);
    const fields = this.generateFieldTypes(collection.schema || []);
    const rules = this.generateRuleTypes(collection.rules);
    
    return `export interface ${typeName}Record extends ${collection.type === 'auth' ? 'AuthRecord' : 'BaseRecord'} {
${fields}
}

export interface ${typeName}Create {
${this.generateCreateFields(collection.schema || [])}
}

export interface ${typeName}Update {
${this.generateUpdateFields(collection.schema || [])}
}

export interface ${typeName}Rules {
${rules}
}`;
  }
  
  /**
   * Generate API client code
   */
  static generateApiClient(schema: SchemaDefinition): string {
    const collectionMethods = schema.collections
      .map(collection => {
        const typeName = this.toPascalCase(collection.name);
        return `  ${collection.name}: {
    getList: (params?: PocketBaseListParams) => Promise<PocketBaseResponse<${typeName}Record>>;
    getOne: (id: string, params?: { expand?: string; fields?: string }) => Promise<${typeName}Record>;
    create: (data: ${typeName}Create) => Promise<${typeName}Record>;
    update: (id: string, data: ${typeName}Update) => Promise<${typeName}Record>;
    delete: (id: string) => Promise<boolean>;
    getFullList: (params?: Omit<PocketBaseListParams, 'page' | 'perPage'>) => Promise<${typeName}Record[]>;
    getFirstListItem: (filter: string, params?: { expand?: string; fields?: string }) => Promise<${typeName}Record>;
    subscribe: (id: string, callback: (data: ${typeName}Record) => void) => () => void;
    subscribeList: (callback: (data: PocketBaseResponse<${typeName}Record>) => void) => () => void;
  };`;
      })
      .join('\n');
    
    return `// Generated API client
export interface PocketBaseAPI {
${collectionMethods}
}

// Usage example:
// const pb = new PocketBase('http://localhost:8090');
// const users = await pb.collection('users').getList();
// const user = await pb.collection('users').getOne('user-id');
// const newUser = await pb.collection('users').create({ name: 'John', email: 'john@example.com' });`;
  }
}
