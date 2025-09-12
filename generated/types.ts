/**
 * Generated TypeScript types for PocketBase collections
 * Auto-generated from schema definition
 */

import type { PocketBaseRecord } from 'pocketvex/types';

// Base PocketBase types
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
}

// courses collection
export interface CoursesRecord extends BaseRecord {
  title: string;
  slug: string;
  description?: string;
  overview?: string;
  level?: string;
  visibility?: string;
  coverImage?: string | string[];
  author?: string;
  order?: number;
  status?: string;
}

export interface CoursesCreate {
  title: string;
  slug: string;
  description?: string;
  overview?: string;
  level?: string;
  visibility?: string;
  coverImage?: string | string[];
  author?: string;
  order?: number;
  status?: string;
}

export interface CoursesUpdate {
  title?: string;
  slug?: string;
  description?: string;
  overview?: string;
  level?: string;
  visibility?: string;
  coverImage?: string | string[];
  author?: string;
  order?: number;
  status?: string;
}

export interface CoursesRules {
  list?: string;
  view?: string;
  create?: string;
  update?: string;
  delete?: string;
}

// modules collection
export interface ModulesRecord extends BaseRecord {
  title: string;
  description?: string;
  course: string;
  order: number;
  isPublished?: boolean;
}

export interface ModulesCreate {
  title: string;
  description?: string;
  course: string;
  order: number;
  isPublished?: boolean;
}

export interface ModulesUpdate {
  title?: string;
  description?: string;
  course?: string;
  order?: number;
  isPublished?: boolean;
}

export interface ModulesRules {
  list?: string;
  view?: string;
  create?: string;
  update?: string;
  delete?: string;
}

// lessons collection
export interface LessonsRecord extends BaseRecord {
  title: string;
  content?: string;
  module: string;
  order: number;
  duration?: number;
  isPublished?: boolean;
}

export interface LessonsCreate {
  title: string;
  content?: string;
  module: string;
  order: number;
  duration?: number;
  isPublished?: boolean;
}

export interface LessonsUpdate {
  title?: string;
  content?: string;
  module?: string;
  order?: number;
  duration?: number;
  isPublished?: boolean;
}

export interface LessonsRules {
  list?: string;
  view?: string;
  create?: string;
  update?: string;
  delete?: string;
}

// Utility types for API responses
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
export type CollectionName = 'users' | 'posts' | 'comments' | 'courses' | 'modules' | 'lessons';

export type CollectionRecord<T extends CollectionName> =
  T extends 'users' ? UsersRecord :
  T extends 'posts' ? PostsRecord :
  T extends 'comments' ? CommentsRecord :
  T extends 'courses' ? CoursesRecord :
  T extends 'modules' ? ModulesRecord :
  T extends 'lessons' ? LessonsRecord :
  never;;

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
}