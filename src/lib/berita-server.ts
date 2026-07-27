import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl, PRODUCTION_SITE_URL } from '@/lib/site-url';

export { getSiteUrl, PRODUCTION_SITE_URL } from '@/lib/site-url';

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

/** Make image URL absolute HTTPS for Open Graph / WhatsApp crawlers. */
export function toAbsoluteImageUrl(
  imageUrl: string | null | undefined,
  siteUrl = getSiteUrl()
): string | null {
  if (!imageUrl?.trim()) return null;
  const trimmed = imageUrl.trim();

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${siteUrl}${path}`;
}

/**
 * WhatsApp often skips large OG images (>~300KB).
 * Always serve via same-origin /api/og-image on the public domain.
 */
export function toWhatsAppOgImageUrl(
  imageUrl: string | null | undefined,
  siteUrl = getSiteUrl()
): string | null {
  const absolute = toAbsoluteImageUrl(imageUrl, siteUrl);
  if (!absolute) return null;
  // Force public domain so OG never points at *.vercel.app
  const origin =
    siteUrl.includes('vercel.app') || !siteUrl.includes('iain-bone.ac.id')
      ? PRODUCTION_SITE_URL
      : siteUrl;
  return `${origin}/api/og-image?url=${encodeURIComponent(absolute)}`;
}


