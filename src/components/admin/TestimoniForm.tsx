"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';
import { supabase } from '@/lib/supabase';
import { getSupabaseErrorMessage } from '@/lib/fetchKategoriPegawai';
import { testimoniInitials } from '@/lib/testimoni';
import type { Testimoni } from '@/types/testimoni';
import { useToast } from '@/context/ToastContext';

type TestimoniFormProps = {
  mode: 'create' | 'edit';
  initial?: Testimoni;
};

function blankToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function TestimoniForm({ mode, initial }: TestimoniFormProps) {
  const router = useRouter();
  const { showError, showSuccess, showWarning } = useToast();
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [nama, setNama] = useState(initial?.nama || '');
  const [namaEn, setNamaEn] = useState(initial?.nama_en || '');
  const [namaAr, setNamaAr] = useState(initial?.nama_ar || '');
  const [peran, setPeran] = useState(initial?.peran || '');
  const [peranEn, setPeranEn] = useState(initial?.peran_en || '');
  const [peranAr, setPeranAr] = useState(initial?.peran_ar || '');
  const [kutipan, setKutipan] = useState(initial?.kutipan || '');
  const [kutipanEn, setKutipanEn] = useState(initial?.kutipan_en || '');
  const [kutipanAr, setKutipanAr] = useState(initial?.kutipan_ar || '');
  const [inisial, setInisial] = useState(initial?.inisial || '');
  const [urut, setUrut] = useState(initial?.urut != null ? String(initial.urut) : '');
  const [aktif, setAktif] = useState(initial?.aktif ?? true);
  const [inisialEdited, setInisialEdited] = useState(Boolean(initial?.inisial));

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

  const handleNamaChange = (value: string) => {
    setNama(value);
    if (!inisialEdited) {
      setInisial(testimoniInitials(value));
    }
  };

  const handleAutoTranslate = async () => {
    if (!nama.trim() && !peran.trim() && !kutipan.trim()) {
      showWarning('Form Kosong', 'Isi nama, peran, atau kutipan terlebih dahulu');
      return;
    }

    setTranslating(true);
    try {
      const [namaEnText, peranEnText, kutipanEnText, namaArText, peranArText, kutipanArText] = await Promise.all([
        nama.trim() ? translateText(nama.trim(), 'en') : '',
        peran.trim() ? translateText(peran.trim(), 'en') : '',
        kutipan.trim() ? translateText(kutipan.trim(), 'en') : '',
        nama.trim() ? translateText(nama.trim(), 'ar') : '',
        peran.trim() ? translateText(peran.trim(), 'ar') : '',
        kutipan.trim() ? translateText(kutipan.trim(), 'ar') : '',
      ]);
      if (namaEnText) setNamaEn(namaEnText);
      if (peranEnText) setPeranEn(peranEnText);
      if (kutipanEnText) setKutipanEn(kutipanEnText);
      if (namaArText) setNamaAr(namaArText);
      if (peranArText) setPeranAr(peranArText);
      if (kutipanArText) setKutipanAr(kutipanArText);
      showSuccess('Terjemahan Berhasil', 'Versi Inggris dan Arab sudah diisi');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menerjemahkan';
      showError('Error Terjemahan', message);
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !peran.trim() || !kutipan.trim()) {
      showError('Form Tidak Lengkap', 'Nama, peran, dan kutipan wajib diisi');
      return;
    }
    if (urut.trim() && (!Number.isInteger(Number(urut)) || Number(urut) < 1)) {
      showError('Form Tidak Lengkap', 'Urutan harus berupa angka mulai dari 1');
      return;
    }

    setSaving(true);
    try {
      let nextUrut = urut.trim() ? Number(urut) : null;
      if (nextUrut == null && mode === 'create') {
        const { data } = await supabase
          .from('testimonis')
          .select('urut')
          .order('urut', { ascending: false, nullsFirst: false })
          .limit(1);
        const highest = data?.[0]?.urut;
        nextUrut = (typeof highest === 'number' ? highest : 0) + 1;
      }

      const payload = {
        nama: nama.trim(),
        nama_en: blankToNull(namaEn),
        nama_ar: blankToNull(namaAr),
        peran: peran.trim(),
        peran_en: blankToNull(peranEn),
        peran_ar: blankToNull(peranAr),
        kutipan: kutipan.trim(),
        kutipan_en: blankToNull(kutipanEn),
        kutipan_ar: blankToNull(kutipanAr),
        inisial: blankToNull(inisial)?.toUpperCase() || testimoniInitials(nama),
        urut: nextUrut,
        aktif,
        updated_at: new Date().toISOString(),
      };

      const query =
        mode === 'edit' && initial
          ? supabase.from('testimonis').update(payload).eq('id', initial.id)
          : supabase.from('testimonis').insert([payload]);

      const { error } = await query;
      if (error) throw error;

      showSuccess('Berhasil', mode === 'edit' ? 'Testimoni berhasil diperbarui' : 'Testimoni berhasil ditambahkan');
      router.push('/admin/testimoni');
    } catch (error: unknown) {
      showError('Gagal menyimpan', getSupabaseErrorMessage(error, 'Gagal menyimpan testimoni'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ComponentCard title={mode === 'edit' ? 'Edit Testimoni' : 'Form Testimoni'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>
            Nama (Indonesia) <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            value={nama}
            onChange={(e) => handleNamaChange(e.target.value)}
            placeholder="Nama lengkap"
            required
            disabled={saving}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>Inisial</Label>
            <Input
              type="text"
              value={inisial}
              onChange={(e) => {
                setInisialEdited(true);
                setInisial(e.target.value);
              }}
              placeholder="PR"
              maxLength={4}
              disabled={saving}
            />
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
          </div>
        </div>

        <div>
          <Label>
            Peran (Indonesia) <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            value={peran}
            onChange={(e) => setPeran(e.target.value)}
            placeholder="Alumni, program studi, dan pekerjaan"
            required
            disabled={saving}
          />
        </div>

        <div>
          <Label>
            Kutipan (Indonesia) <span className="text-error-500">*</span>
          </Label>
          <TextArea
            rows={5}
            value={kutipan}
            onChange={setKutipan}
            placeholder="Isi testimoni"
            disabled={saving}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={aktif}
            onChange={(e) => setAktif(e.target.checked)}
            disabled={saving}
          />
          Tampilkan di halaman publik
        </label>

        <div>
          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={translating || saving || (!nama.trim() && !peran.trim() && !kutipan.trim())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {translating ? 'Menerjemahkan...' : 'Auto Translate'}
          </button>
        </div>

        <div>
          <Label>Nama (English)</Label>
          <Input type="text" value={namaEn} onChange={(e) => setNamaEn(e.target.value)} disabled={saving} />
        </div>
        <div>
          <Label>Peran (English)</Label>
          <Input type="text" value={peranEn} onChange={(e) => setPeranEn(e.target.value)} disabled={saving} />
        </div>
        <div>
          <Label>Kutipan (English)</Label>
          <TextArea rows={4} value={kutipanEn} onChange={setKutipanEn} disabled={saving} />
        </div>

        <div>
          <Label>Nama (Arabic)</Label>
          <Input type="text" value={namaAr} onChange={(e) => setNamaAr(e.target.value)} dir="rtl" disabled={saving} />
        </div>
        <div>
          <Label>Peran (Arabic)</Label>
          <Input type="text" value={peranAr} onChange={(e) => setPeranAr(e.target.value)} dir="rtl" disabled={saving} />
        </div>
        <div>
          <Label>Kutipan (Arabic)</Label>
          <TextArea rows={4} value={kutipanAr} onChange={setKutipanAr} dir="rtl" disabled={saving} />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <Link href="/admin/testimoni" className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Batal
          </Link>
        </div>
      </form>
    </ComponentCard>
  );
}
