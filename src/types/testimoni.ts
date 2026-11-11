export interface Testimoni {
  id: string;
  nama: string;
  nama_en?: string | null;
  nama_ar?: string | null;
  peran: string;
  peran_en?: string | null;
  peran_ar?: string | null;
  kutipan: string;
  kutipan_en?: string | null;
  kutipan_ar?: string | null;
  inisial?: string | null;
  urut?: number | null;
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
}
