// Generated API client
export interface PocketBaseAPI {
  courses: {
    getList: (params?: PocketBaseListParams) => Promise<PocketBaseResponse<CoursesRecord>>;
    getOne: (id: string, params?: { expand?: string; fields?: string }) => Promise<CoursesRecord>;
    create: (data: CoursesCreate) => Promise<CoursesRecord>;
    update: (id: string, data: CoursesUpdate) => Promise<CoursesRecord>;
    delete: (id: string) => Promise<boolean>;
    getFullList: (params?: Omit<PocketBaseListParams, 'page' | 'perPage'>) => Promise<CoursesRecord[]>;
    getFirstListItem: (filter: string, params?: { expand?: string; fields?: string }) => Promise<CoursesRecord>;
    subscribe: (id: string, callback: (data: CoursesRecord) => void) => () => void;
    subscribeList: (callback: (data: PocketBaseResponse<CoursesRecord>) => void) => () => void;
  };
  modules: {
    getList: (params?: PocketBaseListParams) => Promise<PocketBaseResponse<ModulesRecord>>;
    getOne: (id: string, params?: { expand?: string; fields?: string }) => Promise<ModulesRecord>;
    create: (data: ModulesCreate) => Promise<ModulesRecord>;
    update: (id: string, data: ModulesUpdate) => Promise<ModulesRecord>;
    delete: (id: string) => Promise<boolean>;
    getFullList: (params?: Omit<PocketBaseListParams, 'page' | 'perPage'>) => Promise<ModulesRecord[]>;
    getFirstListItem: (filter: string, params?: { expand?: string; fields?: string }) => Promise<ModulesRecord>;
    subscribe: (id: string, callback: (data: ModulesRecord) => void) => () => void;
    subscribeList: (callback: (data: PocketBaseResponse<ModulesRecord>) => void) => () => void;
  };
  lessons: {
    getList: (params?: PocketBaseListParams) => Promise<PocketBaseResponse<LessonsRecord>>;
    getOne: (id: string, params?: { expand?: string; fields?: string }) => Promise<LessonsRecord>;
    create: (data: LessonsCreate) => Promise<LessonsRecord>;
    update: (id: string, data: LessonsUpdate) => Promise<LessonsRecord>;
    delete: (id: string) => Promise<boolean>;
    getFullList: (params?: Omit<PocketBaseListParams, 'page' | 'perPage'>) => Promise<LessonsRecord[]>;
    getFirstListItem: (filter: string, params?: { expand?: string; fields?: string }) => Promise<LessonsRecord>;
    subscribe: (id: string, callback: (data: LessonsRecord) => void) => () => void;
    subscribeList: (callback: (data: PocketBaseResponse<LessonsRecord>) => void) => () => void;
  };
}

// Usage example:
// const pb = new PocketBase('http://localhost:8090');
// const users = await pb.collection('users').getList();
// const user = await pb.collection('users').getOne('user-id');
// const newUser = await pb.collection('users').create({ name: 'John', email: 'john@example.com' });