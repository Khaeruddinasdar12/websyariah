"use client";

import { useEffect, useState } from "react";
import Label from "@/components/form/Label";
import type { KategoriPegawai } from "@/types/kategoriPegawai";
import { fetchKategoriPegawai } from "@/lib/fetchKategoriPegawai";

interface KategoriPegawaiMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export default function KategoriPegawaiMultiSelect({
  value,
  onChange,
  disabled = false,
}: KategoriPegawaiMultiSelectProps) {
  const [categories, setCategories] = useState<KategoriPegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      setError(null);

      // Coba lewat API route (server) dulu, fallback ke client Supabase
      try {
        const response = await fetch("/api/kategoripegawai", {
          cache: "no-store",
        });
        const json = await response.json();

        if (response.ok && Array.isArray(json.data)) {
          setCategories(json.data);
          setLoading(false);
          return;
        }

        if (json.error) {
          throw new Error(
            [json.error, json.details, json.hint, json.code].filter(Boolean).join(" — ")
          );
        }
      } catch (apiErr) {
        console.warn("API kategoripegawai gagal, mencoba langsung ke Supabase:", apiErr);
      }

      const result = await fetchKategoriPegawai();
      if (result.error) {
        setError(result.error);
        setCategories([]);
      } else {
        setCategories(result.data);
      }
      setLoading(false);
    }

    loadCategories();
  }, []);

  const toggle = (id: string) => {
    if (disabled) return;

    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
      return;
    }

    onChange([...value, id]);
  };

  return (
    <div>
      <Label>Kategori Pegawai *</Label>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Pilih satu atau lebih kategori dari tabel kategoripegawai. Data disimpan
        sebagai array UUID di kolom prodi.
      </p>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Memuat kategori...</p>
      )}

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <p className="font-medium">Gagal memuat kategori pegawai</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs opacity-90">
            Pastikan di Supabase: tabel <code>kategoripegawai</code> ada di schema public,
            kolom minimal <code>id</code> dan <code>nama</code>, serta jalankan{" "}
            <code>GRANT SELECT ON kategoripegawai TO anon, authenticated;</code>
          </p>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Tabel kategoripegawai dapat diakses, tetapi belum ada data. Tambahkan baris
          kategori di Supabase Table Editor.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const selected = value.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(category.id)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                  : "border-gray-300 bg-white text-gray-700 hover:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {category.nama}
            </button>
          );
        })}
      </div>
    </div>
  );
}
