export interface PpidTableRow {
  no: string;
  title: string;
  summary: string;
  unit: string;
  format: string;
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
}
