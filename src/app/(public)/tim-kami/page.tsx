"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatKategoriNames, normalizeKategoriIds } from '@/utils/kategoriPegawai';
import { fetchKategoriPegawai } from '@/lib/fetchKategoriPegawai';
import type { KategoriPegawai } from '@/types/kategoriPegawai';

interface DosenSupabase {
  id: number;
  nama: string;
  jabatan?: string;
  prodi?: string[] | string | null;
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
  studyProgram: string;
  kategoriIds: string[];
  expertise: string[];
  pendidikan: string;
  imageUrl: string;
  urut: number;
}

function parseKeahlian(keahlian?: string): string[] {
  if (!keahlian) return [];
  try {
    const parsed = JSON.parse(keahlian);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return keahlian.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

export default function TimKamiPage() {
  const { t } = useLanguage();
  usePageTitle(t('nav.lecturers'));
  const [kategoriList, setKategoriList] = useState<KategoriPegawai[]>([]);
  const [dosen, setDosen] = useState<DosenDisplay[]>([]);
  const [filteredDosen, setFilteredDosen] = useState<DosenDisplay[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setSelectedFilter('');
    setCurrentPage(1);
  }, [kategoriList]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [kategoriResult, dosenResult] = await Promise.all([
          fetchKategoriPegawai(),
          supabase
            .from('dosens')
            .select('*')
            .order('urut', { ascending: true, nullsFirst: false }),
        ]);

        if (kategoriResult.error) {
          console.warn('Kategori pegawai:', kategoriResult.error);
        }
        if (dosenResult.error) throw dosenResult.error;

        const categories = kategoriResult.data;
        setKategoriList(categories);

        if (dosenResult.data && Array.isArray(dosenResult.data)) {
          const transformedData: DosenDisplay[] = dosenResult.data
            .filter((item: DosenSupabase) => item && item.nama)
            .map((item: DosenSupabase) => {
              const kategoriIds = normalizeKategoriIds(item.prodi);
              return {
                id: item.id,
                name: item.nama || 'Tanpa Nama',
                position: item.jabatan || '-',
                studyProgram: formatKategoriNames(kategoriIds, categories),
                kategoriIds,
                expertise: parseKeahlian(item.keahlian),
                pendidikan: item.pendidikan || '',
                imageUrl: item.foto || item.gambar || '/dosen-default.jpg',
                urut: item.urut || 999,
              };
            })
            .sort((a, b) => a.urut - b.urut);

          setDosen(transformedData);
          setFilteredDosen(transformedData);
        } else {
          setDosen([]);
          setFilteredDosen([]);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Gagal memuat data tim. Silakan coba lagi nanti.';
        setError(message);
        setDosen([]);
        setFilteredDosen([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (dosen.length === 0) {
      setFilteredDosen([]);
      return;
    }

    let result = dosen;

    if (selectedFilter) {
      result = result.filter((item) => item.kategoriIds.includes(selectedFilter));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.position.toLowerCase().includes(term) ||
          item.pendidikan.toLowerCase().includes(term) ||
          item.expertise.some((skill) => skill.toLowerCase().includes(term))
      );
    }

    setFilteredDosen(result);
    setCurrentPage(1);
  }, [selectedFilter, searchTerm, dosen]);

  const totalPages = Math.ceil(filteredDosen.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDosen = filteredDosen.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-900 font-outfit">
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-4">{t('team.title')}</h1>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">{t('team.description')}</p>
          </div>
        </div>
      </div>

      <div className="flex-grow py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="bg-white card-soft p-6 mb-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-ink-800 mb-2">
                  <i className="fas fa-search mr-2 text-primary"></i>
                  {t('team.search')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('team.searchPlaceholder')}
                    className="input-soft input-soft-icon w-full text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 text-base pointer-events-none" aria-hidden="true"></i>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <p className="mt-2 text-sm text-ink-500">
                    {t('team.showingResults', { count: filteredDosen.length, term: searchTerm })}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-800 mb-3">
                  <i className="fas fa-filter mr-2 text-primary"></i>
                  {t('team.filterCategory')}
                </label>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    type="button"
                    className={`whitespace-nowrap text-sm font-medium transition-all duration-200 rounded-xl px-5 py-2.5 ${
                      selectedFilter === ''
                        ? 'text-white shadow-lg transform scale-105'
                        : 'bg-white text-ink-800 border-2 border-ink-200 hover:border-primary hover:text-primary'
                    }`}
                    style={
                      selectedFilter === ''
                        ? {
                            background:
                              'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                            borderColor: 'var(--color-primary)',
                          }
                        : {}
                    }
                    onClick={() => setSelectedFilter('')}
                  >
                    {t('team.filters.all')}
                  </button>
                  {kategoriList.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`whitespace-nowrap text-sm font-medium transition-all duration-200 rounded-xl px-5 py-2.5 ${
                        selectedFilter === category.id
                          ? 'text-white shadow-lg transform scale-105'
                          : 'bg-white text-ink-800 border-2 border-ink-200 hover:border-primary hover:text-primary'
                      }`}
                      style={
                        selectedFilter === category.id
                          ? {
                              background:
                                'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                              borderColor: 'var(--color-primary)',
                            }
                          : {}
                      }
                      onClick={() => setSelectedFilter(category.id)}
                    >
                      {category.nama}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-ink-600">{t('team.loading')}</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-ink-800 mb-2">{t('team.error')}</h3>
              <p className="text-ink-600">{error}</p>
            </div>
          )}

          {!loading && !error && currentDosen.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentDosen.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-lg border border-ink-100 overflow-hidden group hover:shadow-xl transition-all duration-300 card-hover"
                  >
                    <div className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="w-28 h-28 rounded-2xl overflow-hidden mb-4 mx-auto shadow-lg border-2"
                          style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.3)' }}
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={112}
                            height={112}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/dosen-default.jpg';
                            }}
                          />
                        </div>
                        <h3 className="text-lg font-bold text-ink-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-primary font-medium mb-1">{item.position}</p>
                        <p className="text-xs text-ink-500 mb-4">{item.studyProgram}</p>
                      </div>

                      <div className="border-t border-ink-100 pt-4">
                        {item.pendidikan && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-ink-700 mb-1">
                              <i className="fas fa-graduation-cap mr-1 text-primary"></i>
                              {t('team.education')}
                            </p>
                            <p className="text-xs text-ink-600 leading-relaxed">{item.pendidikan}</p>
                          </div>
                        )}
                        {item.expertise.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-ink-700 mb-2">
                              <i className="fas fa-star mr-1 text-primary"></i>
                              {t('team.expertise')}
                            </p>
                            <div className="flex flex-wrap gap-1.5 justify-center">
                              {item.expertise.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2.5 py-1 text-xs rounded-lg font-medium"
                                  style={{
                                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.12)',
                                    color: 'var(--color-primary)',
                                    border: '1px solid rgba(var(--color-primary-rgb), 0.2)',
                                  }}
                                >
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

              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-ink-600">
                    {t('team.showingPage', {
                      start: startIndex + 1,
                      end: Math.min(endIndex, filteredDosen.length),
                      total: filteredDosen.length,
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-ink-200 text-sm font-medium text-ink-700 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('team.previous')}
                    </button>
                    <span className="text-sm text-ink-600">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-ink-200 text-sm font-medium text-ink-700 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('team.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !error && currentDosen.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-user-tie text-4xl text-ink-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-ink-800 mb-2">{t('team.noResults')}</h3>
              <p className="text-ink-600">{t('team.noResultsDescription')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
