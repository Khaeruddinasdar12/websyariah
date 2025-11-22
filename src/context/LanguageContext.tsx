"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'id' | 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const [translations, setTranslations] = useState<Record<string, any>>({});

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
        let translationsModule;
        switch (language) {
          case 'en':
            translationsModule = await import('@/locales/en.json');
            break;
          case 'ar':
            translationsModule = await import('@/locales/ar.json');
            break;
          default:
            translationsModule = await import('@/locales/id.json');
        }
        setTranslations(translationsModule.default || translationsModule);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to Indonesian if translation file doesn't exist
        try {
          const fallback = await import('@/locales/id.json');
          setTranslations(fallback.default || fallback);
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
          setTranslations({});
        }
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

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
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

