"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../lib/translations';
import { useTheme } from 'next-themes';

export type Lang = 'en' | 'zh' | 'ms';

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: string | undefined;
  setThemePreference: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  t: typeof translations.en; // Strongly typed based on English structure
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isValidLang = (value: string | null | undefined): value is Lang => {
  return value === 'en' || value === 'zh' || value === 'ms';
};

export const AppProvider = ({
  children,
  initialLang = 'zh',
}: {
  children: ReactNode;
  initialLang?: Lang;
}) => {
  const [lang, setLang] = useState<Lang>(initialLang);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Sync saved language preference after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLang = localStorage.getItem('lang');
    if (isValidLang(savedLang)) {
      // Keep cookie and localStorage in sync for server-first language rendering.
      document.cookie = `lm_lang=${savedLang}; path=/; max-age=31536000; samesite=lax`;
    } else {
      localStorage.setItem('lang', lang);
      document.cookie = `lm_lang=${lang}; path=/; max-age=31536000; samesite=lax`;
    }
  }, [lang]);

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', newLang);
      document.cookie = `lm_lang=${newLang}; path=/; max-age=31536000; samesite=lax`;
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const setThemePreference = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const value = {
    lang,
    setLang: handleSetLang,
    theme,
    setThemePreference,
    toggleTheme,
    t: translations[lang] || translations['en']
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
