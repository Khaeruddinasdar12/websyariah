/**
 * Helper functions for handling multi-language data from Supabase
 * 
 * This file provides utilities to fetch and format data that supports
 * multiple languages (Indonesian, English, Arabic)
 */

import { supabase } from './supabase';

export type Language = 'id' | 'en' | 'ar';

/**
 * Get language-specific field name
 * Example: getLangField('judul', 'en') returns 'judul_en'
 */
export function getLangField(baseField: string, lang: Language): string {
  if (lang === 'id') {
    return baseField; // Indonesian is the default/base language
  }
  return `${baseField}_${lang}`;
}

/**
 * Get the value for a field in the current language
 * Falls back to Indonesian if the language-specific field is not available
 */
export function getLangValue(data: any, baseField: string, lang: Language): string {
  if (lang === 'id') {
    return data[baseField] || '';
  }
  
  const langField = getLangField(baseField, lang);
  const langValue = data[langField];
  
  // Fallback to Indonesian if language-specific field is empty
  if (!langValue || langValue.trim() === '') {
    return data[baseField] || '';
  }
  
  return langValue;
}

/**
 * Transform data to include language-specific fields
 * This function should be used when fetching data from Supabase
 */
export function transformI18nData<T extends Record<string, any>>(
  data: T[],
  fields: string[],
  lang: Language
): T[] {
  return data.map(item => {
    const transformed: Record<string, any> = { ...item };

    fields.forEach(field => {
      const langValue = getLangValue(item, field, lang);
      transformed[field] = langValue;
    });

    return transformed as T;
  });
}

/**
 * Example usage for fetching announcements with i18n support
 */
export async function fetchAnnouncementsI18n(lang: Language = 'id', limit?: number) {
  const query = supabase
    .from('pengumumans')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (limit) {
    query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  if (!data) {
    return [];
  }
  
  // Transform data to use language-specific fields
  return transformI18nData(data, ['judul', 'konten'], lang);
}

/**
 * Example usage for fetching news with i18n support
 */
export async function fetchBeritaI18n(lang: Language = 'id', limit?: number) {
  const query = supabase
    .from('beritas')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (limit) {
    query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  if (!data) {
    return [];
  }
  
  // Transform data to use language-specific fields
  return transformI18nData(data, ['judul', 'konten', 'kategori'], lang);
}

/**
 * Example usage for fetching single announcement with i18n support
 */
export async function fetchAnnouncementBySlugI18n(slug: string, lang: Language = 'id') {
  const { data, error } = await supabase
    .from('pengumumans')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    throw error;
  }
  
  if (!data) {
    return null;
  }
  
  // Transform data to use language-specific fields
  const transformed = transformI18nData([data], ['judul', 'konten'], lang);
  return transformed[0];
}

/**
 * Example usage for fetching single news with i18n support
 */
export async function fetchBeritaByIdI18n(id: number, lang: Language = 'id') {
  const { data, error } = await supabase
    .from('beritas')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw error;
  }
  
  if (!data) {
    return null;
  }
  
  // Transform data to use language-specific fields
  const transformed = transformI18nData([data], ['judul', 'konten', 'kategori'], lang);
  return transformed[0];
}

