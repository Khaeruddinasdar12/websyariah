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

    const status = data.error && !data.configured ? 503 : 200;

    return NextResponse.json(data, {
      status,
      headers: {
        // Always fresh — Refresh button must get new GA data
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Statistik API error:', error);
    return NextResponse.json(
      {
        configured: false,
        propertyId: null,
        rangeDays: 28,
        dateRange: { startDate: '', endDate: '' },
        overview: {
          activeUsers: 0,
          newUsers: 0,
          returningUsers: 0,
          sessions: 0,
          engagedSessions: 0,
          screenPageViews: 0,
          eventCount: 0,
          bounceRate: 0,
          engagementRate: 0,
          averageSessionDuration: 0,
          sessionsPerUser: 0,
          viewsPerSession: 0,
        },
        timeseries: [],
        topPages: [],
        topLandingPages: [],
        topSources: [],
        topChannels: [],
        topCountries: [],
        topCities: [],
        devices: [],
        browsers: [],
        operatingSystems: [],
        topEvents: [],
        byDayOfWeek: [],
        byHour: [],
        fetchedAt: new Date().toISOString(),
        error: error?.message || 'Gagal memuat statistik.',
      },
      { status: 500 }
    );
  }
}
