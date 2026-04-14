import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof darkColors;
}

const darkColors = {
  bg: '#010409',
  bgSecondary: '#0d1117',
  border: '#21262d',
  text: '#e6e6e6',
  textMuted: '#888',
  textDim: '#555',
  accent: '#64b5f6',
  success: '#4caf50',
  warning: '#ff9800',
  critical: '#f44336',
};

const lightColors = {
  bg: '#f5f5f5',
  bgSecondary: '#ffffff',
  border: '#e0e0e0',
  text: '#1a1a1a',
  textMuted: '#666',
  textDim: '#999',
  accent: '#1976d2',
  success: '#2e7d32',
  warning: '#ed6c02',
  critical: '#d32f2f',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('kla-theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('kla-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
