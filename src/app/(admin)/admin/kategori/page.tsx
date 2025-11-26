"use client";

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';
import { TrashBinIcon, PencilIcon } from '@/icons';
import { useRouter } from 'next/navigation';

interface Kategori {
  id?: number;
  kategori: string;
  kategori_en?: string;
  kategori_ar?: string;
}

export default function KategoriPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchKategoris();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchKategoris = async () => {
    try {
      const { data, error } = await supabase
        .from('kategoris')
        .select('*')
        .order('kategori', { ascending: true });

      if (error) throw error;
      setKategoris(data || []);
    } catch (error: any) {
      console.error('Error fetching kategoris:', error);
      toast.showError('Error', 'Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Kategori) => {
    router.push(`/admin/kategori/${item.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Hapus Kategori',
      message: 'Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase.from('kategoris').delete().eq('id', id);
      if (error) throw error;
      toast.showSuccess('Berhasil', 'Kategori berhasil dihapus!');
      fetchKategoris();
    } catch (error: any) {
      console.error('Error deleting kategori:', error);
      toast.showError('Error Menghapus Kategori', error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Kategori Management" />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Kategori Management" />
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
      <PageBreadcrumb pageTitle="Kategori Management" />
      <ComponentCard title="Kategori List">
        <div className="mb-4">
          <button
            onClick={() => router.push('/admin/kategori/new')}
            className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Add New Kategori
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">Kategori (ID)</th>
                <th className="px-4 py-3">Kategori (EN)</th>
                <th className="px-4 py-3">Kategori (AR)</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {kategoris.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada kategori
                  </td>
                </tr>
              ) : (
                kategoris.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">{item.kategori}</td>
                    <td className="px-4 py-3">{item.kategori_en || '-'}</td>
                    <td className="px-4 py-3">{item.kategori_ar || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </div>
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

