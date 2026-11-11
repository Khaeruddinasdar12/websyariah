"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import PageHeader from '@/components/public/PageHeader';


const TABS = [
  { id: 'visi-misi', icon: 'fa-eye', label: 'about.visionMission' },
  { id: 'sejarah', icon: 'fa-history', label: 'about.history' },
  { id: 'struktur', icon: 'fa-sitemap', label: 'about.structure' },
  { id: 'nilai', icon: 'fa-heart', label: 'about.values' },
  { id: 'fasilitas', icon: 'fa-building', label: 'home.facilities.title' },
  { id: 'testimoni', icon: 'fa-quote-left', label: 'home.testimonials.title' },
];

const FACILITIES = [
  { key: 'library', icon: 'fa-book' },
  { key: 'computerLab', icon: 'fa-desktop' },
  { key: 'discussionRoom', icon: 'fa-comments' },
  { key: 'wifi', icon: 'fa-wifi' },
  { key: 'falakLab', icon: 'fa-moon' },
  { key: 'yustisiLab', icon: 'fa-balance-scale' },
];

const TESTIMONIALS = [
  { initials: 'PR', key: 'putra' },
  { initials: 'AA', key: 'ahmad' },
  { initials: 'VS', key: 'vivin' },
  { initials: 'AT', key: 'taufiq' },
];

export default function TentangPage() {
  const { t } = useLanguage();
  usePageTitle(t('nav.about'));
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  // Tautan seperti /tentang?tab=fasilitas membuka tab itu secara langsung.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (requested && TABS.some((tab) => tab.id === requested)) {
      setActiveTab(requested);
    }
  }, []);

  const selectTab = (id: string) => {
    setActiveTab(id);
    window.history.replaceState(null, '', id === TABS[0].id ? '/tentang' : `/tentang?tab=${id}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-900 font-outfit">
      <PageHeader title={t('about.title')} description={t('about.subtitle')} />

      <section className="py-4 bg-white sticky z-40 border-b border-ink-200" style={{ top: 'var(--public-header-h)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`whitespace-nowrap text-sm font-medium transition-all duration-200 rounded-xl px-6 py-3 ${
                  activeTab === tab.id
                    ? 'text-white shadow-lg transform scale-105'
                    : 'bg-white text-ink-800 border-2 border-ink-200 hover:border-primary hover:text-primary hover:shadow-md'
                }`}
                style={activeTab === tab.id ? {
                  background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                  borderColor: 'var(--color-primary)'
                } : {}}
                onClick={() => selectTab(tab.id)}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>
                {t(tab.label)}
              </button>
            ))}
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
                <h2 className="text-3xl md:text-4xl font-bold text-ink-900 mb-4">{t('about.visionMission')}</h2>
                <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                  {t('about.visionMissionDescription')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12">
                {/* Visi */}
                <div className="card-soft p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 opacity-30 group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(to bottom right, rgba(var(--color-primary-rgb), 0.15), rgba(var(--color-primary-light-rgb), 0.15))'}}></div>
                  <div className="relative z-10">
                    <div className="w-18 h-18 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', borderColor: 'rgba(var(--color-primary-rgb), 0.4)'}}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-ink-900 mb-4">{t('about.vision.title')}</h3>
                    <p className="text-ink-600 leading-relaxed text-base">
                      {t('about.vision.content')}
                    </p>
                  </div>
                </div>

                {/* Misi */}
                <div className="card-soft p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 opacity-30 group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(to bottom right, rgba(var(--color-primary-rgb), 0.15), rgba(var(--color-primary-light-rgb), 0.15))'}}></div>
                  <div className="relative z-10">
                    <div className="w-18 h-18 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', borderColor: 'rgba(var(--color-primary-rgb), 0.4)'}}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-ink-900 mb-4">{t('about.mission.title')}</h3>
                    <ul className="text-ink-600 space-y-3 text-base leading-relaxed">
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
      <h2 className="text-3xl md:text-4xl font-bold text-ink-900 mb-4">{t('about.history')}</h2>
      <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
      <p className="text-lg text-ink-600 max-w-2xl mx-auto">
        {t('about.historyDescription')}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="prose max-w-none">
          <p className="text-ink-800 mb-4">
            {t('about.historyContent.p1')}
          </p>
          <p className="text-ink-800 mb-4">
            {t('about.historyContent.p2')}
          </p>
          <p className="text-ink-800 mb-4">
            {t('about.historyContent.p3')}
          </p>
          <p className="text-ink-800 mb-4">
            {t('about.historyContent.p4')}
          </p>
          <p className="text-ink-800">
            {t('about.historyContent.p5')}
          </p>
        </div>
      </div>
    </div>

              {/* Timeline */}
    <div className="relative">
                {/* Timeline line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1" style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)'}}></div>

                {/* Timeline items */}
      <div className="space-y-12">
                  {/* 1964 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8 text-right">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-ink-900 mb-2">1964</h3>
              <p className="text-ink-600">{t('about.timeline.1964')}</p>
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
              <h3 className="text-xl font-bold text-ink-900 mb-2">1967</h3>
              <p className="text-ink-600">{t('about.timeline.1967')}</p>
            </div>
          </div>
        </div>

                  {/* 1968 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8 text-right">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-ink-900 mb-2">1968</h3>
              <p className="text-ink-600">{t('about.timeline.1968')}</p>
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
              <h3 className="text-xl font-bold text-ink-900 mb-2">1982</h3>
              <p className="text-ink-600">{t('about.timeline.1982')}</p>
            </div>
          </div>
        </div>

                  {/* 1997 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8 text-right">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-ink-900 mb-2">1997</h3>
              <p className="text-ink-600">{t('about.timeline.1997')}</p>
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
              <h3 className="text-xl font-bold text-ink-900 mb-2">2005</h3>
              <p className="text-ink-600">{t('about.timeline.2005')}</p>
            </div>
          </div>
        </div>

                  {/* 2018 */}
        <div className="relative flex items-center">
          <div className="w-1/2 pr-8 text-right">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-ink-900 mb-2">2018</h3>
              <p className="text-ink-600">{t('about.timeline.2018')}</p>
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
      <h2 className="text-3xl md:text-4xl font-bold text-ink-900 mb-4">{t('about.structure')}</h2>
      <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
      <p className="text-lg text-ink-600 max-w-2xl mx-auto">
        {t('about.structureDescription')}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="w-full">
        <div className="relative w-full rounded-xl overflow-hidden shadow-lg border border-ink-200 group hover:shadow-xl transition-all duration-300">
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
          <div className="w-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-ink-50 to-ink-100" style={{display: 'none'}}>
            <div className="text-center">
              <i className="fas fa-sitemap text-6xl mb-4" style={{color: 'rgba(var(--color-primary-rgb), 0.5)'}}></i>
              <p className="text-ink-600">{t('about.structure')}</p>
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
      <h2 className="text-3xl md:text-4xl font-bold text-ink-900 mb-4">{t('about.values')}</h2>
      <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
      <p className="text-lg text-ink-600 max-w-2xl mx-auto leading-relaxed">
        {t('about.valuesDescription')}
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* H - Humanis */}
      <div className="rounded-xl shadow-lg border border-ink-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', borderColor: 'rgba(var(--color-primary-rgb), 0.4)'}}>
          <span className="text-white text-3xl font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>H</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.humanis.title')}</h3>
        <p className="text-sm leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.humanis.description')}
        </p>
      </div>

                {/* A - Adaptif */}
      <div className="rounded-xl shadow-lg border border-ink-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2"
          style={{background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', borderColor: 'rgba(var(--color-primary-rgb), 0.4)'}}
        >
          <span className="text-white text-3xl font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>A</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.adaptif.title')}</h3>
        <p className="text-sm leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.adaptif.description')}
        </p>
      </div>

                {/* D - Dedikatif */}
      <div className="rounded-xl shadow-lg border border-ink-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', borderColor: 'rgba(var(--color-primary-rgb), 0.4)'}}>
          <span className="text-white text-3xl font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>D</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.dedikatif.title')}</h3>
        <p className="text-sm leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.dedikatif.description')}
        </p>
      </div>

                {/* I - Inovatif */}
      <div className="rounded-xl shadow-lg border border-ink-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', borderColor: 'rgba(var(--color-primary-rgb), 0.4)'}}>
          <span className="text-white text-3xl font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>I</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{color: '#000000', fontWeight: '700'}}>{t('about.hadis.inovatif.title')}</h3>
        <p className="text-sm leading-relaxed" style={{color: '#000000', fontWeight: '400'}}>
          {t('about.hadis.inovatif.description')}
        </p>
      </div>

                {/* S - Selebritif */}
      <div className="rounded-xl shadow-lg border border-ink-200 p-6 group text-center card-hover bg-white" style={{backgroundColor: '#ffffff'}}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', borderColor: 'rgba(var(--color-primary-rgb), 0.4)'}}>
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
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-ink-200" style={{backgroundColor: '#ffffff'}}>
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

          {/* Fasilitas Tab */}
          {activeTab === 'fasilitas' && (
            <div className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-ink-900 mb-4">{t('home.facilities.title')}</h2>
                <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                  {t('home.facilities.subtitle')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FACILITIES.map((item) => (
                  <article key={item.key} className="pub-card p-5 flex gap-4">
                    <span className="w-10 h-10 shrink-0 bg-ink-50 text-primary flex items-center justify-center">
                      <i className={`fas ${item.icon}`} aria-hidden="true"></i>
                    </span>
                    <div>
                      <h3 className="text-lg text-ink-900">{t(`home.facilities.${item.key}.title`)}</h3>
                      <p className="mt-1 text-sm text-ink-600 leading-relaxed">{t(`home.facilities.${item.key}.description`)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Testimoni Tab */}
          {activeTab === 'testimoni' && (
            <div className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-ink-900 mb-4">{t('home.testimonials.title')}</h2>
                <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
                <p className="text-lg text-ink-600 max-w-2xl mx-auto">
                  {t('home.testimonials.subtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {TESTIMONIALS.map((item) => (
                  <article key={item.key} className="pub-quote-card">
                    <div className="flex items-center gap-3">
                      <span className="pub-avatar">{item.initials}</span>
                      <div>
                        <h3 className="text-base text-ink-900">{t(`home.testimonialItems.${item.key}.name`)}</h3>
                        <p className="text-xs text-ink-500 mt-0.5">{t(`home.testimonialItems.${item.key}.role`)}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-ink-700 leading-relaxed flex-1">
                      “{t(`home.testimonialItems.${item.key}.quote`)}”
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
</div>
</section>
</div>
);
}