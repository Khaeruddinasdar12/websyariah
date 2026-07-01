-- Kategori pegawai untuk halaman Tim Kami
CREATE TABLE IF NOT EXISTS public.kategoripegawai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  urut integer,
  created_at timestamptz DEFAULT now()
);

-- Kolom prodi menyimpan array UUID dari kategoripegawai
-- Jika prodi masih bertipe text, buat kolom baru lalu migrasi:
--   ALTER TABLE public.dosens ADD COLUMN prodi_ids uuid[];
--   ... migrasi data ...
--   ALTER TABLE public.dosens DROP COLUMN prodi;
--   ALTER TABLE public.dosens RENAME COLUMN prodi_ids TO prodi;
--
-- Atau jika prodi sudah uuid[]:
--   (tidak perlu perubahan struktur)

ALTER TABLE public.kategoripegawai DISABLE ROW LEVEL SECURITY;

-- Wajib: tanpa GRANT, role anon/authenticated tetap tidak bisa SELECT meski RLS dimatikan
GRANT SELECT ON public.kategoripegawai TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.kategoripegawai TO authenticated, service_role;

-- Setelah membuat/mengubah tabel, reload schema cache di Supabase:
-- Settings → API → Reload schema cache

-- Contoh data awal (jalankan sekali jika tabel masih kosong)
-- INSERT INTO public.kategoripegawai (nama, urut) VALUES
--   ('Pejabat', 1),
--   ('HTN', 2),
--   ('HES', 3),
--   ('HKI', 4),
--   ('Yustisi', 5),
--   ('Falak', 6);
