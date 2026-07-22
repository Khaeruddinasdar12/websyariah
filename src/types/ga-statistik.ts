export type GaRangeDays = 7 | 28 | 90;

export interface GaOverview {
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  bounceRate: number;
  averageSessionDuration: number;
}

export interface GaTimePoint {
  date: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
}

export interface GaRankedItem {
  name: string;
  value: number;
}

export interface GaDashboardData {
  configured: boolean;
  propertyId: string | null;
  rangeDays: GaRangeDays;
  overview: GaOverview;
  timeseries: GaTimePoint[];
  topPages: GaRankedItem[];
  topSources: GaRankedItem[];
  topCountries: GaRankedItem[];
  devices: GaRankedItem[];
  fetchedAt: string;
  error?: string;
  setupHint?: string;
}
