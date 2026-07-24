import axios from 'axios';

// ─── Base instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ─── Request interceptor — attach JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — normalise errors ─────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status;
    const message = err.response?.data?.message
      ?? err.response?.data?.error
      ?? err.message
      ?? 'An unexpected error occurred.';

    // Auto-logout on 401
    if (status === 401) {
      localStorage.removeItem('tt_token');
      // Let the auth store / ProtectedRoute redirect — just reject cleanly
    }

    return Promise.reject(new Error(message));
  },
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** POST /api/auth/register  →  { token, user } */
export const register = (payload) =>
  api.post('/api/auth/register', payload).then((r) => r.data);

/** POST /api/auth/login  →  { token, user } */
export const login = (payload) =>
  api.post('/api/auth/login', payload).then((r) => r.data);

/** GET /api/auth/me  →  user */
export const getMe = () =>
  api.get('/api/auth/me').then((r) => r.data);

/** POST /api/auth/password-reset/request  →  { message, resetToken, expiresAt, user } */
export const requestPasswordReset = (payload) =>
  api.post('/api/auth/password-reset/request', payload).then((r) => r.data);

/** POST /api/auth/password-reset/confirm  →  { message } */
export const confirmPasswordReset = (payload) =>
  api.post('/api/auth/password-reset/confirm', payload).then((r) => r.data);

// ─── Health ───────────────────────────────────────────────────────────────────

/** GET /api/health  →  { status } */
export const healthCheck = () =>
  api.get('/api/health').then((r) => r.data);

// ─── Tasks ────────────────────────────────────────────────────────────────────

/**
 * GET /api/tasks
 * Optional query params:
 *   status, category_id, search, page, limit
 */
export const getTasks = (params = {}) =>
  api.get('/api/tasks', { params }).then((r) => r.data);

/** GET /api/tasks/:id  →  task (with category) */
export const getTaskById = (id) =>
  api.get(`/api/tasks/${id}`).then((r) => r.data);

/** POST /api/tasks  →  created task */
export const createTask = (payload) =>
  api.post('/api/tasks', payload).then((r) => r.data);

/** PUT /api/tasks/:id  →  updated task */
export const updateTask = (id, payload) =>
  api.put(`/api/tasks/${id}`, payload).then((r) => r.data);

/** DELETE /api/tasks/:id */
export const deleteTask = (id) =>
  api.delete(`/api/tasks/${id}`).then((r) => r.data);

// ─── Categories ───────────────────────────────────────────────────────────────

/** GET /api/categories  →  category[] */
export const getCategories = () =>
  api.get('/api/categories').then((r) => r.data);

/** POST /api/categories  →  created category */
export const createCategory = (payload) =>
  api.post('/api/categories', payload).then((r) => r.data);

/**
 * NOTE: Your spec doesn't list PUT/DELETE /api/categories/:id.
 * These are kept as local helpers that can be wired to the API
 * once those endpoints are added on the backend.
 */
export const updateCategory = (id, payload) =>
  api.put(`/api/categories/${id}`, payload).then((r) => r.data);

export const deleteCategory = (id) =>
  api.delete(`/api/categories/${id}`).then((r) => r.data);
