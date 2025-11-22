"use client";

import { useLanguage } from '@/context/LanguageContext';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function LayananPage() {
  const { t } = useLanguage();
  usePageTitle(t('nav.services'));
  
  const layananItems = [
    { 
      name: t('services.items.pmb.name'), 
      description: t('services.items.pmb.description'), 
      url: 'https://pmb.iain-bone.ac.id/',
      icon: 'fa-user-graduate'
    },
    { 
      name: t('services.items.tusita.name'), 
      description: t('services.items.tusita.description'), 
      url: 'https://tusita.iain-bone.ac.id/gate/login',
      icon: 'fa-graduation-cap'
    },
    { 
      name: t('services.items.elearning.name'), 
      description: t('services.items.elearning.description'), 
      url: 'https://edlink.id/',
      icon: 'fa-laptop'
    },
    { 
      name: t('services.items.digilib.name'), 
      description: t('services.items.digilib.description'), 
      url: 'https://kbk2300046.perpustakaandigital.com/',
      icon: 'fa-book'
    },
    { 
      name: t('services.items.repository.name'), 
      description: t('services.items.repository.description'), 
      url: 'http://repositori.iain-bone.ac.id/',
      icon: 'fa-database'
    },
    { 
      name: t('services.items.perpusnas.name'), 
      description: t('services.items.perpusnas.description'), 
      url: 'https://www.perpusnas.go.id/',
      icon: 'fa-book-open'
    },
    { 
      name: t('services.items.layanan.name'), 
      description: t('services.items.layanan.description'), 
      url: 'https://layanan.iain-bone.ac.id/',
      icon: 'fa-info-circle'
    },
    { 
      name: t('services.items.lapor.name'), 
      description: t('services.items.lapor.description'), 
      url: 'https://prod.lapor.go.id/',
      icon: 'fa-comment-dots'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-outfit">
      {/* Hero Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-500 mb-4">{t('services.title')}</h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              {t('services.subtitle')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Services Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {layananItems.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 group bg-white"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300 group-hover:scale-110">
                    <i className={`fas ${item.icon} text-2xl`} style={{color: 'var(--color-primary)'}}></i>
                  </div>
                  <h3 className="font-semibold text-base text-gray-800 mb-2 group-hover:text-primary transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-tight">
                    {item.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

