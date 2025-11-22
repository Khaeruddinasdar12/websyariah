# Struktur Database Supabase untuk Multi-Bahasa

Dokumen ini menjelaskan struktur database yang diperlukan untuk mendukung 3 bahasa (Indonesia, Inggris, Arab) pada aplikasi.

## Konsep

Untuk setiap field yang perlu diterjemahkan, kita akan menggunakan pola:
- Field dasar: `judul` (bahasa Indonesia - default)
- Field bahasa Inggris: `judul_en`
- Field bahasa Arab: `judul_ar`

## Struktur Tabel

### 1. Tabel `pengumumans`

```sql
CREATE TABLE pengumumans (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Bahasa Indonesia (default)
  judul TEXT NOT NULL,
  konten TEXT NOT NULL,
  
  -- Bahasa Inggris
  judul_en TEXT,
  konten_en TEXT,
  
  -- Bahasa Arab
  judul_ar TEXT,
  konten_ar TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Contoh Data:**
```json
{
  "id": 1,
  "slug": "kuliah-perdana-semester-ganjil",
  "judul": "Kuliah Perdana Semester Ganjil TA 2025/2026",
  "konten": "Kuliah perdana akan dimulai pada tanggal 02 September 2025...",
  "judul_en": "First Semester Opening Lecture Academic Year 2025/2026",
  "konten_en": "The opening lecture will begin on September 2, 2025...",
  "judul_ar": "محاضرة الفصل الدراسي الأول للعام الأكاديمي 2025/2026",
  "konten_ar": "ستبدأ المحاضرة الافتتاحية في 2 سبتمبر 2025...",
  "created_at": "2025-01-15T10:00:00Z"
}
```

### 2. Tabel `beritas`

```sql
CREATE TABLE beritas (
  id SERIAL PRIMARY KEY,
  
  -- Bahasa Indonesia (default)
  judul TEXT NOT NULL,
  konten TEXT NOT NULL,
  kategori VARCHAR(100),
  
  -- Bahasa Inggris
  judul_en TEXT,
  konten_en TEXT,
  kategori_en VARCHAR(100),
  
  -- Bahasa Arab
  judul_ar TEXT,
  konten_ar TEXT,
  kategori_ar VARCHAR(100),
  
  gambar VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Contoh Data:**
```json
{
  "id": 1,
  "judul": "Workshop Hukum Ekonomi Syariah",
  "konten": "Fakultas Syariah mengadakan workshop...",
  "kategori": "Acara",
  "judul_en": "Sharia Economic Law Workshop",
  "konten_en": "The Faculty of Sharia held a workshop...",
  "kategori_en": "Event",
  "judul_ar": "ورشة عمل القانون الاقتصادي الإسلامي",
  "konten_ar": "نظمت كلية الشريعة ورشة عمل...",
  "kategori_ar": "فعالية",
  "gambar": "/images/workshop.jpg",
  "created_at": "2025-01-15T10:00:00Z"
}
```

### 3. Tabel `dosen` (jika perlu multi-bahasa)

```sql
CREATE TABLE dosen (
  id SERIAL PRIMARY KEY,
  
  -- Bahasa Indonesia (default)
  nama VARCHAR(255) NOT NULL,
  gelar_depan VARCHAR(50),
  gelar_belakang VARCHAR(50),
  prodi VARCHAR(100),
  bidang_keahlian TEXT,
  riwayat_pendidikan TEXT,
  
  -- Bahasa Inggris
  nama_en VARCHAR(255),
  gelar_depan_en VARCHAR(50),
  gelar_belakang_en VARCHAR(50),
  prodi_en VARCHAR(100),
  bidang_keahlian_en TEXT,
  riwayat_pendidikan_en TEXT,
  
  -- Bahasa Arab
  nama_ar VARCHAR(255),
  gelar_depan_ar VARCHAR(50),
  gelar_belakang_ar VARCHAR(50),
  prodi_ar VARCHAR(100),
  bidang_keahlian_ar TEXT,
  riwayat_pendidikan_ar TEXT,
  
  foto VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Migration SQL

Berikut adalah script SQL untuk menambahkan kolom bahasa ke tabel yang sudah ada:

### Untuk Tabel `pengumumans`:

```sql
-- Tambah kolom untuk bahasa Inggris
ALTER TABLE pengumumans 
ADD COLUMN IF NOT EXISTS judul_en TEXT,
ADD COLUMN IF NOT EXISTS konten_en TEXT;

-- Tambah kolom untuk bahasa Arab
ALTER TABLE pengumumans 
ADD COLUMN IF NOT EXISTS judul_ar TEXT,
ADD COLUMN IF NOT EXISTS konten_ar TEXT;
```

### Untuk Tabel `beritas`:

```sql
-- Tambah kolom untuk bahasa Inggris
ALTER TABLE beritas 
ADD COLUMN IF NOT EXISTS judul_en TEXT,
ADD COLUMN IF NOT EXISTS konten_en TEXT,
ADD COLUMN IF NOT EXISTS kategori_en VARCHAR(100);

-- Tambah kolom untuk bahasa Arab
ALTER TABLE beritas 
ADD COLUMN IF NOT EXISTS judul_ar TEXT,
ADD COLUMN IF NOT EXISTS konten_ar TEXT,
ADD COLUMN IF NOT EXISTS kategori_ar VARCHAR(100);
```

## Penggunaan di Aplikasi

Aplikasi sudah dilengkapi dengan helper functions di `src/lib/supabase-i18n.ts` yang akan:

1. **Otomatis mengambil field yang sesuai dengan bahasa aktif**
2. **Fallback ke bahasa Indonesia** jika field bahasa tertentu tidak tersedia
3. **Menyediakan fungsi transform** untuk mengubah data dari format database ke format yang digunakan aplikasi

### Contoh Penggunaan:

```typescript
import { fetchAnnouncementsI18n } from '@/lib/supabase-i18n';
import { useLanguage } from '@/context/LanguageContext';

// Di dalam component
const { language } = useLanguage();
const announcements = await fetchAnnouncementsI18n(language, 3);
```

## Catatan Penting

1. **Bahasa Indonesia adalah default**: Field tanpa suffix (`_en` atau `_ar`) adalah bahasa Indonesia
2. **Fallback mechanism**: Jika field bahasa tertentu kosong, aplikasi akan menggunakan bahasa Indonesia
3. **Slug tetap sama**: Slug tidak perlu di-translate, tetap menggunakan format yang sama untuk semua bahasa
4. **Gambar/Media**: Field seperti `gambar` tidak perlu di-translate karena universal

## Best Practices

1. **Selalu isi bahasa Indonesia terlebih dahulu** sebelum menambahkan terjemahan
2. **Gunakan tool translation** untuk memastikan kualitas terjemahan
3. **Review terjemahan** terutama untuk bahasa Arab yang menggunakan RTL
4. **Test semua bahasa** sebelum deploy ke production

