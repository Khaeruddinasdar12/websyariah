# Panduan Deployment ke Vercel

## Error yang Terjadi
```
FetchError: request to https://76.76.21.112/v13/now/deployments?... failed, 
reason: Client network socket disconnected before secure TLS connection was established
```

Error ini adalah masalah koneksi jaringan/TLS ke Vercel API, bukan masalah kode.

## Solusi

### 1. Coba Deploy Ulang
- Error ini sering terjadi karena masalah sementara pada jaringan atau Vercel
- Coba deploy ulang melalui Vercel Dashboard atau CLI
- Tunggu beberapa menit dan coba lagi

### 2. Pastikan Environment Variables Sudah Dikonfigurasi
Di Vercel Dashboard, pastikan environment variables berikut sudah di-set:
- `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase project Anda
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key dari Supabase

**Cara menambahkan:**
1. Buka Vercel Dashboard → Project Settings → Environment Variables
2. Tambahkan kedua variable di atas
3. Deploy ulang

### 3. Gunakan Vercel CLI (Alternatif)
Jika deployment melalui GitHub/GitLab gagal, coba gunakan Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel

# Atau deploy ke production
vercel --prod
```

### 4. Periksa Build Lokal
Pastikan build lokal berhasil sebelum deploy:

```bash
npm run build
```

Jika build lokal gagal, perbaiki error terlebih dahulu.

### 5. Periksa Koneksi Internet
- Pastikan koneksi internet stabil
- Coba gunakan VPN jika ada firewall yang memblokir
- Periksa apakah firewall/antivirus memblokir koneksi ke Vercel

### 6. Periksa Vercel Status
- Kunjungi https://www.vercel-status.com/
- Pastikan tidak ada masalah dengan layanan Vercel

### 7. Hapus dan Buat Project Baru (Jika Masih Gagal)
Jika semua langkah di atas tidak berhasil:
1. Hapus project di Vercel Dashboard
2. Buat project baru
3. Connect repository lagi
4. Set environment variables
5. Deploy ulang

## Konfigurasi yang Diperlukan

### Environment Variables di Vercel
Pastikan environment variables berikut sudah di-set di Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Build Settings
- Framework Preset: Next.js
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

## Troubleshooting Tambahan

### Jika Build Gagal
1. Periksa log build di Vercel Dashboard
2. Pastikan semua dependencies terinstall dengan benar
3. Periksa apakah ada error TypeScript atau ESLint

### Jika Runtime Error
1. Periksa environment variables sudah benar
2. Pastikan Supabase URL dan key valid
3. Periksa RLS policies di Supabase sudah dikonfigurasi

## Catatan
- File `vercel.json` sudah dibuat untuk konfigurasi dasar
- Environment variables harus di-set manual di Vercel Dashboard
- Pastikan `.env.local` tidak di-commit ke Git (sudah ada di .gitignore)

