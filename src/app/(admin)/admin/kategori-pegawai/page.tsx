"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { supabase } from '@/lib/supabase';
import AdminTableActions from '@/components/admin/AdminTableActions';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';
import { normalizeKategoriIds } from '@/utils/kategoriPegawai';
import { getSupabaseErrorMessage } from '@/lib/fetchKategoriPegawai';
import {
  applyStoredKategoriOrder,
  fetchKategoriOrderIds,
  saveKategoriOrderIds,
} from '@/lib/kategoriPegawaiOrder';

interface KategoriPegawaiRow {
  id: number;
  nama: string;
  nama_en?: string | null;
  nama_ar?: string | null;
  urut?: number | null;
  created_at?: string;
}

export default function KategoriPegawaiPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [rows, setRows] = useState<KategoriPegawaiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase
        .from('kategoripegawai')
        .select('id, nama, nama_en, nama_ar, created_at');

      if (error) throw error;
      const loaded = (data || []) as KategoriPegawaiRow[];
      const hasColumnOrder = loaded.some((row) => typeof row.urut === 'number');
      const sorted = hasColumnOrder
        ? [...loaded].sort((a, b) => {
            const urutA = a.urut ?? Number.MAX_SAFE_INTEGER;
            const urutB = b.urut ?? Number.MAX_SAFE_INTEGER;
            if (urutA !== urutB) return urutA - urutB;
            return a.id - b.id;
          })
        : applyStoredKategoriOrder(loaded, await fetchKategoriOrderIds());
      setRows(sorted);
    } catch (error: unknown) {
      const message = getSupabaseErrorMessage(error, 'Gagal memuat kategori pegawai');
      showError('Gagal memuat', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // Muat sekali saat halaman dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countDosenUsing = async (id: number) => {
    const { data, error } = await supabase.from('dosens').select('prodi');
    if (error || !data) return 0;
    const target = String(id);
    return data.filter((row) => normalizeKategoriIds(row.prodi).includes(target)).length;
  };

  const moveRow = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length || savingOrder) return;

    const next = [...rows];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setRows(next);
    setSavingOrder(true);

    try {
      const usesColumn = next.some((row) => typeof row.urut === 'number');
      if (usesColumn) {
        const results = await Promise.all(
          next.map((row, position) =>
            supabase.from('kategoripegawai').update({ urut: position + 1 }).eq('id', row.id)
          )
        );
        const failed = results.find((result) => result.error);
        if (failed?.error) throw failed.error;
        setRows(next.map((row, position) => ({ ...row, urut: position + 1 })));
      } else {
        await saveKategoriOrderIds(next.map((row) => String(row.id)));
        setRows(next);
      }
    } catch (error: unknown) {
      const message = getSupabaseErrorMessage(error, 'Gagal mengubah urutan');
      showError('Gagal menyimpan urutan', message);
      fetchRows();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (item: KategoriPegawaiRow) => {
    const usedBy = await countDosenUsing(item.id);
    const usageNote =
      usedBy > 0
        ? ` Kategori ini dipakai oleh ${usedBy} dosen dan akan hilang dari filter Tim Kami.`
        : '';

    const confirmed = await confirm({
      title: 'Hapus Kategori Pegawai',
      message: `Hapus "${item.nama}"?${usageNote}`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('kategoripegawai').delete().eq('id', item.id);
      if (error) throw error;
      if (typeof item.urut !== 'number') {
        const remaining = (await fetchKategoriOrderIds())?.filter((id) => id !== String(item.id));
        if (remaining) await saveKategoriOrderIds(remaining);
      }
      showSuccess('Berhasil', 'Kategori pegawai berhasil dihapus');
      fetchRows();
    } catch (error: unknown) {
      const message = getSupabaseErrorMessage(error, 'Gagal menghapus kategori pegawai');
      showError('Gagal menghapus', message);
    }
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Kategori Pegawai" />
        <div className="text-center py-10">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Kategori Pegawai" />
      <ComponentCard title="Daftar Kategori Pegawai">
        <div className="mb-4">
          <Link
            href="/admin/kategori-pegawai/new"
            className="inline-block px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600"
          >
            Tambah Kategori
          </Link>
        </div>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Urutan di tabel ini sama dengan urutan filter di halaman Tim Kami. Gunakan tombol naik atau turun untuk mengubahnya.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">Urutan</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">English</th>
                <th className="px-4 py-3">Arabic</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Belum ada kategori pegawai
                  </td>
                </tr>
              ) : (
                rows.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-gray-500">{index + 1}</span>
                        <button
                          type="button"
                          aria-label={`Naikkan ${item.nama}`}
                          disabled={index === 0 || savingOrder}
                          onClick={() => moveRow(index, -1)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-800"
                        >
                          Naik
                        </button>
                        <button
                          type="button"
                          aria-label={`Turunkan ${item.nama}`}
                          disabled={index === rows.length - 1 || savingOrder}
                          onClick={() => moveRow(index, 1)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-800"
                        >
                          Turun
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.nama}</td>
                    <td className="px-4 py-3">{item.nama_en || '-'}</td>
                    <td className="px-4 py-3" dir="rtl">
                      {item.nama_ar || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <AdminTableActions
                        onEdit={() => router.push(`/admin/kategori-pegawai/${item.id}/edit`)}
                        onDelete={() => handleDelete(item)}
                        editLabel="Edit kategori pegawai"
                        deleteLabel="Hapus kategori pegawai"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>
      {options && (
        <ConfirmDialog
          isOpen={isOpen}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          type={options.type}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
