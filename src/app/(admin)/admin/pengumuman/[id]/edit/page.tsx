"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import RichTextEditor from '@/components/form/input/RichTextEditor';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';
import { useLanguage } from '@/context/LanguageContext';

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
}

export default function EditPengumumanPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const { language, t } = useLanguage();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [slugError, setSlugError] = useState<string>('');
  const [slugWarning, setSlugWarning] = useState<string>('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState<Pengumuman>({
    judul: '',
    judul_en: '',
    judul_ar: '',
    slug: '',
    konten: '',
    konten_en: '',
    konten_ar: '',
    user_id: user?.id || '',
    file: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
    if (user && params.id) {
      fetchPengumuman();
    }
  }, [user, authLoading, params.id, router]);

  const fetchPengumuman = async () => {
    try {
      const { data, error } = await supabase
        .from('pengumumans')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
        setFileUrl(data.file || '');
      }
    } catch (error: any) {
      console.error('Error fetching pengumuman:', error);
      toast.showError('Error', 'Gagal memuat data pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const validateSlug = (slug: string) => {
    setSlugError('');
    setSlugWarning('');

    if (!slug || slug.trim() === '') {
      setSlugError('Slug tidak boleh kosong');
      return false;
    }

    // Check for spaces
    if (slug.includes(' ')) {
      setSlugWarning('Slug tidak boleh mengandung spasi. Gunakan dash (-) atau underscore (_) sebagai pengganti.');
      return false;
    }

    // Check for valid slug format (lowercase letters, numbers, dash, underscore only)
    const slugRegex = /^[a-z0-9-_]+$/;
    if (!slugRegex.test(slug)) {
      const invalidChars = slug.match(/[^a-z0-9-_]/g);
      if (invalidChars) {
        setSlugError(`Slug mengandung karakter tidak valid: ${invalidChars.join(', ')}. Slug hanya boleh mengandung huruf kecil, angka, dash (-), dan underscore (_).`);
      } else {
        setSlugError('Format slug tidak valid. Slug hanya boleh mengandung huruf kecil, angka, dash (-), dan underscore (_).');
      }
      return false;
    }

    // Check if slug starts or ends with dash/underscore
    if (slug.startsWith('-') || slug.startsWith('_') || slug.endsWith('-') || slug.endsWith('_')) {
      setSlugWarning('Slug sebaiknya tidak dimulai atau diakhiri dengan dash (-) atau underscore (_).');
    }

    return true;
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true); // Mark slug as manually edited
    handleInputChange('slug', value);
    validateSlug(value);
  };

  const translateText = async (text: string, targetLang: 'en' | 'ar'): Promise<string> => {
    if (!text || !text.trim()) return '';
    
    let textOnly = text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    if (!textOnly) return '';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textOnly, targetLang }),
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
    if (!formData.judul && !formData.konten) {
      toast.showWarning('Form Kosong', 'Silakan isi judul dan konten terlebih dahulu');
      return;
    }

    setTranslating(true);
    try {
      const [judulEn, kontenEn] = await Promise.all([
        formData.judul ? translateText(formData.judul, 'en') : '',
        formData.konten ? translateText(formData.konten, 'en') : '',
      ]);

      const [judulAr, kontenAr] = await Promise.all([
        formData.judul ? translateText(formData.judul, 'ar') : '',
        formData.konten ? translateText(formData.konten, 'ar') : '',
      ]);

      setFormData((prev) => ({
        ...prev,
        judul_en: judulEn || prev.judul_en,
        konten_en: kontenEn || prev.konten_en,
        judul_ar: judulAr || prev.judul_ar,
        konten_ar: kontenAr || prev.konten_ar,
      }));

      toast.showSuccess('Terjemahan Berhasil', 'Terjemahan berhasil!');
    } catch (error: any) {
      console.error('Auto-translate error:', error);
      toast.showError('Error Terjemahan', error.message || 'Error saat menerjemahkan.');
    } finally {
      setTranslating(false);
    }
  };

  const handleInputChange = (field: keyof Pengumuman, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Only auto-generate slug from judul if slug hasn't been manually edited
      if (field === 'judul' && !slugManuallyEdited) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadedFile(file);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `pengumumans/${fileName}`;

      // Try to upload to 'files' bucket first, fallback to 'images' if 'files' doesn't exist
      let bucketName = 'files';
      let uploadError = null;
      let uploadData = null;

      // Try uploading to 'files' bucket
      const { data: data1, error: error1 } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error1) {
        // If 'files' bucket doesn't exist or has error, try 'images' bucket
        console.warn('Error uploading to files bucket, trying images bucket:', error1);
        bucketName = 'images';
        const { data: data2, error: error2 } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
        uploadData = data2;
        uploadError = error2;
      } else {
        uploadData = data1;
      }

      if (uploadError) {
        // Check if bucket not found error
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          const errorTitles: Record<string, string> = {
            id: 'Bucket Tidak Ditemukan',
            en: 'Bucket Not Found',
            ar: 'الحاوية غير موجودة'
          };
          const errorDetails: Record<string, string> = {
            id: 'Bucket "files" dan "images" tidak ditemukan di Supabase Storage.\n\nSilakan buat bucket di Supabase Dashboard:\n1. Buka Supabase Dashboard\n2. Pilih Storage\n3. Klik "New bucket"\n4. Nama: "files" atau "images"\n5. Pilih "Public bucket"\n6. Klik "Create bucket"',
            en: 'Buckets "files" and "images" not found in Supabase Storage.\n\nPlease create a bucket in Supabase Dashboard:\n1. Open Supabase Dashboard\n2. Select Storage\n3. Click "New bucket"\n4. Name: "files" or "images"\n5. Select "Public bucket"\n6. Click "Create bucket"',
            ar: 'لم يتم العثور على الحاويات "files" و "images" في Supabase Storage.\n\nيرجى إنشاء حاوية في لوحة تحكم Supabase:\n1. افتح لوحة تحكم Supabase\n2. اختر Storage\n3. انقر على "New bucket"\n4. الاسم: "files" أو "images"\n5. اختر "Public bucket"\n6. انقر على "Create bucket"'
          };
          toast.showError(errorTitles[language] || errorTitles.id, errorDetails[language] || errorDetails.id, 10000);
          setUploadedFile(null);
          setUploading(false);
          return;
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setFileUrl(publicUrl);
      setFormData(prev => ({ ...prev, file: publicUrl }));
      const successTitles: Record<string, string> = {
        id: 'Upload Berhasil',
        en: 'Upload Successful',
        ar: 'تم الرفع بنجاح'
      };
      const successDetails: Record<string, string> = {
        id: 'File berhasil diupload!',
        en: 'File uploaded successfully!',
        ar: 'تم رفع الملف بنجاح!'
      };
      toast.showSuccess(successTitles[language] || successTitles.id, successDetails[language] || successDetails.id);
    } catch (error: any) {
      console.error('File upload error:', error);
      const errorTitles: Record<string, string> = {
        id: 'Upload Gagal',
        en: 'Upload Failed',
        ar: 'فشل الرفع'
      };
      if (error.message?.includes('mime type')) {
        const errorDetails: Record<string, string> = {
          id: 'Jenis file tidak didukung. Pastikan bucket storage mengizinkan file PDF dan jenis file lainnya.',
          en: 'File type not supported. Make sure the storage bucket allows PDF files and other file types.',
          ar: 'نوع الملف غير مدعوم. تأكد من أن حاوية التخزين تسمح بملفات PDF وأنواع الملفات الأخرى.'
        };
        toast.showError(errorTitles[language] || errorTitles.id, errorDetails[language] || errorDetails.id);
      } else if (error.message?.includes('Bucket not found')) {
        const errorDetails: Record<string, string> = {
          id: 'Bucket tidak ditemukan. Silakan buat bucket "files" atau "images" di Supabase Dashboard.',
          en: 'Bucket not found. Please create "files" or "images" bucket in Supabase Dashboard.',
          ar: 'لم يتم العثور على الحاوية. يرجى إنشاء حاوية "files" أو "images" في لوحة تحكم Supabase.'
        };
        toast.showError(errorTitles[language] || errorTitles.id, errorDetails[language] || errorDetails.id, 10000);
      } else {
        const errorDetails: Record<string, string> = {
          id: error.message || 'Gagal mengupload file',
          en: error.message || 'Failed to upload file',
          ar: error.message || 'فشل رفع الملف'
        };
        toast.showError(errorTitles[language] || errorTitles.id, errorDetails[language] || errorDetails.id);
      }
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.judul || !formData.konten) {
      toast.showError('Form Tidak Lengkap', 'Judul dan konten wajib diisi');
      return;
    }

    // Validate slug before submit
    if (!validateSlug(formData.slug)) {
      const errorTitles: Record<string, string> = {
        id: 'Slug Tidak Valid',
        en: 'Invalid Slug',
        ar: 'الرابط غير صالح'
      };
      const errorDetails: Record<string, string> = {
        id: slugError || slugWarning || 'Slug tidak valid. Perbaiki format slug sebelum menyimpan.',
        en: slugError || slugWarning || 'Invalid slug. Please fix the slug format before saving.',
        ar: slugError || slugWarning || 'الرابط غير صالح. يرجى إصلاح تنسيق الرابط قبل الحفظ.'
      };
      toast.showError(errorTitles[language] || errorTitles.id, errorDetails[language] || errorDetails.id);
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('pengumumans')
        .update(formData)
        .eq('id', params.id);

      if (error) throw error;

      toast.showSuccess('Berhasil', 'Pengumuman berhasil diperbarui!');
      router.push('/admin/pengumuman');
    } catch (error: any) {
      console.error('Error updating pengumuman:', error);
      toast.showError('Error', error.message || 'Gagal memperbarui pengumuman');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Pengumuman" />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Pengumuman" />
      <ComponentCard title="Edit Pengumuman">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul */}
          <div>
            <Label>Judul (Indonesia) *</Label>
            <Input
              type="text"
              value={formData.judul}
              onChange={(e) => handleInputChange('judul', e.target.value)}
              placeholder="Masukkan judul pengumuman"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <Label>
              Slug
              <span className="text-error-500 ml-1">*</span>
            </Label>
            <Input
              type="text"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="contoh-slug-pengumuman"
              className={`w-full ${slugError ? 'border-red-500' : slugWarning ? 'border-yellow-500' : ''}`}
            />
            {slugError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{slugError}</p>
            )}
            {slugWarning && !slugError && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{slugWarning}</p>
            )}
            {!slugError && !slugWarning && (
              <p className="text-xs text-gray-500 mt-1">Slug hanya boleh mengandung huruf kecil, angka, dash (-), dan underscore (_). Tidak boleh ada spasi.</p>
            )}
          </div>

          {/* Created At */}
          <div>
            <Label>Tanggal Dibuat (Created At)</Label>
            <Input
              type="datetime-local"
              value={formData.created_at ? new Date(formData.created_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const dateValue = e.target.value;
                if (dateValue) {
                  const date = new Date(dateValue);
                  setFormData(prev => ({ ...prev, created_at: date.toISOString() }));
                } else {
                  setFormData(prev => ({ ...prev, created_at: undefined }));
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">Kosongkan untuk menggunakan tanggal saat ini</p>
          </div>

          {/* Konten */}
          <div>
            <Label>Konten (Indonesia) *</Label>
            <RichTextEditor
              value={formData.konten}
              onChange={(value) => handleInputChange('konten', value)}
              placeholder="Masukkan konten pengumuman"
            />
          </div>

          {/* File Upload */}
          <div>
            <Label>File (Optional)</Label>
            {fileUrl && (
              <div className="mb-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <i className="fas fa-file mr-2"></i>
                  File Saat Ini
                </a>
              </div>
            )}
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              disabled={uploading}
            />
            {uploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
          </div>

          {/* Auto Translate Button */}
          <div>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating || !formData.judul || !formData.konten}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translating ? 'Menerjemahkan...' : 'Auto Translate'}
            </button>
          </div>

          {/* Judul EN */}
          <div>
            <Label>Judul (English)</Label>
            <Input
              type="text"
              value={formData.judul_en || ''}
              onChange={(e) => handleInputChange('judul_en', e.target.value)}
              placeholder="Judul dalam bahasa Inggris"
            />
          </div>

          {/* Konten EN */}
          <div>
            <Label>Konten (English)</Label>
            <RichTextEditor
              value={formData.konten_en || ''}
              onChange={(value) => handleInputChange('konten_en', value)}
              placeholder="Konten dalam bahasa Inggris"
              dir="ltr"
            />
          </div>

          {/* Judul AR */}
          <div>
            <Label>Judul (Arabic)</Label>
            <Input
              type="text"
              value={formData.judul_ar || ''}
              onChange={(e) => handleInputChange('judul_ar', e.target.value)}
              placeholder="Judul dalam bahasa Arab"
            />
          </div>

          {/* Konten AR */}
          <div>
            <Label>Konten (Arabic)</Label>
            <RichTextEditor
              value={formData.konten_ar || ''}
              onChange={(value) => handleInputChange('konten_ar', value)}
              placeholder="Konten dalam bahasa Arab"
              dir="rtl"
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
              href="/admin/pengumuman"
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

