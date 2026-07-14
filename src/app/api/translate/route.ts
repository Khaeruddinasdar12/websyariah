import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// Simple translation mapping for common words (fallback)
const categoryTranslations: Record<string, { en: string; ar: string }> = {
  'Umum': { en: 'General', ar: 'عام' },
  'Pendidikan': { en: 'Education', ar: 'تعليم' },
  'Agama': { en: 'Religion', ar: 'دين' },
  'Hukum': { en: 'Law', ar: 'قانون' },
  'Ekonomi': { en: 'Economy', ar: 'اقتصاد' },
};

/** Max chars per request chunk (keep under typical free-API limits). */
const CHUNK_SIZE = 450;

/** Optional email raises MyMemory daily quota (anonymous → 50k chars). */
const MYMEMORY_EMAIL =
  process.env.MYMEMORY_EMAIL || 'admin@syariah.iain-bone.ac.id';

type TextChunk = { text: string; trailingBreak: string };

function splitTextIntoChunks(text: string, maxLen = CHUNK_SIZE): TextChunk[] {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.trim() && normalized.indexOf('\n') === -1) return [];

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

/** True if text contains Arabic letters. */
function hasArabicScript(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/** True if text is mostly Latin letters (Indonesian/English). */
function isMostlyLatin(text: string): boolean {
  const letters = text.replace(/[^A-Za-z\u0600-\u06FF]/g, '');
  if (!letters) return false;
  const latin = (letters.match(/[A-Za-z]/g) || []).length;
  return latin / letters.length > 0.6;
}

/**
 * Google Translate free endpoint (client=gtx). Works well for id→ar.
 * Response: [[["translated","source",...],...],...]
 */
async function translateWithGoogle(
  text: string,
  sourceLang: string,
  targetLangCode: string
): Promise<string | null> {
  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx&sl=${encodeURIComponent(sourceLang)}` +
    `&tl=${encodeURIComponent(targetLangCode)}` +
    `&dt=t&q=${encodeURIComponent(text)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; WebSyariahTranslate/1.0; +https://syariah.iain-bone.ac.id)',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data?.[0])) return null;

    const translated = data[0]
      .map((part: unknown) =>
        Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''
      )
      .join('')
      .trim();

    return translated || null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.log('Google Translate error:', err?.message || err);
    return null;
  }
}

async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLangCode: string
): Promise<string | null> {
  // Max ~500 bytes for MyMemory — skip oversized pieces
  if (new TextEncoder().encode(text).length > 480) return null;

  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLang}|${targetLangCode}`,
    de: MYMEMORY_EMAIL,
  });
  const myMemoryUrl = `https://api.mymemory.translated.net/get?${params.toString()}`;

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

    if (data.quotaFinished) {
      console.log('MyMemory quota finished');
      return null;
    }

    if (data.responseStatus && Number(data.responseStatus) !== 200) {
      console.log('MyMemory status:', data.responseStatus, data.responseDetails);
      return null;
    }

    if (data.responseData?.translatedText) {
      const translated = String(data.responseData.translatedText).trim();
      if (
        !translated ||
        /MYMEMORY WARNING|INVALID|QUERY LENGTH|NO QUERY|QUOTA/i.test(translated)
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
    process.env.TRANSLATE_API_URL || 'https://libretranslate.com/translate';

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

/**
 * Validate that the result looks like a real translation for the target language.
 * For Arabic: must contain Arabic script and not be mostly Latin source leftover.
 */
function isValidTranslation(
  source: string,
  translated: string,
  targetLangCode: string
): boolean {
  if (!translated?.trim()) return false;

  if (targetLangCode === 'ar') {
    if (!hasArabicScript(translated)) return false;
    // Reject if still mostly Latin (Indonesian left in AR field)
    if (isMostlyLatin(translated) && !hasArabicScript(source)) return false;
    return true;
  }

  // English: reject if identical to source for longer phrases
  if (targetLangCode === 'en') {
    if (translated === source && source.split(/\s+/).length > 3) return false;
  }

  return true;
}

async function translateChunkOnce(
  text: string,
  sourceLang: string,
  targetLangCode: string
): Promise<{ translated: string; service: string } | null> {
  if (!text.trim()) {
    return { translated: text, service: 'passthrough' };
  }

  // 1) Google (most reliable for id→ar)
  const google = await translateWithGoogle(text, sourceLang, targetLangCode);
  if (google && isValidTranslation(text, google, targetLangCode)) {
    return { translated: google, service: 'google' };
  }

  // 2) MyMemory
  const myMemory = await translateWithMyMemory(text, sourceLang, targetLangCode);
  if (myMemory && isValidTranslation(text, myMemory, targetLangCode)) {
    return { translated: myMemory, service: 'mymemory' };
  }

  // 3) LibreTranslate (optional / self-hosted)
  const libre = await translateWithLibreTranslate(
    text,
    sourceLang,
    targetLangCode
  );
  if (libre && isValidTranslation(text, libre, targetLangCode)) {
    return { translated: libre, service: 'libretranslate' };
  }

  // 4) Arabic pivot: id → en → ar (when direct id→ar providers fail)
  if (targetLangCode === 'ar' && sourceLang === 'id') {
    const en =
      (await translateWithGoogle(text, 'id', 'en')) ||
      (await translateWithMyMemory(text, 'id', 'en'));
    if (en) {
      const ar =
        (await translateWithGoogle(en, 'en', 'ar')) ||
        (await translateWithMyMemory(en, 'en', 'ar'));
      if (ar && isValidTranslation(text, ar, 'ar')) {
        return { translated: ar, service: 'pivot-id-en-ar' };
      }
    }
  }

  return null;
}

async function translateChunkWithRetry(
  text: string,
  sourceLang: string,
  targetLangCode: string,
  retries = 2
): Promise<{ translated: string; service: string } | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await delay(600 * attempt);

    const result = await translateChunkOnce(text, sourceLang, targetLangCode);
    if (result) return result;
  }

  return null;
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
    let usedService = 'google';
    let translatedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i].text;

      if (!chunkText.trim()) {
        fullTranslation += chunkText + chunks[i].trailingBreak;
        continue;
      }

      if (i > 0) {
        await delay(targetLangCode === 'ar' ? 200 : 120);
      }

      const result = await translateChunkWithRetry(
        chunkText,
        sourceLang,
        targetLangCode
      );

      if (!result) {
        failedCount++;
        console.log(
          `Chunk ${i + 1}/${chunks.length} failed for ${targetLangCode}`
        );
        // Do NOT put Indonesian into Arabic field — skip failed chunk with marker
        if (targetLangCode === 'ar') {
          fullTranslation += chunks[i].trailingBreak;
        } else {
          // For EN, keep source so partial news is still usable
          fullTranslation += chunkText + chunks[i].trailingBreak;
        }
        continue;
      }

      fullTranslation += result.translated + chunks[i].trailingBreak;
      if (result.service !== 'passthrough') {
        usedService = result.service;
        translatedCount++;
      }
    }

    fullTranslation = fullTranslation.replace(/\n{3,}/g, '\n\n').trim();

    if (!fullTranslation.trim() || translatedCount === 0) {
      return NextResponse.json(
        {
          error:
            targetLangCode === 'ar'
              ? 'Gagal menerjemahkan ke Bahasa Arab. Silakan coba lagi atau isi manual.'
              : 'Layanan terjemahan sedang sibuk. Silakan coba lagi sebentar.',
          translatedText: null,
          failedCount,
        },
        { status: 503 }
      );
    }

    // Arabic must actually look Arabic — never accept mostly-Latin body
    if (targetLangCode === 'ar' && isMostlyLatin(fullTranslation)) {
      return NextResponse.json(
        {
          error:
            'Hasil terjemahan Arab tidak valid (masih Bahasa Indonesia). Silakan coba lagi.',
          translatedText: null,
        },
        { status: 503 }
      );
    }

    console.log(
      `Translation done (${usedService}, ok=${translatedCount}, failed=${failedCount}): ${fullTranslation.substring(0, 50)}...`
    );

    return NextResponse.json({
      translatedText: fullTranslation,
      success: true,
      service: usedService,
      chunks: chunks.length,
      translatedCount,
      failedCount,
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
