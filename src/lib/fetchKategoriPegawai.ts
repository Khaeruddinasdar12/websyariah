import { supabase } from '@/lib/supabase';
import type { KategoriPegawai } from '@/types/kategoriPegawai';

const TABLE_CANDIDATES = ['kategoripegawai', 'kategori_pegawai'] as const;

type SupabaseLikeError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

export function getSupabaseErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as SupabaseLikeError;
    const parts = [e.message, e.details, e.hint, e.code].filter(Boolean);
    if (parts.length > 0) return parts.join(' — ');
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function mapKategoriRow(row: Record<string, unknown>): KategoriPegawai | null {
  if (row.id == null) return null;

  const nama =
    (typeof row.nama === 'string' && row.nama) ||
    (typeof row.name === 'string' && row.name) ||
    (typeof row.kategori === 'string' && row.kategori) ||
    null;

  if (!nama) return null;

  return {
    id: String(row.id),
    nama,
    nama_en: typeof row.nama_en === 'string' ? row.nama_en : undefined,
    nama_ar: typeof row.nama_ar === 'string' ? row.nama_ar : undefined,
  };
}

export function sortKategoriPegawai(list: KategoriPegawai[]): KategoriPegawai[] {
  return [...list].sort((a, b) => compareKategoriId(a.id, b.id));
}

function compareKategoriId(a: string, b: string): number {
  const numA = Number(a);
  const numB = Number(b);

  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    return numA - numB;
  }

  return a.localeCompare(b);
}

export async function fetchKategoriPegawai(): Promise<{
  data: KategoriPegawai[];
  error: string | null;
  table: string | null;
}> {
  let lastError: unknown = null;

  for (const table of TABLE_CANDIDATES) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('id', { ascending: true });

    if (!error && data) {
      const mapped = data
        .map((row) => mapKategoriRow(row as Record<string, unknown>))
        .filter((row): row is KategoriPegawai => row !== null);

      return {
        data: sortKategoriPegawai(mapped),
        error: null,
        table,
      };
    }

    lastError = error;

    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as SupabaseLikeError).code)
        : '';

    if (code !== '42P01' && code !== 'PGRST205') {
      break;
    }
  }

  return {
    data: [],
    error: getSupabaseErrorMessage(
      lastError,
      'Gagal memuat kategori pegawai. Pastikan tabel kategoripegawai ada dan role anon/authenticated punya hak SELECT.'
    ),
    table: null,
  };
}
