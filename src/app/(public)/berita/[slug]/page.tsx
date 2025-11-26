"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Berita {
  id: number;
  judul: string;
  konten: string;
  gambar: string;
  kategori: string;
  kategori_en?: string;
  kategori_ar?: string;
  judul_en?: string;
  konten_en?: string;
  judul_ar?: string;
  konten_ar?: string;
  created_at?: string;
}

export default function BeritaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { t, language } = useLanguage();
  const [berita, setBerita] = useState<Berita | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to get localized category
  const getLocalizedCategory = (item: Berita | null): string => {
    if (!item) return '';
    if (language === 'en' && item.kategori_en) return item.kategori_en;
    if (language === 'ar' && item.kategori_ar) return item.kategori_ar;
    return item.kategori || 'Umum';
  };
  
  // Helper function to get localized title
  const getLocalizedTitle = (item: Berita | null): string => {
    if (!item) return '';
    if (language === 'en' && item.judul_en) return item.judul_en;
    if (language === 'ar' && item.judul_ar) return item.judul_ar;
    return item.judul || '';
  };
  
  // Helper function to get localized content
  const getLocalizedContent = (item: Berita | null): string => {
    if (!item) return '';
    if (language === 'en' && item.konten_en) return item.konten_en;
    if (language === 'ar' && item.konten_ar) return item.konten_ar;
    return item.konten || '';
  };

  // Set page title dynamically
  usePageTitle(getLocalizedTitle(berita) || t('nav.news'));

  useEffect(() => {
    async function fetchBeritaDetail() {
      try {
        setLoading(true);
        setError(null);

        // Extract ID from slug (format: title-slug-id)
        const idMatch = slug?.match(/-(\d+)$/);
        if (!idMatch) {
          throw new Error('Invalid berita slug');
        }
        const beritaId = parseInt(idMatch[1], 10);

        const { data, error: fetchError } = await supabase
          .from('beritas')
          .select('*')
          .eq('id', beritaId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setBerita(data as Berita);
        } else {
          setError('Berita tidak ditemukan');
        }
      } catch (err: any) {
        console.error('Error fetching berita detail:', err);
        setError(err?.message || 'Gagal memuat detail berita');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchBeritaDetail();
    }
  }, [slug, language]);

  // Helper function to format date
  function formatDate(dateString?: string): string {
    if (!dateString) return new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-sage-green mb-4"></i>
          <p className="text-gray-600">{t('news.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !berita) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('news.noNews')}</h2>
          <p className="text-gray-600 mb-6">{error || t('news.noNews')}</p>
          <Link
            href="/berita"
            className="inline-block bg-gradient-to-r from-sage-green to-soft-green text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-500 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            {t('news.backToNews')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-outfit">
      {/* Header */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/berita"
            className="inline-flex items-center text-gray-700 hover:text-primary transition-colors font-medium mb-4 text-base"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            {t('news.backToNews')}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center text-gray-600 text-sm">
              <i className="fas fa-calendar-alt mr-2"></i>
              <span>{formatDate(berita.created_at)}</span>
            </div>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
              {getLocalizedCategory(berita)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">{getLocalizedTitle(berita)}</h1>

        {/* Featured Image */}
        {berita.gambar && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={berita.gambar}
              alt={getLocalizedTitle(berita)}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const nextSibling = target.nextElementSibling as HTMLElement;
                if (nextSibling) nextSibling.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
              <i className="fas fa-image text-4xl text-sage-green/50"></i>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-700 leading-relaxed berita-content"
            dangerouslySetInnerHTML={{ __html: getLocalizedContent(berita) }}
          />
        </div>
        
        <style jsx global>{`
          .berita-content {
            line-height: 1.8;
          }
          .berita-content p {
            margin-bottom: 1.25em;
            color: #374151;
          }
          .berita-content h1,
          .berita-content h2,
          .berita-content h3,
          .berita-content h4,
          .berita-content h5,
          .berita-content h6 {
            font-weight: 700;
            margin-top: 1.5em;
            margin-bottom: 0.75em;
            color: #111827;
          }
          .berita-content h1 { font-size: 2em; }
          .berita-content h2 { font-size: 1.5em; }
          .berita-content h3 { font-size: 1.25em; }
          .berita-content ul,
          .berita-content ol {
            margin: 1em 0;
            padding-left: 2em;
          }
          .berita-content li {
            margin: 0.5em 0;
          }
          .berita-content a {
            color: #3b82f6;
            text-decoration: underline;
          }
          .berita-content a:hover {
            color: #2563eb;
          }
          .berita-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1.5em 0;
          }
          .berita-content blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1em;
            margin: 1.5em 0;
            font-style: italic;
            color: #6b7280;
          }
          .berita-content code {
            background-color: #f3f4f6;
            padding: 0.2em 0.4em;
            border-radius: 0.25rem;
            font-size: 0.9em;
            color: #dc2626;
          }
          .berita-content pre {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 1em;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5em 0;
          }
          .berita-content pre code {
            background-color: transparent;
            padding: 0;
            color: inherit;
          }
          .dark .berita-content {
            color: #d1d5db;
          }
          .dark .berita-content p {
            color: #d1d5db;
          }
          .dark .berita-content h1,
          .dark .berita-content h2,
          .dark .berita-content h3,
          .dark .berita-content h4,
          .dark .berita-content h5,
          .dark .berita-content h6 {
            color: #f9fafb;
          }
          .dark .berita-content code {
            background-color: #374151;
            color: #fca5a5;
          }
          .dark .berita-content blockquote {
            border-left-color: #4b5563;
            color: #9ca3af;
          }
        `}</style>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">{t('news.share')}:</span>
              <div className="flex gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&text=${encodeURIComponent(getLocalizedTitle(berita))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(getLocalizedTitle(berita) + (typeof window !== 'undefined' ? ' ' + window.location.href : ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
            <Link
              href="/berita"
              className="inline-flex items-center text-sage-green hover:text-emerald-600 font-semibold transition-colors group"
            >
              <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
              {t('news.backToList')}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

