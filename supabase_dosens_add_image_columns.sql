-- Pastikan kolom untuk URL foto dosen tersedia
ALTER TABLE public.dosens
ADD COLUMN IF NOT EXISTS gambar text,
ADD COLUMN IF NOT EXISTS foto text;

-- Salin data lama jika hanya salah satu kolom yang terisi
UPDATE public.dosens
SET gambar = foto
WHERE (gambar IS NULL OR gambar = '') AND foto IS NOT NULL AND foto <> '';

UPDATE public.dosens
SET foto = gambar
WHERE (foto IS NULL OR foto = '') AND gambar IS NOT NULL AND gambar <> '';
