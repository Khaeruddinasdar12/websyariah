# Konfigurasi Reset Password untuk Production

## Masalah
Link reset password yang dikirim masih menggunakan `localhost:3000` meskipun sudah di-deploy ke Vercel.

## Solusi

### 1. Set Environment Variable di Vercel

Tambahkan environment variable berikut di Vercel Dashboard:

1. Buka **Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. Tambahkan variable baru:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://syariah.iain-bone.ac.id` (atau domain production Anda)
   - **Environment**: Production, Preview, Development (atau pilih sesuai kebutuhan)

### 2. Konfigurasi Supabase Dashboard

Pastikan redirect URL sudah dikonfigurasi di Supabase:

1. Buka **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Di bagian **Redirect URLs**, tambahkan:
   ```
   https://syariah.iain-bone.ac.id/reset-password/confirm
   ```
   (Ganti dengan domain production Anda)

3. Pastikan **Site URL** juga sudah di-set ke domain production:
   ```
   https://syariah.iain-bone.ac.id
   ```

### 3. Verifikasi Email Template

1. Buka **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Pilih template **"Reset Password"**
3. Pastikan template menggunakan variable `{{ .ConfirmationURL }}` yang akan otomatis menggunakan redirect URL yang sudah dikonfigurasi

### 4. Deploy Ulang

Setelah menambahkan environment variable:
1. Deploy ulang aplikasi di Vercel
2. Atau tunggu auto-deploy jika menggunakan GitHub integration

## Testing

1. Buka halaman `/reset-password` di production
2. Masukkan email yang terdaftar
3. Cek email yang diterima
4. Pastikan link di email mengarah ke domain production, bukan localhost

## Troubleshooting

### Jika link masih localhost:

1. **Cek Environment Variable**: Pastikan `NEXT_PUBLIC_SITE_URL` sudah di-set di Vercel
2. **Cek Supabase Redirect URLs**: Pastikan URL production sudah ditambahkan
3. **Clear Cache**: Coba clear cache browser atau gunakan incognito mode
4. **Cek Logs**: Lihat console log di browser untuk melihat redirect URL yang digunakan

### Jika email tidak terkirim:

1. Cek **Supabase Dashboard** → **Authentication** → **Users** → cek apakah email user sudah terverifikasi
2. Cek spam folder
3. Cek **Supabase Dashboard** → **Logs** untuk melihat error

## Catatan Penting

- Environment variable `NEXT_PUBLIC_SITE_URL` harus di-set di **Vercel Dashboard**, bukan di `.env.local`
- `.env.local` hanya untuk development lokal
- Setelah menambahkan environment variable, **deploy ulang** aplikasi
- Pastikan redirect URL di Supabase sudah sesuai dengan domain production

