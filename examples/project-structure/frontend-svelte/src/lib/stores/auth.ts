import { writable, derived } from 'svelte/store';
import { pb } from '../pocketbase.js';
import type { User } from '../../generated/types.js';

// Auth state store
export const authStore = writable<{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}>({
  user: null,
  isAuthenticated: false,
  isLoading: true
});

// Derived stores
export const user = derived(authStore, ($auth) => $auth.user);
export const isAuthenticated = derived(authStore, ($auth) => $auth.isAuthenticated);
export const isLoading = derived(authStore, ($auth) => $auth.isLoading);

// Auth actions
export const authActions = {
  async login(email: string, password: string) {
    try {
      const user = await pb.login(email, password);
      authStore.update(state => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
      return { success: true, user };
    } catch (error: any) {
      authStore.update(state => ({
        ...state,
        isLoading: false
      }));
      return { success: false, error: error.message };
    }
  },

  async signup(email: string, password: string, name: string) {
    try {
      const user = await pb.signup(email, password, name);
      authStore.update(state => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
      return { success: true, user };
    } catch (error: any) {
      authStore.update(state => ({
        ...state,
        isLoading: false
      }));
      return { success: false, error: error.message };
    }
  },

  async logout() {
    await pb.logout();
    authStore.update(state => ({
      ...state,
      user: null,
      isAuthenticated: false,
      isLoading: false
    }));
  },

  // Initialize auth state
  async init() {
    if (pb.isAuthenticated) {
      authStore.update(state => ({
        ...state,
        user: pb.currentUser,
        isAuthenticated: true,
        isLoading: false
      }));
    } else {
      authStore.update(state => ({
        ...state,
        isLoading: false
      }));
    }
  }
};

// Initialize auth on app start
authActions.init();
