"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import TestimoniForm from '@/components/admin/TestimoniForm';
import { supabase } from '@/lib/supabase';
import { getSupabaseErrorMessage } from '@/lib/fetchKategoriPegawai';
import type { Testimoni } from '@/types/testimoni';
import { useToast } from '@/context/ToastContext';

export default function EditTestimoniPage() {
  const params = useParams();
  const router = useRouter();
  const { showError } = useToast();
  const [row, setRow] = useState<Testimoni | null>(null);
  const [loading, setLoading] = useState(true);
  const testimoniId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!testimoniId) return;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonis')
          .select('*')
          .eq('id', testimoniId)
          .single();
        if (error) throw error;
        setRow(data as Testimoni);
      } catch (error: unknown) {
        showError('Gagal memuat', getSupabaseErrorMessage(error, 'Gagal memuat testimoni'));
        router.push('/admin/testimoni');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [testimoniId, router, showError]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Testimoni" />
        <div className="text-center py-10">Memuat data...</div>
      </div>
    );
  }

  if (!row) return null;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Testimoni" />
      <TestimoniForm mode="edit" initial={row} />
    </div>
  );
}
