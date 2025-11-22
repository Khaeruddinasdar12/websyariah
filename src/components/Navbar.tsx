// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoDropdownOpen, setInfoDropdownOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const handleInfoMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setInfoDropdownOpen(true);
  };
  
  const handleInfoMouseLeave = () => {
    const timeout = setTimeout(() => {
      setInfoDropdownOpen(false);
    }, 200); // Delay 200ms sebelum dropdown hilang
    setDropdownTimeout(timeout);
  };
  
  const navigation = [
    { name: t('nav.home'), href: '/', key: 'home' },
    { 
      name: t('nav.information'), 
      key: 'information',
      submenu: [
        { name: t('nav.news'), href: '/berita', key: 'news' },
        { name: t('nav.announcements'), href: '/pengumuman', key: 'announcements' },
      ]
    },
    { name: t('nav.lecturers'), href: '/dosen', key: 'lecturers' },
    { name: t('nav.about'), href: '/tentang', key: 'about' },
    { name: t('nav.accreditation'), href: '/akreditasi', key: 'accreditation' },
    { name: t('nav.services'), href: '/layanan', key: 'services' },
    { name: t('nav.contact'), href: '/kontak', key: 'contact' },
  ];
  
  const isInfoActive = pathname.startsWith('/berita') || pathname.startsWith('/pengumuman');
  
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };
  
  // Helper function to split title: first 3 words on first line, rest + subtitle on second line
  const splitTitle = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 3) {
      return { firstLine: text, secondLine: t('home.subtitle') };
    }
    const firstLine = words.slice(0, 3).join(' ');
    const remainingWords = words.slice(3).join(' ');
    const secondLine = remainingWords ? `${remainingWords} ${t('home.subtitle')}` : t('home.subtitle');
    return { firstLine, secondLine };
  };
  
  const titleParts = splitTitle(t('home.title'));
  
  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center min-w-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 overflow-hidden bg-white">
                  <Image
                    src="/assets/iain.png"
                    alt="IAIN Bone"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-shrink overflow-hidden">
                  <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 leading-tight">
                    {titleParts.firstLine}
                    <br />
                    <span className="text-[10px] sm:text-xs md:text-sm lg:text-base">{titleParts.secondLine}</span>
                  </h1>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="flex items-baseline space-x-4 xl:space-x-6">
              {navigation.map((item) => {
                if (item.submenu) {
                  return (
                    <div
                      key={item.key}
                      className="relative"
                      onMouseEnter={handleInfoMouseEnter}
                      onMouseLeave={handleInfoMouseLeave}
                    >
                      <button
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group flex items-center ${
                          isInfoActive ? '' : 'text-gray-700'
                        }`}
                        style={isInfoActive ? {color: 'var(--color-primary)'} : {}}
                        onMouseEnter={(e) => {
                          if (!isInfoActive) {
                            e.currentTarget.style.color = 'var(--color-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isInfoActive) {
                            e.currentTarget.style.color = '';
                          }
                        }}
                      >
                        {item.name}
                        <i className="fas fa-chevron-down ml-1 text-xs"></i>
                        <span
                          className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                            isInfoActive ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                          style={{backgroundColor: 'var(--color-primary)'}}
                        ></span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {infoDropdownOpen && (
                        <div 
                          className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                          onMouseEnter={handleInfoMouseEnter}
                          onMouseLeave={handleInfoMouseLeave}
                        >
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.key}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                isActive(subItem.href)
                                  ? 'text-primary bg-primary/10'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                              }`}
                              style={isActive(subItem.href) ? {color: 'var(--color-primary)'} : {}}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group ${
                      isActive(item.href)
                        ? ''
                        : 'text-gray-700'
                    }`}
                    style={isActive(item.href) ? {color: 'var(--color-primary)'} : {}}
                    onMouseEnter={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.color = '';
                      }
                    }}
                  >
                    {item.name}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                        isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                      style={{backgroundColor: 'var(--color-primary)'}}
                    ></span>
                  </Link>
                );
              })}
              
              {/* Tur Virtual */}
              <a
                href="https://iain-bone.ac.id/tur-virtual/fakultas-syariah"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group text-gray-700"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                }}
              >
                {t('nav.virtualTour')}
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
                  style={{backgroundColor: 'var(--color-primary)'}}
                ></span>
              </a>

            </div>
          </div>

          {/* Mobile/Tablet menu button and language switcher */}
          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 transition-colors duration-300"
              onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--color-primary)';}}
              onMouseLeave={(e) => {e.currentTarget.style.color = '';}}
              onFocus={(e) => {e.currentTarget.style.color = 'var(--color-primary)';}}
              onBlur={(e) => {e.currentTarget.style.color = '';}}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
          
          {/* Desktop Language Switcher */}
          <div className="hidden lg:block flex-shrink-0">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-lg">
              {navigation.map((item) => {
                if (item.submenu) {
                  return (
                    <div key={item.key}>
                      <button
                        onClick={() => setMobileInfoOpen(!mobileInfoOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                          isInfoActive
                            ? 'bg-opacity-10'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        style={isInfoActive ? {color: 'var(--color-primary)', backgroundColor: 'rgba(134, 176, 189, 0.1)'} : {}}
                      >
                        <span>{item.name}</span>
                        <i className={`fas fa-chevron-${mobileInfoOpen ? 'up' : 'down'} text-xs ml-2`}></i>
                      </button>
                      
                      {/* Mobile Submenu */}
                      {mobileInfoOpen && (
                        <div className="pl-4 mt-1 space-y-1">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.key}
                              href={subItem.href}
                              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                                isActive(subItem.href)
                                  ? 'bg-opacity-10'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                              style={isActive(subItem.href) ? {color: 'var(--color-primary)', backgroundColor: 'rgba(134, 176, 189, 0.1)'} : {}}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileInfoOpen(false);
                              }}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      isActive(item.href)
                        ? 'bg-opacity-10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={isActive(item.href) ? {color: 'var(--color-primary)', backgroundColor: 'rgba(134, 176, 189, 0.1)'} : {}}
                    onMouseEnter={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.color = '';
                      }
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Tur Virtual Mobile */}
              <a
                href="https://iain-bone.ac.id/tur-virtual/fakultas-syariah"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                }}
              >
                {t('nav.virtualTour')}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}