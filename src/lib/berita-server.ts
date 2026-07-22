import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export interface BeritaRecord {
  id: number;
  judul: string;
  konten: string;
  gambar: string;
  kategori: string;
  kategori_en?: string;
  kategori_ar?: string;
  judul_en?: string;
  konten_en?: string;
  judul_ar?: string;
  konten_ar?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at?: string;
}

export function extractBeritaIdFromSlug(slug: string): number | null {
  const idMatch = slug.match(/-(\d+)$/);
  return idMatch ? parseInt(idMatch[1], 10) : null;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export const getBeritaById = cache(async (id: number): Promise<BeritaRecord | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('beritas')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as BeritaRecord;
});

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}
