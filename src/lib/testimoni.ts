import { supabase } from '@/lib/supabase';
import type { Language } from '@/lib/supabase-i18n';
import type { Testimoni } from '@/types/testimoni';

const TITLE_WORDS = new Set(['s', 'h', 'm', 'sh', 'mh', 'shi', 'dr', 'prof', 'y']);

export function testimoniInitials(nama: string, stored?: string | null) {
  const custom = stored?.trim();
  if (custom) return custom.slice(0, 4).toUpperCase();

  const parts = nama
    .replace(/[.,]/g, ' ')
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part && !TITLE_WORDS.has(part.toLowerCase()));

  const letters = parts.slice(0, 2).map((part) => part[0]).join('');
  return (letters || nama.slice(0, 2)).toUpperCase();
}

export function localizedTestimoni(row: Testimoni, language: Language) {
  const pick = (id: string, en?: string | null, ar?: string | null) => {
    if (language === 'en' && en?.trim()) return en;
    if (language === 'ar' && ar?.trim()) return ar;
    return id;
  };

  const name = pick(row.nama, row.nama_en, row.nama_ar);
  return {
    id: row.id,
    name,
    role: pick(row.peran, row.peran_en, row.peran_ar),
    quote: pick(row.kutipan, row.kutipan_en, row.kutipan_ar),
    initials: testimoniInitials(row.nama, row.inisial),
  };
}

export async function fetchPublicTestimoni() {
  const { data, error } = await supabase
    .from('testimonis')
    .select('id, nama, nama_en, nama_ar, peran, peran_en, peran_ar, kutipan, kutipan_en, kutipan_ar, inisial, urut, aktif, created_at')
    .eq('aktif', true)
    .order('urut', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Testimoni[];
}
