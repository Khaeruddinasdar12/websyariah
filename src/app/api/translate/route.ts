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

type TextChunk = { text: string; trailingBreak: string };

/**
 * Split into paragraph/line blocks first (preserving exact Enter spacing),
 * then split oversized blocks by sentence. trailingBreak mirrors the original
 * newline sequence that followed each block (e.g. "\n" or "\n\n").
 */
function splitTextIntoChunks(text: string, maxLen = CHUNK_SIZE): TextChunk[] {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.trim()) return [];

  const blocks = normalized.split(/(\n+)/);
  const chunks: TextChunk[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;

    // Newline-only segments are attached as trailingBreak of previous text
    if (/^\n+$/.test(block)) {
      if (chunks.length > 0) {
        chunks[chunks.length - 1].trailingBreak += block;
      }
      continue;
    }

    const trailingBreak =
      i + 1 < blocks.length && /^\n+$/.test(blocks[i + 1]) ? blocks[i + 1] : '';
    if (trailingBreak) i++; // consume the break segment now

    if (block.length <= maxLen) {
      chunks.push({ text: block, trailingBreak });
      continue;
    }

    // Oversized paragraph: split by sentence, keep breaks only after last piece
    let remaining = block;
    const pieceChunks: string[] = [];

    while (remaining.length > maxLen) {
      let splitAt = -1;
      const window = remaining.slice(0, maxLen);

      const sentenceMatch = [...window.matchAll(/[.!?…](?=\s|$)/g)];
      if (sentenceMatch.length > 0) {
        const last = sentenceMatch[sentenceMatch.length - 1];
        const idx = (last.index ?? 0) + last[0].length;
        if (idx > maxLen * 0.3) splitAt = idx;
      }

      if (splitAt === -1) {
        const softBreak = Math.max(
          window.lastIndexOf('; '),
          window.lastIndexOf(', '),
          window.lastIndexOf(' ')
        );
        if (softBreak > maxLen * 0.3) splitAt = softBreak;
      }

      if (splitAt <= 0) splitAt = maxLen;

      pieceChunks.push(remaining.slice(0, splitAt).trimEnd());
      remaining = remaining.slice(splitAt).trimStart();
    }

    if (remaining) pieceChunks.push(remaining);

    pieceChunks.forEach((piece, idx) => {
      const isLast = idx === pieceChunks.length - 1;
      chunks.push({
        text: piece,
        // Mid-paragraph sentence splits join with a space (no Enter)
        trailingBreak: isLast ? trailingBreak : ' ',
      });
    });
  }

  return chunks.filter((c) => c.text.trim().length > 0 || c.trailingBreak);
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
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
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
  // Preserve intentional blank lines without calling the API
  if (!text.trim()) {
    return { translated: text, service: 'passthrough' };
  }

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

    let fullTranslation = '';
    let usedService = 'mymemory';
    let translatedAny = false;

    for (let i = 0; i < chunks.length; i++) {
      if (i > 0 && chunks[i].text.trim()) await delay(250);

      const { translated, service } = await translateChunk(
        chunks[i].text,
        sourceLang,
        targetLangCode
      );

      fullTranslation += translated + chunks[i].trailingBreak;
      if (service !== 'passthrough') {
        usedService = service;
        translatedAny = true;
      }
    }

    fullTranslation = fullTranslation.replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n');

    // Keep leading/trailing newlines from source if any meaningful body remains
    fullTranslation = fullTranslation.replace(/[ \t]+$/g, '').replace(/^[ \t]+/g, '');

    if (!fullTranslation.trim() || !translatedAny) {
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
