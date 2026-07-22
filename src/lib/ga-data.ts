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

function metricValue(
  row: { metricValues?: Array<{ value?: string | null }> } | undefined,
  index: number
): number {
  const raw = row?.metricValues?.[index]?.value;
  const n = Number(raw || 0);
  return Number.isFinite(n) ? n : 0;
}

function emptyOverview(): GaOverview {
  return {
    activeUsers: 0,
    sessions: 0,
    screenPageViews: 0,
    bounceRate: 0,
    averageSessionDuration: 0,
  };
}

export function getGaSetupHint(): string {
  return [
    '1. Buat Service Account di Google Cloud Console (API & Services > Credentials).',
    '2. Aktifkan "Google Analytics Data API".',
    '3. Download JSON key service account.',
    '4. Di Google Analytics > Admin > Property Access Management, undang email service account sebagai Viewer.',
    '5. Set env: GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY (atau GA_SERVICE_ACCOUNT_JSON).',
    'Property ID angka ada di Admin GA > Property Settings (bukan G-XXXXXXXX).',
  ].join('\n');
}

export async function fetchGaDashboard(
  rangeDays: GaRangeDays = 28
): Promise<GaDashboardData> {
  const propertyId = getPropertyId();
  const fetchedAt = new Date().toISOString();
  const startDate = `${rangeDays}daysAgo`;
  const endDate = 'yesterday';

  const base: GaDashboardData = {
    configured: false,
    propertyId,
    rangeDays,
    overview: emptyOverview(),
    timeseries: [],
    topPages: [],
    topSources: [],
    topCountries: [],
    devices: [],
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

  try {
    const [
      overviewRes,
      seriesRes,
      pagesRes,
      sourcesRes,
      countriesRes,
      devicesRes,
    ] = await Promise.all([
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 5,
      }),
    ]);

    const overviewRow = overviewRes[0]?.rows?.[0];
    const overview: GaOverview = {
      activeUsers: metricValue(overviewRow, 0),
      sessions: metricValue(overviewRow, 1),
      screenPageViews: metricValue(overviewRow, 2),
      bounceRate: metricValue(overviewRow, 3),
      averageSessionDuration: metricValue(overviewRow, 4),
    };

    const timeseries: GaTimePoint[] = (seriesRes[0]?.rows || []).map((row) => ({
      date: formatGaDate(row.dimensionValues?.[0]?.value || ''),
      activeUsers: metricValue(row, 0),
      sessions: metricValue(row, 1),
      screenPageViews: metricValue(row, 2),
    }));

    const mapRanked = (
      report: typeof pagesRes,
      metricIndex = 0
    ): GaRankedItem[] =>
      (report[0]?.rows || []).map((row) => ({
        name: row.dimensionValues?.[0]?.value || '(not set)',
        value: metricValue(row, metricIndex),
      }));

    return {
      configured: true,
      propertyId,
      rangeDays,
      overview,
      timeseries,
      topPages: mapRanked(pagesRes),
      topSources: mapRanked(sourcesRes),
      topCountries: mapRanked(countriesRes),
      devices: mapRanked(devicesRes),
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
