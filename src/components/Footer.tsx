// components/Footer.tsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer
      className="py-12 text-white"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-deep-blue) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{background: 'linear-gradient(to bottom right, var(--color-gold), var(--color-gold-light))'}}>
                  <i className="fas fa-mosque text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{t('footer.facultyName')}</h3>
                  <p className="text-xs text-white/70">{t('footer.facultySubtitle')}</p>
                </div>
              </Link>
            </div>
            <p className="text-white/75 mb-4 leading-relaxed text-sm">
              {t('footer.description')}
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://www.instagram.com/fshiiainbone" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/15 rounded-md flex items-center justify-center transition-all duration-300 hover:bg-gold/80"
                title="Instagram @fshiiainbone"
              >
                <i className="fab fa-instagram text-sm"></i>
              </a>
              <a 
                href="https://www.facebook.com/FasyahiIainBone" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/15 rounded-md flex items-center justify-center transition-all duration-300 hover:bg-gold/80"
                title="Facebook @Fasyahi Iain Bone"
              >
                <i className="fab fa-facebook text-sm"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-4 text-gold-light">{t('footer.studyPrograms')}</h4>
            <ul className="space-y-2 text-white/75 text-sm">
              <li>
                <a 
                  href="http://htn.iain-bone.ac.id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold-light transition-colors duration-300"
                >
                  {t('home.programs.constitutionalLaw.title')}
                </a>
              </li>
              <li>
                <a 
                  href="http://hes.iain-bone.ac.id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold-light transition-colors duration-300"
                >
                  {t('home.programs.economicLaw.title')}
                </a>
              </li>
              <li>
                <a 
                  href="http://hki.iain-bone.ac.id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold-light transition-colors duration-300"
                >
                  {t('home.programs.familyLaw.title')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-4 text-gold-light">{t('footer.information')}</h4>
            <ul className="space-y-2 text-white/75 text-sm">
              <li>
                <Link href="/tentang" className="hover:text-gold-light transition-colors duration-300">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-gold-light transition-colors duration-300">
                  {t('footer.news')}
                </Link>
              </li>
              <li>
                <Link href="/pengumuman" className="hover:text-gold-light transition-colors duration-300">
                  {t('footer.announcements')}
                </Link>
              </li>
              <li>
                <Link href="/tim-kami" className="hover:text-gold-light transition-colors duration-300">
                  {t('footer.lecturers')}
                </Link>
              </li>
              <li>
                <Link href="/ppid" className="hover:text-gold-light transition-colors duration-300">
                  {t('nav.ppid')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-semibold mb-4 text-gold-light">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-white/75 text-sm">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2 text-gold-light"></i>
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-2 text-gold-light"></i>
                <span>{t('footer.phone')}</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-2 text-gold-light"></i>
                <span>{t('footer.email')}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/70">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} {t('footer.facultyName')} {t('footer.facultySubtitle')}. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
