/** Recommended lengths for Google SERP display. */
export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

const SITE_NAME = 'FSHI IAIN Bone';

const STOP_WORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'ini', 'itu',
  'atau', 'juga', 'akan', 'telah', 'dalam', 'oleh', 'adalah', 'sebagai',
  'the', 'a', 'an', 'of', 'to', 'in', 'on', 'for', 'and', 'or', 'is', 'are',
]);

export function stripHtmlForSeo(html: string): string {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Truncate at word boundary when possible. */
export function truncateSeoText(text: string, maxLen: number): string {
  const cleaned = (text || '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;

  const sliced = cleaned.slice(0, maxLen);
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.6) {
    return sliced.slice(0, lastSpace).trim();
  }
  return sliced.trim();
}

export function generateSeoTitle(judul: string): string {
  const base = (judul || '').trim();
  if (!base) return '';

  const withBrand = `${base} | ${SITE_NAME}`;
  if (withBrand.length <= SEO_TITLE_MAX) return withBrand;
  if (base.length <= SEO_TITLE_MAX) return base;
  return truncateSeoText(base, SEO_TITLE_MAX);
}

export function generateSeoDescription(konten: string, judul?: string): string {
  const plain = stripHtmlForSeo(konten);
  if (plain) return truncateSeoText(plain, SEO_DESCRIPTION_MAX);
  if (judul?.trim()) return truncateSeoText(judul.trim(), SEO_DESCRIPTION_MAX);
  return '';
}

export function generateSeoKeywords(
  judul: string,
  kategori?: string,
  konten?: string
): string {
  const parts: string[] = [];

  if (kategori?.trim()) parts.push(kategori.trim());

  const judulWords = (judul || '')
    .toLowerCase()
    .replace(/[^a-z0-9à-ÿ\s-]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  for (const w of judulWords.slice(0, 6)) {
    if (!parts.some((p) => p.toLowerCase() === w)) parts.push(w);
  }

  if (konten) {
    const bodyWords = stripHtmlForSeo(konten)
      .toLowerCase()
      .replace(/[^a-z0-9à-ÿ\s-]/gi, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 4 && !STOP_WORDS.has(w));

    const freq = new Map<string, number>();
    for (const w of bodyWords) freq.set(w, (freq.get(w) || 0) + 1);

    const top = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([w]) => w);

    for (const w of top) {
      if (!parts.some((p) => p.toLowerCase() === w)) parts.push(w);
    }
  }

  parts.push('FSHI', 'IAIN Bone');
  return parts.slice(0, 12).join(', ');
}

export function buildBeritaSeo(input: {
  judul: string;
  konten: string;
  kategori?: string;
}): { meta_title: string; meta_description: string; meta_keywords: string } {
  return {
    meta_title: generateSeoTitle(input.judul),
    meta_description: generateSeoDescription(input.konten, input.judul),
    meta_keywords: generateSeoKeywords(
      input.judul,
      input.kategori,
      input.konten
    ),
  };
}

export function getSeoCharStatus(
  length: number,
  max: number
): 'good' | 'warn' | 'bad' {
  if (length === 0) return 'bad';
  if (length > max) return 'bad';
  if (length > max * 0.9) return 'warn';
  return 'good';
}
