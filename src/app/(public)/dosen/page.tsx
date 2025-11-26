"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';

interface DosenSupabase {
  id: number;
  nama: string;
  jabatan?: string;
  prodi: string;
  keahlian?: string;
  pendidikan?: string;
  email?: string;
  foto?: string;
  gambar?: string;
  nidn?: string;
  urut?: number;
}

interface DosenDisplay {
  id: number;
  name: string;
  position: string;
  studyProgram: string; // Display name
  prodiCode: string; // Original prodi code from database (htn, hki, hes, semua)
  expertise: string[];
  pendidikan: string;
  imageUrl: string;
  urut: number;
}

// Helper function to parse keahlian (assuming it's a string, could be comma-separated or JSON)
function parseKeahlian(keahlian?: string): string[] {
  if (!keahlian) return [];
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(keahlian);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // If not JSON, split by comma
    return keahlian.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

// Map prodi from Supabase to display name
function mapProdiToDisplay(prodi: string, language: string = 'id'): string {
  const prodiLower = prodi.toLowerCase();
  
  if (language === 'en') {
    const mapping: { [key: string]: string } = {
      'htn': 'Constitutional Law',
      'hki': 'Islamic Family Law',
      'hes': 'Sharia Economic Law',
      'semua': 'All Programs',
    };
    return mapping[prodiLower] || prodi;
  }
  
  if (language === 'ar') {
    const mapping: { [key: string]: string } = {
      'htn': 'القانون الدستوري',
      'hki': 'قانون الأسرة الإسلامي',
      'hes': 'القانون الاقتصادي الإسلامي',
      'semua': 'جميع البرامج',
    };
    return mapping[prodiLower] || prodi;
  }
  
  // Indonesian (default)
  const mapping: { [key: string]: string } = {
    'htn': 'Hukum Tata Negara',
    'hki': 'Hukum Keluarga Islam',
    'hes': 'Hukum Ekonomi Syariah',
    'semua': 'Semua Program',
  };
  return mapping[prodiLower] || prodi;
}

// Map display name to prodi code (supports all languages)
function mapDisplayToProdi(display: string): string {
  // Indonesian
  if (display === 'Hukum Tata Negara') return 'htn';
  if (display === 'Hukum Keluarga Islam') return 'hki';
  if (display === 'Hukum Ekonomi Syariah') return 'hes';
  if (display === 'Hukum Ekonomi Islam') return 'hes'; // Alias
  
  // English
  if (display === 'Constitutional Law') return 'htn';
  if (display === 'Islamic Family Law') return 'hki';
  if (display === 'Sharia Economic Law') return 'hes';
  
  // Arabic
  if (display === 'القانون الدستوري') return 'htn';
  if (display === 'قانون الأسرة الإسلامي') return 'hki';
  if (display === 'القانون الاقتصادي الإسلامي') return 'hes';
  
  // All Programs (any language) - return empty to show all
  if (display === 'Semua Program' || display === 'All Programs' || display === 'جميع البرامج') {
    return ''; // Empty means show all
  }
  
  return display.toLowerCase();
}

export default function DosenPage() {
  const { t, language } = useLanguage();
  usePageTitle(t('nav.lecturers'));
  const [dosen, setDosen] = useState<DosenDisplay[]>([]);
  const [filteredDosen, setFilteredDosen] = useState<DosenDisplay[]>([]);
  
  // Get study programs with proper mapping based on language
  const getAllProgramsText = () => {
    if (language === 'en') return 'All Programs';
    if (language === 'ar') return 'جميع البرامج';
    return 'Semua Program';
  };
  
  const getHukumTataNegaraText = () => {
    if (language === 'en') return 'Constitutional Law';
    if (language === 'ar') return 'القانون الدستوري';
    return 'Hukum Tata Negara';
  };
  
  const getHukumEkonomiSyariahText = () => {
    if (language === 'en') return 'Sharia Economic Law';
    if (language === 'ar') return 'القانون الاقتصادي الإسلامي';
    return 'Hukum Ekonomi Syariah';
  };
  
  const getHukumKeluargaIslamText = () => {
    if (language === 'en') return 'Islamic Family Law';
    if (language === 'ar') return 'قانون الأسرة الإسلامي';
    return 'Hukum Keluarga Islam';
  };
  
  const studyPrograms = [
    getAllProgramsText(),
    getHukumTataNegaraText(),
    getHukumEkonomiSyariahText(),
    getHukumKeluargaIslamText()
  ];
  
  // Initialize selectedProgram with "All Programs" text
  const [selectedProgram, setSelectedProgram] = useState<string>(getAllProgramsText());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  // Initialize selectedProgram when component mounts or language changes
  useEffect(() => {
    const allPrograms = getAllProgramsText();
    setSelectedProgram(allPrograms);
    setCurrentPage(1);
  }, [language]);

  // Fetch dosen from Supabase
  useEffect(() => {
    async function fetchDosen() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching dosen from Supabase...');

        const { data, error: fetchError } = await supabase
          .from('dosens')
          .select('*')
          .order('urut', { ascending: true, nullsFirst: false });

        console.log('📊 Supabase Response:', { data, error: fetchError });

        if (fetchError) {
          console.error('❌ Supabase Error:', fetchError);
          throw fetchError;
        }

        if (data && Array.isArray(data)) {
          console.log(`✅ Successfully fetched ${data.length} dosen items`);
          
          if (data.length === 0) {
            console.warn('⚠️ Data array is empty - no dosen found in database');
            setDosen([]);
            setFilteredDosen([]);
            return;
          }
          
          // Transform data from database to display format
          const transformedData: DosenDisplay[] = data
            .filter((item: any) => item && item.nama) // Filter out invalid items
            .map((item: DosenSupabase) => ({
              id: item.id,
              name: item.nama || 'Tanpa Nama',
              position: item.jabatan || 'Dosen',
              studyProgram: mapProdiToDisplay(item.prodi || '', language),
              prodiCode: (item.prodi || 'semua').toLowerCase(), // Store original prodi code
              expertise: parseKeahlian(item.keahlian),
              pendidikan: item.pendidikan || '',
              imageUrl: item.foto || item.gambar || '/dosen-default.jpg',
              urut: item.urut || 999
            }))
            .sort((a, b) => a.urut - b.urut); // Sort by urut field

          console.log('🔄 Transformed data:', transformedData);
          
          if (transformedData.length === 0) {
            console.warn('⚠️ No valid dosen items after transformation');
            setError('Data dosen tidak valid. Pastikan semua field (nama, prodi) terisi.');
            setDosen([]);
            setFilteredDosen([]);
          } else {
            setDosen(transformedData);
            // Set filteredDosen to all dosen initially (show all by default)
            // This will be updated by the filter useEffect
            setFilteredDosen(transformedData);
          }
        } else {
          console.warn('⚠️ No data returned from Supabase or data is not an array');
          setDosen([]);
          setFilteredDosen([]);
        }
      } catch (err: any) {
        console.error('❌ Error fetching dosen:', err);
        const errorMessage = err?.message || 'Gagal memuat data dosen. Silakan coba lagi nanti.';
        setError(errorMessage);
        setDosen([]);
        setFilteredDosen([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDosen();
  }, [language]);
  
  // Filter dosen based on study program and search term
  useEffect(() => {
    if (dosen.length === 0) {
      setFilteredDosen([]);
      return;
    }
    
    // If selectedProgram is not set yet, show all
    if (!selectedProgram) {
      setFilteredDosen(dosen);
      return;
    }
    
    let result = dosen;
    
    // Get all programs text for current language
    const allProgramsText = getAllProgramsText();
    
    // Filter by program if not "All Programs"
    if (selectedProgram && selectedProgram !== allProgramsText) {
      const prodiCode = mapDisplayToProdi(selectedProgram);
      if (prodiCode && prodiCode !== '') { // Only filter if prodiCode is not empty (not "All Programs")
        result = result.filter(item => {
          // Use prodiCode directly from item (stored from database)
          return item.prodiCode === prodiCode;
        });
      }
    }
    // If selectedProgram === allProgramsText, show all (result = dosen, no filtering)
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pendidikan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredDosen(result);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [selectedProgram, searchTerm, dosen, language]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredDosen.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDosen = filteredDosen.slice(startIndex, endIndex);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-outfit">
      {/* Page Header */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('lecturers.title')}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('lecturers.description')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-grow py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter */}
          <div className="mb-10">
            <div className="bg-white card-soft p-6 mb-6">
              {/* Search Form */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-search mr-2 text-primary"></i>
                  {t('lecturers.search')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('lecturers.searchPlaceholder')}
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
                    {t('lecturers.showingResults', { count: filteredDosen.length, term: searchTerm })}
                  </p>
                )}
              </div>
              
              {/* Program Studi Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <i className="fas fa-filter mr-2 text-primary"></i>
                  {t('lecturers.filterProgram')}
                </label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {studyPrograms.map((program) => (
                    <button
                      key={program}
                      className={`whitespace-nowrap text-sm font-medium transition-all duration-200 rounded-xl px-5 py-2.5 ${
                        selectedProgram === program
                          ? 'text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary'
                      }`}
                      style={selectedProgram === program ? {
                        background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                        borderColor: 'var(--color-primary)'
                      } : {}}
                      onClick={() => setSelectedProgram(program)}
                    >
                      {program}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-gray-600">{t('lecturers.loading')}</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('lecturers.error')}</h3>
              <p className="text-gray-600 mb-4">{error}</p>
            </div>
          )}
          
          {/* Dosen Grid */}
          {!loading && !error && currentDosen.length > 0 ? (
            <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDosen.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 card-hover">
                  <div className="p-6">
                    <div className="flex flex-col items-center mb-5">
                      <div className="w-28 h-28 rounded-2xl overflow-hidden mb-4 mx-auto shadow-lg border-2" style={{borderColor: 'rgba(134, 176, 189, 0.3)'}}>
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={112}
                          height={112}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextSibling = target.nextElementSibling as HTMLElement;
                            if (nextSibling) nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" style={{display: 'none'}}>
                          <i className="fas fa-user-tie text-3xl" style={{color: 'rgba(134, 176, 189, 0.6)'}}></i>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 text-center mb-1">{item.name}</h3>
                      <p className="font-semibold text-center mb-1" style={{color: 'var(--color-primary)', fontSize: '0.875rem'}}>{item.position}</p>
                      <p className="text-gray-500 text-xs text-center">{item.studyProgram}</p>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4">
                      {item.pendidikan && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
                            <i className="fas fa-graduation-cap mr-2 text-primary text-xs"></i>
                            {t('lecturers.education')}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.pendidikan}</p>
                        </div>
                      )}
                      
                      {item.expertise.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center">
                            <i className="fas fa-star mr-2 text-primary text-xs"></i>
                            {t('lecturers.expertise')}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.expertise.map((skill, index) => (
                              <span key={index} className="px-2.5 py-1 text-xs rounded-lg font-medium" style={{backgroundColor: 'rgba(134, 176, 189, 0.12)', color: 'var(--color-primary)', border: '1px solid rgba(134, 176, 189, 0.2)'}}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {t('lecturers.showingPage', { start: startIndex + 1, end: Math.min(endIndex, filteredDosen.length), total: filteredDosen.length })}
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
                      {t('lecturers.previous')}
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
                      {t('lecturers.next')}
                      <i className="fas fa-chevron-right ml-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
            </>
          ) : !loading && !error ? (
            <div className="text-center py-12">
              <i className="fas fa-user-tie text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('lecturers.noResults')}</h3>
              <p className="text-gray-600">{t('lecturers.noResultsDescription')}</p>
            </div>
          ) : null}
          </div>
        </div>
      </div>
      );
}