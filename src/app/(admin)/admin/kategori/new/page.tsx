"use client";

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';

interface Kategori {
  id?: number;
  kategori: string;
  kategori_en?: string;
  kategori_ar?: string;
}

export default function NewKategoriPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const [formData, setFormData] = useState<Kategori>({
    kategori: '',
    kategori_en: '',
    kategori_ar: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  const translateText = async (text: string, targetLang: 'en' | 'ar'): Promise<string> => {
    if (!text || !text.trim()) return '';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.translatedText || '';
    } catch (error: any) {
      console.error(`Translation error to ${targetLang}:`, error);
      throw error;
    }
  };

  const handleAutoTranslate = async () => {
    if (!formData.kategori) {
      toast.showWarning('Form Kosong', 'Silakan isi kategori terlebih dahulu');
      return;
    }

    setTranslating(true);
    try {
      const [kategoriEn, kategoriAr] = await Promise.all([
        translateText(formData.kategori, 'en'),
        translateText(formData.kategori, 'ar'),
      ]);

      setFormData((prev) => ({
        ...prev,
        kategori_en: kategoriEn || prev.kategori_en,
        kategori_ar: kategoriAr || prev.kategori_ar,
      }));

      toast.showSuccess('Terjemahan Berhasil', 'Terjemahan berhasil!');
    } catch (error: any) {
      console.error('Auto-translate error:', error);
      toast.showError('Error Terjemahan', error.message || 'Error saat menerjemahkan.');
    } finally {
      setTranslating(false);
    }
  };

  const handleInputChange = (field: keyof Kategori, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kategori) {
      toast.showError('Form Tidak Lengkap', 'Kategori wajib diisi');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('kategoris')
        .insert([formData]);

      if (error) throw error;

      toast.showSuccess('Berhasil', 'Kategori berhasil dibuat!');
      router.push('/admin/kategori');
    } catch (error: any) {
      console.error('Error creating kategori:', error);
      toast.showError('Error', error.message || 'Gagal membuat kategori');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="New Kategori" />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="New Kategori" />
      <ComponentCard title="Create New Kategori">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kategori ID */}
          <div>
            <Label>Kategori (Indonesia) *</Label>
            <Input
              type="text"
              value={formData.kategori}
              onChange={(e) => handleInputChange('kategori', e.target.value)}
              placeholder="Masukkan nama kategori"
              required
            />
          </div>

          {/* Auto Translate Button */}
          <div>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating || !formData.kategori}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translating ? 'Menerjemahkan...' : 'Auto Translate'}
            </button>
          </div>

          {/* Kategori EN */}
          <div>
            <Label>Kategori (English)</Label>
            <Input
              type="text"
              value={formData.kategori_en || ''}
              onChange={(e) => handleInputChange('kategori_en', e.target.value)}
              placeholder="Kategori dalam bahasa Inggris"
            />
          </div>

          {/* Kategori AR */}
          <div>
            <Label>Kategori (Arabic)</Label>
            <Input
              type="text"
              value={formData.kategori_ar || ''}
              onChange={(e) => handleInputChange('kategori_ar', e.target.value)}
              placeholder="Kategori dalam bahasa Arab"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <Link
              href="/admin/kategori"
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Batal
            </Link>
          </div>
        </form>
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

