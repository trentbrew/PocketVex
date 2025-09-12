/**
 * PocketBase JavaScript VM Type Definitions
 * Based on PocketBase v0.30.0 JavaScript API
 */

// Core PocketBase JavaScript VM types
export interface PocketBaseApp {
  // App settings and configuration
  settings(): any;
  
  // Database operations
  db(): PocketBaseDB;
  
  // Mailer operations
  newMailClient(): PocketBaseMailer;
  
  // File operations
  newMultipartReader(): any;
  newMultipartWriter(): any;
  
  // Validation
  validate(data: any, rules: any): any;
  
  // Model operations
  save(model: any): Promise<any>;
  delete(model: any): Promise<any>;
  
  // Backup operations
  createBackup(name: string, exclude?: string[]): Promise<any>;
  restoreBackup(name: string, exclude?: string[]): Promise<any>;
}

export interface PocketBaseDB {
  // Raw SQL queries
  newQuery(sql: string): PocketBaseQuery;
  
  // Collection operations
  findCollectionByNameOrId(nameOrId: string): Promise<PocketBaseCollection>;
  findCollectionsByFilter(filter: string): Promise<PocketBaseCollection[]>;
  saveCollection(collection: PocketBaseCollection): Promise<PocketBaseCollection>;
  deleteCollection(collection: PocketBaseCollection): Promise<void>;
  
  // Record operations
  findRecordById(collection: string, id: string): Promise<PocketBaseRecord>;
  findRecordsByFilter(collection: string, filter: string): Promise<PocketBaseRecord[]>;
  saveRecord(record: PocketBaseRecord): Promise<PocketBaseRecord>;
  deleteRecord(record: PocketBaseRecord): Promise<void>;
  
  // Transaction support
  transaction(fn: () => Promise<any>): Promise<any>;
}

export interface PocketBaseQuery {
  bind(...args: any[]): PocketBaseQuery;
  all(): Promise<any[]>;
  one(): Promise<any>;
  oneOrFail(): Promise<any>;
  execute(): Promise<any>;
}

export interface PocketBaseCollection {
  id: string;
  name: string;
  type: 'base' | 'auth';
  system: boolean;
  schema: PocketBaseField[];
  indexes: string[];
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
  options: any;
}

export interface PocketBaseField {
  id: string;
  name: string;
  type: string;
  system: boolean;
  required: boolean;
  unique: boolean;
  options: any;
}

export interface PocketBaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  [key: string]: any;
  
  // Record methods
  load(): Promise<PocketBaseRecord>;
  save(): Promise<PocketBaseRecord>;
  delete(): Promise<void>;
  isNew(): boolean;
  isAuth(): boolean;
  get(key: string): any;
  set(key: string, value: any): void;
  unset(key: string): void;
  has(key: string): boolean;
  hide(...fields: string[]): void;
  withCustomData(enabled: boolean): void;
}

export interface PocketBaseMailer {
  send(message: PocketBaseMailMessage): Promise<void>;
}

export interface PocketBaseMailMessage {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
  attachments?: PocketBaseMailAttachment[];
}

export interface PocketBaseMailAttachment {
  filename: string;
  content: string | Uint8Array;
  contentType?: string;
}

// Event Hook Types
export interface PocketBaseEvent {
  app: PocketBaseApp;
  next(): void;
}

export interface PocketBaseModelEvent extends PocketBaseEvent {
  model: any;
}

export interface PocketBaseRecordEvent extends PocketBaseEvent {
  record: PocketBaseRecord;
}

export interface PocketBaseCollectionEvent extends PocketBaseEvent {
  collection: PocketBaseCollection;
}

export interface PocketBaseRequestEvent extends PocketBaseEvent {
  requestInfo: PocketBaseRequestInfo;
}

export interface PocketBaseRequestInfo {
  auth?: PocketBaseRecord;
  data: any;
  query: Record<string, string>;
  headers: Record<string, string>;
  method: string;
  path: string;
  remoteAddr: string;
  userAgent: string;
}

// Job Scheduling Types
export interface PocketBaseJob {
  name: string;
  cron: string;
  handler: (e: PocketBaseEvent) => void;
}

// Console Command Types
export interface PocketBaseConsoleCommand {
  name: string;
  description: string;
  handler: (e: PocketBaseEvent) => void;
}

// HTTP Request Types
export interface PocketBaseHttpRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface PocketBaseHttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
}

// Realtime Types
export interface PocketBaseRealtimeClient {
  id: string;
  subscriptions: string[];
  idleTimeout: number;
}

export interface PocketBaseRealtimeMessage {
  type: string;
  data: any;
}

// Filesystem Types
export interface PocketBaseFile {
  name: string;
  size: number;
  modTime: string;
  isDir: boolean;
}

// Logging Types
export interface PocketBaseLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// Hook Handler Types
export type AppHookHandler = (e: PocketBaseEvent) => void;
export type ModelHookHandler = (e: PocketBaseModelEvent) => void;
export type RecordHookHandler = (e: PocketBaseRecordEvent) => void;
export type CollectionHookHandler = (e: PocketBaseCollectionEvent) => void;
export type RequestHookHandler = (e: PocketBaseRequestEvent) => void;

// Hook Registration Functions
export interface PocketBaseHooks {
  // App hooks
  onBootstrap(handler: AppHookHandler): void;
  onSettingsReload(handler: AppHookHandler): void;
  onBackupCreate(handler: (e: PocketBaseEvent & { name: string; exclude?: string[] }) => void): void;
  onBackupRestore(handler: (e: PocketBaseEvent & { name: string; exclude?: string[] }) => void): void;
  onTerminate(handler: (e: PocketBaseEvent & { isRestart: boolean }) => void): void;
  
  // Mailer hooks
  onMailerSend(handler: (e: PocketBaseEvent & { mailer: PocketBaseMailer; message: PocketBaseMailMessage }) => void): void;
  onMailerRecordAuthAlertSend(handler: (e: PocketBaseEvent & { mailer: PocketBaseMailer; message: PocketBaseMailMessage; record: PocketBaseRecord; meta: any }) => void): void;
  onMailerRecordPasswordResetSend(handler: (e: PocketBaseEvent & { mailer: PocketBaseMailer; message: PocketBaseMailMessage; record: PocketBaseRecord; meta: any }) => void): void;
  onMailerRecordVerificationSend(handler: (e: PocketBaseEvent & { mailer: PocketBaseMailer; message: PocketBaseMailMessage; record: PocketBaseRecord; meta: any }) => void): void;
  onMailerRecordEmailChangeSend(handler: (e: PocketBaseEvent & { mailer: PocketBaseMailer; message: PocketBaseMailMessage; record: PocketBaseRecord; meta: any }) => void): void;
  onMailerRecordOTPSend(handler: (e: PocketBaseEvent & { mailer: PocketBaseMailer; message: PocketBaseMailMessage; record: PocketBaseRecord; meta: any }) => void): void;
  
  // Realtime hooks
  onRealtimeConnectRequest(handler: (e: PocketBaseRequestEvent & { client: PocketBaseRealtimeClient; idleTimeout: number }) => void): void;
  onRealtimeSubscribeRequest(handler: (e: PocketBaseRequestEvent & { client: PocketBaseRealtimeClient; subscriptions: string[] }) => void): void;
  onRealtimeMessageSend(handler: (e: PocketBaseRequestEvent & { client: PocketBaseRealtimeClient; message: PocketBaseRealtimeMessage }) => void): void;
  
  // Record hooks
  onRecordEnrich(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordValidate(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordCreate(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordCreateExecute(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordAfterCreateSuccess(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordAfterCreateError(handler: (e: PocketBaseRecordEvent & { error: any }) => void, ...collections: string[]): void;
  onRecordUpdate(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordUpdateExecute(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordAfterUpdateSuccess(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordAfterUpdateError(handler: (e: PocketBaseRecordEvent & { error: any }) => void, ...collections: string[]): void;
  onRecordDelete(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordDeleteExecute(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordAfterDeleteSuccess(handler: RecordHookHandler, ...collections: string[]): void;
  onRecordAfterDeleteError(handler: (e: PocketBaseRecordEvent & { error: any }) => void, ...collections: string[]): void;
  
  // Collection hooks
  onCollectionCreate(handler: CollectionHookHandler): void;
  onCollectionUpdate(handler: CollectionHookHandler): void;
  onCollectionDelete(handler: CollectionHookHandler): void;
  
  // Request hooks
  onRequest(handler: RequestHookHandler): void;
  onResponse(handler: RequestHookHandler): void;
}

// Global PocketBase JavaScript VM interface
export interface PocketBaseJSVM {
  $app: PocketBaseApp;
  $hooks: PocketBaseHooks;
  $jobs: {
    register(job: PocketBaseJob): void;
  };
  $commands: {
    register(command: PocketBaseConsoleCommand): void;
  };
  $http: {
    send(request: PocketBaseHttpRequest): Promise<PocketBaseHttpResponse>;
  };
  $realtime: {
    sendMessage(clientId: string, message: PocketBaseRealtimeMessage): void;
    broadcast(message: PocketBaseRealtimeMessage, subscriptions?: string[]): void;
  };
  $filesystem: {
    readFile(path: string): Promise<Uint8Array>;
    writeFile(path: string, data: Uint8Array): Promise<void>;
    deleteFile(path: string): Promise<void>;
    listFiles(path: string): Promise<PocketBaseFile[]>;
    createDir(path: string): Promise<void>;
    deleteDir(path: string): Promise<void>;
  };
  $log: PocketBaseLogger;
}
