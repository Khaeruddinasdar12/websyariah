import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** WhatsApp often drops previews above ~300KB; stay well under. */
const MAX_BYTES = 200_000;
const SIZE_STEPS: Array<[number, number]> = [
  [1200, 630],
  [1000, 525],
  [800, 420],
  [640, 336],
];

function isAllowedImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    return true;
  } catch {
    return false;
  }
}

async function optimizeWithSharp(input: Buffer): Promise<Buffer | null> {
  try {
    const sharp = (await import('sharp')).default;
    let best: Buffer | null = null;

    for (const [width, height] of SIZE_STEPS) {
      for (let quality = 68; quality >= 28; quality -= 8) {
        const output = await sharp(input)
          .rotate()
          .resize(width, height, {
            fit: 'cover',
            position: 'centre',
            withoutEnlargement: false,
          })
          .jpeg({
            quality,
            mozjpeg: true,
            progressive: true,
            chromaSubsampling: '4:2:0',
          })
          .toBuffer();

        if (!best || output.length < best.length) {
          best = output;
        }

        if (output.length <= MAX_BYTES) {
          return output;
        }
      }
    }

    // Last resort: tiny thumbnail
    const tiny = await sharp(input)
      .rotate()
      .resize(480, 252, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 24, mozjpeg: true, progressive: true })
      .toBuffer();

    return tiny.length <= (best?.length ?? Infinity) ? tiny : best;
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
      signal: AbortSignal.timeout(20000),
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

    if (!optimized) {
      if (input.length <= MAX_BYTES) {
        const contentType =
          upstream.headers.get('content-type') || 'image/jpeg';
        return new NextResponse(input, {
          headers: {
            'Content-Type': contentType,
            'Content-Length': String(input.length),
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          },
        });
      }
      return NextResponse.json(
        { error: 'Image too large and optimizer unavailable' },
        { status: 500 }
      );
    }

    const body = new Uint8Array(optimized);
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(body.byteLength),
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
