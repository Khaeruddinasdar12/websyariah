const SOFT_BREAK = '\uE000'; // placeholder for <br> inside a paragraph

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function cleanInlineHtml(inner: string): string {
  return decodeEntities(
    inner
      .replace(/<br\s*\/?>/gi, SOFT_BREAK)
      .replace(/<[^>]*>/g, '')
      .replace(/[ \t]+/g, ' ')
      .trim()
  );
}

function looksLikeHtml(text: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

function hasArabicScript(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function isMostlyLatin(text: string): boolean {
  const letters = text.replace(/[^A-Za-z\u0600-\u06FF]/g, '');
  if (!letters) return false;
  const latin = (letters.match(/[A-Za-z]/g) || []).length;
  return latin / letters.length > 0.6;
}

/** Existing AR value is usable only if it actually contains Arabic (not leftover Indonesian). */
export function isUsableArabicTranslation(value?: string | null): boolean {
  if (!value?.trim()) return false;
  const plain = stripHtmlForTranslation(value);
  if (!hasArabicScript(plain)) return false;
  if (isMostlyLatin(plain)) return false;
  return true;
}

/**
 * Strip HTML for translation while preserving Enter/paragraph structure as newlines.
 * TipTap Enter = new <p>; each </p> becomes exactly one newline (no extra blank).
 * Empty <p><br></p> becomes a blank line so intentional gaps survive.
 */
export function stripHtmlForTranslation(text: string): string {
  if (!text?.trim()) return '';

  const normalized = text.replace(/\r\n/g, '\n');

  if (looksLikeHtml(normalized)) {
    const paragraphs: string[] = [];
    const paragraphRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
    let match: RegExpExecArray | null;
    let found = false;

    while ((match = paragraphRegex.exec(normalized)) !== null) {
      found = true;
      paragraphs.push(cleanInlineHtml(match[1]));
    }

    if (found) {
      // Join with single \n so paragraph count matches Indonesian TipTap Enter count
      return paragraphs.join('\n');
    }

    // Fallback for non-<p> HTML
    return decodeEntities(
      normalized
        .replace(/<\/(div|h[1-6]|li|tr|blockquote)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?(ul|ol|table|thead|tbody|tfoot)>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/[ \t]*\n[ \t]*/g, '\n')
        .replace(/\n{2,}/g, '\n')
        .trim()
    );
  }

  return normalized.replace(/[ \t]+/g, ' ').trim();
}

/**
 * Convert plain text (with newlines) back to TipTap-friendly HTML paragraphs.
 * One newline = one Enter = one <p> (same count as Indonesian source).
 */
export function plainTextToRichHtml(text: string): string {
  if (text == null || text === '') return '';

  const lines = String(text).replace(/\r\n/g, '\n').split('\n');

  // Soft-trim only true empty edges (keep intentional blank middle lines)
  while (lines.length && lines[0] === '') lines.shift();
  while (lines.length && lines[lines.length - 1] === '') lines.pop();

  if (lines.length === 0) return '';

  return lines
    .map((line) => {
      // Soft breaks inside a paragraph (rare after translate)
      const withSoftBreaks = line.replace(new RegExp(SOFT_BREAK, 'g'), '<br>');
      const trimmed = withSoftBreaks.trim();
      if (!trimmed || trimmed === '<br>') return '<p><br></p>';

      const html = trimmed
        .split(/<br>/i)
        .map((part) => escapeHtml(part))
        .join('<br>');
      return `<p>${html}</p>`;
    })
    .join('');
}

export function shouldSkipTranslation(text: string): boolean {
  if (!text?.trim()) return false;
  return stripHtmlForTranslation(text) === '-';
}

export function isPlainFieldEmpty(value?: string | null): boolean {
  return !value?.trim();
}

export function isHtmlFieldEmpty(value?: string | null): boolean {
  if (!value?.trim()) return true;
  return stripHtmlForTranslation(value).length === 0;
}

export function getEmptyBeritaRequiredFields(formData: {
  judul: string;
  konten: string;
  kategori_id?: number;
  kategori?: string;
}): string[] {
  const emptyFields: string[] = [];

  if (isPlainFieldEmpty(formData.judul)) emptyFields.push('Judul');
  if (isHtmlFieldEmpty(formData.konten)) emptyFields.push('Konten');
  if (!formData.kategori_id && isPlainFieldEmpty(formData.kategori)) {
    emptyFields.push('Kategori');
  }

  return emptyFields;
}

export async function translateBeritaText(
  text: string,
  targetLang: 'en' | 'ar'
): Promise<string> {
  if (!text?.trim()) return '';
  if (shouldSkipTranslation(text)) return text;

  const sourceIsHtml = looksLikeHtml(text);
  // Soft-break marker is only for structure; send a normal space to the API
  const textOnly = stripHtmlForTranslation(text).replace(
    new RegExp(SOFT_BREAK, 'g'),
    ' '
  );
  if (!textOnly) return text;

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: textOnly, targetLang }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.error ||
      data.note ||
      `Translation API returned ${response.status}`;
    throw new Error(errorMsg);
  }

  if (data.error || !data.translatedText) {
    const errorMsg =
      data.error ||
      data.note ||
      'Layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual.';
    throw new Error(errorMsg);
  }

  const translated = String(data.translatedText);

  if (translated.trim() === '') {
    throw new Error('Translation service returned empty text');
  }

  // Guard: never accept Indonesian leftover as Arabic
  if (targetLang === 'ar') {
    const plain = stripHtmlForTranslation(translated);
    if (!hasArabicScript(plain) || isMostlyLatin(plain)) {
      throw new Error(
        'Hasil terjemahan Arab tidak valid. Silakan coba lagi atau isi manual.'
      );
    }
  }

  // Konten uses RichTextEditor — restore Enter as HTML paragraphs (1:1)
  if (sourceIsHtml) {
    return plainTextToRichHtml(translated);
  }

  return translated;
}

export async function fillBeritaTranslationField(
  sourceText: string,
  enValue: string | undefined,
  arValue: string | undefined
): Promise<{ en: string; ar: string }> {
  if (shouldSkipTranslation(sourceText)) {
    return { en: sourceText, ar: sourceText };
  }

  // Sequential EN → AR. Re-translate AR if existing value is still Indonesian.
  const en = enValue?.trim()
    ? enValue
    : await translateBeritaText(sourceText, 'en');
  const ar = isUsableArabicTranslation(arValue)
    ? arValue!
    : await translateBeritaText(sourceText, 'ar');

  return {
    en: en || enValue || '',
    ar: ar || '',
  };
}
