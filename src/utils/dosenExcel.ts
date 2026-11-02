import type { KategoriPegawai } from '@/types/kategoriPegawai';
import { formatKategoriNames, normalizeKategoriIds } from '@/utils/kategoriPegawai';

const PREFERRED_COLUMNS = [
  'id',
  'urut',
  'nama',
  'kategori',
  'prodi',
  'jabatan',
  'jabatan_en',
  'jabatan_ar',
  'pendidikan',
  'keahlian',
  'keahlian_en',
  'keahlian_ar',
  'gambar',
  'created_at',
] as const;

type DosenRow = Record<string, unknown>;

function xmlText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cellText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

export function dosenExportColumns(rows: DosenRow[]): string[] {
  const present = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => present.add(key));
  });
  present.add('kategori');

  const ordered = PREFERRED_COLUMNS.filter((column) => present.has(column));
  const extras = [...present]
    .filter((column) => !PREFERRED_COLUMNS.includes(column as (typeof PREFERRED_COLUMNS)[number]))
    .sort();

  return [...ordered, ...extras];
}

export function dosenExportValue(
  row: DosenRow,
  column: string,
  categories: KategoriPegawai[]
): unknown {
  if (column === 'kategori') {
    const names = formatKategoriNames(normalizeKategoriIds(row.prodi), categories, 'id', '');
    return names;
  }
  return row[column];
}

export function buildDosenWorkbookXml(
  rows: DosenRow[],
  categories: KategoriPegawai[]
): string {
  const columns = dosenExportColumns(rows);
  const header = columns
    .map(
      (column) =>
        `<Cell><Data ss:Type="String">${xmlText(column)}</Data></Cell>`
    )
    .join('');

  const body = rows
    .map((row) => {
      const cells = columns
        .map((column) => {
          const value = dosenExportValue(row, column, categories);
          if (typeof value === 'number' && Number.isFinite(value)) {
            return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
          }
          return `<Cell><Data ss:Type="String">${xmlText(cellText(value))}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Dosen">
<Table>
<Row>${header}</Row>
${body}
</Table>
</Worksheet>
</Workbook>`;
}

export function downloadDosenExcel(rows: DosenRow[], categories: KategoriPegawai[]) {
  const xml = buildDosenWorkbookXml(rows, categories);
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `dosen-fshi-${date}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
