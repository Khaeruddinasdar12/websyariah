"use client";

import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import Link from 'next/link';

export default function AkreditasiPage() {
  const { t } = useLanguage();
  usePageTitle(t('nav.accreditation'));
  
  const accreditationItems = [
    {
      title: t('accreditation.items.economicLaw.title'),
      description: t('accreditation.items.economicLaw.description'),
      url: 'https://hes.iain-bone.ac.id/accreditation',
      icon: 'fa-balance-scale'
    },
    {
      title: t('accreditation.items.familyLaw.title'),
      description: t('accreditation.items.familyLaw.description'),
      url: 'https://hki.iain-bone.ac.id/akreditasi',
      icon: 'fa-users'
    },
    {
      title: t('accreditation.items.constitutionalLaw.title'),
      description: t('accreditation.items.constitutionalLaw.description'),
      url: 'https://htn.iain-bone.ac.id/accreditation',
      icon: 'fa-gavel'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-outfit">
      {/* Page Header */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-500 mb-4">{t('accreditation.title')}</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {t('accreditation.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Accreditation Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {accreditationItems.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl shadow-lg border border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300 p-8 card-hover"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors duration-300 group-hover:scale-110">
                    <i className={`fas ${item.icon} text-3xl`} style={{color: 'var(--color-primary)'}}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    <span>{t('accreditation.viewAccreditation')}</span>
                    <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

