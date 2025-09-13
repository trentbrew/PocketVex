/**
 * Stricter schema field types (discriminated unions)
 * These are not wired into the core yet, but exported for consumers who prefer
 * precise narrowing when constructing schemas.
 */

export type BaseField = {
  name: string;
  required?: boolean;
  unique?: boolean;
};

export type TextField = BaseField & {
  type: 'text';
  options?: { min?: number; max?: number; pattern?: string };
};

export type NumberField = BaseField & {
  type: 'number';
  options?: { min?: number; max?: number };
};

export type SelectField = BaseField & {
  type: 'select';
  options: { values: string[]; maxSelect?: number };
};

export type FileField = BaseField & {
  type: 'file';
  options?: {
    maxSize?: number;
    mimeTypes?: string[];
    maxSelect?: number;
    thumbs?: string[];
    protected?: boolean;
  };
};

export type RelationField = BaseField & {
  type: 'relation';
  options: { collection: string; cascadeDelete?: boolean; maxSelect?: number };
};

export type EditorField = BaseField & { type: 'editor'; options?: {} };
export type BoolField = BaseField & { type: 'bool' };
export type EmailField = BaseField & { type: 'email' };
export type UrlField = BaseField & { type: 'url' };
export type DateField = BaseField & { type: 'date' };
export type JsonField = BaseField & { type: 'json'; options?: { maxSize?: number } };

export type SchemaFieldStrict =
  | TextField
  | NumberField
  | SelectField
  | FileField
  | RelationField
  | EditorField
  | BoolField
  | EmailField
  | UrlField
  | DateField
  | JsonField;

