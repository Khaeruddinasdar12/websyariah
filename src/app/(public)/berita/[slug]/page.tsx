import type { Metadata } from 'next';
import BeritaDetailClient from './BeritaDetailClient';
import {
  extractBeritaIdFromSlug,
  getBeritaById,
  getSiteUrl,
  stripHtml,
} from '@/lib/berita-server';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const beritaId = extractBeritaIdFromSlug(slug);

  if (!beritaId) {
    return { title: 'Berita tidak ditemukan' };
  }

  const berita = await getBeritaById(beritaId);

  if (!berita) {
    return { title: 'Berita tidak ditemukan' };
  }

  const title = berita.judul;
  const description = stripHtml(berita.konten).slice(0, 160) || title;
  const pageUrl = `${getSiteUrl()}/berita/${slug}`;

  const openGraphImages = berita.gambar
    ? [
        {
          url: berita.gambar,
          width: 1200,
          height: 630,
          alt: title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
      siteName: 'FSHI IAIN Bone',
      locale: 'id_ID',
      images: openGraphImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: berita.gambar ? [berita.gambar] : undefined,
    },
  };
}

export default function BeritaDetailPage() {
  return <BeritaDetailClient />;
}
