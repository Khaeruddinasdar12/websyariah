import { NextRequest, NextResponse } from 'next/server';
import {
  jpegResponse,
  OG_MAX_BYTES,
  optimizeOgJpeg,
} from '@/lib/og-image';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowedImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    return true;
  } catch {
    return false;
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
    const optimized = await optimizeOgJpeg(input);

    if (!optimized) {
      if (input.length <= OG_MAX_BYTES) {
        const contentType =
          upstream.headers.get('content-type') || 'image/jpeg';
        return new NextResponse(input, {
          headers: {
            'Content-Type': contentType,
            'Content-Length': String(input.length),
            'Cache-Control':
              'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        });
      }
      return NextResponse.json(
        { error: 'Image too large and optimizer unavailable' },
        { status: 500 }
      );
    }

    return jpegResponse(optimized);
  } catch (error: any) {
    console.error('OG image route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to build OG image' },
      { status: 500 }
    );
  }
}
