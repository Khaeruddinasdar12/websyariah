# Implementasi Multi-Bahasa (i18n)

Dokumen ini menjelaskan implementasi sistem multi-bahasa untuk aplikasi yang mendukung 3 bahasa: Indonesia, Inggris, dan Arab.

## ✅ Yang Sudah Dibuat

### 1. Language Context & Provider
- **File**: `src/context/LanguageContext.tsx`
- **Fungsi**: 
  - Mengelola state bahasa aktif
  - Menyediakan fungsi `t()` untuk translation
  - Menyimpan preferensi bahasa di localStorage
  - Mengatur HTML `lang` dan `dir` attributes (RTL untuk Arab)

### 2. Translation Files
- **Lokasi**: `src/locales/`
- **File**:
  - `id.json` - Bahasa Indonesia (default)
  - `en.json` - Bahasa Inggris
  - `ar.json` - Bahasa Arab
- **Struktur**: Hierarchical JSON dengan key yang terorganisir

### 3. Language Switcher Component
- **File**: `src/components/LanguageSwitcher.tsx`
- **Fitur**:
  - Dropdown untuk memilih bahasa
  - Menampilkan flag dan nama bahasa
  - Indikator bahasa aktif
  - Responsif untuk mobile dan desktop

### 4. Layout Integration
- **File**: `src/app/(public)/layout.tsx`
- **Perubahan**: Menambahkan `LanguageProvider` wrapper

### 5. Navbar Integration
- **File**: `src/components/Navbar.tsx`
- **Perubahan**:
  - Menggunakan `useLanguage()` hook
  - Semua menu item menggunakan translation
  - Menambahkan LanguageSwitcher di desktop dan mobile

### 6. Homepage Integration
- **File**: `src/app/(public)/page.tsx`
- **Perubahan**:
  - Menggunakan `useLanguage()` hook
  - Semua teks statis menggunakan translation
  - Data dinamis menggunakan helper i18n dari Supabase
  - Format tanggal sesuai dengan locale

### 7. Supabase i18n Helpers
- **File**: `src/lib/supabase-i18n.ts`
- **Fungsi**:
  - `getLangField()` - Mendapatkan nama field untuk bahasa tertentu
  - `getLangValue()` - Mendapatkan nilai field dengan fallback
  - `transformI18nData()` - Transform data untuk bahasa aktif
  - `fetchAnnouncementsI18n()` - Fetch pengumuman dengan i18n
  - `fetchBeritaI18n()` - Fetch berita dengan i18n

### 8. Dokumentasi Database
- **File**: `SUPABASE_I18N_STRUCTURE.md`
- **Isi**: 
  - Struktur tabel untuk multi-bahasa
  - SQL migration scripts
  - Contoh data
  - Best practices

## 📝 Cara Menggunakan

### Di Component

```typescript
import { useLanguage } from '@/context/LanguageContext';

export default function MyComponent() {
  const { language, t } = useLanguage();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

### Untuk Data Dinamis dari Supabase

```typescript
import { fetchAnnouncementsI18n } from '@/lib/supabase-i18n';
import { useLanguage } from '@/context/LanguageContext';

export default function MyComponent() {
  const { language } = useLanguage();
  const [data, setData] = useState([]);
  
  useEffect(() => {
    async function loadData() {
      const announcements = await fetchAnnouncementsI18n(language, 10);
      setData(announcements);
    }
    loadData();
  }, [language]);
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>
          <h2>{item.judul}</h2>
          <p>{item.konten}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔄 Langkah Selanjutnya

### 1. Update Halaman Lainnya
Halaman berikut masih perlu di-update untuk menggunakan i18n:
- [ ] `src/app/(public)/berita/page.tsx`
- [ ] `src/app/(public)/berita/[slug]/page.tsx`
- [ ] `src/app/(public)/pengumuman/page.tsx`
- [ ] `src/app/(public)/pengumuman/[slug]/page.tsx`
- [ ] `src/app/(public)/dosen/page.tsx`
- [ ] `src/app/(public)/tentang/page.tsx`
- [ ] `src/app/(public)/layanan/page.tsx`
- [ ] `src/app/(public)/kontak/page.tsx`
- [ ] `src/components/Footer.tsx`

### 2. Update Supabase Database
Ikuti instruksi di `SUPABASE_I18N_STRUCTURE.md` untuk:
- Menambahkan kolom `_en` dan `_ar` ke tabel yang ada
- Mengisi data terjemahan
- Testing fallback mechanism

### 3. Menambahkan Translation Keys
Jika ada teks baru yang perlu di-translate:
1. Tambahkan key ke `src/locales/id.json`
2. Tambahkan terjemahan ke `src/locales/en.json`
3. Tambahkan terjemahan ke `src/locales/ar.json`

### 4. Testing
- [ ] Test semua bahasa di setiap halaman
- [ ] Test RTL untuk bahasa Arab
- [ ] Test fallback jika field bahasa tidak tersedia
- [ ] Test localStorage persistence
- [ ] Test responsive design dengan semua bahasa

## 🎨 Styling untuk RTL

Aplikasi sudah otomatis mengatur `dir="rtl"` untuk bahasa Arab. Untuk styling khusus RTL, gunakan:

```css
[dir="rtl"] .my-class {
  /* RTL specific styles */
}
```

Atau di Tailwind:
```jsx
<div className="ltr:ml-4 rtl:mr-4">
  {/* Content */}
</div>
```

## 📚 Translation Keys Structure

```
common.*          - Teks umum (readMore, seeAll, back, dll)
nav.*             - Menu navigasi
home.*            - Halaman beranda
announcements.*   - Halaman pengumuman
news.*            - Halaman berita
about.*           - Halaman tentang
services.*        - Halaman layanan
contact.*         - Halaman kontak
```

## ⚠️ Catatan Penting

1. **Bahasa Indonesia adalah default**: Field tanpa suffix adalah bahasa Indonesia
2. **Fallback mechanism**: Jika field bahasa tidak tersedia, akan menggunakan bahasa Indonesia
3. **Slug tidak di-translate**: Slug tetap sama untuk semua bahasa
4. **Gambar universal**: Field seperti `gambar` tidak perlu di-translate
5. **Date formatting**: Format tanggal otomatis sesuai locale

## 🐛 Troubleshooting

### Translation tidak muncul
- Pastikan file JSON ada di `src/locales/`
- Pastikan key yang digunakan ada di file JSON
- Check console untuk error loading translation

### Data dari Supabase tidak ter-translate
- Pastikan menggunakan helper function dari `supabase-i18n.ts`
- Pastikan kolom `_en` dan `_ar` sudah ditambahkan di database
- Check apakah data sudah diisi untuk bahasa tersebut

### RTL tidak bekerja
- Pastikan `dir="rtl"` sudah di-set di HTML element
- Check apakah CSS RTL sudah di-apply
- Pastikan font mendukung RTL (Arial, Times New Roman, dll)

