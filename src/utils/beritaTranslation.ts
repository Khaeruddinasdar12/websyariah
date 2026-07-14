function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strip HTML for translation while preserving Enter/paragraph structure as newlines.
 * TipTap uses </p> for Enter and <br> for soft breaks.
 */
export function stripHtmlForTranslation(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    // Block ends → paragraph break (matches Enter in the editor)
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
    // Soft line break
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(ul|ol|table|thead|tbody|tfoot)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Collapse spaces/tabs only (keep newlines/Enter)
    .replace(/[ \t]+/g, ' ')
    // Trim spaces around newlines without removing blank lines entirely
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    // Cap runaway blank lines, but keep double Enter as paragraph gap
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

/**
 * Convert plain text (with newlines) back to TipTap-friendly HTML paragraphs
 * so Enter spacing from Indonesian source is visible in EN/AR editors.
 */
export function plainTextToRichHtml(text: string): string {
  if (!text?.trim()) return '';

  // Split on one-or-more newlines; empty slots = intentional blank paragraph
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  // Group consecutive non-empty lines into paragraphs; empty lines create gaps
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length > 0) {
      paragraphs.push(buffer.join('<br>'));
      buffer = [];
    }
  };

  for (const line of lines) {
    if (line.trim() === '') {
      flush();
      // Preserve blank Enter as empty paragraph (visible gap in TipTap)
      paragraphs.push('');
    } else {
      buffer.push(escapeHtml(line.trim()));
    }
  }
  flush();

  // Drop leading/trailing empty paragraphs only
  while (paragraphs.length && paragraphs[0] === '') paragraphs.shift();
  while (paragraphs.length && paragraphs[paragraphs.length - 1] === '') {
    paragraphs.pop();
  }

  if (paragraphs.length === 0) return '';

  return paragraphs
    .map((p) => (p === '' ? '<p><br></p>' : `<p>${p}</p>`))
    .join('');
}

function looksLikeHtml(text: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(text);
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
  const textOnly = stripHtmlForTranslation(text);
  if (!textOnly) return text;

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: textOnly, targetLang }),
  });

  if (!response.ok) {
    throw new Error(`Translation API returned ${response.status}`);
  }

  const data = await response.json();

  if (data.error || !data.translatedText) {
    const errorMsg =
      data.error ||
      data.note ||
      'Layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual.';
    throw new Error(errorMsg);
  }

  const translated = String(data.translatedText);

  if (stripHtmlForTranslation(translated) === textOnly || translated.trim() === '') {
    throw new Error('Translation service returned unchanged text');
  }

  // Konten uses RichTextEditor — restore Enter as HTML paragraphs
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

  const [en, ar] = await Promise.all([
    enValue?.trim() ? enValue : translateBeritaText(sourceText, 'en'),
    arValue?.trim() ? arValue : translateBeritaText(sourceText, 'ar'),
  ]);

  return {
    en: en || enValue || '',
    ar: ar || arValue || '',
  };
}
