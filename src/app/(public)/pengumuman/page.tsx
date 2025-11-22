"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Pengumuman {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  created_at?: string;
}

interface PengumumanDisplay {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
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

// Helper function to create excerpt from konten
function createExcerpt(konten: string, maxLength: number = 150): string {
  if (konten.length <= maxLength) return konten;
  return konten.substring(0, maxLength).trim() + '...';
}

export default function PengumumanPage() {
  const { t } = useLanguage();
  usePageTitle(t('nav.announcements'));
  const [pengumuman, setPengumuman] = useState<PengumumanDisplay[]>([]);
  const [filteredPengumuman, setFilteredPengumuman] = useState<PengumumanDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pengumuman from Supabase
  useEffect(() => {
    async function fetchPengumuman() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching pengumuman from Supabase...');

        const { data, error: fetchError } = await supabase
          .from('pengumumans')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('📊 Supabase Response:', { data, error: fetchError });

        if (fetchError) {
          console.error('❌ Supabase Error:', fetchError);
          throw fetchError;
        }

        if (data && Array.isArray(data)) {
          console.log(`✅ Successfully fetched ${data.length} pengumuman items`);
          
          if (data.length === 0) {
            console.warn('⚠️ Data array is empty - no pengumuman found in database');
            setPengumuman([]);
            setFilteredPengumuman([]);
            return;
          }
          
          // Transform data from database to display format
          const transformedData: PengumumanDisplay[] = data
            .filter((item: any) => item && item.judul && item.konten) // Filter out invalid items
            .map((item: Pengumuman) => ({
              id: item.id,
              title: item.judul || 'Tanpa Judul',
              slug: item.slug || '',
              excerpt: createExcerpt(item.konten || ''),
              content: item.konten || '',
              date: formatDate(item.created_at)
            }));

          console.log('🔄 Transformed data:', transformedData);
          
          if (transformedData.length === 0) {
            console.warn('⚠️ No valid pengumuman items after transformation');
            setError('Data pengumuman tidak valid. Pastikan semua field (judul, konten, slug) terisi.');
          } else {
            setPengumuman(transformedData);
            setFilteredPengumuman(transformedData);
          }
        } else {
          console.warn('⚠️ No data returned from Supabase or data is not an array');
          setPengumuman([]);
          setFilteredPengumuman([]);
        }
      } catch (err: any) {
        console.error('❌ Error fetching pengumuman:', err);
        const errorMessage = err?.message || 'Gagal memuat data pengumuman. Silakan coba lagi nanti.';
        setError(errorMessage);
        setPengumuman([]);
        setFilteredPengumuman([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPengumuman();
  }, []);
  
  // Filter pengumuman based on search term
  useEffect(() => {
    let result = pengumuman;
    
    if (searchTerm) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPengumuman(result);
  }, [searchTerm, pengumuman]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-outfit">
      {/* Page Header */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-500 mb-4">{t('announcements.title')}</h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('announcements.description')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-grow py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Form */}
          <div className="mb-8">
            <div className="bg-white card-soft p-6 mb-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-search mr-2 text-primary"></i>
                  {t('announcements.search')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('announcements.searchPlaceholder')}
                    className="input-soft w-full pl-12 pr-4 py-3 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <p className="mt-2 text-sm text-gray-500">
                    {t('announcements.showingResults', { count: filteredPengumuman.length, term: searchTerm })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-gray-600">{t('announcements.loading')}</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('announcements.error')}</h3>
              <p className="text-gray-600 mb-4">{error}</p>
            </div>
          )}
          
          {/* Pengumuman List */}
          {!loading && !error && filteredPengumuman.length > 0 ? (
            <div className="space-y-4">
              {filteredPengumuman.map((item) => (
                <Link 
                  key={item.id}
                  href={`/pengumuman/${item.slug}`}
                  className="block"
                >
                  <div className="card-soft border-l-4 hover:shadow-xl transition-all duration-300 cursor-pointer group" style={{borderColor: 'var(--color-primary)'}}>
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 mb-2 sm:mb-0">
                          <i className="fas fa-info-circle mr-1.5"></i>
                          {t('announcements.detail.badge')}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <i className="fas fa-calendar-alt mr-2"></i>
                          {item.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{item.excerpt}</p>
                      <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                        <span>{t('announcements.readMore')}</span>
                        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : !loading && !error ? (
            <div className="text-center py-12">
              <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('announcements.noResults')}</h3>
              <p className="text-gray-600">{t('announcements.noResultsDescription')}</p>
            </div>
          ) : null}
          </div>
        </div>
      </div>
      );
}