"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { testSupabaseConnection } from '@/lib/test-supabase';
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

interface BeritaDisplay {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  imageUrl: string;
  slug: string;
}

// Helper function to create slug from judul
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
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

export default function BeritaPage() {
  const { t, language } = useLanguage();
  usePageTitle(t('nav.news'));
  const [berita, setBerita] = useState<BeritaDisplay[]>([]);
  const [filteredBerita, setFilteredBerita] = useState<BeritaDisplay[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(t('news.allCategories'));
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Helper function to get localized category
  const getLocalizedCategory = (item: Berita): string => {
    if (language === 'en' && item.kategori_en) return item.kategori_en;
    if (language === 'ar' && item.kategori_ar) return item.kategori_ar;
    return item.kategori || 'Umum';
  };
  
  // Helper function to get localized title
  const getLocalizedTitle = (item: Berita): string => {
    if (language === 'en' && item.judul_en) return item.judul_en;
    if (language === 'ar' && item.judul_ar) return item.judul_ar;
    return item.judul || 'Tanpa Judul';
  };
  
  // Helper function to get localized content
  const getLocalizedContent = (item: Berita): string => {
    if (language === 'en' && item.konten_en) return item.konten_en;
    if (language === 'ar' && item.konten_ar) return item.konten_ar;
    return item.konten || '';
  };

  // Fetch berita from Supabase
  useEffect(() => {
    async function fetchBerita() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching berita from Supabase...');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
        console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');

        const { data, error: fetchError } = await supabase
          .from('beritas')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('📊 Supabase Response:', { data, error: fetchError });

        if (fetchError) {
          console.error('❌ Supabase Error:', fetchError);
          throw fetchError;
        }

        if (data && Array.isArray(data)) {
          console.log(`✅ Successfully fetched ${data.length} berita items`);
          console.log('📝 Raw data:', data);
          
          if (data.length === 0) {
            console.warn('⚠️ Data array is empty - no berita found in database');
            setBerita([]);
            setFilteredBerita([]);
            return;
          }
          
          // Transform data from database to display format
          const transformedData: BeritaDisplay[] = data
            .filter((item: any) => item && item.judul && item.konten) // Filter out invalid items
            .map((item: Berita) => {
              const localizedTitle = getLocalizedTitle(item);
              const localizedContent = getLocalizedContent(item);
              const localizedCategory = getLocalizedCategory(item);
              
              return {
                id: item.id,
                title: localizedTitle,
                excerpt: createExcerpt(localizedContent),
                content: localizedContent,
                date: formatDate(item.created_at),
                category: localizedCategory,
                imageUrl: item.gambar || '/banner.jpeg', // fallback image
                slug: createSlug(localizedTitle) + '-' + item.id
              };
            });

          console.log('🔄 Transformed data:', transformedData);
          
          if (transformedData.length === 0) {
            console.warn('⚠️ No valid berita items after transformation');
            setError('Data berita tidak valid. Pastikan semua field (judul, konten, kategori) terisi.');
          } else {
            setBerita(transformedData);
            setFilteredBerita(transformedData);
          }
        } else {
          console.warn('⚠️ No data returned from Supabase or data is not an array');
          console.warn('Data type:', typeof data);
          setBerita([]);
          setFilteredBerita([]);
        }
      } catch (err: any) {
        console.error('❌ Error fetching berita:', err);
        const errorMessage = err?.message || 'Gagal memuat data berita. Silakan coba lagi nanti.';
        setError(errorMessage);
        setBerita([]);
        setFilteredBerita([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBerita();
  }, [language]);
  
  // Helper function to capitalize first letter
  function capitalizeFirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Get unique categories with capitalized names
  const categories = [t('news.allCategories'), ...Array.from(new Set(berita.map(item => item.category))).map(cat => capitalizeFirst(cat))];

  // Filter berita based on category and search term
  useEffect(() => {
    let result = berita;

    if (selectedCategory !== t('news.allCategories')) {
      // Compare with capitalized category
      result = result.filter(item => capitalizeFirst(item.category) === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBerita(result);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [selectedCategory, searchTerm, berita, t, language]);
  

  // Pagination calculations
  const totalPages = Math.ceil(filteredBerita.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBerita = filteredBerita.slice(startIndex, endIndex);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-outfit">
      {/* Page Header */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('news.titlePage')}</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto ">
              {t('news.description')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter */}
          <div className="mb-8">
            <div className="bg-white card-soft p-6 mb-6">
              {/* Search Form */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-search mr-2 text-primary"></i>
                  {t('news.search')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('news.searchPlaceholder')}
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
                    {t('news.showingResults', { count: filteredBerita.length, term: searchTerm })}
                  </p>
                )}
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <i className="fas fa-filter mr-2 text-primary"></i>
                  {t('news.filterCategory')}
                </label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`whitespace-nowrap text-sm font-medium transition-all duration-200 rounded-xl px-5 py-2.5 ${
                        selectedCategory === category
                          ? 'text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary'
                      }`}
                      style={selectedCategory === category ? {
                        background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                        borderColor: 'var(--color-primary)'
                      } : {}}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-sage-green mb-4"></i>
              <p className="text-gray-600">{t('news.loading')}</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('news.error')}</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left max-w-2xl mx-auto">
                <p className="text-sm text-gray-700 mb-2"><strong>Tips untuk memperbaiki:</strong></p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Pastikan file .env.local ada di root project</li>
                  <li>Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diisi</li>
                  <li>Restart development server setelah mengubah .env.local</li>
                  <li>Pastikan tabel "beritas" ada di database Supabase</li>
                  <li>Pastikan Row Level Security (RLS) di Supabase mengizinkan read untuk tabel beritas</li>
                  <li>Buka browser console (F12) untuk melihat detail error</li>
                </ul>
              </div>
            </div>
          )}

          {/* Berita Grid */}
          {!loading && !error && currentBerita.length > 0 ? (
            <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBerita.map((item) => (
                <article key={item.id} className="card-soft overflow-hidden">
                  <div className="h-48 relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const nextSibling = target.nextElementSibling as HTMLElement;
                        if (nextSibling) nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{display: 'none'}}>
                      <i className="fas fa-newspaper text-4xl text-sage-green/50"></i>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/95 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border-2" style={{color: 'var(--color-primary)', borderColor: 'rgba(134, 176, 189, 0.3)'}}>
                        {capitalizeFirst(item.category)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <i className="fas fa-calendar-alt mr-2"></i>
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                    <p className="text-gray-600 mb-4">{item.excerpt}</p>
                    <Link href={`/berita/${item.slug}`} className="text-primary hover:opacity-80 font-semibold inline-flex items-center transition-colors group">
                      {t('news.readMore')} <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {t('news.showingPage', { start: startIndex + 1, end: Math.min(endIndex, filteredBerita.length), total: filteredBerita.length })}
                  </div>
                  
                  <div className="flex justify-center items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary hover:shadow-md'
                      }`}
                    >
                      <i className="fas fa-chevron-left mr-2"></i>
                      {t('news.previous')}
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                                currentPage === page
                                  ? 'text-white shadow-lg transform scale-105'
                                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary'
                              }`}
                              style={currentPage === page ? {
                                background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                                borderColor: 'var(--color-primary)'
                              } : {}}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="w-10 h-10 flex items-center justify-center text-gray-400 font-medium">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary hover:shadow-md'
                      }`}
                    >
                      {t('news.next')}
                      <i className="fas fa-chevron-right ml-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
            </>
          ) : !loading && !error ? (
            <div className="text-center py-12">
              <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('news.noResults')}</h3>
              <p className="text-gray-600">{t('news.noResultsDescription')}</p>
            </div>
          ) : null}
          </div>
        </div>
      </div>
      );
}