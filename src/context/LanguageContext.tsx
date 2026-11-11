"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import idTranslations from '@/locales/id.json';

export type Language = 'id' | 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  // Teks Indonesia ikut dirender di server, jadi HTML awal berisi kalimat, bukan kunci terjemahan.
  const [translations, setTranslations] = useState<Record<string, any>>(idTranslations);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['id', 'en', 'ar'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Load translations
  useEffect(() => {
    async function loadTranslations() {
      try {
        switch (language) {
          case 'en':
            setTranslations((await import('@/locales/en.json')).default);
            break;
          case 'ar':
            setTranslations((await import('@/locales/ar.json')).default);
            break;
          default:
            setTranslations(idTranslations);
        }
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to Indonesian if translation file doesn't exist
        setTranslations(idTranslations);
      }
    }
    loadTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      // Set direction for Arabic
      if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  };

  const lookup = (source: unknown, key: string): string | undefined => {
    let value = source;
    for (const k of key.split('.')) {
      if (!value || typeof value !== 'object') return undefined;
      value = (value as Record<string, unknown>)[k];
    }
    return typeof value === 'string' ? value : undefined;
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Kunci yang belum ada di bahasa aktif memakai teks Indonesia, bukan menampilkan nama kuncinya.
    const value = lookup(translations, key) ?? lookup(idTranslations, key);

    if (value === undefined) {
      return key;
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  // Set initial HTML attributes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      if (language === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

