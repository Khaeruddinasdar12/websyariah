import { NextRequest, NextResponse } from 'next/server';

// Simple translation mapping for common words (fallback)
const categoryTranslations: Record<string, { en: string; ar: string }> = {
  'Umum': { en: 'General', ar: 'عام' },
  'Pendidikan': { en: 'Education', ar: 'تعليم' },
  'Agama': { en: 'Religion', ar: 'دين' },
  'Hukum': { en: 'Law', ar: 'قانون' },
  'Ekonomi': { en: 'Economy', ar: 'اقتصاد' },
};

/** Max chars per free-API request (MyMemory/LibreTranslate). */
const CHUNK_SIZE = 450;

type TextChunk = { text: string; joiner: ' ' | '\n\n' };

/**
 * Split text into chunks near CHUNK_SIZE, preferring paragraph then sentence boundaries
 * so translations are not cut mid-sentence.
 */
function splitTextIntoChunks(text: string, maxLen = CHUNK_SIZE): TextChunk[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  if (normalized.length <= maxLen) return [{ text: normalized, joiner: ' ' }];

  const chunks: TextChunk[] = [];
  let remaining = normalized;

  while (remaining.length > maxLen) {
    let splitAt = -1;
    let joiner: ' ' | '\n\n' = ' ';
    const window = remaining.slice(0, maxLen);

    // Prefer paragraph break
    const doubleBreak = window.lastIndexOf('\n\n');
    const singleBreak = window.lastIndexOf('\n');
    const paraBreak = Math.max(doubleBreak, singleBreak);
    if (paraBreak > maxLen * 0.3) {
      splitAt = paraBreak;
      joiner = '\n\n';
    }

    // Prefer sentence end (. ! ? …) followed by space or end
    if (splitAt === -1) {
      const sentenceMatch = [...window.matchAll(/[.!?…](?=\s|$)/g)];
      if (sentenceMatch.length > 0) {
        const last = sentenceMatch[sentenceMatch.length - 1];
        const idx = (last.index ?? 0) + last[0].length;
        if (idx > maxLen * 0.3) splitAt = idx;
      }
    }

    // Prefer soft punctuation / space
    if (splitAt === -1) {
      const softBreak = Math.max(
        window.lastIndexOf('; '),
        window.lastIndexOf(', '),
        window.lastIndexOf(' ')
      );
      if (softBreak > maxLen * 0.3) {
        splitAt = softBreak;
      }
    }

    if (splitAt <= 0) splitAt = maxLen;

    const piece = remaining.slice(0, splitAt).trim();
    remaining = remaining.slice(splitAt).trim();
    if (piece) chunks.push({ text: piece, joiner });
  }

  if (remaining) chunks.push({ text: remaining, joiner: ' ' });
  return chunks;
}

async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLangCode: string
): Promise<string | null> {
  const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLangCode}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(myMemoryUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (
      data.responseStatus === 200 &&
      data.responseData?.translatedText
    ) {
      const translated = String(data.responseData.translatedText).trim();
      if (translated && translated.length > 0 && translated !== text) {
        return translated;
      }
    }
    return null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function translateWithLibreTranslate(
  text: string,
  sourceLang: string,
  targetLangCode: string
): Promise<string | null> {
  const libreTranslateUrl =
    process.env.TRANSLATE_API_URL || 'https://libretranslate.de/translate';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(libreTranslateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLangCode,
        format: 'text',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const translated = data.translatedText?.trim();
    if (translated && translated !== text) {
      return translated;
    }
    return null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function translateChunk(
  text: string,
  sourceLang: string,
  targetLangCode: string
): Promise<{ translated: string; service: string }> {
  const myMemory = await translateWithMyMemory(text, sourceLang, targetLangCode);
  if (myMemory) {
    return { translated: myMemory, service: 'mymemory' };
  }

  const libre = await translateWithLibreTranslate(
    text,
    sourceLang,
    targetLangCode
  );
  if (libre) {
    return { translated: libre, service: 'libretranslate' };
  }

  throw new Error(
    'Semua layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual.'
  );
}

/** Small delay between chunk requests to reduce free-API rate limiting. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Text and targetLang are required' },
        { status: 400 }
      );
    }

    // Check if it's a category (simple word)
    if (categoryTranslations[text]) {
      return NextResponse.json({
        translatedText:
          categoryTranslations[text][targetLang as 'en' | 'ar'] || text,
      });
    }

    const sourceLang = 'id';
    const targetLangCode =
      targetLang === 'en' ? 'en' : targetLang === 'ar' ? 'ar' : 'id';

    const chunks = splitTextIntoChunks(String(text));
    console.log(
      `Translating ${chunks.length} chunk(s) (${String(text).length} chars) from ${sourceLang} to ${targetLangCode}`
    );

    const translatedParts: string[] = [];
    let usedService = 'mymemory';

    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) await delay(300);

      const { translated, service } = await translateChunk(
        chunks[i].text,
        sourceLang,
        targetLangCode
      );
      translatedParts.push(translated);
      usedService = service;
    }

    let fullTranslation = translatedParts[0] || '';
    for (let i = 1; i < translatedParts.length; i++) {
      const joiner = chunks[i - 1].joiner;
      fullTranslation += joiner + translatedParts[i];
    }
    fullTranslation = fullTranslation.replace(/[ \t]+/g, ' ').trim();

    if (!fullTranslation) {
      throw new Error(
        'Semua layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual.'
      );
    }

    console.log(
      `Translation successful (${usedService}): ${fullTranslation.substring(0, 50)}...`
    );

    return NextResponse.json({
      translatedText: fullTranslation,
      success: true,
      service: usedService,
      chunks: chunks.length,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    const errorMessage =
      error.message ||
      'Layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual.';
    return NextResponse.json(
      {
        error: errorMessage,
        translatedText: null,
        note: 'Layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual atau coba lagi nanti.',
      },
      { status: 500 }
    );
  }
}
