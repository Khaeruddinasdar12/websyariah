import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 280_000; // WhatsApp reliably shows previews under ~300KB
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 630;

function isAllowedImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    // Allow site assets + common Supabase storage hosts
    const host = url.hostname.toLowerCase();
    if (host.includes('supabase.co')) return true;
    if (host.includes('iain-bone.ac.id')) return true;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    return true; // public berita images may use various CDNs
  } catch {
    return false;
  }
}

async function optimizeWithSharp(input: Buffer): Promise<Buffer | null> {
  try {
    const sharp = (await import('sharp')).default;
    let quality = 72;
    let output = await sharp(input)
      .rotate()
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'centre',
        withoutEnlargement: false,
      })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    while (output.length > MAX_BYTES && quality > 40) {
      quality -= 8;
      output = await sharp(input)
        .rotate()
        .resize(TARGET_WIDTH, TARGET_HEIGHT, {
          fit: 'cover',
          position: 'centre',
        })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    return output;
  } catch (err) {
    console.error('OG image sharp error:', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('url')?.trim();

  if (!source || !isAllowedImageUrl(source)) {
    return NextResponse.json({ error: 'Invalid image url' }, { status: 400 });
  }

  try {
    const upstream = await fetch(source, {
      headers: {
        'User-Agent': 'WebSyariah-OG/1.0',
        Accept: 'image/*,*/*',
      },
      // Avoid hanging WhatsApp crawlers
      signal: AbortSignal.timeout(12000),
      cache: 'force-cache',
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream image failed: ${upstream.status}` },
        { status: 502 }
      );
    }

    const input = Buffer.from(await upstream.arrayBuffer());
    const optimized = await optimizeWithSharp(input);

    // Fallback: serve original if already small enough and JPEG/PNG
    if (!optimized) {
      if (input.length <= MAX_BYTES) {
        const contentType =
          upstream.headers.get('content-type') || 'image/jpeg';
        return new NextResponse(input, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          },
        });
      }
      return NextResponse.json(
        { error: 'Image too large and optimizer unavailable' },
        { status: 500 }
      );
    }

    return new NextResponse(new Uint8Array(optimized), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('OG image route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to build OG image' },
      { status: 500 }
    );
  }
}
