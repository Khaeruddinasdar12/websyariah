import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapKategoriPegawaiRow } from '@/lib/fetchKategoriPegawai';
import { orderKategoriPegawai } from '@/lib/kategoriPegawaiOrder';
import type { KategoriPegawai } from '@/types/kategoriPegawai';

const TABLE_CANDIDATES = ['kategoripegawai', 'kategori_pegawai'] as const;

export async function GET() {
  const supabase = await createClient();
  let lastError: { message?: string; details?: string; hint?: string; code?: string } | null =
    null;

  for (const table of TABLE_CANDIDATES) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('id', { ascending: true });

    if (!error && data) {
      const mapped = await orderKategoriPegawai(
        data
          .map((row) => mapKategoriPegawaiRow(row as Record<string, unknown>))
          .filter((row): row is KategoriPegawai => row !== null)
      );

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
