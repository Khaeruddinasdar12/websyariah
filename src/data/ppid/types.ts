export interface PpidTableRow {
  no: string;
  title: string;
  summary: string;
  unit: string;
  /** Tautan berkas. Baris induk tanpa berkas dibiarkan kosong, sama seperti kolom Aksi di FEBI. */
  href?: string;
  isSubRow?: boolean;
}

export interface PpidSection {
  id: string;
  number: number;
  title: string;
  description: string;
  rows: PpidTableRow[];
}

export interface PpidContent {
  intro: string[];
  sections: PpidSection[];
  downloadUrl: string;
  requestUrl: string;
}
