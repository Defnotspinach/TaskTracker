import { create } from 'zustand';
import { mockTasks } from '../lib/mockData';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (userId) => {
    set({ loading: true, error: null });
    try {
      const tasks = await mockTasks.getAll(userId);
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createTask: async (userId, data) => {
    const task = await mockTasks.create(userId, data);
    set(s => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  updateTask: async (userId, id, data) => {
    const updated = await mockTasks.update(userId, id, data);
    set(s => ({ tasks: s.tasks.map(t => (t.id === id ? updated : t)) }));
    return updated;
  },

  deleteTask: async (userId, id) => {
    await mockTasks.delete(userId, id);
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
  },
}));
