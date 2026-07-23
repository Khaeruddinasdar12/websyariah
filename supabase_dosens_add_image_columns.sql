-- Pastikan kolom URL foto dosen tersedia di tabel dosens
-- Jalankan di Supabase Dashboard > SQL Editor

ALTER TABLE public.dosens
ADD COLUMN IF NOT EXISTS gambar text;

-- Kolom `foto` opsional (legacy). Tidak wajib; aplikasi memakai `gambar`.
-- Uncomment jika ingin menyimpan dual-column:
-- ALTER TABLE public.dosens ADD COLUMN IF NOT EXISTS foto text;

-- Salin dari foto → gambar jika ada data lama di kolom foto
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'dosens'
      AND column_name = 'foto'
  ) THEN
    UPDATE public.dosens
    SET gambar = foto
    WHERE (gambar IS NULL OR gambar = '')
      AND foto IS NOT NULL
      AND foto <> '';
  END IF;
END $$;

COMMENT ON COLUMN public.dosens.gambar IS 'URL publik foto/gambar dosen';
