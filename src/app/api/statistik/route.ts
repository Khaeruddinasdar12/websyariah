import { NextRequest, NextResponse } from 'next/server';
import { fetchGaDashboard, type GaRangeDays } from '@/lib/ga-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseRange(value: string | null): GaRangeDays {
  const n = Number(value || 28);
  if (n === 7 || n === 90) return n;
  return 28;
}

export async function GET(request: NextRequest) {
  try {
    const rangeDays = parseRange(request.nextUrl.searchParams.get('range'));
    const data = await fetchGaDashboard(rangeDays);

    // Cache briefly on CDN/browser to avoid burning GA API quota
    const status = data.error && !data.configured ? 503 : 200;

    return NextResponse.json(data, {
      status,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Statistik API error:', error);
    return NextResponse.json(
      {
        configured: false,
        propertyId: null,
        rangeDays: 28,
        overview: {
          activeUsers: 0,
          sessions: 0,
          screenPageViews: 0,
          bounceRate: 0,
          averageSessionDuration: 0,
        },
        timeseries: [],
        topPages: [],
        topSources: [],
        topCountries: [],
        devices: [],
        fetchedAt: new Date().toISOString(),
        error: error?.message || 'Gagal memuat statistik.',
      },
      { status: 500 }
    );
  }
}
