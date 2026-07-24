import { create } from 'zustand';
import { getMe, login, register } from '../lib/api';

const TOKEN_KEY = 'tt_token';

export const useAuthStore = create((set) => ({
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
      const user = await getMe();
      set({ user, token, initialized: true });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, initialized: true });
    }
  },

  signIn: async (credentials) => {
    set({ loading: true });
    try {
      const { token, user } = await login(credentials);
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
      const { token, user } = await register(data);
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
