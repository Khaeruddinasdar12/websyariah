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
 * newline sequence that followed each block (e.g. "\n").
 */
function splitTextIntoChunks(text: string, maxLen = CHUNK_SIZE): TextChunk[] {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.trim() && normalized.indexOf('\n') === -1) return [];

  // Keep empty paragraphs (intentional blank Enter) as empty text chunks
  const lines = normalized.split('\n');
  const chunks: TextChunk[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trailingBreak = i < lines.length - 1 ? '\n' : '';

    if (line.length <= maxLen) {
      chunks.push({ text: line, trailingBreak });
      continue;
    }

    let remaining = line;
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
        trailingBreak: isLast ? trailingBreak : ' ',
      });
    });
  }

  return chunks;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLangCode: string
): Promise<string | null> {
  const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLangCode}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(myMemoryUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();

    // MyMemory returns 200 with INVALID QUERY / QUOTA in body sometimes
    if (data.responseStatus && Number(data.responseStatus) !== 200) {
      console.log('MyMemory status:', data.responseStatus, data.responseDetails);
      return null;
    }

    if (data.responseData?.translatedText) {
      const translated = String(data.responseData.translatedText).trim();
      // Ignore known error payloads returned as "translation"
      if (
        !translated ||
        /MYMEMORY WARNING|INVALID|QUERY LENGTH|NO QUERY/i.test(translated)
      ) {
        return null;
      }
      return translated;
    }
    return null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.log('MyMemory error:', err?.message || err);
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
  const timeoutId = setTimeout(() => controller.abort(), 20000);

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
    if (translated) return translated;
    return null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.log('LibreTranslate error:', err?.message || err);
    return null;
  }
}

async function translateChunkOnce(
  text: string,
  sourceLang: string,
  targetLangCode: string
): Promise<{ translated: string; service: string } | null> {
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

  return null;
}

async function translateChunkWithRetry(
  text: string,
  sourceLang: string,
  targetLangCode: string,
  retries = 2
): Promise<{ translated: string; service: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await delay(500 * attempt);

    const result = await translateChunkOnce(text, sourceLang, targetLangCode);
    if (result) return result;
  }

  // Soft fallback: keep original text for this chunk so the whole article
  // still returns instead of a hard 500 (common when Arabic quota/rate-limits).
  console.log('Chunk translate failed after retries, keeping source text');
  return { translated: text, service: 'fallback-source' };
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
    let translatedCount = 0;
    let fallbackCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      // Slow down a bit for Arabic / multi-chunk to reduce free-API 429/500
      if (i > 0 && chunks[i].text.trim()) {
        await delay(targetLangCode === 'ar' ? 400 : 250);
      }

      const { translated, service } = await translateChunkWithRetry(
        chunks[i].text,
        sourceLang,
        targetLangCode
      );

      fullTranslation += translated + chunks[i].trailingBreak;

      if (service === 'fallback-source') {
        fallbackCount++;
      } else if (service !== 'passthrough') {
        usedService = service;
        translatedCount++;
      }
    }

    if (!fullTranslation.trim()) {
      return NextResponse.json(
        {
          error:
            'Semua layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual.',
          translatedText: null,
        },
        { status: 500 }
      );
    }

    // If nothing was actually translated, surface as error
    if (translatedCount === 0 && fallbackCount > 0) {
      return NextResponse.json(
        {
          error:
            'Layanan terjemahan sedang sibuk atau tidak tersedia. Silakan coba lagi sebentar.',
          translatedText: null,
          note: 'Coba lagi dalam beberapa detik, atau isi terjemahan secara manual.',
        },
        { status: 503 }
      );
    }

    console.log(
      `Translation done (${usedService}, ok=${translatedCount}, fallback=${fallbackCount}): ${fullTranslation.substring(0, 50)}...`
    );

    return NextResponse.json({
      translatedText: fullTranslation,
      success: true,
      service: usedService,
      chunks: chunks.length,
      translatedCount,
      fallbackCount,
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
