# Setup Supabase Storage untuk Upload Gambar

## Masalah
Error: "Bucket not found" atau "new row violates row-level security policy" saat upload gambar

## Solusi Lengkap

### ✅ Langkah 1: Pastikan Bucket Sudah Dibuat

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik menu **Storage** di sidebar kiri
4. Pastikan bucket dengan nama **`images`** sudah ada
5. Jika belum ada, klik **"New bucket"** dan buat dengan:
   - **Name**: `images` (harus exact match, huruf kecil)
   - **Public bucket**: ✅ **WAJIB dicentang** (agar gambar bisa diakses public)
   - **File size limit**: (opsional, default 50MB)
   - **Allowed MIME types**: (opsional, bisa dikosongkan)

---

### ✅ Langkah 2: Konfigurasi Storage Policy (PENTING!)

Ini adalah langkah yang paling penting dan sering terlewat. Tanpa policy yang benar, upload akan gagal.

#### Cara 1: Menggunakan SQL Editor (RECOMMENDED)

1. Buka Supabase Dashboard
2. Klik menu **SQL Editor** di sidebar kiri
3. Klik **"New query"** atau buka query baru
4. Copy dan paste SQL berikut:

```sql
-- ============================================
-- STORAGE POLICY UNTUK BUCKET 'images'
-- ============================================
-- Hapus policy lama jika ada (opsional, untuk clean start)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Policy 1: SELECT (Public read access)
-- Semua orang bisa membaca/melihat gambar
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy 2: INSERT (Authenticated users can upload)
-- Hanya user yang sudah login yang bisa upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy 3: UPDATE (Authenticated users can update)
-- Hanya user yang sudah login yang bisa update file
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Policy 4: DELETE (Authenticated users can delete)
-- Hanya user yang sudah login yang bisa delete file
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
```

5. Klik tombol **"Run"** atau tekan `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
6. Pastikan tidak ada error message
7. Jika ada error, cek apakah bucket `images` sudah dibuat terlebih dahulu

#### Cara 2: Menggunakan UI Dashboard (Alternative)

1. Buka Supabase Dashboard
2. Klik menu **Storage** di sidebar
3. Klik bucket **`images`**
4. Klik tab **"Policies"**
5. Klik **"New Policy"** atau **"Create Policy"**
6. Buat 4 policy berikut:

**Policy 1: Public Read Access**
- **Policy name**: `Public Access`
- **Allowed operation**: `SELECT`
- **Target roles**: `public` (atau kosongkan untuk public)
- **USING expression**: `bucket_id = 'images'`

**Policy 2: Authenticated Upload**
- **Policy name**: `Authenticated users can upload`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **WITH CHECK expression**: `bucket_id = 'images'`

**Policy 3: Authenticated Update**
- **Policy name**: `Authenticated users can update`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'images'`
- **WITH CHECK expression**: `bucket_id = 'images'`

**Policy 4: Authenticated Delete**
- **Policy name**: `Authenticated users can delete`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'images'`

---

### ✅ Langkah 3: Verifikasi Policy

Setelah policy dibuat, verifikasi dengan cara:

1. Buka **Storage** > **images** > **Policies**
2. Pastikan ada 4 policy:
   - ✅ Public Access (SELECT)
   - ✅ Authenticated users can upload (INSERT)
   - ✅ Authenticated users can update (UPDATE)
   - ✅ Authenticated users can delete (DELETE)

Atau jalankan query SQL ini untuk mengecek:

```sql
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%images%' OR qual::text LIKE '%images%';
```

---

### ✅ Langkah 4: Test Upload

1. Buka aplikasi dan login sebagai admin
2. Buka halaman **Add New Berita** (`/admin/beritas/new`)
3. Coba upload gambar dengan drag & drop atau klik area upload
4. Buka **Developer Tools** (F12) > **Console** untuk melihat log
5. Jika berhasil, akan muncul:
   - `Starting image upload...`
   - `Uploading to path: beritas/...`
   - `Upload successful, URL: https://...`
6. Cek di Supabase Dashboard > Storage > images > beritas untuk melihat file yang terupload

---

## Troubleshooting

### Error: "new row violates row-level security policy"

**Penyebab**: Storage Policy belum dikonfigurasi atau salah.

**Solusi**:
1. Pastikan semua 4 policy sudah dibuat (SELECT, INSERT, UPDATE, DELETE)
2. Pastikan policy INSERT menggunakan role `authenticated`
3. Pastikan bucket name di policy adalah `'images'` (dengan tanda kutip)
4. Coba hapus semua policy dan buat ulang menggunakan SQL di atas

### Error: "Bucket not found"

**Penyebab**: Bucket belum dibuat atau nama bucket salah.

**Solusi**:
1. Pastikan bucket dengan nama **exact** `images` (huruf kecil) sudah dibuat
2. Cek di Storage > Buckets
3. Jika belum ada, buat bucket baru dengan nama `images`

### Error: "Permission denied" atau "Access denied"

**Penyebab**: User belum login atau session expired.

**Solusi**:
1. Pastikan sudah login sebagai admin
2. Coba logout dan login lagi
3. Cek di browser console apakah ada error authentication

### Gambar terupload tapi tidak muncul di database

**Penyebab**: Upload berhasil tapi URL tidak tersimpan ke database.

**Solusi**:
1. Cek console browser untuk melihat URL yang dihasilkan
2. Pastikan field `gambar` di form terisi dengan URL
3. Cek apakah ada error saat submit form

---

## Catatan Penting

1. **Bucket name harus exact match**: `images` (huruf kecil, tanpa spasi)
2. **Bucket harus Public**: Centang "Public bucket" saat membuat bucket
3. **Policy wajib dikonfigurasi**: Tanpa policy, upload akan selalu gagal
4. **User harus authenticated**: Pastikan sudah login sebelum upload
5. **File path**: File akan disimpan di `beritas/{filename}` di dalam bucket `images`
6. **URL format**: URL akan seperti: `https://[project].supabase.co/storage/v1/object/public/images/beritas/[filename]`

---

## Quick Check List

Sebelum mencoba upload, pastikan:

- [ ] Bucket `images` sudah dibuat
- [ ] Bucket `images` di-set sebagai Public
- [ ] Policy SELECT sudah dibuat (Public Access)
- [ ] Policy INSERT sudah dibuat (Authenticated users can upload)
- [ ] Policy UPDATE sudah dibuat (Authenticated users can update)
- [ ] Policy DELETE sudah dibuat (Authenticated users can delete)
- [ ] User sudah login sebagai admin
- [ ] Browser console tidak ada error

---

## Bantuan Lebih Lanjut

Jika masih mengalami masalah:

1. Cek **Browser Console** (F12) untuk error message detail
2. Cek **Network Tab** untuk melihat request/response dari Supabase
3. Cek **Supabase Dashboard** > **Storage** > **images** > **Logs** untuk melihat activity log
4. Pastikan environment variables (`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`) sudah benar di `.env.local`
