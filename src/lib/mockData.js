// In-memory mock database
let users = [
  { id: 1, name: 'Victoria Salvador', email: 'example@example.com', password: 'password123', avatar: 'VS' },
];

let tasks = [
  { id: 1, userId: 1, title: 'Design landing page', description: 'Create mockups for the new landing page', category: 'Design', status: 'todo', priority: 'high', dueDate: '2026-08-01' },
  { id: 2, userId: 1, title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing', category: 'DevOps', status: 'in-progress', priority: 'critical', dueDate: '2026-07-28' },
  { id: 3, userId: 1, title: 'Write unit tests', description: 'Add test coverage for authentication module', category: 'Engineering', status: 'todo', priority: 'medium', dueDate: '2026-08-05' },
  { id: 4, userId: 1, title: 'Update documentation', description: 'Review and update API docs', category: 'Docs', status: 'done', priority: 'low', dueDate: '2026-07-20' },
  { id: 5, userId: 1, title: 'Fix login bug', description: 'Users are getting logged out unexpectedly', category: 'Engineering', status: 'in-progress', priority: 'critical', dueDate: '2026-07-25' },
  { id: 6, userId: 1, title: 'Onboarding flow', description: 'Design and implement user onboarding', category: 'Design', status: 'hold', priority: 'medium', dueDate: '2026-08-10' },
];

let categories = [
  { id: 1, userId: 1, name: 'Design' },
  { id: 2, userId: 1, name: 'Engineering' },
  { id: 3, userId: 1, name: 'DevOps' },
  { id: 4, userId: 1, name: 'Docs' },
];

let nextId = { user: 2, task: 7, category: 5 };

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// --- Auth ---
export const mockAuth = {
  async signUp({ name, email, password }) {
    await delay();
    if (users.find(u => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    const user = { id: nextId.user++, name, email, password, avatar: name.slice(0, 2).toUpperCase() };
    users.push(user);
    const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }));
    return { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } };
  },

  async signIn({ email, password }) {
    await delay();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password.');
    const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }));
    return { token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } };
  },

  async getMe(token) {
    await delay(200);
    try {
      const { userId, exp } = JSON.parse(atob(token));
      if (Date.now() > exp) throw new Error('Token expired');
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      return { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
    } catch {
      throw new Error('Invalid token');
    }
  },
};

// --- Tasks ---
export const mockTasks = {
  async getAll(userId) {
    await delay();
    return tasks.filter(t => t.userId === userId);
  },
  async create(userId, data) {
    await delay();
    const task = { id: nextId.task++, userId, ...data };
    tasks.push(task);
    return task;
  },
  async update(userId, id, data) {
    await delay();
    const idx = tasks.findIndex(t => t.id === id && t.userId === userId);
    if (idx === -1) throw new Error('Task not found');
    tasks[idx] = { ...tasks[idx], ...data };
    return tasks[idx];
  },
  async delete(userId, id) {
    await delay();
    const idx = tasks.findIndex(t => t.id === id && t.userId === userId);
    if (idx === -1) throw new Error('Task not found');
    tasks.splice(idx, 1);
  },
};

// --- Categories ---
export const mockCategories = {
  async getAll(userId) {
    await delay();
    return categories.filter(c => c.userId === userId);
  },
  async create(userId, name) {
    await delay();
    if (categories.find(c => c.userId === userId && c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Category already exists.');
    }
    const cat = { id: nextId.category++, userId, name };
    categories.push(cat);
    return cat;
  },
  async update(userId, id, name) {
    await delay();
    if (categories.find(c => c.userId === userId && c.name.toLowerCase() === name.toLowerCase() && c.id !== id)) {
      throw new Error('Category name already in use.');
    }
    const idx = categories.findIndex(c => c.id === id && c.userId === userId);
    if (idx === -1) throw new Error('Category not found');
    categories[idx] = { ...categories[idx], name };
    return categories[idx];
  },
  async delete(userId, id) {
    await delay();
    const idx = categories.findIndex(c => c.id === id && c.userId === userId);
    if (idx === -1) throw new Error('Category not found');
    categories.splice(idx, 1);
  },
};
