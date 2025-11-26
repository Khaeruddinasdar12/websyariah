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

interface Pengumuman {
  id?: string;
  judul: string;
  judul_en?: string;
  judul_ar?: string;
  slug: string;
  konten: string;
  konten_en?: string;
  konten_ar?: string;
  user_id: string;
  file?: string;
  created_at?: string;
  updated_at?: string;
}

export default function PengumumanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchPengumuman();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchPengumuman = async () => {
    try {
      const { data, error } = await supabase
        .from('pengumumans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPengumuman(data || []);
    } catch (error: any) {
      console.error('Error fetching pengumuman:', error);
      toast.showError('Error', 'Gagal memuat data pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Pengumuman) => {
    router.push(`/admin/pengumuman/${item.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Hapus Pengumuman',
      message: 'Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase.from('pengumumans').delete().eq('id', id);
      if (error) throw error;
      toast.showSuccess('Berhasil', 'Pengumuman berhasil dihapus!');
      fetchPengumuman();
    } catch (error: any) {
      console.error('Error deleting pengumuman:', error);
      toast.showError('Error Menghapus Pengumuman', error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Pengumuman Management" />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Pengumuman Management" />
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
      <PageBreadcrumb pageTitle="Pengumuman Management" />
      <ComponentCard title="Pengumuman List">
        <div className="mb-4">
          <button
            onClick={() => router.push('/admin/pengumuman/new')}
            className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Add New Pengumuman
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pengumuman.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada pengumuman
                  </td>
                </tr>
              ) : (
                pengumuman.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">{item.judul}</td>
                    <td className="px-4 py-3">
                      {item.file ? (
                        <a
                          href={item.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          <i className="fas fa-file mr-2"></i>
                          Lihat File
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : '-'}
                    </td>
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

