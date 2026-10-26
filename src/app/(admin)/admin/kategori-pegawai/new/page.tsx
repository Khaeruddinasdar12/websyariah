"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { supabase } from '@/lib/supabase';
import { getSupabaseErrorMessage } from '@/lib/fetchKategoriPegawai';
import {
  fetchKategoriOrderIds,
  placeIdInOrder,
  saveKategoriOrderIds,
} from '@/lib/kategoriPegawaiOrder';
import { useToast } from '@/context/ToastContext';

export default function NewKategoriPegawaiPage() {
  const router = useRouter();
  const { showError, showSuccess, showWarning } = useToast();
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [nama, setNama] = useState('');
  const [namaEn, setNamaEn] = useState('');
  const [namaAr, setNamaAr] = useState('');
  const [urut, setUrut] = useState('');

  useEffect(() => {
    const loadNextUrut = async () => {
      const ids = await fetchKategoriOrderIds();
      setUrut(String((ids?.length || 0) + 1));
    };
    loadNextUrut();
  }, []);

  const translateText = async (text: string, targetLang: 'en' | 'ar') => {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return (data.translatedText as string) || '';
  };

  const handleAutoTranslate = async () => {
    if (!nama.trim()) {
      showWarning('Form Kosong', 'Isi nama kategori terlebih dahulu');
      return;
    }

    setTranslating(true);
    try {
      const [en, ar] = await Promise.all([
        translateText(nama.trim(), 'en'),
        translateText(nama.trim(), 'ar'),
      ]);
      setNamaEn(en);
      setNamaAr(ar);
      showSuccess('Terjemahan Berhasil', 'Nama Inggris dan Arab sudah diisi');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menerjemahkan';
      showError('Error Terjemahan', message);
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      showError('Form Tidak Lengkap', 'Nama kategori wajib diisi');
      return;
    }
    if (urut.trim() && (!Number.isInteger(Number(urut)) || Number(urut) < 1)) {
      showError('Form Tidak Lengkap', 'Urutan harus berupa angka mulai dari 1');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('kategoripegawai')
        .insert([
          {
            nama: nama.trim(),
            nama_en: namaEn.trim() || null,
            nama_ar: namaAr.trim() || null,
          },
        ])
        .select('id')
        .single();
      if (error) throw error;
      const ids = (await fetchKategoriOrderIds()) || [];
      await saveKategoriOrderIds(
        placeIdInOrder(ids, String(data.id), urut.trim() ? Number(urut) : ids.length + 1)
      );
      showSuccess('Berhasil', 'Kategori pegawai berhasil ditambahkan');
      router.push('/admin/kategori-pegawai');
    } catch (error: unknown) {
      const message = getSupabaseErrorMessage(error, 'Gagal menambah kategori pegawai');
      showError('Gagal menyimpan', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Tambah Kategori Pegawai" />
      <ComponentCard title="Form Kategori Pegawai">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>
              Nama (Indonesia) <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Hukum Tata Negara"
              required
              disabled={saving}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating || saving || !nama.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translating ? 'Menerjemahkan...' : 'Auto Translate'}
            </button>
          </div>

          <div>
            <Label>Urutan tampil</Label>
            <Input
              type="number"
              min="1"
              step={1}
              value={urut}
              onChange={(e) => setUrut(e.target.value)}
              placeholder="1"
              disabled={saving}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Angka lebih kecil tampil lebih dulu di filter Tim Kami.
            </p>
          </div>

          <div>
            <Label>Nama (English)</Label>
            <Input
              type="text"
              value={namaEn}
              onChange={(e) => setNamaEn(e.target.value)}
              placeholder="Nama dalam bahasa Inggris"
              disabled={saving}
            />
          </div>

          <div>
            <Label>Nama (Arabic)</Label>
            <Input
              type="text"
              value={namaAr}
              onChange={(e) => setNamaAr(e.target.value)}
              placeholder="Nama dalam bahasa Arab"
              dir="rtl"
              disabled={saving}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <Link
              href="/admin/kategori-pegawai"
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Batal
            </Link>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
