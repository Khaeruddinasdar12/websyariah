'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="pub-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 bg-white p-1 shrink-0">
                <Image
                  src="/assets/iain.png"
                  alt=""
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </span>
              <span>
                <span className="block text-white text-lg leading-tight">{t('footer.facultyName')}</span>
                <span className="block text-xs text-white/60">{t('footer.facultySubtitle')}</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">{t('footer.description')}</p>
            <div className="flex gap-2 mt-5">
              <a
                href="https://www.instagram.com/fshiiainbone"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-gold-light hover:text-gold-light"
                title="Instagram @fshiiainbone"
              >
                <i className="fab fa-instagram text-sm" aria-hidden="true"></i>
              </a>
              <a
                href="https://www.facebook.com/FasyahiIainBone"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-gold-light hover:text-gold-light"
                title="Facebook @Fasyahi Iain Bone"
              >
                <i className="fab fa-facebook text-sm" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold tracking-wide mb-4">{t('footer.studyPrograms')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="http://htn.iain-bone.ac.id" target="_blank" rel="noopener noreferrer">
                  {t('home.programs.constitutionalLaw.title')}
                </a>
              </li>
              <li>
                <a href="http://hes.iain-bone.ac.id" target="_blank" rel="noopener noreferrer">
                  {t('home.programs.economicLaw.title')}
                </a>
              </li>
              <li>
                <a href="http://hki.iain-bone.ac.id" target="_blank" rel="noopener noreferrer">
                  {t('home.programs.familyLaw.title')}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold tracking-wide mb-4">{t('footer.information')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/tentang">{t('footer.aboutUs')}</Link></li>
              <li><Link href="/berita">{t('footer.news')}</Link></li>
              <li><Link href="/pengumuman">{t('footer.announcements')}</Link></li>
              <li><Link href="/tim-kami">{t('footer.lecturers')}</Link></li>
              <li><Link href="/ppid">{t('nav.ppid')}</Link></li>
              <li><Link href="/layanan">{t('nav.services')}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold tracking-wide mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <i className="fas fa-map-marker-alt mt-1 text-gold-light" aria-hidden="true"></i>
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-phone text-gold-light" aria-hidden="true"></i>
                <span>{t('footer.phone')}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-envelope text-gold-light" aria-hidden="true"></i>
                <span>{t('footer.email')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-white/55">
          <p>
            &copy; {new Date().getFullYear()} {t('footer.facultyName')} {t('footer.facultySubtitle')}. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
