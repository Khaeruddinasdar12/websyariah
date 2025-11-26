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
import Image from 'next/image';

interface Dosen {
  id?: number;
  urut?: number;
  prodi: string;
  nama: string;
  jabatan: string;
  jabatan_en?: string;
  jabatan_ar?: string;
  pendidikan: string;
  keahlian: string;
  keahlian_en?: string;
  keahlian_ar?: string;
  gambar?: string;
}

export default function DosenPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);

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
      const { data, error } = await supabase
        .from('dosens')
        .select('*')
        .order('urut', { ascending: true });

      if (error) throw error;
      setDosens(data || []);
    } catch (error: any) {
      console.error('Error fetching dosens:', error);
      toast.showError('Error', 'Gagal memuat data dosen');
    } finally {
      setLoading(false);
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
        <div className="mb-4">
          <button
            onClick={() => router.push('/admin/dosen/new')}
            className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Add New Dosen
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">Urut</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Prodi</th>
                <th className="px-4 py-3">Jabatan</th>
                <th className="px-4 py-3">Pendidikan</th>
                <th className="px-4 py-3">Gambar</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dosens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada dosen
                  </td>
                </tr>
              ) : (
                dosens.map((dosen) => (
                  <tr
                    key={dosen.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">{dosen.urut || '-'}</td>
                    <td className="px-4 py-3">{dosen.nama}</td>
                    <td className="px-4 py-3">{dosen.prodi}</td>
                    <td className="px-4 py-3">{dosen.jabatan}</td>
                    <td className="px-4 py-3">{dosen.pendidikan}</td>
                    <td className="px-4 py-3">
                      {dosen.gambar ? (
                        <img
                          src={dosen.gambar}
                          alt={dosen.nama}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(dosen)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dosen.id!)}
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

