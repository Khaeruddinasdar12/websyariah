import { supabase } from '@/lib/supabase';
import type { KategoriPegawai } from '@/types/kategoriPegawai';

export function sortKategoriPegawai(list: KategoriPegawai[]): KategoriPegawai[] {
  return [...list].sort((a, b) => {
    const urutA = a.urut ?? Number.MAX_SAFE_INTEGER;
    const urutB = b.urut ?? Number.MAX_SAFE_INTEGER;
    if (urutA !== urutB) return urutA - urutB;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}

const ORDER_PATH = 'kategori-pegawai/order.png';

function orderUrl() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/images/${ORDER_PATH}`;
}

export async function fetchKategoriOrderIds(): Promise<string[] | null> {
  try {
    const response = await fetch(`${orderUrl()}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const text = (await response.text()).trim();
    if (!/^[\d,\s]+$/.test(text)) return null;
    const ids = text.split(',').map((part) => part.trim()).filter(Boolean);
    return ids.length > 0 ? ids : null;
  } catch {
    return null;
  }
}

export function applyStoredKategoriOrder<T extends { id: string | number }>(
  list: T[],
  orderIds: string[] | null
): T[] {
  if (!orderIds || orderIds.length === 0) return list;

  const rank = new Map(orderIds.map((id, index) => [id, index]));
  return [...list].sort((a, b) => {
    const keyA = String(a.id);
    const keyB = String(b.id);
    const rankA = rank.has(keyA) ? rank.get(keyA)! : orderIds.length;
    const rankB = rank.has(keyB) ? rank.get(keyB)! : orderIds.length;
    if (rankA !== rankB) return rankA - rankB;
    return keyA.localeCompare(keyB, undefined, { numeric: true });
  });
}

export async function orderKategoriPegawai(list: KategoriPegawai[]): Promise<KategoriPegawai[]> {
  const orderIds = await fetchKategoriOrderIds();
  if (orderIds) return applyStoredKategoriOrder(list, orderIds);
  return sortKategoriPegawai(list);
}

export async function saveKategoriOrderIds(ids: string[]) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Sesi login tidak ditemukan');

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const response = await fetch(`${base}/storage/v1/object/images/${ORDER_PATH}`, {
    method: 'POST',
    headers: {
      apikey: apikey || '',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
      'cache-control': '0',
    },
    body: ids.join(','),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Gagal menyimpan urutan');
  }
}

export function placeIdInOrder(ids: string[], id: string, position: number) {
  const next = ids.filter((item) => item !== id);
  const index = Math.min(Math.max(position, 1), next.length + 1) - 1;
  next.splice(index, 0, id);
  return next;
}
