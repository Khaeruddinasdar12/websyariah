"use client";

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { parsePendidikan } from '@/utils/dosenPendidikan';

interface DosenPendidikanFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DosenPendidikanField({ value, onChange }: DosenPendidikanFieldProps) {
  const parsed = parsePendidikan(value);
  const hasValue = value.trim().length > 0;

  return (
    <div>
      <Label htmlFor="dosen-pendidikan">Pendidikan *</Label>
      <Input
        id="dosen-pendidikan"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Gelar, Nama kampus"
        required
      />
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        Format: <span className="font-medium text-gray-700 dark:text-gray-300">Gelar, Nama kampus</span>.
        Koma pertama memisahkan gelar dan nama kampus alumni.
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-gray-500 dark:text-gray-400">
        <li>
          <span className="font-medium text-gray-700 dark:text-gray-300">S3, UIN Syarif Hidayatullah Jakarta</span>
          {' '}— pendidikan S3, alumni UIN Syarif Hidayatullah Jakarta
        </li>
        <li>
          <span className="font-medium text-gray-700 dark:text-gray-300">Guru Besar, Universitas Indonesia</span>
          {' '}— pendidikan Guru Besar, alumni Universitas Indonesia
        </li>
        <li>
          <span className="font-medium text-gray-700 dark:text-gray-300">Guru Besar</span>
          {' '}— pendidikan Guru Besar, alumni dikosongkan
        </li>
      </ul>
      {hasValue && (
        <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Tampilan di halaman tim: pendidikan{' '}
          <span className="font-semibold text-gray-800 dark:text-white">{parsed.degree || '—'}</span>
          {parsed.campus ? (
            <>
              , alumni{' '}
              <span className="font-semibold text-gray-800 dark:text-white">{parsed.campus}</span>
            </>
          ) : (
            <>, alumni dikosongkan</>
          )}
        </p>
      )}
    </div>
  );
}
