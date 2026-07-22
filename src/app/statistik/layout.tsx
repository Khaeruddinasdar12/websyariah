import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Statistik Situs | FSHI IAIN Bone',
  description: 'Dashboard laporan kunjungan website dari Google Analytics',
  robots: {
    index: false,
    follow: false,
  },
};

export default function StatistikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100 antialiased">
      {children}
    </div>
  );
}
