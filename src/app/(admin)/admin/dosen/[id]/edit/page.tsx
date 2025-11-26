"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';
import { useDropzone } from 'react-dropzone';

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

export default function EditDosenPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Dosen>({
    urut: undefined,
    prodi: 'semua',
    nama: '',
    jabatan: '',
    jabatan_en: '',
    jabatan_ar: '',
    pendidikan: '',
    keahlian: '',
    keahlian_en: '',
    keahlian_ar: '',
    gambar: '',
  });

  const prodiOptions = [
    { value: 'semua', label: 'Semua' },
    { value: 'htn', label: 'HTN' },
    { value: 'hes', label: 'HES' },
    { value: 'hki', label: 'HKI' },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
    if (user && params.id) {
      fetchDosen();
    }
  }, [user, authLoading, params.id, router]);

  const fetchDosen = async () => {
    try {
      const { data, error } = await supabase
        .from('dosens')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
        if (data.gambar) {
          setPreviewImage(data.gambar);
        }
      }
    } catch (error: any) {
      console.error('Error fetching dosen:', error);
      toast.showError('Error', 'Gagal memuat data dosen');
    } finally {
      setLoading(false);
    }
  };

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
    if (!formData.jabatan && !formData.keahlian) {
      toast.showWarning('Form Kosong', 'Silakan isi jabatan atau keahlian terlebih dahulu');
      return;
    }

    setTranslating(true);
    try {
      const promises: Promise<any>[] = [];
      
      if (formData.jabatan) {
        promises.push(
          translateText(formData.jabatan, 'en').then(en => ({ field: 'jabatan_en', value: en })),
          translateText(formData.jabatan, 'ar').then(ar => ({ field: 'jabatan_ar', value: ar }))
        );
      }
      
      if (formData.keahlian) {
        promises.push(
          translateText(formData.keahlian, 'en').then(en => ({ field: 'keahlian_en', value: en })),
          translateText(formData.keahlian, 'ar').then(ar => ({ field: 'keahlian_ar', value: ar }))
        );
      }

      const results = await Promise.all(promises);
      
      const updates: any = {};
      results.forEach(result => {
        updates[result.field] = result.value;
      });

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      toast.showSuccess('Terjemahan Berhasil', 'Terjemahan berhasil!');
    } catch (error: any) {
      console.error('Auto-translate error:', error);
      toast.showError('Error Terjemahan', error.message || 'Error saat menerjemahkan.');
    } finally {
      setTranslating(false);
    }
  };

  const handleInputChange = (field: keyof Dosen, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `dosens/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, gambar: publicUrl }));
      toast.showSuccess('Upload Berhasil', 'Gambar berhasil diupload!');
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.showError('Upload Gagal', error.message || 'Gagal mengupload gambar');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': [],
      'image/jpeg': [],
      'image/webp': [],
      'image/jpg': [],
    },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama || !formData.jabatan || !formData.pendidikan || !formData.keahlian) {
      toast.showError('Form Tidak Lengkap', 'Nama, jabatan, pendidikan, dan keahlian wajib diisi');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('dosens')
        .update(formData)
        .eq('id', params.id);

      if (error) throw error;

      toast.showSuccess('Berhasil', 'Dosen berhasil diperbarui!');
      router.push('/admin/dosen');
    } catch (error: any) {
      console.error('Error updating dosen:', error);
      toast.showError('Error', error.message || 'Gagal memperbarui dosen');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Dosen" />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Dosen" />
      <ComponentCard title="Edit Dosen">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Urut */}
          <div>
            <Label>Urut</Label>
            <Input
              type="number"
              value={formData.urut || ''}
              onChange={(e) => handleInputChange('urut', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Urutan tampil"
            />
          </div>

          {/* Prodi */}
          <div>
            <Label>Prodi *</Label>
            <Select
              options={prodiOptions}
              value={formData.prodi}
              onChange={(value) => handleInputChange('prodi', value)}
            />
          </div>

          {/* Nama */}
          <div>
            <Label>Nama *</Label>
            <Input
              type="text"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              placeholder="Masukkan nama dosen"
              required
            />
          </div>

          {/* Jabatan */}
          <div>
            <Label>Jabatan *</Label>
            <Input
              type="text"
              value={formData.jabatan}
              onChange={(e) => handleInputChange('jabatan', e.target.value)}
              placeholder="Masukkan jabatan"
              required
            />
          </div>

          {/* Pendidikan */}
          <div>
            <Label>Pendidikan *</Label>
            <Input
              type="text"
              value={formData.pendidikan}
              onChange={(e) => handleInputChange('pendidikan', e.target.value)}
              placeholder="Masukkan pendidikan"
              required
            />
          </div>

          {/* Keahlian */}
          <div>
            <Label>Keahlian *</Label>
            <Input
              type="text"
              value={formData.keahlian}
              onChange={(e) => handleInputChange('keahlian', e.target.value)}
              placeholder="Masukkan keahlian"
              required
            />
          </div>

          {/* Gambar Upload */}
          <div>
            <Label>Gambar</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-300 hover:border-brand-400'
              }`}
            >
              <input {...getInputProps()} />
              {previewImage ? (
                <div className="space-y-4">
                  <img src={previewImage} alt="Preview" className="max-w-xs mx-auto rounded-lg" />
                  <p className="text-sm text-gray-600">Klik atau drag untuk mengganti gambar</p>
                </div>
              ) : (
                <div>
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-600">
                    Klik atau drag gambar ke sini untuk upload
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (max 5MB)</p>
                </div>
              )}
            </div>
            {uploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
          </div>

          {/* Auto Translate Button */}
          <div>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating || (!formData.jabatan && !formData.keahlian)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translating ? 'Menerjemahkan...' : 'Auto Translate Jabatan & Keahlian'}
            </button>
          </div>

          {/* Jabatan EN */}
          <div>
            <Label>Jabatan (English)</Label>
            <Input
              type="text"
              value={formData.jabatan_en || ''}
              onChange={(e) => handleInputChange('jabatan_en', e.target.value)}
              placeholder="Jabatan dalam bahasa Inggris"
            />
          </div>

          {/* Jabatan AR */}
          <div>
            <Label>Jabatan (Arabic)</Label>
            <Input
              type="text"
              value={formData.jabatan_ar || ''}
              onChange={(e) => handleInputChange('jabatan_ar', e.target.value)}
              placeholder="Jabatan dalam bahasa Arab"
            />
          </div>

          {/* Keahlian EN */}
          <div>
            <Label>Keahlian (English)</Label>
            <Input
              type="text"
              value={formData.keahlian_en || ''}
              onChange={(e) => handleInputChange('keahlian_en', e.target.value)}
              placeholder="Keahlian dalam bahasa Inggris"
            />
          </div>

          {/* Keahlian AR */}
          <div>
            <Label>Keahlian (Arabic)</Label>
            <Input
              type="text"
              value={formData.keahlian_ar || ''}
              onChange={(e) => handleInputChange('keahlian_ar', e.target.value)}
              placeholder="Keahlian dalam bahasa Arab"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <Link
              href="/admin/dosen"
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

