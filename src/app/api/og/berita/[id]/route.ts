import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  jpegResponse,
  OG_MAX_BYTES,
  optimizeOgJpeg,
} from '@/lib/og-image';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = Number.parseInt(rawId, 10);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid berita id' }, { status: 400 });
  }

  const supabase = createPublicClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('beritas')
      .select('gambar')
      .eq('id', id)
      .single();

    if (error || !data?.gambar) {
      return NextResponse.json({ error: 'Berita image not found' }, { status: 404 });
    }

    const source = String(data.gambar).trim();
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
        return jpegResponse(input);
      }
      return NextResponse.json(
        { error: 'Image too large and optimizer unavailable' },
        { status: 500 }
      );
    }

    return jpegResponse(optimized);
  } catch (error: any) {
    console.error('OG berita route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to build OG image' },
      { status: 500 }
    );
  }
}
