import type { KategoriPegawai } from '@/types/kategoriPegawai';
import { getLangValue, type Language } from '@/lib/supabase-i18n';

export function normalizeKategoriIds(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return [...new Set(value.map(String).filter(Boolean))];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return [...new Set(parsed.map(String).filter(Boolean))];
      }
    } catch {
      // legacy comma-separated values
    }

    return [...new Set(trimmed.split(/[,;]+/).map((part) => part.trim()).filter(Boolean))];
  }

  return [];
}

/** @deprecated gunakan normalizeKategoriIds */
export const normalizePegawaiIds = normalizeKategoriIds;

export function getLocalizedKategoriName(
  category: KategoriPegawai,
  lang: Language
): string {
  return getLangValue(category, 'nama', lang) || category.nama;
}

export function getKategoriNames(
  ids: string[],
  categories: KategoriPegawai[],
  lang: Language = 'id'
): string[] {
  const map = new Map(
    categories.map((item) => [item.id, getLocalizedKategoriName(item, lang)])
  );
  return ids.map((id) => map.get(id)).filter((name): name is string => Boolean(name));
}

export function formatKategoriNames(
  ids: string[],
  categories: KategoriPegawai[],
  lang: Language = 'id',
  fallback = '-'
): string {
  const names = getKategoriNames(ids, categories, lang);
  return names.length > 0 ? names.join(', ') : fallback;
}
