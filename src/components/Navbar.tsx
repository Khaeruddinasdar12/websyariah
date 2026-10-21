'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileInfoOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

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
    }, 160);
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
      ],
    },
    { name: t('nav.lecturers'), href: '/tim-kami', key: 'lecturers' },
    { name: t('nav.about'), href: '/tentang', key: 'about' },
    { name: t('nav.accreditation'), href: '/akreditasi', key: 'accreditation' },
    { name: t('nav.services'), href: '/layanan', key: 'services' },
    { name: t('nav.contact'), href: '/kontak', key: 'contact' },
  ];

  const isInfoActive = pathname.startsWith('/berita') || pathname.startsWith('/pengumuman');

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="pub-topbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4 text-xs">
          <p className="pub-top-name">
            {t('footer.facultyName')}
          </p>
          <div className="pub-top-links">
            <Link
              href="/ppid"
              className={`pub-top-link ${pathname.startsWith('/ppid') ? 'is-active' : ''}`}
            >
              <i className="fas fa-folder-open" aria-hidden="true"></i>
              <span>{t('nav.ppid')}</span>
            </Link>
            <a
              href="https://iain-bone.ac.id/tur-virtual/fakultas-syariah"
              target="_blank"
              rel="noopener noreferrer"
              className="pub-top-link"
            >
              <i className="fas fa-street-view" aria-hidden="true"></i>
              <span>{t('nav.virtualTour')}</span>
            </a>
            <LanguageSwitcher variant="onDark" />
          </div>
        </div>
      </div>

      <nav className="pub-nav" aria-label="Utama">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pub-nav-bar">
            <Link href="/" className="pub-brand">
              <span className="pub-brand-mark">
                <Image
                  src="/assets/iain.png"
                  alt="IAIN Bone"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </span>
              <span className="min-w-0">
                <span className="pub-brand-title">
                  {t('footer.facultyName')}
                </span>
                <span className="pub-brand-sub">
                  {t('home.subtitle')}
                </span>
              </span>
            </Link>

            <div className="hidden xl:flex items-center ml-auto">
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
                        className={`pub-nav-link inline-flex items-center gap-1 ${isInfoActive ? 'is-active' : ''}`}
                        aria-expanded={infoDropdownOpen}
                        aria-haspopup="true"
                      >
                        {item.name}
                        <i className="fas fa-chevron-down text-[10px]" aria-hidden="true"></i>
                      </button>
                      {infoDropdownOpen && (
                        <div
                          className="pub-menu absolute top-full left-0 mt-2 w-52 bg-white border border-ink-200 py-1.5 z-50"
                          onMouseEnter={handleInfoMouseEnter}
                          onMouseLeave={handleInfoMouseLeave}
                        >
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.key}
                              href={subItem.href}
                              className={`block px-4 py-2.5 text-sm ${
                                isActive(subItem.href)
                                  ? 'text-primary bg-ink-50'
                                  : 'text-ink-800 hover:bg-ink-50 hover:text-primary'
                              }`}
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
                    className={`pub-nav-link ${isActive(item.href) ? 'is-active' : ''}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="pub-nav-toggle"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="pub-menu pub-nav-panel xl:hidden">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navigation.map((item) => {
                if (item.submenu) {
                  return (
                    <div key={item.key}>
                      <button
                        type="button"
                        onClick={() => setMobileInfoOpen((open) => !open)}
                        className={`pub-nav-item w-full flex items-center justify-between px-3 py-3 text-base ${
                          isInfoActive ? 'is-active' : ''
                        }`}
                      >
                        <span>{item.name}</span>
                        <i className={`fas fa-chevron-${mobileInfoOpen ? 'up' : 'down'} text-xs`} aria-hidden="true"></i>
                      </button>
                      {mobileInfoOpen && (
                        <div className="pl-3 pb-1">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.key}
                              href={subItem.href}
                              className={`pub-nav-item block px-3 py-2.5 text-sm ${
                                isActive(subItem.href) ? 'is-active' : ''
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
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
                    className={`pub-nav-item block px-3 py-3 text-base ${
                      isActive(item.href) ? 'is-active' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
