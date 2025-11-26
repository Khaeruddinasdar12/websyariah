import { NextRequest, NextResponse } from 'next/server';

// Simple translation mapping for common words (fallback)
const categoryTranslations: Record<string, { en: string; ar: string }> = {
  'Umum': { en: 'General', ar: 'عام' },
  'Pendidikan': { en: 'Education', ar: 'تعليم' },
  'Agama': { en: 'Religion', ar: 'دين' },
  'Hukum': { en: 'Law', ar: 'قانون' },
  'Ekonomi': { en: 'Economy', ar: 'اقتصاد' },
};

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
        translatedText: categoryTranslations[text][targetLang as 'en' | 'ar'] || text 
      });
    }

    // Try multiple translation services with fallback
    const sourceLang = 'id';
    const targetLangCode = targetLang === 'en' ? 'en' : targetLang === 'ar' ? 'ar' : 'id';
    
    // Limit text length for API (max 500 characters per request for free APIs)
    const textToTranslate = text.length > 500 ? text.substring(0, 500) : text;
    
    console.log(`Translating "${textToTranslate.substring(0, 50)}..." from ${sourceLang} to ${targetLangCode}`);
    
    // Try MyMemory Translation API first (free, stable, 10000 chars/day)
    try {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${sourceLang}|${targetLangCode}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      const response = await fetch(myMemoryUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
          const translated = data.responseData.translatedText.trim();
          
          if (translated && translated !== textToTranslate && translated.length > 0) {
            console.log('MyMemory translation successful:', translated.substring(0, 50) + '...');
            return NextResponse.json({ 
              translatedText: translated,
              success: true,
              service: 'mymemory'
            });
          }
        }
      }
      
      // If MyMemory fails, try fallback
      console.log('MyMemory failed, trying fallback...');
    } catch (myMemoryError: any) {
      console.log('MyMemory error:', myMemoryError.message);
      // Continue to fallback
    }

    // Fallback: Try LibreTranslate (if available)
    try {
      const libreTranslateUrl = process.env.TRANSLATE_API_URL || 'https://libretranslate.de/translate';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(libreTranslateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: textToTranslate,
          source: sourceLang,
          target: targetLangCode,
          format: 'text',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (data.translatedText && data.translatedText.trim() && data.translatedText !== textToTranslate) {
          console.log('LibreTranslate successful:', data.translatedText.substring(0, 50) + '...');
          return NextResponse.json({ 
            translatedText: data.translatedText,
            success: true,
            service: 'libretranslate'
          });
        }
      }
    } catch (libreError: any) {
      console.log('LibreTranslate error:', libreError.message);
      // Continue to final fallback
    }

    // Final fallback: Simple word-by-word translation for common words
    // This is a very basic fallback and won't work well for sentences
    throw new Error('Semua layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual.');
  } catch (error: any) {
    console.error('Translation error:', error);
    // Return error with user-friendly message
    const errorMessage = error.message || 'Layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual.';
    return NextResponse.json({ 
      error: errorMessage,
      translatedText: null,
      note: 'Layanan terjemahan tidak tersedia. Silakan isi terjemahan secara manual atau coba lagi nanti.'
    }, { status: 500 });
  }
}

