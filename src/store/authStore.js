import { create } from 'zustand';
import { mockAuth } from '../lib/mockData';

const TOKEN_KEY = 'tt_token';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ initialized: true });
      return;
    }
    try {
      const user = await mockAuth.getMe(token);
      set({ user, token, initialized: true });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, initialized: true });
    }
  },

  signIn: async (credentials) => {
    set({ loading: true });
    try {
      const { token, user } = await mockAuth.signIn(credentials);
      localStorage.setItem(TOKEN_KEY, token);
      set({ user, token, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  signUp: async (data) => {
    set({ loading: true });
    try {
      const { token, user } = await mockAuth.signUp(data);
      localStorage.setItem(TOKEN_KEY, token);
      set({ user, token, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },
}));
