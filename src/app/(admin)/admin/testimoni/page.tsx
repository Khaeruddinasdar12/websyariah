"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { supabase } from '@/lib/supabase';
import AdminTableActions from '@/components/admin/AdminTableActions';
import { getSupabaseErrorMessage } from '@/lib/fetchKategoriPegawai';
import type { Testimoni } from '@/types/testimoni';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';

export default function TestimoniAdminPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [rows, setRows] = useState<Testimoni[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonis')
        .select('id, nama, peran, aktif, urut, created_at')
        .order('urut', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRows((data || []) as Testimoni[]);
    } catch (error: unknown) {
      showError('Gagal memuat', getSupabaseErrorMessage(error, 'Gagal memuat testimoni'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveRow = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length || savingOrder) return;

    const next = [...rows];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setRows(next);
    setSavingOrder(true);

    try {
      const results = await Promise.all(
        next.map((row, position) =>
          supabase.from('testimonis').update({ urut: position + 1 }).eq('id', row.id)
        )
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      setRows(next.map((row, position) => ({ ...row, urut: position + 1 })));
    } catch (error: unknown) {
      showError('Gagal menyimpan urutan', getSupabaseErrorMessage(error, 'Gagal mengubah urutan'));
      fetchRows();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (item: Testimoni) => {
    const confirmed = await confirm({
      title: 'Hapus Testimoni',
      message: `Hapus testimoni "${item.nama}"?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('testimonis').delete().eq('id', item.id);
      if (error) throw error;
      showSuccess('Berhasil', 'Testimoni berhasil dihapus');
      fetchRows();
    } catch (error: unknown) {
      showError('Gagal menghapus', getSupabaseErrorMessage(error, 'Gagal menghapus testimoni'));
    }
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Testimoni" />
        <div className="text-center py-10">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Testimoni" />
      <ComponentCard title="Daftar Testimoni">
        <div className="mb-4">
          <Link
            href="/admin/testimoni/new"
            className="inline-block px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600"
          >
            Tambah Testimoni
          </Link>
        </div>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Hanya testimoni yang ditandai tampil yang muncul di halaman Tentang. Urutan di tabel ini sama dengan urutan di situs.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">Urutan</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Peran</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Belum ada testimoni
                  </td>
                </tr>
              ) : (
                rows.map((item, index) => (
                  <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
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
                    <td className="px-4 py-3 max-w-xs truncate">{item.peran}</td>
                    <td className="px-4 py-3">{item.aktif ? 'Tampil' : 'Disembunyikan'}</td>
                    <td className="px-4 py-3">
                      <AdminTableActions
                        onEdit={() => router.push(`/admin/testimoni/${item.id}/edit`)}
                        onDelete={() => handleDelete(item)}
                        editLabel="Edit testimoni"
                        deleteLabel="Hapus testimoni"
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
