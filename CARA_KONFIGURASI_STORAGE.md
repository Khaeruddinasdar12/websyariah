# 🚀 Cara Konfigurasi Supabase Storage untuk Upload Gambar

## ⚠️ MASALAH: Gambar belum terupload

Jika bucket `images` sudah dibuat tapi gambar masih belum terupload, kemungkinan besar **Storage Policy belum dikonfigurasi**.

---

## ✅ LANGKAH-LANGKAH KONFIGURASI

### **Langkah 1: Buka Supabase Dashboard**

1. Buka https://app.supabase.com
2. Login ke akun Anda
3. Pilih project yang digunakan

---

### **Langkah 2: Verifikasi Bucket 'images'**

1. Klik menu **Storage** di sidebar kiri
2. Pastikan ada bucket dengan nama **`images`** (huruf kecil)
3. Jika belum ada:
   - Klik **"New bucket"**
   - Nama: `images`
   - ✅ Centang **"Public bucket"** (PENTING!)
   - Klik **"Create bucket"**

---

### **Langkah 3: Konfigurasi Storage Policy (PENTING!)**

Ini adalah langkah yang paling penting. Tanpa policy, upload akan selalu gagal.

#### **Cara Cepat (Menggunakan SQL):**

1. Klik menu **SQL Editor** di sidebar kiri
2. Klik **"New query"** atau buka query baru
3. Buka file **`supabase-storage-policy.sql`** di project ini
4. Copy **SEMUA** isi file tersebut
5. Paste ke SQL Editor
6. Klik tombol **"Run"** (atau tekan `Ctrl+Enter` / `Cmd+Enter`)
7. Pastikan tidak ada error message (harus muncul "Success. No rows returned")

#### **Atau Copy SQL ini langsung:**

```sql
-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Policy 1: Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy 2: Authenticated Upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy 3: Authenticated Update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Policy 4: Authenticated Delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
```

---

### **Langkah 4: Verifikasi Policy Sudah Dibuat**

1. Klik menu **Storage** > **images** > tab **"Policies"**
2. Pastikan ada **4 policy**:
   - ✅ **Public Access** (SELECT)
   - ✅ **Authenticated users can upload** (INSERT)
   - ✅ **Authenticated users can update** (UPDATE)
   - ✅ **Authenticated users can delete** (DELETE)

Jika ada 4 policy seperti di atas, berarti konfigurasi sudah benar! ✅

---

### **Langkah 5: Test Upload**

1. Buka aplikasi dan **login sebagai admin**
2. Buka halaman **Add New Berita** (`/admin/beritas/new`)
3. Coba upload gambar (drag & drop atau klik area upload)
4. Buka **Developer Tools** (F12) > tab **Console**
5. Lihat log:
   - ✅ `Starting image upload...`
   - ✅ `Uploading to path: beritas/...`
   - ✅ `Upload successful, URL: https://...`
6. Jika muncul alert **"Gambar berhasil diupload!"**, berarti berhasil! ✅

---

## 🔍 TROUBLESHOOTING

### ❌ Error: "new row violates row-level security policy"

**Penyebab**: Storage Policy belum dikonfigurasi.

**Solusi**:
1. Pastikan sudah menjalankan SQL di **Langkah 3**
2. Verifikasi ada 4 policy di **Langkah 4**
3. Jika masih error, coba hapus semua policy dan buat ulang

### ❌ Error: "Bucket not found"

**Penyebab**: Bucket belum dibuat atau nama salah.

**Solusi**:
1. Pastikan bucket dengan nama **exact** `images` (huruf kecil) sudah dibuat
2. Cek di Storage > Buckets

### ❌ Error: "Permission denied"

**Penyebab**: User belum login.

**Solusi**:
1. Pastikan sudah login sebagai admin
2. Coba logout dan login lagi

### ❌ Gambar terupload tapi tidak muncul di form

**Penyebab**: URL tidak tersimpan.

**Solusi**:
1. Cek console browser untuk melihat URL
2. Pastikan field "Gambar" di form terisi
3. Refresh halaman dan coba lagi

---

## ✅ CHECKLIST SEBELUM UPLOAD

Sebelum mencoba upload, pastikan semua ini sudah dilakukan:

- [ ] Bucket `images` sudah dibuat
- [ ] Bucket `images` di-set sebagai **Public**
- [ ] Policy **SELECT** sudah dibuat (Public Access)
- [ ] Policy **INSERT** sudah dibuat (Authenticated users can upload)
- [ ] Policy **UPDATE** sudah dibuat (Authenticated users can update)
- [ ] Policy **DELETE** sudah dibuat (Authenticated users can delete)
- [ ] User sudah **login sebagai admin**
- [ ] Browser console tidak ada error

---

## 📝 CATATAN PENTING

1. **Bucket name harus exact**: `images` (huruf kecil, tanpa spasi)
2. **Bucket harus Public**: Centang "Public bucket" saat membuat
3. **Policy wajib dikonfigurasi**: Tanpa policy, upload akan selalu gagal
4. **User harus authenticated**: Pastikan sudah login sebelum upload
5. **File path**: File akan disimpan di `beritas/{filename}` di dalam bucket `images`

---

## 🆘 MASIH ERROR?

Jika masih mengalami masalah setelah mengikuti semua langkah:

1. **Cek Browser Console** (F12) untuk error message detail
2. **Cek Network Tab** untuk melihat request/response
3. **Cek Supabase Dashboard** > **Storage** > **images** > **Logs**
4. Pastikan environment variables sudah benar di `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📚 FILE TERKAIT

- **`SUPABASE_STORAGE_SETUP.md`** - Dokumentasi lengkap
- **`supabase-storage-policy.sql`** - File SQL untuk policy

