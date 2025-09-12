/**
 * Schema diff engine for comparing desired vs current PocketBase schema
 * Determines safe vs unsafe operations for migration planning
 */

import type { 
  SchemaDefinition, 
  SchemaCollection, 
  SchemaField, 
  MigrationPlan, 
  MigrationOperation 
} from '../types/schema.js';

export class SchemaDiff {
  /**
   * Compare desired schema against current PocketBase schema
   */
  static buildDiffPlan(desired: SchemaDefinition, current: SchemaDefinition): MigrationPlan {
    const safe: MigrationOperation[] = [];
    const unsafe: MigrationOperation[] = [];

    // Normalize collections by name for comparison
    const desiredByName = this.normalizeCollectionsByName(desired.collections);
    const currentByName = this.normalizeCollectionsByName(current.collections);

    // Find collections to create, update, or delete
    const allCollectionNames = new Set([
      ...Object.keys(desiredByName),
      ...Object.keys(currentByName)
    ]);

    for (const name of allCollectionNames) {
      const desiredCol = desiredByName[name];
      const currentCol = currentByName[name];

      if (!currentCol && desiredCol) {
        // Create new collection
        safe.push({
          kind: 'createCollection',
          summary: `Create collection '${name}'`,
          collection: name,
          payload: desiredCol
        });
      } else if (currentCol && !desiredCol) {
        // Delete collection (unsafe - data loss)
        unsafe.push({
          kind: 'deleteCollection',
          summary: `Delete collection '${name}' (WARNING: data loss)`,
          collection: name,
          payload: currentCol,
          requiresDataMigration: true
        });
      } else if (desiredCol && currentCol) {
        // Update existing collection
        this.compareCollections(name, desiredCol, currentCol, safe, unsafe);
      }
    }

    return { safe, unsafe };
  }

  /**
   * Compare two collections and generate operations
   */
  private static compareCollections(
    name: string,
    desired: SchemaCollection,
    current: SchemaCollection,
    safe: MigrationOperation[],
    unsafe: MigrationOperation[]
  ) {
    // Compare rules
    this.compareRules(name, desired.rules, current.rules, safe);

    // Compare indexes
    this.compareIndexes(name, desired.indexes || [], current.indexes || [], safe, unsafe);

    // Compare fields
    this.compareFields(name, desired.schema || [], current.schema || [], safe, unsafe);
  }

  /**
   * Compare collection rules
   */
  private static compareRules(
    name: string,
    desired: any,
    current: any,
    safe: MigrationOperation[]
  ) {
    if (!desired) return;

    const ruleTypes = ['list', 'view', 'create', 'update', 'delete'] as const;
    let hasChanges = false;

    for (const ruleType of ruleTypes) {
      const desiredRule = desired[ruleType];
      const currentRule = current?.[ruleType];

      if (desiredRule !== currentRule) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges) {
      safe.push({
        kind: 'updateRules',
        summary: `Update rules for collection '${name}'`,
        collection: name,
        payload: desired
      });
    }
  }

  /**
   * Compare collection indexes
   */
  private static compareIndexes(
    name: string,
    desired: string[],
    current: string[],
    safe: MigrationOperation[],
    unsafe: MigrationOperation[]
  ) {
    const desiredIndexes = new Set(desired || []);
    const currentIndexes = new Set(current || []);

    // Find indexes to add
    for (const index of desiredIndexes) {
      if (!currentIndexes.has(index)) {
        safe.push({
          kind: 'addIndex',
          summary: `Add index to collection '${name}': ${index}`,
          collection: name,
          payload: index
        });
      }
    }

    // Find indexes to remove (unsafe - may affect performance)
    for (const index of currentIndexes) {
      if (!desiredIndexes.has(index)) {
        unsafe.push({
          kind: 'deleteIndex',
          summary: `Remove index from collection '${name}': ${index}`,
          collection: name,
          payload: index
        });
      }
    }
  }

  /**
   * Compare collection fields
   */
  private static compareFields(
    name: string,
    desired: SchemaField[],
    current: SchemaField[],
    safe: MigrationOperation[],
    unsafe: MigrationOperation[]
  ) {
    const desiredFields = this.normalizeFieldsByName(desired || []);
    const currentFields = this.normalizeFieldsByName(current || []);

    const allFieldNames = new Set([
      ...Object.keys(desiredFields),
      ...Object.keys(currentFields)
    ]);

    for (const fieldName of allFieldNames) {
      const desiredField = desiredFields[fieldName];
      const currentField = currentFields[fieldName];

      if (!currentField && desiredField) {
        // Add new field
        safe.push({
          kind: 'addField',
          summary: `Add field '${fieldName}' to collection '${name}'`,
          collection: name,
          field: fieldName,
          payload: desiredField
        });
      } else if (currentField && !desiredField) {
        // Remove field (unsafe - data loss)
        unsafe.push({
          kind: 'deleteField',
          summary: `Remove field '${fieldName}' from collection '${name}' (WARNING: data loss)`,
          collection: name,
          field: fieldName,
          payload: currentField,
          requiresDataMigration: true
        });
      } else if (desiredField && currentField) {
        // Update existing field
        this.compareField(name, fieldName, desiredField, currentField, safe, unsafe);
      }
    }
  }

  /**
   * Compare individual field changes
   */
  private static compareField(
    collectionName: string,
    fieldName: string,
    desired: SchemaField,
    current: SchemaField,
    safe: MigrationOperation[],
    unsafe: MigrationOperation[]
  ) {
    const changes: string[] = [];
    let isUnsafe = false;

    // Type changes are always unsafe
    if (desired.type !== current.type) {
      isUnsafe = true;
      changes.push(`type: ${current.type} → ${desired.type}`);
    }

    // Required changes can be unsafe
    if (desired.required !== current.required) {
      if (desired.required && !current.required) {
        // Making field required without default is unsafe
        isUnsafe = true;
        changes.push('required: false → true (no default value)');
      } else {
        changes.push(`required: ${current.required} → ${desired.required}`);
      }
    }

    // Unique changes can be unsafe
    if (desired.unique !== current.unique) {
      if (desired.unique && !current.unique) {
        // Making field unique is unsafe if data has duplicates
        isUnsafe = true;
        changes.push('unique: false → true (may have duplicates)');
      } else {
        changes.push(`unique: ${current.unique} → ${desired.unique}`);
      }
    }

    // Options changes
    const optionChanges = this.compareFieldOptions(desired.options, current.options);
    if (optionChanges.length > 0) {
      const hasUnsafeOptions = optionChanges.some(change => 
        change.includes('tighten') || change.includes('reduce')
      );
      if (hasUnsafeOptions) {
        isUnsafe = true;
      }
      changes.push(...optionChanges);
    }

    if (changes.length > 0) {
      const operation: MigrationOperation = {
        kind: isUnsafe ? 'typeChange' : 'updateField',
        summary: `Update field '${fieldName}' in collection '${collectionName}': ${changes.join(', ')}`,
        collection: collectionName,
        field: fieldName,
        payload: { desired, current },
        requiresDataMigration: isUnsafe
      };

      if (isUnsafe) {
        unsafe.push(operation);
      } else {
        safe.push(operation);
      }
    }
  }

  /**
   * Compare field options for changes
   */
  private static compareFieldOptions(desired?: any, current?: any): string[] {
    const changes: string[] = [];
    
    if (!desired && !current) return changes;
    if (!desired || !current) {
      changes.push('options: changed');
      return changes;
    }

    // Check for tightening constraints (unsafe)
    if (desired.min !== undefined && current.min !== undefined && desired.min > current.min) {
      changes.push(`min: ${current.min} → ${desired.min} (tighten)`);
    }
    if (desired.max !== undefined && current.max !== undefined && desired.max < current.max) {
      changes.push(`max: ${current.max} → ${desired.max} (tighten)`);
    }

    // Check for pattern changes
    if (desired.pattern !== current.pattern) {
      changes.push(`pattern: changed`);
    }

    // Check for select values changes
    if (desired.values && current.values) {
      const desiredValues = new Set(desired.values);
      const currentValues = new Set(current.values);
      
      const removed = [...currentValues].filter(v => !desiredValues.has(v));
      if (removed.length > 0) {
        changes.push(`select values: removed ${removed.join(', ')} (unsafe)`);
      }
    }

    return changes;
  }

  /**
   * Normalize collections by name for easier comparison
   */
  private static normalizeCollectionsByName(collections: SchemaCollection[]): Record<string, SchemaCollection> {
    return Object.fromEntries(
      collections.map(col => [col.name, col])
    );
  }

  /**
   * Normalize fields by name for easier comparison
   */
  private static normalizeFieldsByName(fields: SchemaField[]): Record<string, SchemaField> {
    return Object.fromEntries(
      fields.map(field => [field.name, field])
    );
  }
}
