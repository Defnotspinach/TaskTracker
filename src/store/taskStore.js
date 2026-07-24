import { create } from 'zustand';
import { createTask as createTaskApi, deleteTask as deleteTaskApi, getTasks, updateTask as updateTaskApi } from '../lib/api';

export const useTaskStore = create((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (userId) => {
    void userId;
    set({ loading: true, error: null });
    try {
      const tasks = await getTasks();
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createTask: async (userId, data) => {
    void userId;
    const task = await createTaskApi(data);
    set(s => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  updateTask: async (userId, id, data) => {
    void userId;
    const updated = await updateTaskApi(id, data);
    set(s => ({ tasks: s.tasks.map(t => (t.id === id ? updated : t)) }));
    return updated;
  },

  deleteTask: async (userId, id) => {
    void userId;
    await deleteTaskApi(id);
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
  },
}));
