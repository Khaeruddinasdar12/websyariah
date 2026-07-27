import type { Metadata } from 'next';
import BeritaDetailClient from './BeritaDetailClient';
import {
  extractBeritaIdFromSlug,
  getBeritaById,
  getSiteUrl,
  stripHtml,
  toAbsoluteImageUrl,
  toWhatsAppOgImageUrl,
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

  const siteUrl = getSiteUrl();
  const title = berita.meta_title?.trim() || berita.judul;
  const description =
    berita.meta_description?.trim() ||
    stripHtml(berita.konten).slice(0, 160) ||
    title;
  const pageUrl = `${siteUrl}/berita/${slug}`;
  const keywords = berita.meta_keywords?.trim() || undefined;

  const originalImage = toAbsoluteImageUrl(berita.gambar, siteUrl);
  const ogOptimizedImage = toWhatsAppOgImageUrl(berita.gambar, siteUrl);

  // Put optimized (smaller) image first so WhatsApp picks a preview-friendly file.
  // Keep original as fallback for platforms that prefer higher quality.
  const openGraphImages = ogOptimizedImage
    ? [
        {
          url: ogOptimizedImage,
          secureUrl: ogOptimizedImage,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: title,
        },
        ...(originalImage && originalImage !== ogOptimizedImage
          ? [
              {
                url: originalImage,
                secureUrl: originalImage,
                width: 1200,
                height: 630,
                alt: title,
              },
            ]
          : []),
      ]
    : undefined;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
      siteName: 'FSHI IAIN Bone',
      locale: 'id_ID',
      images: openGraphImages,
      publishedTime: berita.created_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogOptimizedImage
        ? [ogOptimizedImage]
        : originalImage
          ? [originalImage]
          : undefined,
    },
  };
}

export default function BeritaDetailPage() {
  return <BeritaDetailClient />;
}
