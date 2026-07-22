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

/** Penjelasan singkat untuk pengguna awam */
const METRIC_DESCRIPTIONS = {
  activeUsers:
    'Jumlah orang unik yang mengunjungi situs dalam periode ini. Satu orang hanya dihitung sekali meski datang berkali-kali.',
  newUsers:
    'Pengunjung yang pertama kali datang ke situs. Bagus untuk melihat pertumbuhan audiens baru.',
  returningUsers:
    'Pengunjung yang pernah datang sebelumnya lalu kembali lagi. Menandakan audiens yang sudah mengenal situs.',
  sessions:
    'Satu kali kunjungan ke situs. Buka situs pagi dan sore = 2 sesi. Satu sesi bisa melihat banyak halaman.',
  engagedSessions:
    'Kunjungan yang cukup lama atau interaktif (bukan langsung keluar). Semakin tinggi, semakin baik.',
  pageview:
    'Berapa kali halaman situs dibuka. Baca 3 berita = 3 pageview. Bisa lebih banyak dari jumlah pengunjung.',
  eventCount:
    'Total aksi yang tercatat di situs, misalnya klik, scroll, atau unduh. Setiap interaksi kecil bisa dihitung.',
  engagementRate:
    'Persentase kunjungan yang benar-benar “terlibat” dengan situs. Semakin tinggi, konten semakin menarik.',
  bounceRate:
    'Persentase pengunjung yang langsung pergi tanpa melihat halaman lain. Semakin rendah, semakin baik.',
  avgSessionDuration:
    'Rata-rata lama pengunjung tinggal di situs dalam satu kunjungan.',
  sessionsPerUser:
    'Rata-rata berapa kali satu orang mengunjungi situs. Angka di atas 1 berarti ada yang kembali lagi.',
  viewsPerSession:
    'Rata-rata berapa halaman dibuka dalam satu kunjungan. Tinggi = pengunjung eksplorasi banyak konten.',
  trend:
    'Grafik per hari: biru = pengunjung, hijau = sesi, ungu = pageview, kuning = pengunjung baru.',
  newVsReturning:
    'Perbandingan pengunjung pertama kali vs yang sudah pernah datang. Menunjukkan loyalitas audiens.',
  devices:
    'Perangkat yang dipakai: HP (mobile), komputer (desktop), atau tablet.',
  channels:
    'Dari mana pengunjung datang: langsung ketik URL, Google, media sosial, link dari situs lain, dll.',
  topPages:
    'Halaman yang paling sering dibuka. Berguna untuk tahu konten/berita mana yang paling diminati.',
  landingPages:
    'Halaman pertama yang dibuka saat pengunjung masuk. Ini “pintu masuk” utama ke situs Anda.',
  sources:
    'Sumber asal kunjungan, misalnya Google, Facebook, atau ketik alamat langsung (direct).',
  topEvents:
    'Aksi yang paling sering dilakukan pengunjung, misalnya klik menu, scroll, atau buka link.',
  countries: 'Negara asal pengunjung berdasarkan lokasi perangkat/internet.',
  cities: 'Kota asal pengunjung yang paling aktif mengakses situs.',
  browsers: 'Program penjelajah web yang dipakai, misalnya Chrome, Safari, atau Edge.',
  os: 'Sistem operasi perangkat: Android, iOS, Windows, macOS, dll.',
  dayOfWeek:
    'Hari dalam seminggu dengan pengunjung terbanyak. Cocok untuk menentukan hari terbaik publish berita.',
  hourOfDay:
    'Jam dalam sehari dengan pengunjung terbanyak. Cocok untuk waktu promosi atau posting.',
} as const;

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
      description: METRIC_DESCRIPTIONS.activeUsers,
    },
    {
      label: 'Pengunjung baru',
      value: formatNumber(data?.overview.newUsers || 0),
      description: METRIC_DESCRIPTIONS.newUsers,
    },
    {
      label: 'Pengunjung kembali',
      value: formatNumber(data?.overview.returningUsers || 0),
      description: METRIC_DESCRIPTIONS.returningUsers,
    },
    {
      label: 'Sesi',
      value: formatNumber(data?.overview.sessions || 0),
      description: METRIC_DESCRIPTIONS.sessions,
    },
    {
      label: 'Sesi engaged',
      value: formatNumber(data?.overview.engagedSessions || 0),
      description: METRIC_DESCRIPTIONS.engagedSessions,
    },
    {
      label: 'Pageview',
      value: formatNumber(data?.overview.screenPageViews || 0),
      description: METRIC_DESCRIPTIONS.pageview,
    },
    {
      label: 'Jumlah peristiwa',
      value: formatNumber(data?.overview.eventCount || 0),
      description: METRIC_DESCRIPTIONS.eventCount,
    },
    {
      label: 'Engagement rate',
      value: formatPercent(data?.overview.engagementRate || 0),
      description: METRIC_DESCRIPTIONS.engagementRate,
    },
    {
      label: 'Bounce rate',
      value: formatPercent(data?.overview.bounceRate || 0),
      description: METRIC_DESCRIPTIONS.bounceRate,
    },
    {
      label: 'Durasi sesi rata-rata',
      value: formatDuration(data?.overview.averageSessionDuration || 0),
      description: METRIC_DESCRIPTIONS.avgSessionDuration,
    },
    {
      label: 'Sesi / pengunjung',
      value: formatDecimal(data?.overview.sessionsPerUser || 0),
      description: METRIC_DESCRIPTIONS.sessionsPerUser,
    },
    {
      label: 'Pageview / sesi',
      value: formatDecimal(data?.overview.viewsPerSession || 0),
      description: METRIC_DESCRIPTIONS.viewsPerSession,
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
      <section className="mb-6">
        <div className="mb-3">
          <h2 className="text-lg font-medium text-white">Ringkasan utama</h2>
          <p className="text-xs text-slate-500">
            Angka-angka penting dalam periode yang dipilih, beserta penjelasan
            singkat di setiap kartu.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* Trend */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium text-white">Tren kunjungan</h2>
            <p className="text-xs text-slate-500">{METRIC_DESCRIPTIONS.trend}</p>
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
        <Panel
          title="Baru vs kembali"
          subtitle="Komposisi audiens"
          description={METRIC_DESCRIPTIONS.newVsReturning}
        >
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

        <Panel
          title="Perangkat"
          subtitle="Mobile / desktop / tablet"
          description={METRIC_DESCRIPTIONS.devices}
        >
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

        <Panel
          title="Channel traffic"
          subtitle="Asal kunjungan"
          description={METRIC_DESCRIPTIONS.channels}
        >
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
          subtitle="Konten paling banyak dibaca"
          description={METRIC_DESCRIPTIONS.topPages}
          items={data?.topPages || []}
          empty="Belum ada data halaman."
          valueLabel="tampilan"
        />
        <RankedList
          title="Landing page"
          subtitle="Halaman pertama saat masuk"
          description={METRIC_DESCRIPTIONS.landingPages}
          items={data?.topLandingPages || []}
          empty="Belum ada data landing page."
          valueLabel="sesi"
        />
        <RankedList
          title="Sumber traffic"
          subtitle="Dari mana pengunjung datang"
          description={METRIC_DESCRIPTIONS.sources}
          items={data?.topSources || []}
          empty="Belum ada data sumber."
          valueLabel="sesi"
        />
        <RankedList
          title="Event teratas"
          subtitle="Aksi yang paling sering dilakukan"
          description={METRIC_DESCRIPTIONS.topEvents}
          items={data?.topEvents || []}
          empty="Belum ada data event."
          valueLabel="kali"
        />
      </section>

      {/* Geography & tech */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <RankedList
          title="Negara"
          subtitle="Lokasi pengunjung"
          description={METRIC_DESCRIPTIONS.countries}
          items={data?.topCountries || []}
          empty="Belum ada data negara."
        />
        <RankedList
          title="Kota"
          subtitle="Kota dengan pengunjung terbanyak"
          description={METRIC_DESCRIPTIONS.cities}
          items={data?.topCities || []}
          empty="Belum ada data kota."
        />
        <RankedList
          title="Browser"
          subtitle="Aplikasi penjelajah web"
          description={METRIC_DESCRIPTIONS.browsers}
          items={data?.browsers || []}
          empty="Belum ada data browser."
        />
        <RankedList
          title="Sistem operasi"
          subtitle="OS perangkat pengunjung"
          description={METRIC_DESCRIPTIONS.os}
          items={data?.operatingSystems || []}
          empty="Belum ada data OS."
        />
      </section>

      {/* Timing patterns — best for scheduling content */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Hari tersibuk"
          subtitle="Aktivitas per hari dalam seminggu"
          description={METRIC_DESCRIPTIONS.dayOfWeek}
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
          subtitle="Aktivitas per jam dalam sehari"
          description={METRIC_DESCRIPTIONS.hourOfDay}
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
        <h2 className="mb-3 text-lg font-medium text-white">
          Kamus istilah singkat
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm text-slate-400">
          <GlossaryItem term="Sesi" text={METRIC_DESCRIPTIONS.sessions} />
          <GlossaryItem term="Pageview" text={METRIC_DESCRIPTIONS.pageview} />
          <GlossaryItem term="Event / peristiwa" text={METRIC_DESCRIPTIONS.eventCount} />
          <GlossaryItem term="Bounce rate" text={METRIC_DESCRIPTIONS.bounceRate} />
          <GlossaryItem term="Engagement rate" text={METRIC_DESCRIPTIONS.engagementRate} />
          <GlossaryItem term="Landing page" text={METRIC_DESCRIPTIONS.landingPages} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
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

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div
      className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-4 shadow-xl shadow-black/20"
      title={description}
    >
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-3 group-hover:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function GlossaryItem({ term, text }: { term: string; text: string }) {
  return (
    <div>
      <p className="font-medium text-slate-300">{term}</p>
      <p className="mt-1 text-xs leading-relaxed">{text}</p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  description,
  children,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs font-medium text-slate-400">{subtitle}</p>}
      {description && (
        <p className="mb-4 mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
      )}
      {!description && <div className="mb-4" />}
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
  description,
  items,
  empty,
  valueLabel,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  items: GaRankedItem[];
  empty: string;
  valueLabel?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs font-medium text-slate-400">{subtitle}</p>}
      {description && (
        <p className="mb-4 mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
      )}
      {!description && <div className="mb-4" />}
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
