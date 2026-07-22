'use client';

import React, { useEffect, useRef } from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import {
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  buildBeritaSeo,
  getSeoCharStatus,
} from '@/utils/beritaSeo';

export interface BeritaSeoValues {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface BeritaSeoFieldsProps {
  judul: string;
  konten: string;
  kategori?: string;
  slug?: string;
  values: BeritaSeoValues;
  onChange: (values: BeritaSeoValues) => void;
  /** When true, auto-refresh SEO whenever judul/konten/kategori changes. */
  autoSync?: boolean;
  onAutoSyncChange?: (enabled: boolean) => void;
}

function CharCount({ length, max }: { length: number; max: number }) {
  const status = getSeoCharStatus(length, max);
  const color =
    status === 'good'
      ? 'text-success-600 dark:text-success-400'
      : status === 'warn'
        ? 'text-warning-600 dark:text-warning-400'
        : 'text-error-500';

  return (
    <span className={`text-xs ${color}`}>
      {length}/{max}
    </span>
  );
}

export default function BeritaSeoFields({
  judul,
  konten,
  kategori,
  slug,
  values,
  onChange,
  autoSync = true,
  onAutoSyncChange,
}: BeritaSeoFieldsProps) {
  const lastAutoKey = useRef('');

  useEffect(() => {
    if (!autoSync) return;
    if (!judul?.trim() && !konten?.trim()) return;

    const key = `${judul}||${konten}||${kategori || ''}`;
    if (key === lastAutoKey.current) return;
    lastAutoKey.current = key;

    const generated = buildBeritaSeo({ judul, konten, kategori });
    onChange(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync from source fields
  }, [judul, konten, kategori, autoSync]);

  const handleGenerate = () => {
    const generated = buildBeritaSeo({ judul, konten, kategori });
    lastAutoKey.current = `${judul}||${konten}||${kategori || ''}`;
    onChange(generated);
    onAutoSyncChange?.(true);
  };

  const updateField = (field: keyof BeritaSeoValues, value: string) => {
    onAutoSyncChange?.(false);
    onChange({ ...values, [field]: value });
  };

  const previewUrl = `https://syariah.iain-bone.ac.id/berita/${slug || 'judul-berita'}`;
  const previewTitle = values.meta_title || judul || 'Judul berita';
  const previewDesc =
    values.meta_description ||
    'Deskripsi meta akan muncul di hasil pencarian Google.';

  return (
    <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/80 dark:from-gray-800/80 dark:via-gray-750/60 dark:to-gray-700/80 rounded-2xl p-6 border border-emerald-100/50 dark:border-gray-600/50 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-700 dark:text-emerald-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
              SEO Otomatis
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Meta title &amp; description dibuat dari judul dan konten
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => onAutoSyncChange?.(e.target.checked)}
              className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            Auto-update
          </label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!judul?.trim()}
            className="px-3 py-1.5 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate ulang
          </button>
        </div>
      </div>

      {/* Google SERP preview */}
      <div className="mb-5 rounded-xl border border-gray-200/70 dark:border-gray-600/50 bg-white dark:bg-gray-900/60 p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Preview Google
        </p>
        <div className="space-y-1 max-w-xl">
          <p className="text-sm text-emerald-800 dark:text-emerald-300 truncate">
            {previewUrl}
          </p>
          <p className="text-xl text-[#1a0dab] dark:text-blue-400 leading-snug line-clamp-2">
            {previewTitle}
          </p>
          <p className="text-sm text-[#4d5156] dark:text-gray-400 leading-snug line-clamp-3">
            {previewDesc}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>Meta Title</Label>
            <CharCount length={values.meta_title.length} max={SEO_TITLE_MAX} />
          </div>
          <Input
            type="text"
            value={values.meta_title}
            onChange={(e) => updateField('meta_title', e.target.value)}
            placeholder="Judul untuk hasil pencarian Google"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ideal ±{SEO_TITLE_MAX} karakter. Editing manual menonaktifkan
            auto-update.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>Meta Description</Label>
            <CharCount
              length={values.meta_description.length}
              max={SEO_DESCRIPTION_MAX}
            />
          </div>
          <TextArea
            value={values.meta_description}
            onChange={(value) => updateField('meta_description', value)}
            placeholder="Ringkasan singkat untuk cuplikan Google"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Ideal ±{SEO_DESCRIPTION_MAX} karakter.
          </p>
        </div>

        <div>
          <Label>Keywords (opsional)</Label>
          <Input
            type="text"
            value={values.meta_keywords}
            onChange={(e) => updateField('meta_keywords', e.target.value)}
            placeholder="kata kunci, dipisah koma"
            className="w-full mt-1.5"
          />
          <p className="text-xs text-gray-500 mt-1">
            Diambil otomatis dari kategori, judul, dan konten.
          </p>
        </div>
      </div>
    </div>
  );
}
