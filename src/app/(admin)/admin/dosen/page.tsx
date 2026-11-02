"use client";

import React, { useEffect, useMemo, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';
import AdminTableActions from '@/components/admin/AdminTableActions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { KategoriPegawai } from '@/types/kategoriPegawai';
import { formatKategoriNames, normalizeKategoriIds } from '@/utils/kategoriPegawai';
import { fetchKategoriPegawai } from '@/lib/fetchKategoriPegawai';
import { resolveDosenImageUrl } from '@/utils/dosenImage';
import Input from '@/components/form/input/InputField';
import { downloadDosenExcel } from '@/utils/dosenExcel';

interface Dosen {
  id?: number;
  urut?: number;
  prodi?: string[] | string | null;
  nama: string;
  jabatan: string;
  jabatan_en?: string;
  jabatan_ar?: string;
  pendidikan: string;
  keahlian: string;
  keahlian_en?: string;
  keahlian_ar?: string;
  gambar?: string;
  foto?: string;
}

export default function DosenPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriPegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchDosens();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchDosens = async () => {
    try {
      const [kategoriResult, dosenResult] = await Promise.all([
        fetchKategoriPegawai(),
        supabase
          .from('dosens')
          .select('*')
          .order('urut', { ascending: true }),
      ]);

      if (kategoriResult.error) {
        console.warn('Kategori pegawai:', kategoriResult.error);
      }
      if (dosenResult.error) throw dosenResult.error;

      setKategoriList(kategoriResult.data);
      setDosens(dosenResult.data || []);
    } catch (error: any) {
      console.error('Error fetching dosens:', error);
      toast.showError('Error', 'Gagal memuat data dosen');
    } finally {
      setLoading(false);
    }
  };

  const filteredDosens = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return dosens;

    return dosens.filter((dosen) => {
      const kategori = formatKategoriNames(
        normalizeKategoriIds(dosen.prodi),
        kategoriList,
        'id',
        ''
      );
      const haystack = [
        dosen.nama,
        dosen.jabatan,
        dosen.jabatan_en,
        dosen.jabatan_ar,
        dosen.pendidikan,
        dosen.keahlian,
        dosen.keahlian_en,
        dosen.keahlian_ar,
        kategori,
        dosen.urut != null ? String(dosen.urut) : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [dosens, kategoriList, query]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const pageSize = 1000;
      const rows: Record<string, unknown>[] = [];
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from('dosens')
          .select('*')
          .order('urut', { ascending: true, nullsFirst: false })
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1);

        if (error) throw error;
        const batch = data || [];
        rows.push(...batch);
        if (batch.length < pageSize) break;
        from += pageSize;
      }

      if (rows.length === 0) {
        toast.showError('Tidak ada data', 'Belum ada dosen yang bisa diekspor');
        return;
      }

      downloadDosenExcel(rows, kategoriList);
      toast.showSuccess('Berhasil', `${rows.length} dosen diekspor ke Excel`);
    } catch (error: any) {
      console.error('Error exporting dosens:', error);
      toast.showError('Gagal mengekspor', error.message || 'Tidak dapat membuat file Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleEdit = (dosen: Dosen) => {
    router.push(`/admin/dosen/${dosen.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Hapus Dosen',
      message: 'Apakah Anda yakin ingin menghapus dosen ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase.from('dosens').delete().eq('id', id);
      if (error) throw error;
      toast.showSuccess('Berhasil', 'Dosen berhasil dihapus!');
      fetchDosens();
    } catch (error: any) {
      console.error('Error deleting dosen:', error);
      toast.showError('Error Menghapus Dosen', error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Dosen Management" />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Dosen Management" />
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">
            Please login to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Dosen Management" />
      <ComponentCard title="Dosen List">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/admin/dosen/new')}
              className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Add New Dosen
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || dosens.length === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {exporting ? 'Mengekspor...' : 'Export Excel'}
            </button>
          </div>
          <form
            className="w-full sm:max-w-sm"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="dosen-search" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Cari dosen
            </label>
            <div className="flex gap-2">
              <Input
                id="dosen-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nama, jabatan, pendidikan, atau kategori"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="shrink-0 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
        {query.trim() && (
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            {filteredDosens.length} dari {dosens.length} dosen
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">Urut</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kategori Pegawai</th>
                <th className="px-4 py-3">Jabatan</th>
                <th className="px-4 py-3">Pendidikan</th>
                <th className="px-4 py-3">Gambar</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDosens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {query.trim() ? 'Tidak ada dosen yang cocok dengan pencarian' : 'Tidak ada dosen'}
                  </td>
                </tr>
              ) : (
                filteredDosens.map((dosen) => (
                  <tr
                    key={dosen.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">{dosen.urut || '-'}</td>
                    <td className="px-4 py-3">{dosen.nama}</td>
                    <td className="px-4 py-3">
                      {formatKategoriNames(
                        normalizeKategoriIds(dosen.prodi),
                        kategoriList
                      )}
                    </td>
                    <td className="px-4 py-3">{dosen.jabatan}</td>
                    <td className="px-4 py-3">{dosen.pendidikan}</td>
                    <td className="px-4 py-3">
                      {resolveDosenImageUrl(dosen) ? (
                        <img
                          src={resolveDosenImageUrl(dosen)}
                          alt={dosen.nama}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AdminTableActions
                        onEdit={() => handleEdit(dosen)}
                        onDelete={() => handleDelete(dosen.id!)}
                        editLabel="Edit dosen"
                        deleteLabel="Hapus dosen"
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

