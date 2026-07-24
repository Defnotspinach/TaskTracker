import { create } from 'zustand';
import { createCategory as createCategoryApi, deleteCategory as deleteCategoryApi, getCategories, updateCategory as updateCategoryApi } from '../lib/api';

export const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (userId) => {
    void userId;
    set({ loading: true, error: null });
    try {
      const categories = await getCategories();
      set({ categories, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createCategory: async (userId, name) => {
    void userId;
    const cat = await createCategoryApi({ name });
    set(s => ({ categories: [...s.categories, cat] }));
    return cat;
  },

  updateCategory: async (userId, id, name) => {
    void userId;
    const updated = await updateCategoryApi(id, { name });
    set(s => ({ categories: s.categories.map(c => (c.id === id ? updated : c)) }));
    return updated;
  },

  deleteCategory: async (userId, id) => {
    void userId;
    await deleteCategoryApi(id);
    set(s => ({ categories: s.categories.filter(c => c.id !== id) }));
  },
}));
