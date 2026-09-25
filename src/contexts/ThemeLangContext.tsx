import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { LanguageCode } from '@/i18n/translations';
import { translate, type TranslationKey } from '@/i18n/translations';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeLangContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

const ThemeLangContext = createContext<ThemeLangContextValue | undefined>(undefined);

export function ThemeLangProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('vaanshield-theme') as ThemeMode) || 'system';
  });
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('vaanshield-lang') as LanguageCode) || 'en';
  });

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    applyTheme();

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem('vaanshield-theme', t);
  };

  const setLanguage = (l: LanguageCode) => {
    setLanguageState(l);
    localStorage.setItem('vaanshield-lang', l);
  };

  const t = (key: TranslationKey) => translate(language, key);

  return (
    <ThemeLangContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </ThemeLangContext.Provider>
  );
}

export function useThemeLang() {
  const ctx = useContext(ThemeLangContext);
  if (!ctx) throw new Error('useThemeLang must be used within ThemeLangProvider');
  return ctx;
}
