"use client";

import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import RichTextEditor from '@/components/form/input/RichTextEditor';
import Select from '@/components/form/Select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useDropzone } from 'react-dropzone';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog';

interface Berita {
  id?: string;
  judul: string;
  slug: string;
  konten: string;
  gambar: string;
  user_id: string;
  kategori_id?: number;
  kategori?: string; // For backward compatibility
  judul_en: string;
  konten_en: string;
  kategori_en: string;
  judul_ar: string;
  konten_ar: string;
  kategori_ar: string;
  created_at?: string;
  updated_at?: string;
}

export default function EditBeritaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const { confirm, isOpen, options, isLoading, handleConfirm, handleCancel } = useConfirm();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Berita>({
    judul: '',
    slug: '',
    konten: '',
    gambar: '',
    user_id: user?.id || '',
    kategori_id: undefined,
    kategori: '',
    judul_en: '',
    konten_en: '',
    kategori_en: '',
    judul_ar: '',
    konten_ar: '',
    kategori_ar: '',
  });

  const [kategoriOptions, setKategoriOptions] = useState<{ value: string; label: string }[]>([]);
  const [kategorisData, setKategorisData] = useState<any[]>([]);

  // Fetch kategoris from Supabase
  useEffect(() => {
    async function fetchKategoris() {
      try {
        const { data, error } = await supabase
          .from('kategoris')
          .select('*')
          .order('kategori', { ascending: true });

        if (error) {
          console.error('Error fetching kategoris:', error);
          toast.showError('Error', 'Gagal memuat kategori. Menggunakan kategori default.');
          // Fallback to default categories
          setKategoriOptions([
            { value: 'Umum', label: 'Umum' },
            { value: 'Pendidikan', label: 'Pendidikan' },
            { value: 'Agama', label: 'Agama' },
            { value: 'Hukum', label: 'Hukum' },
            { value: 'Ekonomi', label: 'Ekonomi' },
          ]);
          return;
        }

        if (data && data.length > 0) {
          setKategorisData(data);
          const options = data.map((kat: any) => ({
            value: kat.id.toString(), // Use ID as value for foreign key
            label: kat.kategori || 'Kategori',
          }));
          setKategoriOptions(options);
        } else {
          // Fallback if no kategoris found
          setKategoriOptions([
            { value: 'Umum', label: 'Umum' },
            { value: 'Pendidikan', label: 'Pendidikan' },
            { value: 'Agama', label: 'Agama' },
            { value: 'Hukum', label: 'Hukum' },
            { value: 'Ekonomi', label: 'Ekonomi' },
          ]);
        }
      } catch (error: any) {
        console.error('Error fetching kategoris:', error);
        toast.showError('Error', 'Gagal memuat kategori. Menggunakan kategori default.');
        setKategoriOptions([
          { value: 'Umum', label: 'Umum' },
          { value: 'Pendidikan', label: 'Pendidikan' },
          { value: 'Agama', label: 'Agama' },
          { value: 'Hukum', label: 'Hukum' },
          { value: 'Ekonomi', label: 'Ekonomi' },
        ]);
      }
    }

    fetchKategoris();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (id && user) {
      fetchBerita();
    }
  }, [id, user]);

  const fetchBerita = async () => {
    try {
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
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        // If kategori_id exists, use it; otherwise use kategori (backward compatibility)
        const beritaData: any = { ...data };
        if (data.kategoris && Array.isArray(data.kategoris) && data.kategoris.length > 0) {
          const kategoriData = data.kategoris[0];
          beritaData.kategori_id = kategoriData.id;
          beritaData.kategori = kategoriData.kategori || data.kategori || '';
          beritaData.kategori_en = kategoriData.kategori_en || data.kategori_en || '';
          beritaData.kategori_ar = kategoriData.kategori_ar || data.kategori_ar || '';
        } else if (data.kategori_id) {
          // Find kategori from kategorisData
          const kategoriData = kategorisData.find((kat: any) => kat.id === data.kategori_id);
          if (kategoriData) {
            beritaData.kategori = kategoriData.kategori || data.kategori || '';
            beritaData.kategori_en = kategoriData.kategori_en || data.kategori_en || '';
            beritaData.kategori_ar = kategoriData.kategori_ar || data.kategori_ar || '';
          }
        }
        setFormData(beritaData);
        setPreviewImage(data.gambar || '');
      }
    } catch (error: any) {
      console.error('Error fetching berita:', error);
      toast.showError('Error Memuat Berita', error.message);
      setTimeout(() => router.push('/admin/beritas'), 2000);
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

  const translateText = async (text: string, targetLang: 'en' | 'ar'): Promise<string> => {
    if (!text || !text.trim()) return '';
    
    // Strip HTML tags for translation (RichTextEditor uses HTML)
    // Remove HTML tags, decode HTML entities, and clean up whitespace
    let textOnly = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Decode &amp;
      .replace(/&lt;/g, '<') // Decode &lt;
      .replace(/&gt;/g, '>') // Decode &gt;
      .replace(/&quot;/g, '"') // Decode &quot;
      .replace(/&#39;/g, "'") // Decode &#39;
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    if (!textOnly) return text; // If no text after stripping HTML, return original
    
    try {
      console.log(`Translating "${textOnly.substring(0, 50)}..." to ${targetLang}`);
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textOnly, targetLang }),
      });

      if (!response.ok) {
        console.error('Translation API error:', response.status, response.statusText);
        throw new Error(`Translation API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Check for error response
      if (data.error || !data.translatedText) {
        // Use the user-friendly error message from API
        const errorMsg = data.error || data.note || 'Layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual.';
        throw new Error(errorMsg);
      }
      
      const translated = data.translatedText;
      
      // Check if translation actually happened (not just returned original)
      if (translated === textOnly || translated.trim() === '') {
        console.warn(`Translation returned same text or empty for ${targetLang}`);
        throw new Error('Translation service returned unchanged text');
      }
      
      console.log(`Translation result (${targetLang}):`, translated.substring(0, 50) + '...');
      
      return translated;
    } catch (error: any) {
      console.error('Translation error:', error);
      throw new Error(`Failed to translate to ${targetLang}: ${error.message}`);
    }
  };

  const handleAutoTranslate = async () => {
    if (!formData.judul && !formData.konten && !formData.kategori) {
      toast.showWarning('Form Kosong', 'Silakan isi judul dan konten terlebih dahulu');
      return;
    }

    setTranslating(true);
    try {
      console.log('Starting auto-translate...');
      
      // Get kategori translations from kategoris table first
      let kategoriEn = '';
      let kategoriAr = '';
      if (formData.kategori_id || formData.kategori) {
        const kategoriId = formData.kategori_id || (formData.kategori ? parseInt(formData.kategori) : null);
        const selectedKategori = kategorisData.find(
          (kat: any) => kat.id === kategoriId || kat.id.toString() === formData.kategori || kat.kategori === formData.kategori
        );
        if (selectedKategori) {
          kategoriEn = selectedKategori.kategori_en || selectedKategori.kategori || '';
          kategoriAr = selectedKategori.kategori_ar || selectedKategori.kategori || '';
        }
      }

      const [judulEn, kontenEn] = await Promise.all([
        formData.judul ? translateText(formData.judul, 'en') : '',
        formData.konten ? translateText(formData.konten, 'en') : '',
      ]);

      console.log('English translations:', { judulEn, kontenEn, kategoriEn });

      const [judulAr, kontenAr] = await Promise.all([
        formData.judul ? translateText(formData.judul, 'ar') : '',
        formData.konten ? translateText(formData.konten, 'ar') : '',
      ]);

      console.log('Arabic translations:', { judulAr, kontenAr, kategoriAr });

      setFormData((prev) => ({
        ...prev,
        judul_en: judulEn || prev.judul_en,
        konten_en: kontenEn || prev.konten_en,
        kategori_en: kategoriEn || prev.kategori_en,
        judul_ar: judulAr || prev.judul_ar,
        konten_ar: kontenAr || prev.konten_ar,
        kategori_ar: kategoriAr || prev.kategori_ar,
      }));

      toast.showSuccess('Terjemahan Berhasil', 'Terjemahan berhasil! Silakan cek section terjemahan di bawah.');
    } catch (error: any) {
      console.error('Auto-translate error:', error);
      toast.showError('Error Terjemahan', error.message || 'Error saat menerjemahkan. Silakan isi manual atau coba lagi.');
    } finally {
      setTranslating(false);
    }
  };

  const handleInputChange = (field: keyof Berita, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'judul') {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      console.log('Starting image upload...', file.name, file.size);

      // Create preview first
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `beritas/${fileName}`;

      console.log('Uploading to path:', filePath);

      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        throw new Error('Cannot access storage. Please check your Supabase configuration.');
      }

      console.log('Available buckets:', buckets?.map(b => b.name));

      const bucketExists = buckets?.some(bucket => bucket.name === 'images');
      
      if (!bucketExists) {
        const errorMsg = 'Bucket "images" tidak ditemukan di Supabase Storage.\n\nSilakan buat bucket "images" di Supabase Dashboard:\n1. Buka Supabase Dashboard\n2. Pilih Storage\n3. Klik "New bucket"\n4. Nama: "images"\n5. Pilih "Public bucket"\n6. Klik "Create bucket"';
        toast.showError('Bucket Tidak Ditemukan', errorMsg, 10000);
        setUploading(false);
        return;
      }

      // Upload file
      console.log('Uploading file to bucket...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        if (uploadError.message.includes('already exists')) {
          // Retry with new filename
          const newFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const newFilePath = `beritas/${newFileName}`;
          console.log('Retrying with new path:', newFilePath);
          
          const { data: retryData, error: retryError } = await supabase.storage
            .from('images')
            .upload(newFilePath, file);
          
          if (retryError) {
            console.error('Retry upload error:', retryError);
            throw retryError;
          }
          
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(newFilePath);
          
          console.log('Upload successful, URL:', urlData.publicUrl);
          handleInputChange('gambar', urlData.publicUrl);
        } else if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('new row violates row-level security')) {
          toast.showError('Error Upload', uploadError.message + '\n\nPastikan:\n1. Bucket "images" sudah dibuat\n2. Storage policy sudah di-set untuk authenticated users\n3. Cek SUPABASE_STORAGE_SETUP.md untuk panduan', 10000);
          throw uploadError;
        } else {
          throw uploadError;
        }
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        console.log('Upload successful, URL:', urlData.publicUrl);
        handleInputChange('gambar', urlData.publicUrl);
        toast.showSuccess('Upload Berhasil', 'Gambar berhasil diupload!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('Bucket not found')) {
        toast.showError('Bucket Tidak Ditemukan', 'Bucket "images" tidak ditemukan di Supabase Storage.\n\nCara membuat bucket:\n1. Buka Supabase Dashboard\n2. Pilih menu "Storage"\n3. Klik "New bucket"\n4. Nama bucket: "images"\n5. Pilih "Public bucket" (agar bisa diakses public)\n6. Klik "Create bucket"\n\nSetelah bucket dibuat, coba upload gambar lagi.', 10000);
      } else if (errorMessage.includes('row-level security')) {
        toast.showError('Storage Policy Belum Dikonfigurasi', 'Storage policy belum dikonfigurasi.\n\nSilakan set policy di Supabase Storage:\n1. Buka Storage > Policies\n2. Buat policy untuk INSERT dengan role: authenticated\n3. Lihat SUPABASE_STORAGE_SETUP.md untuk detail', 10000);
      } else {
        toast.showError('Error Upload Gambar', errorMessage + '\n\nCek console untuk detail error.', 8000);
      }
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.showError('Login Diperlukan', 'Silakan login terlebih dahulu');
      return;
    }

    setSaving(true);
    setTranslating(true);
    
    try {
      // Auto-translate SELALU saat submit jika ada judul dan konten
      let updatedFormData = { ...formData };
      const translationErrors: string[] = [];

      // Translate judul SELALU jika ada
      if (formData.judul && formData.judul.trim()) {
        console.log('Translating judul to EN and AR...');
        
        try {
          const [judulEn, judulAr] = await Promise.all([
            translateText(formData.judul, 'en'),
            translateText(formData.judul, 'ar'),
          ]);
          
          updatedFormData.judul_en = judulEn;
          updatedFormData.judul_ar = judulAr;
          console.log('Judul translated:', { en: updatedFormData.judul_en, ar: updatedFormData.judul_ar });
        } catch (error: any) {
          console.error('Error translating judul:', error);
          translationErrors.push(`Judul: ${error.message}`);
          if (!updatedFormData.judul_en) updatedFormData.judul_en = formData.judul;
          if (!updatedFormData.judul_ar) updatedFormData.judul_ar = formData.judul;
        }
      }

      // Translate konten SELALU jika ada
      if (formData.konten && formData.konten.trim()) {
        console.log('Translating konten to EN and AR...');
        
        try {
          const [kontenEn, kontenAr] = await Promise.all([
            translateText(formData.konten, 'en'),
            translateText(formData.konten, 'ar'),
          ]);
          
          updatedFormData.konten_en = kontenEn;
          updatedFormData.konten_ar = kontenAr;
          console.log('Konten translated:', { en: updatedFormData.konten_en.substring(0, 50), ar: updatedFormData.konten_ar.substring(0, 50) });
        } catch (error: any) {
          console.error('Error translating konten:', error);
          translationErrors.push(`Konten: ${error.message}`);
          if (!updatedFormData.konten_en) updatedFormData.konten_en = formData.konten;
          if (!updatedFormData.konten_ar) updatedFormData.konten_ar = formData.konten;
        }
      }

      // Get kategori translations from kategoris table
      if (formData.kategori_id || formData.kategori) {
        const kategoriId = formData.kategori_id || (formData.kategori ? parseInt(formData.kategori) : null);
        const selectedKategori = kategorisData.find(
          (kat: any) => kat.id === kategoriId || kat.id.toString() === formData.kategori || kat.kategori === formData.kategori
        );
        
        if (selectedKategori) {
          updatedFormData.kategori_id = selectedKategori.id;
          updatedFormData.kategori = selectedKategori.kategori || '';
          updatedFormData.kategori_en = selectedKategori.kategori_en || selectedKategori.kategori || '';
          updatedFormData.kategori_ar = selectedKategori.kategori_ar || selectedKategori.kategori || '';
          console.log('Kategori from kategoris table:', { 
            id: selectedKategori.id,
            kategori_id: updatedFormData.kategori_id,
            kategori: updatedFormData.kategori,
            en: updatedFormData.kategori_en, 
            ar: updatedFormData.kategori_ar 
          });
        } else {
          // If not found in kategoris, use translate as fallback
          console.log('Kategori not found in kategoris table, translating...');
          try {
            const [kategoriEn, kategoriAr] = await Promise.all([
              translateText(formData.kategori, 'en'),
              translateText(formData.kategori, 'ar'),
            ]);
            
            updatedFormData.kategori_en = kategoriEn;
            updatedFormData.kategori_ar = kategoriAr;
            console.log('Kategori translated:', { en: updatedFormData.kategori_en, ar: updatedFormData.kategori_ar });
          } catch (error: any) {
            console.error('Error translating kategori:', error);
            translationErrors.push(`Kategori: ${error.message}`);
            updatedFormData.kategori_en = formData.kategori;
            updatedFormData.kategori_ar = formData.kategori;
          }
        }
      }

      // Update formData state
      setFormData(updatedFormData);
      setTranslating(false);

      // Show warning if some translations failed
      if (translationErrors.length > 0) {
        console.warn('Some translations failed:', translationErrors);
        const shouldContinue = await confirm({
          title: 'Terjemahan Gagal',
          message: `Beberapa terjemahan gagal:\n${translationErrors.join('\n')}\n\nApakah Anda ingin melanjutkan menyimpan? Anda bisa mengisi terjemahan secara manual.`,
          confirmText: 'Ya, Lanjutkan',
          cancelText: 'Batal',
          type: 'warning',
        });
        if (!shouldContinue) {
          setSaving(false);
          return;
        }
      }

      const beritaData: any = {
        judul: updatedFormData.judul,
        slug: updatedFormData.slug || generateSlug(updatedFormData.judul),
        konten: updatedFormData.konten,
        gambar: updatedFormData.gambar || '',
        user_id: user.id,
        judul_en: updatedFormData.judul_en || '',
        konten_en: updatedFormData.konten_en || '',
        judul_ar: updatedFormData.judul_ar || '',
        konten_ar: updatedFormData.konten_ar || '',
      };

      // Add kategori_id if available, otherwise use kategori (backward compatibility)
      if (updatedFormData.kategori_id) {
        beritaData.kategori_id = updatedFormData.kategori_id;
      } else if (updatedFormData.kategori) {
        beritaData.kategori = updatedFormData.kategori;
        beritaData.kategori_en = updatedFormData.kategori_en || '';
        beritaData.kategori_ar = updatedFormData.kategori_ar || '';
      }

      console.log('Updating berita:', beritaData);

      const { error } = await supabase
        .from('beritas')
        .update(beritaData)
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        if (error.message.includes('row-level security policy')) {
          toast.showError('RLS Policy Belum Dikonfigurasi', 'Row Level Security (RLS) policy belum dikonfigurasi.\n\nSilakan buat policy di Supabase:\n1. Buka Supabase Dashboard\n2. Pilih SQL Editor\n3. Jalankan SQL dari file SUPABASE_RLS_POLICIES.md\n\nAtau hubungi administrator untuk mengatur RLS policy.', 10000);
        } else {
          toast.showError('Error Mengupdate Berita', error.message, 8000);
        }
        throw error;
      }

      toast.showSuccess('Berhasil', 'Berita berhasil diupdate!');
      setTimeout(() => {
        router.push('/admin/beritas');
      }, 1000);
    } catch (error: any) {
      console.error('Error updating berita:', error);
    } finally {
      setSaving(false);
      setTranslating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Berita" />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Berita" />
      <ComponentCard title="Form Edit Berita">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Indonesian Section */}
          <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-gray-800/80 dark:via-gray-750/60 dark:to-gray-700/80 rounded-2xl p-6 border border-blue-100/50 dark:border-gray-600/50 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-xl">🇮🇩</span>
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">Bahasa Indonesia</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label>
                  Judul <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => handleInputChange('judul', e.target.value)}
                  placeholder="Masukkan judul berita"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label>Slug (Auto-generated)</Label>
                <Input
                  type="text"
                  value={formData.slug}
                  readOnly
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Slug otomatis dibuat dari judul</p>
              </div>
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
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Kosongkan untuk menggunakan tanggal saat ini</p>
              </div>
              <div>
                <Label>
                  Konten <span className="text-error-500">*</span>
                </Label>
                <RichTextEditor
                  value={formData.konten}
                  onChange={(value) => handleInputChange('konten', value)}
                  placeholder="Masukkan konten berita"
                />
              </div>
              <div>
                <Label>
                  Kategori <span className="text-error-500">*</span>
                </Label>
                <Select
                  options={kategoriOptions}
                  placeholder="Pilih Kategori"
                  onChange={(value) => {
                    // value is the ID from kategoris
                    const selectedKat = kategorisData.find((kat: any) => kat.id.toString() === value);
                    if (selectedKat) {
                      setFormData((prev) => ({
                        ...prev,
                        kategori_id: selectedKat.id,
                        kategori: selectedKat.kategori || '',
                        kategori_en: selectedKat.kategori_en || selectedKat.kategori || '',
                        kategori_ar: selectedKat.kategori_ar || selectedKat.kategori || '',
                      }));
                    } else {
                      handleInputChange('kategori', value);
                    }
                  }}
                  defaultValue={formData.kategori_id?.toString() || formData.kategori}
                />
              </div>
            </div>
          </div>

          {/* Auto Translate Button */}
          <div className="flex items-center justify-center my-6">
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating || !formData.judul || !formData.konten}
              className="px-6 py-3 bg-gradient-to-r from-purple-400/90 via-pink-400/90 to-rose-400/90 text-white rounded-2xl hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 hover:shadow-xl hover:shadow-purple-300/50 dark:hover:shadow-purple-800/40 hover:scale-105 active:scale-100"
            >
              {translating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menerjemahkan...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Terjemahkan Otomatis ke English & Arabic
                </>
              )}
            </button>
          </div>

          {/* Translated Sections - Collapsible */}
          <details className="bg-gray-50/60 dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
            <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-4 list-none flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Terjemahan (English & Arabic)</span>
            </summary>
            
            {/* English Section */}
            <div className="bg-gradient-to-br from-green-50/70 via-emerald-50/50 to-teal-50/70 dark:from-gray-700/70 dark:via-gray-650/50 dark:to-gray-600/70 rounded-2xl p-5 mb-4 border border-green-100/50 dark:border-gray-600/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-lg">🇬🇧</span>
                </div>
                <h4 className="font-medium text-gray-800 dark:text-white/90">English</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Judul (EN)</Label>
                  <Input
                    type="text"
                    value={formData.judul_en}
                    onChange={(e) => handleInputChange('judul_en', e.target.value)}
                    placeholder="Auto-translated title"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Konten (EN)</Label>
                  <RichTextEditor
                    value={formData.konten_en}
                    onChange={(value) => handleInputChange('konten_en', value)}
                    placeholder="Auto-translated content"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Kategori (EN) - Dari Table Kategoris</Label>
                  <Input
                    type="text"
                    value={formData.kategori_en}
                    readOnly
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed text-sm"
                    placeholder="Otomatis dari table kategoris"
                  />
                  <p className="text-xs text-gray-500 mt-1">Kategori EN diambil dari table kategoris</p>
                </div>
              </div>
            </div>

            {/* Arabic Section */}
            <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/50 to-yellow-50/70 dark:from-gray-700/70 dark:via-gray-650/50 dark:to-gray-600/70 rounded-2xl p-5 border border-amber-100/50 dark:border-gray-600/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <span className="text-lg">🇸🇦</span>
                </div>
                <h4 className="font-medium text-gray-800 dark:text-white/90">العربية</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Judul (AR)</Label>
                  <Input
                    type="text"
                    value={formData.judul_ar}
                    onChange={(e) => handleInputChange('judul_ar', e.target.value)}
                    placeholder="العنوان المترجم تلقائياً"
                    className="text-sm"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label className="text-sm">Konten (AR)</Label>
                  <RichTextEditor
                    value={formData.konten_ar}
                    onChange={(value) => handleInputChange('konten_ar', value)}
                    placeholder="المحتوى المترجم تلقائياً"
                    className="text-sm"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label className="text-sm">Kategori (AR) - Dari Table Kategoris</Label>
                  <Input
                    type="text"
                    value={formData.kategori_ar}
                    readOnly
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed text-sm"
                    placeholder="الفئة من جدول الفئات"
                    dir="rtl"
                  />
                  <p className="text-xs text-gray-500 mt-1">Kategori AR diambil dari table kategoris</p>
                </div>
              </div>
            </div>
          </details>

          {/* Image Upload */}
          <div className="bg-gradient-to-br from-gray-50/80 via-slate-50/60 to-gray-50/80 dark:from-gray-800/80 dark:via-gray-750/60 dark:to-gray-800/80 rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
            <Label className="mb-4 block text-gray-700 dark:text-gray-300">Gambar Berita</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-brand-400 bg-brand-50/80 dark:bg-brand-900/20 scale-[1.02] shadow-lg'
                  : 'border-gray-300/60 dark:border-gray-600/60 hover:border-brand-300/80 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 hover:shadow-md'
              }`}
            >
              <input {...getInputProps()} />
              {previewImage ? (
                <div className="space-y-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-w-full h-64 object-cover rounded-lg mx-auto shadow-lg"
                  />
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Klik untuk mengganti gambar
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {isDragActive ? 'Lepaskan gambar di sini' : 'Seret & lepas gambar di sini, atau klik untuk memilih'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, WEBP maksimal 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            {uploading && (
              <div className="mt-3 flex items-center gap-2 text-sm text-brand-600">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengunggah gambar...
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200/60 dark:border-gray-700/60">
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-brand-400/90 via-brand-500/90 to-brand-600/90 rounded-2xl hover:from-brand-500 hover:via-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg shadow-brand-200/50 dark:shadow-brand-900/30 hover:shadow-xl hover:shadow-brand-300/50 dark:hover:shadow-brand-800/40 hover:scale-[1.02] active:scale-100"
              disabled={uploading || translating || saving}
            >
              {saving ? 'Menyimpan...' : 'Update Berita'}
            </button>
            <Link
              href="/admin/beritas"
              className="px-6 py-3 text-gray-600 bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl hover:bg-gray-200/80 dark:hover:bg-gray-600/80 dark:text-gray-300 transition-all duration-300 font-medium hover:scale-[1.02] active:scale-100 border border-gray-200/50 dark:border-gray-600/50"
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

