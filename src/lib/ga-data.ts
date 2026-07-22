import { BetaAnalyticsDataClient } from '@google-analytics/data';
import type {
  GaDashboardData,
  GaOverview,
  GaRangeDays,
  GaRankedItem,
  GaTimePoint,
} from '@/types/ga-statistik';

export type {
  GaDashboardData,
  GaOverview,
  GaRangeDays,
  GaRankedItem,
  GaTimePoint,
};

function getPropertyId(): string | null {
  return process.env.GA_PROPERTY_ID?.trim() || null;
}

function buildCredentials() {
  const jsonRaw = process.env.GA_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw);
      return {
        client_email: parsed.client_email as string,
        private_key: String(parsed.private_key || '').replace(/\\n/g, '\n'),
      };
    } catch {
      throw new Error(
        'GA_SERVICE_ACCOUNT_JSON tidak valid. Pastikan isi JSON service account lengkap dalam satu baris (escape newline dengan \\n).'
      );
    }
  }

  const email = process.env.GA_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (email && privateKey) {
    return { client_email: email, private_key: privateKey };
  }

  return null;
}

function createClient() {
  const credentials = buildCredentials();
  if (!credentials) return null;

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
}

function formatGaDate(yyyymmdd: string): string {
  if (!/^\d{8}$/.test(yyyymmdd)) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function fillTimeseries(
  rows: GaTimePoint[],
  rangeDays: GaRangeDays
): GaTimePoint[] {
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = addDays(end, -(rangeDays - 1));

  const filled: GaTimePoint[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    const key = toYmd(cursor);
    filled.push(
      byDate.get(key) || {
        date: key,
        activeUsers: 0,
        sessions: 0,
        screenPageViews: 0,
        newUsers: 0,
      }
    );
  }
  return filled;
}

function metricValue(
  row:
    | {
        metricValues?: Array<{ value?: string | null }> | null;
      }
    | null
    | undefined,
  index: number
): number {
  const raw = row?.metricValues?.[index]?.value;
  const n = Number(raw || 0);
  return Number.isFinite(n) ? n : 0;
}

function emptyOverview(): GaOverview {
  return {
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
  };
}

function emptyLists() {
  return {
    timeseries: [] as GaTimePoint[],
    topPages: [] as GaRankedItem[],
    topLandingPages: [] as GaRankedItem[],
    topSources: [] as GaRankedItem[],
    topChannels: [] as GaRankedItem[],
    topCountries: [] as GaRankedItem[],
    topCities: [] as GaRankedItem[],
    devices: [] as GaRankedItem[],
    browsers: [] as GaRankedItem[],
    operatingSystems: [] as GaRankedItem[],
    topEvents: [] as GaRankedItem[],
    byDayOfWeek: [] as GaRankedItem[],
    byHour: [] as GaRankedItem[],
  };
}

const DAY_NAMES: Record<string, string> = {
  '0': 'Minggu',
  '1': 'Senin',
  '2': 'Selasa',
  '3': 'Rabu',
  '4': 'Kamis',
  '5': 'Jumat',
  '6': 'Sabtu',
};

function mapRanked(
  rows: Array<{
    dimensionValues?: Array<{ value?: string | null }> | null;
    metricValues?: Array<{ value?: string | null }> | null;
  }> | null | undefined,
  nameTransform?: (name: string) => string,
  secondaryIndex?: number
): GaRankedItem[] {
  return (rows || []).map((row) => {
    const rawName = row.dimensionValues?.[0]?.value || '(not set)';
    const item: GaRankedItem = {
      name: nameTransform ? nameTransform(rawName) : rawName,
      value: metricValue(row, 0),
    };
    if (secondaryIndex != null) {
      item.secondary = metricValue(row, secondaryIndex);
    }
    return item;
  });
}

function sortDayOfWeek(items: GaRankedItem[]): GaRankedItem[] {
  const order = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  return [...items].sort(
    (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
  );
}

function sortHour(items: GaRankedItem[]): GaRankedItem[] {
  return [...items].sort((a, b) => Number(a.name) - Number(b.name));
}

export function getGaSetupHint(): string {
  return [
    '1. Buat Service Account di Google Cloud Console (API & Services > Credentials).',
    '2. Aktifkan "Google Analytics Data API".',
    '3. Download JSON key service account.',
    '4. Di Google Analytics > Admin > Property Access Management, undang email service account sebagai Viewer.',
    '5. Set env: GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY (atau GA_SERVICE_ACCOUNT_JSON).',
    'Property ID angka ada di Admin GA > Property Settings (bukan G-XXXXXXXX).',
    'Pastikan Property ID adalah properti FSHI (stream G-Z34XPQ6BKW), bukan properti lain.',
  ].join('\n');
}

export async function fetchGaDashboard(
  rangeDays: GaRangeDays = 28
): Promise<GaDashboardData> {
  const propertyId = getPropertyId();
  const fetchedAt = new Date().toISOString();
  const startDate = `${rangeDays - 1}daysAgo`;
  const endDate = 'today';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangeStart = addDays(today, -(rangeDays - 1));

  const base: GaDashboardData = {
    configured: false,
    propertyId,
    rangeDays,
    dateRange: {
      startDate: toYmd(rangeStart),
      endDate: toYmd(today),
    },
    overview: emptyOverview(),
    ...emptyLists(),
    fetchedAt,
  };

  if (!propertyId) {
    return {
      ...base,
      error: 'GA_PROPERTY_ID belum dikonfigurasi.',
      setupHint: getGaSetupHint(),
    };
  }

  let client: BetaAnalyticsDataClient | null = null;
  try {
    client = createClient();
  } catch (err: any) {
    return {
      ...base,
      error: err?.message || 'Kredensial GA tidak valid.',
      setupHint: getGaSetupHint(),
    };
  }

  if (!client) {
    return {
      ...base,
      error: 'Kredensial service account belum dikonfigurasi.',
      setupHint: getGaSetupHint(),
    };
  }

  const property = `properties/${propertyId}`;
  const dateRanges = [{ startDate, endDate }];

  try {
    const [
      overviewRes,
      overviewExtraRes,
      seriesRes,
      pagesRes,
      landingRes,
      sourcesRes,
      channelsRes,
      countriesRes,
      citiesRes,
      devicesRes,
      browsersRes,
      osRes,
      eventsRes,
      dowRes,
      hourRes,
      newVsReturningRes,
    ] = await Promise.all([
      client.runReport({
        property,
        dateRanges,
        // GA Data API max 10 metrics per request
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'screenPageViews' },
          { name: 'eventCount' },
          { name: 'bounceRate' },
          { name: 'engagementRate' },
          { name: 'averageSessionDuration' },
          { name: 'sessionsPerUser' },
        ],
      }),
      client.runReport({
        property,
        dateRanges,
        metrics: [{ name: 'screenPageViewsPerSession' }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'newUsers' },
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'landingPage' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'city' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 5,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'browser' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 6,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'operatingSystem' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 6,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'dayOfWeek' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'dayOfWeek' } }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'hour' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'hour' } }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'newVsReturning' }],
        metrics: [{ name: 'activeUsers' }],
      }),
    ]);

    const overviewRow = overviewRes[0]?.rows?.[0];
    const overviewExtraRow = overviewExtraRes[0]?.rows?.[0];
    const activeUsers = metricValue(overviewRow, 0);
    const newUsers = metricValue(overviewRow, 1);
    const sessions = metricValue(overviewRow, 2);

    const newReturningRows = newVsReturningRes[0]?.rows || [];
    let returningUsers = 0;
    for (const row of newReturningRows) {
      const label = (row.dimensionValues?.[0]?.value || '').toLowerCase();
      if (label.includes('returning')) {
        returningUsers = metricValue(row, 0);
      }
    }
    if (!returningUsers && activeUsers >= newUsers) {
      returningUsers = Math.max(activeUsers - newUsers, 0);
    }

    const overview: GaOverview = {
      activeUsers,
      newUsers,
      returningUsers,
      sessions,
      engagedSessions: metricValue(overviewRow, 3),
      screenPageViews: metricValue(overviewRow, 4),
      eventCount: metricValue(overviewRow, 5),
      bounceRate: metricValue(overviewRow, 6),
      engagementRate: metricValue(overviewRow, 7),
      averageSessionDuration: metricValue(overviewRow, 8),
      sessionsPerUser: metricValue(overviewRow, 9),
      viewsPerSession: metricValue(overviewExtraRow, 0),
    };

    const rawSeries: GaTimePoint[] = (seriesRes[0]?.rows || []).map((row) => ({
      date: formatGaDate(row.dimensionValues?.[0]?.value || ''),
      activeUsers: metricValue(row, 0),
      sessions: metricValue(row, 1),
      screenPageViews: metricValue(row, 2),
      newUsers: metricValue(row, 3),
    }));

    return {
      configured: true,
      propertyId,
      rangeDays,
      dateRange: base.dateRange,
      overview,
      timeseries: fillTimeseries(rawSeries, rangeDays),
      topPages: mapRanked(pagesRes[0]?.rows, undefined, 1),
      topLandingPages: mapRanked(landingRes[0]?.rows, undefined, 1),
      topSources: mapRanked(sourcesRes[0]?.rows, undefined, 1),
      topChannels: mapRanked(channelsRes[0]?.rows, undefined, 1),
      topCountries: mapRanked(countriesRes[0]?.rows, undefined, 1),
      topCities: mapRanked(citiesRes[0]?.rows, undefined, 1),
      devices: mapRanked(devicesRes[0]?.rows),
      browsers: mapRanked(browsersRes[0]?.rows),
      operatingSystems: mapRanked(osRes[0]?.rows),
      topEvents: mapRanked(eventsRes[0]?.rows),
      byDayOfWeek: sortDayOfWeek(
        mapRanked(dowRes[0]?.rows, (n) => DAY_NAMES[n] || n)
      ),
      byHour: sortHour(
        mapRanked(hourRes[0]?.rows, (n) => `${String(n).padStart(2, '0')}:00`)
      ),
      fetchedAt,
    };
  } catch (err: any) {
    const message =
      err?.details || err?.message || 'Gagal mengambil data Google Analytics.';
    return {
      ...base,
      configured: true,
      error: String(message),
      setupHint: getGaSetupHint(),
    };
  }
}
