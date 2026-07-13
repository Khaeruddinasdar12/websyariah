import type { Language } from '@/lib/supabase-i18n';
import type { PpidContent } from './types';
import { ppidContentId } from './id';
import { ppidContentEn } from './en';
import { ppidContentAr } from './ar';

export function getPpidContent(language: Language): PpidContent {
  switch (language) {
    case 'en':
      return ppidContentEn;
    case 'ar':
      return ppidContentAr;
    default:
      return ppidContentId;
  }
}

export type { PpidContent, PpidSection, PpidTableRow } from './types';
