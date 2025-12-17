"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../lib/translations';
import { useTheme } from 'next-themes';

type Lang = 'en' | 'zh' | 'ms';

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: string | undefined;
  toggleTheme: () => void;
  t: typeof translations.en; // Strongly typed based on English structure
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>('en');
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Load saved language preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('lang') as Lang;
      if (savedLang && ['en', 'zh', 'ms'].includes(savedLang)) {
        setLang(savedLang);
      }
    }
  }, []);

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', newLang);
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const value = {
    lang,
    setLang: handleSetLang,
    theme,
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
