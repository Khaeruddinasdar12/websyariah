"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Pengumuman {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  judul_en?: string;
  konten_en?: string;
  judul_ar?: string;
  konten_ar?: string;
  created_at?: string;
}

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

export default function PengumumanDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { t, language } = useLanguage();
  const [pengumuman, setPengumuman] = useState<Pengumuman | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to get localized title
  const getLocalizedTitle = (item: Pengumuman | null): string => {
    if (!item) return '';
    if (language === 'en' && item.judul_en) return item.judul_en;
    if (language === 'ar' && item.judul_ar) return item.judul_ar;
    return item.judul || '';
  };
  
  // Helper function to get localized content
  const getLocalizedContent = (item: Pengumuman | null): string => {
    if (!item) return '';
    if (language === 'en' && item.konten_en) return item.konten_en;
    if (language === 'ar' && item.konten_ar) return item.konten_ar;
    return item.konten || '';
  };

  // Set page title dynamically
  usePageTitle(getLocalizedTitle(pengumuman) || t('nav.announcements'));

  useEffect(() => {
    async function fetchPengumumanDetail() {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching pengumuman detail with slug:', slug);

        const { data, error: fetchError } = await supabase
          .from('pengumumans')
          .select('*')
          .eq('slug', slug)
          .single();

        console.log('📊 Supabase Response:', { data, error: fetchError });

        if (fetchError) {
          console.error('❌ Supabase Error:', fetchError);
          throw fetchError;
        }

        if (data) {
          setPengumuman(data as Pengumuman);
        } else {
          throw new Error('Pengumuman tidak ditemukan');
        }
      } catch (err: any) {
        console.error('❌ Error fetching pengumuman detail:', err);
        const errorMessage = err?.message || 'Gagal memuat detail pengumuman. Silakan coba lagi nanti.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPengumumanDetail();
    }
  }, [slug, language]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: getLocalizedTitle(pengumuman) || t('announcements.title'),
        text: getLocalizedContent(pengumuman) || '',
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        alert(t('common.share'));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-outfit">
      {/* Page Header */}
      <div className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/pengumuman"
            className="inline-flex items-center text-gray-700 hover:text-primary transition-colors font-medium mb-4 text-base"
          >
            <i className="fas fa-arrow-left mr-2"></i> {t('announcements.backToAnnouncements')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {t('announcements.detail.title')}
          </h1>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-grow py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-gray-600">{t('announcements.loading')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex-grow py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('announcements.error')}</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link href="/pengumuman" className="btn-soft-filled inline-flex items-center">
                <i className="fas fa-arrow-left mr-2"></i>
                {t('announcements.backToAnnouncements')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && pengumuman && (
        <div className="flex-grow py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="card-soft p-8">
              {/* Header */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 mb-3 sm:mb-0">
                    <i className="fas fa-info-circle mr-2"></i>
                    {t('announcements.detail.badge')}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    {formatDate(pengumuman.created_at)}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                  {getLocalizedTitle(pengumuman)}
                </h1>
              </div>

              {/* Content */}
              <div className="mb-8">
                <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                  {getLocalizedContent(pengumuman).split('\n').map((line, index) => (
                    <p key={index} className="mb-4">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Share Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleShare}
                  className="btn-soft-outline inline-flex items-center"
                >
                  <i className="fas fa-share-alt mr-2"></i>
                  {t('announcements.detail.share')}
                </button>
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}

