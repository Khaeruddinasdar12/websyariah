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

interface Berita {
  id?: string;
  judul: string;
  slug: string;
  konten: string;
  gambar: string;
  user_id: string;
  kategori?: string;
  kategori_id?: number;
  judul_en: string;
  konten_en: string;
  kategori_en?: string;
  judul_ar: string;
  konten_ar: string;
  kategori_ar?: string;
  created_at?: string;
  updated_at?: string;
  kategoris?: {
    id: number;
    kategori: string;
    kategori_en?: string;
    kategori_ar?: string;
  };
}

export default function BeritasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [beritas, setBeritas] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchBeritas();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchBeritas = async () => {
    try {
      // Try to fetch with join to kategoris table
      const { data, error } = await supabase
        .from('beritas')
        .select(`
          *,
          kategoris (
            id,
            kategori,
            kategori_en,
            kategori_ar
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // If join fails, try without join
        console.warn('Join with kategoris failed, fetching without join:', error);
        const { data: simpleData, error: simpleError } = await supabase
          .from('beritas')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) throw simpleError;
        setBeritas(simpleData || []);
      } else {
        setBeritas(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching beritas:', error);
      toast.showError('Error', 'Gagal memuat data berita');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category name
  const getCategoryName = (berita: Berita): string => {
    // First try to get from kategoris relation
    if (berita.kategoris) {
      const kat = Array.isArray(berita.kategoris) ? berita.kategoris[0] : berita.kategoris;
      if (kat) {
        return kat.kategori || 'Kategori';
      }
    }
    // Fallback to kategori field
    return berita.kategori || '-';
  };

  const handleEdit = (berita: Berita) => {
    router.push(`/admin/beritas/${berita.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Hapus Berita',
      message: 'Apakah Anda yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase.from('beritas').delete().eq('id', id);
      if (error) throw error;
      toast.showSuccess('Berhasil', 'Berita berhasil dihapus!');
      fetchBeritas();
    } catch (error: any) {
      console.error('Error deleting berita:', error);
      toast.showError('Error Menghapus Berita', error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Beritas Management" />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Beritas Management" />
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
      <PageBreadcrumb pageTitle="Beritas Management" />
      <ComponentCard title="Beritas List">
        <div className="mb-4">
          <button
            onClick={() => router.push('/admin/beritas/new')}
            className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Add New Berita
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Gambar</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {beritas.map((berita) => (
                <tr
                  key={berita.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3">{berita.judul}</td>
                  <td className="px-4 py-3">{getCategoryName(berita)}</td>
                  <td className="px-4 py-3">
                    {berita.gambar && (
                      <img
                        src={berita.gambar}
                        alt={berita.judul}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {berita.created_at
                      ? new Date(berita.created_at).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(berita)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(berita.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
