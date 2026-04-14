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
  border: '#1e2230',
  borderSubtle: '#161a26',
  text: '#e8eaf0',
  textSecondary: '#b0b4c0',
  textMuted: '#6e7388',
  textDim: '#3d4158',
  accent: '#7B3FA0',
  accentLight: '#9B5FC0',
  accentDark: '#5B2D83',
  accentGradient: 'linear-gradient(135deg, #5B2D83, #7B3FA0)',
  accentSubtle: 'rgba(123,63,160,0.12)',
  teal: '#00A0C8',
  tealMuted: '#0080A0',
  tealSubtle: 'rgba(0,160,200,0.12)',
  success: '#34d399',
  successMuted: '#059669',
  warning: '#fbbf24',
  warningMuted: '#d97706',
  critical: '#f87171',
  criticalMuted: '#dc2626',
  glow: '0 0 20px rgba(123,63,160,0.18)',
  glowTeal: '0 0 20px rgba(0,160,200,0.15)',
  glowCritical: '0 0 15px rgba(248,113,113,0.12)',
  cardShadow: '0 2px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)',
  surface: '#11141c',
  headerGradient: 'linear-gradient(180deg, #0e1118 0%, #080a10 100%)',
  cardHover: 'rgba(123,63,160,0.06)',
  elevatedShadow: '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)',
  panelShadow: '0 2px 8px rgba(0,0,0,0.2)',
  inputBg: '#11141c',
  pillBg: 'rgba(123,63,160,0.10)',
  pillActiveBg: 'rgba(123,63,160,0.22)',
  divider: '#1a1e2c',
  skeleton: 'rgba(255,255,255,0.04)',
  overlayBg: 'rgba(0,0,0,0.6)',
};

const lightColors = {
  bg: '#f0f2f5',
  bgSecondary: '#ffffff',
  bgElevated: '#ffffff',
  border: '#e2e4ea',
  borderSubtle: '#edeef3',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  accent: '#6B2F90',
  accentLight: '#8B4FB0',
  accentDark: '#4B1D73',
  accentGradient: 'linear-gradient(135deg, #5B2D83, #7B3FA0)',
  accentSubtle: 'rgba(107,47,144,0.07)',
  teal: '#0891b2',
  tealMuted: '#0e7490',
  tealSubtle: 'rgba(8,145,178,0.07)',
  success: '#059669',
  successMuted: '#047857',
  warning: '#d97706',
  warningMuted: '#b45309',
  critical: '#dc2626',
  criticalMuted: '#b91c1c',
  glow: '0 0 20px rgba(107,47,144,0.06)',
  glowTeal: '0 0 20px rgba(8,145,178,0.06)',
  glowCritical: '0 0 15px rgba(220,38,38,0.06)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
  surface: '#f8f9fb',
  headerGradient: 'linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%)',
  cardHover: 'rgba(107,47,144,0.04)',
  elevatedShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
  panelShadow: '0 1px 4px rgba(0,0,0,0.06)',
  inputBg: '#f8f9fb',
  pillBg: 'rgba(107,47,144,0.06)',
  pillActiveBg: 'rgba(107,47,144,0.14)',
  divider: '#e5e7eb',
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
