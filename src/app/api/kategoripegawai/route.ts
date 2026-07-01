import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { KategoriPegawai } from '@/types/kategoriPegawai';

const TABLE_CANDIDATES = ['kategoripegawai', 'kategori_pegawai'] as const;

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
    urut: typeof row.urut === 'number' ? row.urut : null,
  };
}

export async function GET() {
  const supabase = await createClient();
  let lastError: { message?: string; details?: string; hint?: string; code?: string } | null =
    null;

  for (const table of TABLE_CANDIDATES) {
    const { data, error } = await supabase.from(table).select('*');

    if (!error && data) {
      const mapped = data
        .map((row) => mapKategoriRow(row as Record<string, unknown>))
        .filter((row): row is KategoriPegawai => row !== null)
        .sort((a, b) => {
          const urutA = a.urut ?? 9999;
          const urutB = b.urut ?? 9999;
          if (urutA !== urutB) return urutA - urutB;
          return a.nama.localeCompare(b.nama, 'id');
        });

      return NextResponse.json({ data: mapped, table });
    }

    lastError = error;
    const code = error?.code ?? '';
    if (code !== '42P01' && code !== 'PGRST205') break;
  }

  return NextResponse.json(
    {
      error:
        lastError?.message ||
        'Gagal memuat kategori pegawai dari Supabase',
      details: lastError?.details,
      hint: lastError?.hint,
      code: lastError?.code,
    },
    { status: 500 }
  );
}
