-- ============================================
-- SUPABASE STORAGE POLICY SETUP
-- Untuk Bucket 'images'
-- ============================================
-- 
-- INSTRUKSI:
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Copy semua SQL di bawah ini
-- 3. Paste ke SQL Editor
-- 4. Klik "Run" atau tekan Ctrl+Enter
-- 5. Pastikan tidak ada error
--
-- ============================================

-- Hapus policy lama jika ada (untuk clean start)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- ============================================
-- POLICY 1: SELECT (Public Read Access)
-- ============================================
-- Semua orang (termasuk yang belum login) bisa membaca/melihat gambar
-- Ini penting agar gambar bisa diakses dari URL public
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- ============================================
-- POLICY 2: INSERT (Authenticated Upload)
-- ============================================
-- Hanya user yang sudah login (authenticated) yang bisa upload gambar
-- Ini mencegah anonymous user untuk upload file
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- ============================================
-- POLICY 3: UPDATE (Authenticated Update)
-- ============================================
-- Hanya user yang sudah login yang bisa update/mengganti file
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- ============================================
-- POLICY 4: DELETE (Authenticated Delete)
-- ============================================
-- Hanya user yang sudah login yang bisa menghapus file
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- ============================================
-- VERIFIKASI
-- ============================================
-- Jalankan query ini untuk memastikan policy sudah dibuat:
-- 
-- SELECT 
--   policyname,
--   cmd,
--   roles,
--   qual,
--   with_check
-- FROM pg_policies
-- WHERE schemaname = 'storage' 
--   AND tablename = 'objects'
--   AND (policyname LIKE '%images%' OR qual::text LIKE '%images%');
--
-- Seharusnya akan muncul 4 policy:
-- 1. Public Access (SELECT)
-- 2. Authenticated users can upload (INSERT)
-- 3. Authenticated users can update (UPDATE)
-- 4. Authenticated users can delete (DELETE)
-- ============================================

