import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function usePageTitle(pageName: string, dynamicTitle?: string) {
  const { t } = useLanguage();

  useEffect(() => {
    const title = dynamicTitle 
      ? `${dynamicTitle} - FSHI`
      : `${pageName} - FSHI`;
    
    document.title = title;
  }, [pageName, dynamicTitle, t]);
}

