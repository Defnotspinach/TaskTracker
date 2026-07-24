import { create } from 'zustand';

const THEME_KEY = 'tt_theme';

function applyTheme(dark) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

const saved = localStorage.getItem(THEME_KEY);
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialDark = saved !== null ? saved === 'dark' : prefersDark;
applyTheme(initialDark);

export const useThemeStore = create((set) => ({
  dark: initialDark,

  toggleTheme: () =>
    set((state) => {
      const next = !state.dark;
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return { dark: next };
    }),

  setDark: (dark) => {
    applyTheme(dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    set({ dark });
  },
}));
