import PocketBase from 'pocketbase';
import { browser } from '$app/environment';
import type { User, Post } from '../../generated/types.js';

export class PocketBaseClient extends PocketBase {
  constructor() {
    const url = browser
      ? (import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')
      : 'http://127.0.0.1:8090';

    super(url);

    // Enable real-time subscriptions
    this.autoCancellation(false);
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return this.collection('users').getFullList<User>();
  }

  async getUser(id: string): Promise<User> {
    return this.collection('users').getOne<User>(id);
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.collection('users').create<User>(data);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.collection('users').update<User>(id, data);
  }

  // Post operations
  async getPosts(): Promise<Post[]> {
    return this.collection('posts').getFullList<Post>({
      expand: 'author',
      sort: '-created'
    });
  }

  async getPost(id: string): Promise<Post> {
    return this.collection('posts').getOne<Post>(id, {
      expand: 'author'
    });
  }

  async createPost(data: Partial<Post>): Promise<Post> {
    return this.collection('posts').create<Post>(data);
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post> {
    return this.collection('posts').update<Post>(id, data);
  }

  async deletePost(id: string): Promise<boolean> {
    return this.collection('posts').delete(id);
  }

  // Authentication
  async login(email: string, password: string): Promise<User> {
    const authData = await this.collection('users').authWithPassword(email, password);
    return authData.record as User;
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    const userData = await this.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name
    });

    // Auto-login after signup
    const authData = await this.collection('users').authWithPassword(email, password);
    return authData.record as User;
  }

  async logout(): Promise<void> {
    this.authStore.clear();
  }

  get currentUser(): User | null {
    return this.authStore.model as User | null;
  }

  get isAuthenticated(): boolean {
    return this.authStore.isValid;
  }
}

// Create singleton instance
export const pb = new PocketBaseClient();
