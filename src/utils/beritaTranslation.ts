export function stripHtmlForTranslation(text: string): string {
  return text
    // Keep paragraph / line breaks so long articles can be chunked cleanly
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(ul|ol|table|thead|tbody|tfoot)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

  const translated = data.translatedText;

  if (translated === textOnly || translated.trim() === '') {
    throw new Error('Translation service returned unchanged text');
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
