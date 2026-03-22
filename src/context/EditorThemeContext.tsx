import { createContext, useContext, useState, useEffect, useLayoutEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'aj-editor-theme';

const EditorThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return (s === 'light' || s === 'dark') ? s : 'light';
  } catch {
    return 'light';
  }
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function EditorThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  // Apply immediately on mount and whenever theme changes
  useLayoutEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <EditorThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </EditorThemeContext.Provider>
  );
}

export function useEditorTheme() {
  const ctx = useContext(EditorThemeContext);
  if (!ctx) throw new Error('useEditorTheme must be used within EditorThemeProvider');
  return ctx;
}
