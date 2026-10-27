const DEGREE_CODE = /^(S[123]|D[1-4]|Ph\.?D\.?)$/i;

function formatDegreeLabel(value: string): string {
  const text = value.trim();
  if (!text) return '';
  if (DEGREE_CODE.test(text)) return text.toUpperCase();
  return text;
}

/**
 * Format pendidikan: "Gelar, Nama kampus".
 * Koma atau garis tegak pertama memisahkan gelar dan kampus alumni.
 * Tanpa pemisah, seluruh teks adalah gelar dan alumni dikosongkan.
 * Contoh: "Guru Besar" → gelar saja; "Guru Besar, Universitas Indonesia" → alumni kampus.
 */
export function parsePendidikan(raw: string): { degree: string; campus: string } {
  const text = raw.trim();
  if (!text) return { degree: '', campus: '' };

  const separator = text.search(/[,|]/);
  if (separator === -1) {
    return { degree: formatDegreeLabel(text), campus: '' };
  }

  return {
    degree: formatDegreeLabel(text.slice(0, separator)),
    campus: text.slice(separator + 1).trim(),
  };
}
