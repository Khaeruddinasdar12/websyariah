'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ApexOptions } from 'apexcharts';
import type { GaDashboardData, GaRangeDays, GaRankedItem } from '@/types/ga-statistik';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(n || 0));
}

function formatDecimal(n: number, digits = 2): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n || 0);
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return '0d';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m <= 0) return `${s}d`;
  return `${m}m ${s}d`;
}

function formatPercent(rate: number): string {
  const pct = rate <= 1 ? rate * 100 : rate;
  return `${pct.toFixed(1)}%`;
}

function formatDateLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatRangeLabel(start?: string, end?: string): string {
  if (!start || !end) return '';
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return `${start} – ${end}`;
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  return `${s.toLocaleDateString('id-ID', opts)} – ${e.toLocaleDateString('id-ID', opts)}`;
}

const RANGES: { value: GaRangeDays; label: string }[] = [
  { value: 7, label: '7 hari' },
  { value: 28, label: '28 hari' },
  { value: 90, label: '90 hari' },
];

function barChartOptions(
  categories: string[],
  horizontal = false
): ApexOptions {
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Outfit, system-ui, sans-serif',
      background: 'transparent',
    },
    theme: { mode: 'dark' },
    colors: ['#38bdf8'],
    plotOptions: {
      bar: {
        horizontal,
        borderRadius: 4,
        columnWidth: '55%',
        barHeight: '70%',
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: 'rgba(148,163,184,0.15)',
      strokeDashArray: 4,
    },
    xaxis: {
      categories,
      labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px' },
        formatter: (v) => (horizontal ? String(v) : formatNumber(Number(v))),
        maxWidth: horizontal ? 120 : undefined,
      },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (v) => formatNumber(Number(v)) },
    },
  };
}

export default function StatistikDashboard() {
  const [range, setRange] = useState<GaRangeDays>(7);
  const [data, setData] = useState<GaDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (days: GaRangeDays) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/statistik?range=${days}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
      });
      const json = (await res.json()) as GaDashboardData;
      setData(json);
      if (json.error) setError(json.error);
      else setError(null);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  useEffect(() => {
    const id = window.setInterval(() => load(range), 120_000);
    return () => window.clearInterval(id);
  }, [range, load]);

  const categories = useMemo(
    () => (data?.timeseries || []).map((p) => formatDateLabel(p.date)),
    [data?.timeseries]
  );

  const lineOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'area',
        toolbar: { show: false },
        fontFamily: 'Outfit, system-ui, sans-serif',
        background: 'transparent',
        zoom: { enabled: false },
      },
      theme: { mode: 'dark' },
      colors: ['#38bdf8', '#34d399', '#a78bfa', '#fbbf24'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { opacityFrom: 0.35, opacityTo: 0.04 },
      },
      markers: {
        size: 3,
        strokeWidth: 2,
        strokeColors: '#0b1220',
        hover: { size: 5 },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: 'rgba(148,163,184,0.15)',
        strokeDashArray: 4,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        labels: { colors: '#cbd5e1' },
      },
      xaxis: {
        categories,
        labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          style: { colors: '#94a3b8' },
          formatter: (v) => formatNumber(v),
        },
      },
      tooltip: { theme: 'dark', shared: true },
    }),
    [categories]
  );

  const lineSeries = useMemo(
    () => [
      {
        name: 'Pengunjung',
        data: (data?.timeseries || []).map((p) => p.activeUsers),
      },
      {
        name: 'Sesi',
        data: (data?.timeseries || []).map((p) => p.sessions),
      },
      {
        name: 'Pageview',
        data: (data?.timeseries || []).map((p) => p.screenPageViews),
      },
      {
        name: 'Pengunjung baru',
        data: (data?.timeseries || []).map((p) => p.newUsers),
      },
    ],
    [data?.timeseries]
  );

  const deviceOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        fontFamily: 'Outfit, system-ui, sans-serif',
        background: 'transparent',
      },
      theme: { mode: 'dark' },
      labels: (data?.devices || []).map((d) => d.name),
      colors: ['#38bdf8', '#34d399', '#fbbf24', '#f472b6'],
      legend: {
        position: 'bottom',
        labels: { colors: '#cbd5e1' },
      },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Perangkat',
                color: '#94a3b8',
                formatter: () =>
                  formatNumber(
                    (data?.devices || []).reduce((s, d) => s + d.value, 0)
                  ),
              },
            },
          },
        },
      },
      tooltip: { theme: 'dark' },
    }),
    [data?.devices]
  );

  const newReturningOptions: ApexOptions = useMemo(() => {
    const labels = ['Baru', 'Kembali'];
    return {
      chart: {
        type: 'donut',
        fontFamily: 'Outfit, system-ui, sans-serif',
        background: 'transparent',
      },
      theme: { mode: 'dark' },
      labels,
      colors: ['#34d399', '#38bdf8'],
      legend: {
        position: 'bottom',
        labels: { colors: '#cbd5e1' },
      },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Pengunjung',
                color: '#94a3b8',
                formatter: () =>
                  formatNumber(
                    (data?.overview.newUsers || 0) +
                      (data?.overview.returningUsers || 0)
                  ),
              },
            },
          },
        },
      },
      tooltip: { theme: 'dark' },
    };
  }, [data?.overview.newUsers, data?.overview.returningUsers]);

  const dowCategories = (data?.byDayOfWeek || []).map((d) => d.name);
  const hourCategories = (data?.byHour || []).map((d) => d.name);
  const channelCategories = (data?.topChannels || []).map((d) => d.name);

  const cards = [
    {
      label: 'Pengunjung aktif',
      value: formatNumber(data?.overview.activeUsers || 0),
      hint: 'Active users',
    },
    {
      label: 'Pengunjung baru',
      value: formatNumber(data?.overview.newUsers || 0),
      hint: 'New users',
    },
    {
      label: 'Pengunjung kembali',
      value: formatNumber(data?.overview.returningUsers || 0),
      hint: 'Returning users',
    },
    {
      label: 'Sesi',
      value: formatNumber(data?.overview.sessions || 0),
      hint: 'Sessions',
    },
    {
      label: 'Sesi engaged',
      value: formatNumber(data?.overview.engagedSessions || 0),
      hint: 'Engaged sessions',
    },
    {
      label: 'Pageview',
      value: formatNumber(data?.overview.screenPageViews || 0),
      hint: 'Views',
    },
    {
      label: 'Jumlah peristiwa',
      value: formatNumber(data?.overview.eventCount || 0),
      hint: 'Event count',
    },
    {
      label: 'Engagement rate',
      value: formatPercent(data?.overview.engagementRate || 0),
      hint: 'Tingkat engagement',
    },
    {
      label: 'Bounce rate',
      value: formatPercent(data?.overview.bounceRate || 0),
      hint: 'Tingkat pentalan',
    },
    {
      label: 'Durasi sesi rata-rata',
      value: formatDuration(data?.overview.averageSessionDuration || 0),
      hint: 'Avg. session',
    },
    {
      label: 'Sesi / pengunjung',
      value: formatDecimal(data?.overview.sessionsPerUser || 0),
      hint: 'Sessions per user',
    },
    {
      label: 'Pageview / sesi',
      value: formatDecimal(data?.overview.viewsPerSession || 0),
      hint: 'Views per session',
    },
  ];

  const rangeLabel = formatRangeLabel(
    data?.dateRange?.startDate,
    data?.dateRange?.endDate
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-400/80">
            Google Analytics
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Statistik Situs
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Laporan analitik lengkap untuk memahami pengunjung, sumber traffic,
            konten populer, dan pola kunjungan.
          </p>
          {rangeLabel && (
            <p className="mt-2 text-sm text-sky-300/90">Periode: {rangeLabel}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                range === r.value
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {r.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => load(range)}
            disabled={loading}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
          >
            {loading ? 'Memuat…' : 'Refresh'}
          </button>
        </div>
      </header>

      {loading && !data && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          Memuat data Google Analytics…
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
          <p className="font-medium">{error}</p>
          {data?.setupHint && (
            <pre className="mt-3 whitespace-pre-wrap font-sans text-xs text-amber-100/80">
              {data.setupHint}
            </pre>
          )}
        </div>
      )}

      {/* KPI cards */}
      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-4 shadow-xl shadow-black/20"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          </div>
        ))}
      </section>

      {/* Trend */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium text-white">Tren kunjungan</h2>
            <p className="text-xs text-slate-500">
              Pantau pertumbuhan harian pengunjung, sesi, dan pageview
            </p>
          </div>
          {data?.fetchedAt && (
            <p className="text-xs text-slate-500">
              Diperbarui{' '}
              {new Date(data.fetchedAt).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              {' · '}auto-refresh 2 menit
            </p>
          )}
        </div>
        {(data?.timeseries?.length || 0) > 0 ? (
          <ReactApexChart
            key={`trend-${data?.fetchedAt}-${range}`}
            options={lineOptions}
            series={lineSeries}
            type="area"
            height={320}
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">
            Belum ada data tren untuk periode ini.
          </div>
        )}
      </section>

      {/* Audience composition + devices + channels */}
      <section className="mb-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Baru vs kembali" subtitle="Komposisi audiens">
          {(data?.overview.newUsers || 0) + (data?.overview.returningUsers || 0) >
          0 ? (
            <ReactApexChart
              key={`nr-${data?.fetchedAt}`}
              options={newReturningOptions}
              series={[
                data?.overview.newUsers || 0,
                data?.overview.returningUsers || 0,
              ]}
              type="donut"
              height={260}
            />
          ) : (
            <Empty text="Belum ada data audiens." />
          )}
        </Panel>

        <Panel title="Perangkat" subtitle="Mobile / desktop / tablet">
          {(data?.devices?.length || 0) > 0 ? (
            <ReactApexChart
              key={`device-${data?.fetchedAt}`}
              options={deviceOptions}
              series={(data?.devices || []).map((d) => d.value)}
              type="donut"
              height={260}
            />
          ) : (
            <Empty text="Belum ada data perangkat." />
          )}
        </Panel>

        <Panel title="Channel traffic" subtitle="Default channel group">
          {(data?.topChannels?.length || 0) > 0 ? (
            <ReactApexChart
              key={`ch-${data?.fetchedAt}`}
              options={barChartOptions(channelCategories, true)}
              series={[
                {
                  name: 'Sesi',
                  data: (data?.topChannels || []).map((d) => d.value),
                },
              ]}
              type="bar"
              height={260}
            />
          ) : (
            <Empty text="Belum ada data channel." />
          )}
        </Panel>
      </section>

      {/* Content & acquisition */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <RankedList
          title="Halaman teratas"
          subtitle="Pageview tertinggi"
          items={data?.topPages || []}
          empty="Belum ada data halaman."
          valueLabel="views"
        />
        <RankedList
          title="Landing page"
          subtitle="Halaman masuk pertama"
          items={data?.topLandingPages || []}
          empty="Belum ada data landing page."
          valueLabel="sesi"
        />
        <RankedList
          title="Sumber traffic"
          subtitle="Session source"
          items={data?.topSources || []}
          empty="Belum ada data sumber."
          valueLabel="sesi"
        />
        <RankedList
          title="Event teratas"
          subtitle="Peristiwa yang paling sering terjadi"
          items={data?.topEvents || []}
          empty="Belum ada data event."
          valueLabel="event"
        />
      </section>

      {/* Geography & tech */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <RankedList
          title="Negara"
          subtitle="Berdasarkan pengunjung aktif"
          items={data?.topCountries || []}
          empty="Belum ada data negara."
        />
        <RankedList
          title="Kota"
          subtitle="Lokasi pengunjung paling aktif"
          items={data?.topCities || []}
          empty="Belum ada data kota."
        />
        <RankedList
          title="Browser"
          subtitle="Chrome, Safari, dll."
          items={data?.browsers || []}
          empty="Belum ada data browser."
        />
        <RankedList
          title="Sistem operasi"
          subtitle="Android, iOS, Windows, dll."
          items={data?.operatingSystems || []}
          empty="Belum ada data OS."
        />
      </section>

      {/* Timing patterns — best for scheduling content */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Hari tersibuk"
          subtitle="Kapan audiens paling aktif dalam seminggu"
        >
          {(data?.byDayOfWeek?.length || 0) > 0 ? (
            <ReactApexChart
              key={`dow-${data?.fetchedAt}`}
              options={barChartOptions(dowCategories)}
              series={[
                {
                  name: 'Pengunjung',
                  data: (data?.byDayOfWeek || []).map((d) => d.value),
                },
              ]}
              type="bar"
              height={280}
            />
          ) : (
            <Empty text="Belum ada data hari." />
          )}
        </Panel>

        <Panel
          title="Jam tersibuk"
          subtitle="Jam terbaik untuk publish / promosi"
        >
          {(data?.byHour?.length || 0) > 0 ? (
            <ReactApexChart
              key={`hour-${data?.fetchedAt}`}
              options={barChartOptions(hourCategories)}
              series={[
                {
                  name: 'Pengunjung',
                  data: (data?.byHour || []).map((d) => d.value),
                },
              ]}
              type="bar"
              height={280}
            />
          ) : (
            <Empty text="Belum ada data jam." />
          )}
        </Panel>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
        <h2 className="mb-3 text-lg font-medium text-white">Catatan analisa</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>
            Property ID API:{' '}
            <code className="text-sky-300">{data?.propertyId || '—'}</code> —
            pastikan sama dengan properti FSHI (stream{' '}
            <code className="text-sky-300">
              {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-Z34XPQ6BKW'}
            </code>
            ).
          </li>
          <li>
            <strong className="text-slate-300">Engagement rate</strong> tinggi +
            bounce rate rendah = konten menarik perhatian.
          </li>
          <li>
            <strong className="text-slate-300">Landing page & channel</strong>{' '}
            membantu tahu pintu masuk terbaik (mis. Direct, Organic, Social).
          </li>
          <li>
            <strong className="text-slate-300">Hari & jam tersibuk</strong>{' '}
            berguna untuk jadwal publish berita/pengumuman.
          </li>
          <li>
            Data laporan harian bisa tertunda dibanding Realtime GA.
          </li>
        </ul>
      </section>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      {subtitle && <p className="mb-4 text-xs text-slate-500">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-slate-500">{text}</p>;
}

function RankedList({
  title,
  subtitle,
  items,
  empty,
  valueLabel,
}: {
  title: string;
  subtitle?: string;
  items: GaRankedItem[];
  empty: string;
  valueLabel?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      {subtitle && <p className="mb-4 text-xs text-slate-500">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={`${title}-${index}-${item.name}`}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-slate-200" title={item.name}>
                  {item.name === '(not set)' ? 'Tidak diketahui' : item.name}
                </span>
                <span className="shrink-0 text-slate-400">
                  {formatNumber(item.value)}
                  {valueLabel ? (
                    <span className="ml-1 text-[10px] uppercase text-slate-500">
                      {valueLabel}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-400/80"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
