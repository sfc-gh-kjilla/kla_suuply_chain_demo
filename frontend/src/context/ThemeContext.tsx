import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof darkColors;
}

const darkColors = {
  bg: '#080a10',
  bgSecondary: '#0e1118',
  bgElevated: '#151822',
  border: '#1a2035',
  borderSubtle: '#141828',
  text: '#e8eaf0',
  textSecondary: '#b0b4c0',
  textMuted: '#6e7388',
  textDim: '#3d4158',
  accent: '#00A7E1',
  accentLight: '#33BDEE',
  accentDark: '#0087C0',
  accentGradient: 'linear-gradient(135deg, #41007F, #00A7E1)',
  accentSubtle: 'rgba(0,167,225,0.12)',
  teal: '#7340BD',
  tealMuted: '#41007F',
  tealSubtle: 'rgba(115,64,189,0.12)',
  success: '#34d399',
  successMuted: '#059669',
  warning: '#fbbf24',
  warningMuted: '#d97706',
  critical: '#f87171',
  criticalMuted: '#dc2626',
  glow: '0 0 20px rgba(0,167,225,0.18)',
  glowTeal: '0 0 20px rgba(115,64,189,0.15)',
  glowCritical: '0 0 15px rgba(248,113,113,0.12)',
  cardShadow: '0 2px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)',
  surface: '#0c0f1a',
  headerGradient: 'linear-gradient(180deg, #0e1118 0%, #080a10 100%)',
  cardHover: 'rgba(0,167,225,0.06)',
  elevatedShadow: '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)',
  panelShadow: '0 2px 8px rgba(0,0,0,0.2)',
  inputBg: '#0c0f1a',
  pillBg: 'rgba(0,167,225,0.10)',
  pillActiveBg: 'rgba(0,167,225,0.22)',
  divider: '#1a2035',
  skeleton: 'rgba(255,255,255,0.04)',
  overlayBg: 'rgba(0,0,0,0.6)',
};

const lightColors = {
  bg: '#f0f2f7',
  bgSecondary: '#ffffff',
  bgElevated: '#ffffff',
  border: '#dde1ec',
  borderSubtle: '#eaecf3',
  text: '#0a0f1e',
  textSecondary: '#2d3748',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  accent: '#0087C0',
  accentLight: '#00A7E1',
  accentDark: '#006B9E',
  accentGradient: 'linear-gradient(135deg, #41007F, #0087C0)',
  accentSubtle: 'rgba(0,135,192,0.07)',
  teal: '#41007F',
  tealMuted: '#30006B',
  tealSubtle: 'rgba(65,0,127,0.07)',
  success: '#059669',
  successMuted: '#047857',
  warning: '#d97706',
  warningMuted: '#b45309',
  critical: '#dc2626',
  criticalMuted: '#b91c1c',
  glow: '0 0 20px rgba(0,135,192,0.06)',
  glowTeal: '0 0 20px rgba(65,0,127,0.06)',
  glowCritical: '0 0 15px rgba(220,38,38,0.06)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
  surface: '#f8f9fc',
  headerGradient: 'linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%)',
  cardHover: 'rgba(0,135,192,0.04)',
  elevatedShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
  panelShadow: '0 1px 4px rgba(0,0,0,0.06)',
  inputBg: '#f8f9fc',
  pillBg: 'rgba(0,135,192,0.06)',
  pillActiveBg: 'rgba(0,135,192,0.14)',
  divider: '#e2e6f0',
  skeleton: 'rgba(0,0,0,0.04)',
  overlayBg: 'rgba(0,0,0,0.3)',
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
