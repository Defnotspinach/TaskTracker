import { create } from 'zustand';
import { mockCategories } from '../lib/mockData';

export const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (userId) => {
    set({ loading: true, error: null });
    try {
      const categories = await mockCategories.getAll(userId);
      set({ categories, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createCategory: async (userId, name) => {
    const cat = await mockCategories.create(userId, name);
    set(s => ({ categories: [...s.categories, cat] }));
    return cat;
  },

  updateCategory: async (userId, id, name) => {
    const updated = await mockCategories.update(userId, id, name);
    set(s => ({ categories: s.categories.map(c => (c.id === id ? updated : c)) }));
    return updated;
  },

  deleteCategory: async (userId, id) => {
    await mockCategories.delete(userId, id);
    set(s => ({ categories: s.categories.filter(c => c.id !== id) }));
  },
}));
