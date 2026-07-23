import { resolveDosenImageUrl } from '@/utils/dosenImage';

export interface DosenFormData {
  urut?: number;
  nama: string;
  jabatan: string;
  jabatan_en?: string;
  jabatan_ar?: string;
  pendidikan: string;
  keahlian: string;
  keahlian_en?: string;
  keahlian_ar?: string;
  gambar?: string;
  foto?: string;
}

export function getDosenImageUrlForSave(
  imageUrl: string,
  formData: DosenFormData
): string {
  const candidates = [imageUrl, formData.gambar, formData.foto];

  for (const value of candidates) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
  }

  return '';
}

export function buildDosenSavePayload(
  formData: DosenFormData,
  kategoriPegawai: string[],
  imageUrl: string
) {
  const savedImageUrl = getDosenImageUrlForSave(imageUrl, formData);

  // Hanya kirim kolom `gambar` — kolom `foto` opsional/legacy dan
  // sering belum ada di schema Supabase (error: schema cache).
  return {
    urut: formData.urut ?? null,
    nama: formData.nama,
    jabatan: formData.jabatan,
    jabatan_en: formData.jabatan_en?.trim() || null,
    jabatan_ar: formData.jabatan_ar?.trim() || null,
    pendidikan: formData.pendidikan,
    keahlian: formData.keahlian,
    keahlian_en: formData.keahlian_en?.trim() || null,
    keahlian_ar: formData.keahlian_ar?.trim() || null,
    gambar: savedImageUrl || null,
    prodi: kategoriPegawai,
  };
}

export function applyFetchedDosenImage(
  data: DosenFormData
): { formData: DosenFormData; imageUrl: string } {
  const imageUrl = resolveDosenImageUrl(data) || '';

  return {
    formData: {
      ...data,
      gambar: imageUrl,
      foto: imageUrl,
    },
    imageUrl,
  };
}
