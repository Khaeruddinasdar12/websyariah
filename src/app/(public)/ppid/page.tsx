"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { getPpidContent } from '@/data/ppid';

export default function PpidPage() {
  const { t, language } = useLanguage();
  const content = getPpidContent(language);
  const [openSection, setOpenSection] = useState<string | null>(content.sections[0]?.id ?? null);

  usePageTitle(t('nav.ppid'));

  const toggleSection = (id: string) => {
    setOpenSection((current) => (current === id ? null : id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50 text-ink-900 font-outfit">
      <div className="py-16 bg-white border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
            <i className="fas fa-folder-open text-2xl" aria-hidden="true"></i>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-3">{t('ppid.title')}</h1>
          <p className="text-lg text-primary font-medium mb-6">{t('ppid.subtitle')}</p>
          <div className="max-w-4xl mx-auto space-y-4 text-ink-700 leading-relaxed text-left md:text-center">
            {content.intro.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <section className="py-12 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-ink-900 mb-8 text-center">
            {t('ppid.publicInfoList')}
          </h2>

          <div className="space-y-6">
            {content.sections.map((section) => {
              const isOpen = openSection === section.id;

              return (
                <div key={section.id} className="card-soft overflow-hidden bg-white">
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
                      >
                        {section.number}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-ink-900 mb-2">{section.title}</h3>
                        <p className="text-ink-600 mb-4">{section.description}</p>
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
                          aria-expanded={isOpen}
                        >
                          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} aria-hidden="true"></i>
                          {t('ppid.view')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-ink-100 px-4 md:px-8 pb-8 pt-4">
                      <div className="overflow-x-auto rounded-xl border border-ink-100">
                        <table className="min-w-full text-sm">
                          <thead className="bg-ink-50 text-ink-800">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap w-16">{t('ppid.table.no')}</th>
                              <th className="px-4 py-3 text-left font-semibold min-w-[220px]">{t('ppid.table.title')}</th>
                              <th className="px-4 py-3 text-left font-semibold min-w-[220px]">{t('ppid.table.summary')}</th>
                              <th className="px-4 py-3 text-left font-semibold min-w-[180px]">{t('ppid.table.unit')}</th>
                              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">{t('ppid.table.format')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.rows.map((row, rowIndex) => (
                              <tr
                                key={`${section.id}-${row.no}-${rowIndex}`}
                                className={`border-t border-ink-100 ${row.isSubRow ? 'bg-ink-50/60' : 'bg-white'}`}
                              >
                                <td className="px-4 py-3 align-top font-medium text-ink-700 whitespace-nowrap">{row.no}</td>
                                <td className={`px-4 py-3 align-top text-ink-900 ${row.isSubRow ? 'pl-8' : ''}`}>{row.title}</td>
                                <td className="px-4 py-3 align-top text-ink-600">{row.summary}</td>
                                <td className="px-4 py-3 align-top text-ink-600">{row.unit}</td>
                                <td className="px-4 py-3 align-top text-ink-600 whitespace-nowrap">{row.format}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <a
              href={content.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
            >
              <i className="fas fa-download" aria-hidden="true"></i>
              {t('ppid.download')}
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-ink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-ink-900 mb-4">{t('ppid.ctaTitle')}</h2>
          <p className="text-ink-600 mb-8 leading-relaxed">{t('ppid.ctaDescription')}</p>
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
          >
            <i className="fas fa-envelope" aria-hidden="true"></i>
            {t('ppid.contactUs')}
          </Link>
        </div>
      </section>
    </div>
  );
}
