'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ApexOptions } from 'apexcharts';
import type { GaDashboardData, GaRangeDays } from '@/types/ga-statistik';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID').format(Math.round(n));
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return '0d';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m <= 0) return `${s}d`;
  return `${m}m ${s}d`;
}

function formatPercent(rate: number): string {
  // GA bounceRate is already 0–1 in Data API
  const pct = rate <= 1 ? rate * 100 : rate;
  return `${pct.toFixed(1)}%`;
}

function formatDateLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

const RANGES: { value: GaRangeDays; label: string }[] = [
  { value: 7, label: '7 hari' },
  { value: 28, label: '28 hari' },
  { value: 90, label: '90 hari' },
];

export default function StatistikDashboard() {
  const [range, setRange] = useState<GaRangeDays>(28);
  const [data, setData] = useState<GaDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (days: GaRangeDays) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/statistik?range=${days}`, {
        cache: 'no-store',
      });
      const json = (await res.json()) as GaDashboardData;
      setData(json);
      if (json.error) setError(json.error);
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
      colors: ['#38bdf8', '#34d399', '#a78bfa'],
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: { opacityFrom: 0.35, opacityTo: 0.02 },
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
        categories: (data?.timeseries || []).map((p) => formatDateLabel(p.date)),
        labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: '#94a3b8' },
          formatter: (v) => formatNumber(v),
        },
      },
      tooltip: { theme: 'dark' },
    }),
    [data?.timeseries]
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

  const deviceSeries = useMemo(
    () => (data?.devices || []).map((d) => d.value),
    [data?.devices]
  );

  const cards = [
    {
      label: 'Pengunjung aktif',
      value: formatNumber(data?.overview.activeUsers || 0),
      hint: 'Active users',
    },
    {
      label: 'Sesi',
      value: formatNumber(data?.overview.sessions || 0),
      hint: 'Sessions',
    },
    {
      label: 'Pageview',
      value: formatNumber(data?.overview.screenPageViews || 0),
      hint: 'Views',
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
  ];

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
            Laporan kunjungan website FSHI IAIN Bone. Halaman ini publik tanpa
            login admin dan tidak ditampilkan di menu utama.
          </p>
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
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            Refresh
          </button>
        </div>
      </header>

      {loading && (
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

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-white">Tren kunjungan</h2>
          {data?.fetchedAt && (
            <p className="text-xs text-slate-500">
              Diperbarui{' '}
              {new Date(data.fetchedAt).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>
        {(data?.timeseries?.length || 0) > 0 ? (
          <ReactApexChart
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

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 lg:col-span-1">
          <h2 className="mb-4 text-lg font-medium text-white">Perangkat</h2>
          {(data?.devices?.length || 0) > 0 ? (
            <ReactApexChart
              options={deviceOptions}
              series={deviceSeries}
              type="donut"
              height={280}
            />
          ) : (
            <p className="text-sm text-slate-500">Belum ada data perangkat.</p>
          )}
        </div>

        <RankedList
          title="Halaman teratas"
          items={data?.topPages || []}
          empty="Belum ada data halaman."
        />
        <RankedList
          title="Sumber traffic"
          items={data?.topSources || []}
          empty="Belum ada data sumber."
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankedList
          title="Negara"
          items={data?.topCountries || []}
          empty="Belum ada data negara."
        />
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-medium text-white">Catatan</h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              Measurement ID:{' '}
              <code className="text-sky-300">
                {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-Z34XPQ6BKW'}
              </code>
            </li>
            <li>
              Property ID:{' '}
              <code className="text-sky-300">{data?.propertyId || '—'}</code>
            </li>
            <li>
              Data diambil dari Google Analytics Data API (bukan laporan Realtime).
            </li>
            <li>
              URL ini tidak ditambahkan ke menu navigasi situs.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function RankedList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { name: string; value: number }[];
  empty: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-medium text-white">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={`${title}-${item.name}`}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-slate-200" title={item.name}>
                  {item.name}
                </span>
                <span className="shrink-0 text-slate-400">
                  {formatNumber(item.value)}
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
