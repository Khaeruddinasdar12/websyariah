# Setup Dashboard Statistik Google Analytics (`/statistik`)

Halaman publik: `https://syariah.iain-bone.ac.id/statistik`  
Tidak ada menu navigasi ke halaman ini (akses lewat URL langsung).

## 1. Property ID

Di Google Analytics:
**Admin → Property Settings → Property ID** (angka, contoh `226345460`)

Bukan Measurement ID `G-Z34XPQ6BKW`.

## 2. Service Account

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat / pilih project
3. Aktifkan **Google Analytics Data API**
4. **APIs & Services → Credentials → Create Credentials → Service Account**
5. Buat key JSON, download file-nya
6. Di GA4: **Admin → Property Access Management**
7. Undang email service account (…@….iam.gserviceaccount.com) sebagai **Viewer**

## 3. Environment variables

Tambahkan di server / hosting (production):

```env
GA_PROPERTY_ID=226345460
GA_CLIENT_EMAIL=nama-service@project.iam.gserviceaccount.com
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n"
```

Alternatif (satu variabel JSON):

```env
GA_SERVICE_ACCOUNT_JSON={"type":"service_account","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",...}
```

Opsional (sudah ada di kode):

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-Z34XPQ6BKW
```

## 4. Deploy ulang

Setelah env diset, restart / redeploy aplikasi, lalu buka `/statistik`.

Jika kredensial belum ada, halaman tetap bisa dibuka dan menampilkan panduan setup.
