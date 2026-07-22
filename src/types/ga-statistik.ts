export type GaRangeDays = 7 | 28 | 90;

export interface GaOverview {
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  sessions: number;
  engagedSessions: number;
  screenPageViews: number;
  eventCount: number;
  bounceRate: number;
  engagementRate: number;
  averageSessionDuration: number;
  sessionsPerUser: number;
  viewsPerSession: number;
}

export interface GaTimePoint {
  date: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  newUsers: number;
}

export interface GaRankedItem {
  name: string;
  value: number;
  secondary?: number;
}

export interface GaDashboardData {
  configured: boolean;
  propertyId: string | null;
  rangeDays: GaRangeDays;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  overview: GaOverview;
  timeseries: GaTimePoint[];
  topPages: GaRankedItem[];
  topLandingPages: GaRankedItem[];
  topSources: GaRankedItem[];
  topChannels: GaRankedItem[];
  topCountries: GaRankedItem[];
  topCities: GaRankedItem[];
  devices: GaRankedItem[];
  browsers: GaRankedItem[];
  operatingSystems: GaRankedItem[];
  topEvents: GaRankedItem[];
  byDayOfWeek: GaRankedItem[];
  byHour: GaRankedItem[];
  fetchedAt: string;
  error?: string;
  setupHint?: string;
}
