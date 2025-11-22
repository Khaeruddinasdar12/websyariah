"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';


export default function TentangPage() {
  const { t } = useLanguage();
  usePageTitle(t('nav.about'));
  const [activeTab, setActiveTab] = useState('visi-misi');
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-outfit">
      {/* Hero Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-500 mb-4">{t('about.title')}</h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <section className="py-8 bg-white sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              className={`whitespace-nowrap text-sm font-medium transition-all duration-200 rounded-xl px-6 py-3 ${
                activeTab === 'visi-misi'
                  ? 'text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary hover:shadow-md'
              }`}
              style={activeTab === 'visi-misi' ? {
                background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                borderColor: 'var(--color-primary)'
              } : {}}
              onClick={() => setActiveTab('visi-misi')}
            >
              <i className="fas fa-eye mr-2"></i>
              {t('about.visionMission')}
            </button>

            <button
              className={`whitespace-nowrap text-sm font-medium transition-all duration-200 rounded-xl px-6 py-3 ${
                activeTab === 'sejarah'
                  ? 'text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary hover:shadow-md'
              }`}
              style={activeTab === 'sejarah' ? {
                background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                borderColor: 'var(--color-primary)'
              } : {}}
              onClick={() => setActiveTab('sejarah')}
            >
              <i className="fas fa-history mr-2"></i>
              {t('about.history')}
            </button>

            <button
              className={`whitespace-nowrap text-sm font-medium transition-all duration-200 rounded-xl px-6 py-3 ${
                activeTab === 'struktur'
                  ? 'text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary hover:shadow-md'
              }`}
              style={activeTab === 'struktur' ? {
                background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                borderColor: 'var(--color-primary)'
              } : {}}
              onClick={() => setActiveTab('struktur')}
            >
              <i className="fas fa-sitemap mr-2"></i>
              {t('about.structure')}
            </button>

            <button
              className={`whitespace-nowrap text-sm font-medium transition-all duration-200 rounded-xl px-6 py-3 ${
                activeTab === 'nilai'
                  ? 'text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary hover:shadow-md'
              }`}
              style={activeTab === 'nilai' ? {
                background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                borderColor: 'var(--color-primary)'
              } : {}}
              onClick={() => setActiveTab('nilai')}
            >
              <i className="fas fa-heart mr-2"></i>
              {t('about.values')}
            </button>
          </div>
        </div>
      </section>
      
      {/* Tab Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Visi & Misi Tab */}
          {activeTab === 'visi-misi' && (
            <div className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('about.visionMission')}</h2>
                <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {t('about.visionMissionDescription')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12">
                {/* Visi */}
                <div className="card-soft p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 opacity-30 group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(to bottom right, rgba(134, 176, 189, 0.15), rgba(168, 200, 211, 0.15))'}}></div>
                  <div className="relative z-10">
                    <div className="w-18 h-18 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.4)'}}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('about.vision.title')}</h3>
                    <p className="text-gray-600 leading-relaxed text-base">
                      {t('about.vision.content')}
                    </p>
                  </div>
                </div>

                {/* Misi */}
                <div className="card-soft p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 opacity-30 group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(to bottom right, rgba(134, 176, 189, 0.15), rgba(168, 200, 211, 0.15))'}}></div>
                  <div className="relative z-10">
                    <div className="w-18 h-18 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.4)'}}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('about.mission.title')}</h3>
                    <ul className="text-gray-600 space-y-3 text-base leading-relaxed">
                      {['about.mission.items.0', 'about.mission.items.1', 'about.mission.items.2', 'about.mission.items.3'].map((key, index) => (
                        <li key={index} className="flex items-start">
                          <i className="fas fa-check-circle mr-3 mt-1 flex-shrink-0" style={{color: 'var(--color-primary)', fontSize: '1rem'}}></i>
                          <span>{t(key)}</span>
                        </li>
                      ))}
                    </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

          {/* Sejarah Tab */}
{activeTab === 'sejarah' && (
  <div className="space-y-12">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('about.history')}</h2>
      <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        {t('about.historyDescription')}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            {t('about.historyContent.p1')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('about.historyContent.p2')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('about.historyContent.p3')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('about.historyContent.p4')}
          </p>
          <p className="text-gray-700">
            {t('about.historyContent.p5')}
          </p>
        </div>
      </div>
    </div>

              {/* Timeline */}
    <div className="relative">
                {/* Timeline line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1" style={{backgroundColor: 'rgba(134, 176, 189, 0.2)'}}></div>

                {/* Timeline items */}
      <div className="space-y-12">
                  {/* 1964 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8 text-right">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-2">1964</h3>
              <p className="text-gray-600">{t('about.timeline.1964')}</p>
            </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white" style={{backgroundColor: 'var(--color-primary)'}}></div>
          <div className="w-1/2 pl-8"></div>
        </div>

                  {/* 1967 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white" style={{backgroundColor: 'var(--color-primary)'}}></div>
          <div className="w-1/2 pl-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-2">1967</h3>
              <p className="text-gray-600">{t('about.timeline.1967')}</p>
            </div>
          </div>
        </div>

                  {/* 1968 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8 text-right">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-2">1968</h3>
              <p className="text-gray-600">{t('about.timeline.1968')}</p>
            </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white" style={{backgroundColor: 'var(--color-primary)'}}></div>
          <div className="w-1/2 pl-8"></div>
        </div>

                  {/* 1982 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white" style={{backgroundColor: 'var(--color-primary)'}}></div>
          <div className="w-1/2 pl-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-2">1982</h3>
              <p className="text-gray-600">{t('about.timeline.1982')}</p>
            </div>
          </div>
        </div>

                  {/* 1997 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8 text-right">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-2">1997</h3>
              <p className="text-gray-600">{t('about.timeline.1997')}</p>
            </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white" style={{backgroundColor: 'var(--color-primary)'}}></div>
          <div className="w-1/2 pl-8"></div>
        </div>

                  {/* 2005 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white" style={{backgroundColor: 'var(--color-primary)'}}></div>
          <div className="w-1/2 pl-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-2">2005</h3>
              <p className="text-gray-600">{t('about.timeline.2005')}</p>
            </div>
          </div>
        </div>

                  {/* 2018 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8 text-right">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-2">2018</h3>
              <p className="text-gray-600">{t('about.timeline.2018')}</p>
            </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white" style={{backgroundColor: 'var(--color-primary)'}}></div>
          <div className="w-1/2 pl-8"></div>
        </div>
      </div>
    </div>
  </div>
  )}

          {/* Struktur Organisasi Tab */}
{activeTab === 'struktur' && (
  <div className="space-y-12">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('about.structure')}</h2>
      <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        {t('about.structureDescription')}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="w-full">
        <div className="relative w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 group hover:shadow-xl transition-all duration-300">
          <Image
            src="/assets/struktur.png"
            alt={t('about.structure')}
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const nextSibling = target.nextElementSibling as HTMLElement;
              if (nextSibling) nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" style={{display: 'none'}}>
            <div className="text-center">
              <i className="fas fa-sitemap text-6xl mb-4" style={{color: 'rgba(134, 176, 189, 0.5)'}}></i>
              <p className="text-gray-600">{t('about.structure')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )}

          {/* Nilai-nilai HADIS Tab */}
{activeTab === 'nilai' && (
  <div className="space-y-12">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('about.values')}</h2>
      <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        {t('about.valuesDescription')}
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* H - Humanis */}
      <div className="rounded-xl shadow-lg border border-gray-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.4)'}}>
          <span className="text-white text-3xl font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>H</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.humanis.title')}</h3>
        <p className="text-sm leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.humanis.description')}
        </p>
      </div>

                {/* A - Adaptif */}
      <div className="rounded-xl shadow-lg border border-gray-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2"
          style={{background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.4)'}}
        >
          <span className="text-white text-3xl font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>A</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.adaptif.title')}</h3>
        <p className="text-sm leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.adaptif.description')}
        </p>
      </div>

                {/* D - Dedikatif */}
      <div className="rounded-xl shadow-lg border border-gray-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.4)'}}>
          <span className="text-white text-3xl font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>D</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.dedikatif.title')}</h3>
        <p className="text-sm leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.dedikatif.description')}
        </p>
      </div>

                {/* I - Inovatif */}
      <div className="rounded-xl shadow-lg border border-gray-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.4)'}}>
          <span className="text-white text-3xl font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>I</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.inovatif.title')}</h3>
        <p className="text-sm leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.inovatif.description')}
        </p>
      </div>

                {/* S - Selebritif */}
      <div className="rounded-xl shadow-lg border border-gray-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.4)'}}>
          <span className="text-white text-3xl font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>S</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.selebritif.title')}</h3>
        <p className="text-sm leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.selebritif.description')}
        </p>
      </div>
    </div>

              {/* HADIS Acronym Display */}
    <div className="mt-12 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200" style={{backgroundColor: '#ffffff'}}>
        <h3 className="text-2xl font-bold mb-4" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.acronym')}</h3>
        <p className="text-lg leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.acronymDescription')}
        </p>
        <p className="text-base mt-4" style={{color: '#1f2937', fontWeight: '400'}}>
          {t('about.hadis.footerDescription')}
        </p>
      </div>
    </div>
  </div>
  )}
</div>
</section>
</div>
);
}