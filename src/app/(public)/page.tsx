"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useLanguage } from '@/context/LanguageContext';
import { fetchAnnouncementsI18n, fetchBeritaI18n } from '@/lib/supabase-i18n';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Pengumuman {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  created_at?: string;
}

interface Berita {
  id: number;
  judul: string;
  konten: string;
  gambar: string;
  kategori: string;
  created_at?: string;
}

// Helper function to format date
function formatDate(dateString?: string, locale: string = 'id-ID'): string {
  if (!dateString) return new Date().toLocaleDateString(locale, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Helper function to create excerpt
function createExcerpt(konten: string, maxLength: number = 100): string {
  if (konten.length <= maxLength) return konten;
  return konten.substring(0, maxLength).trim() + '...';
}

// Helper function to create slug for berita
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function HomePage() {
  const { language, t } = useLanguage();
  usePageTitle(t('nav.home'));
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [berita, setBerita] = useState<Berita[]>([]);
  const [loadingPengumuman, setLoadingPengumuman] = useState(true);
  const [loadingBerita, setLoadingBerita] = useState(true);

  // Get locale for date formatting
  const localeMap: Record<string, string> = {
    'id': 'id-ID',
    'en': 'en-US',
    'ar': 'ar-SA'
  };

  // Fetch pengumuman from Supabase with i18n
  useEffect(() => {
    async function fetchPengumuman() {
      try {
        setLoadingPengumuman(true);
        const data = await fetchAnnouncementsI18n(language, 3);
        setPengumuman(data || []);
      } catch (err) {
        console.error('Error fetching pengumuman:', err);
        setPengumuman([]);
      } finally {
        setLoadingPengumuman(false);
      }
    }

    fetchPengumuman();
  }, [language]);

  // Fetch berita from Supabase with i18n
  useEffect(() => {
    async function fetchBerita() {
      try {
        setLoadingBerita(true);
        const data = await fetchBeritaI18n(language, 6);
        setBerita(data || []);
      } catch (err) {
        console.error('Error fetching berita:', err);
        setBerita([]);
      } finally {
        setLoadingBerita(false);
      }
    }

    fetchBerita();
  }, [language]);
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{background: 'linear-gradient(to bottom right, rgba(134, 176, 189, 0.05), rgba(255, 255, 255, 1), rgba(168, 200, 211, 0.03))'}}>
        {/* Background Pattern */}
        <div className="absolute inset-0 hero-pattern opacity-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-sage-green/15 to-soft-green/15 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-gold/15 to-yellow-500/15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-10 h-10 bg-gradient-to-br from-deep-blue/15 to-blue-600/15 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="animate-fade-in">
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                  <i className="fas fa-star text-gold mr-2 text-sm"></i>
                  <span className="text-gray-700 font-medium text-sm">{t('home.accredited')}</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                {t('home.title')}
                <div className="text-2xl md:text-3xl font-semibold text-primary mt-2">{t('home.subtitle')}</div>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                {t('home.description')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/dosen" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 border-2 shadow-md hover:shadow-lg" style={{borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'rgba(134, 176, 189, 0.1)', borderWidth: '2px'}} onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)';}} onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = 'rgba(134, 176, 189, 0.1)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(0)';}}>
                  <i className="fas fa-chalkboard-teacher mr-2"></i>
                  <span>{t('home.lecturers')}</span>
                </Link>
                <Link href="/tentang" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" style={{background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))', color: 'white', border: '2px solid var(--color-primary)'}}>
                  <i className="fas fa-play mr-2"></i>
                  <span>{t('home.learnMore')}</span>
                </Link>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>2200+</div>
                  <p className="text-gray-600 text-xs">{t('home.activeStudents')}</p>
                </div>
                <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>50+</div>
                  <p className="text-gray-600 text-xs">{t('home.expertLecturers')}</p>
                </div>
                <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>3</div>
                  <p className="text-gray-600 text-xs">{t('home.studyPrograms')}</p>
                </div>
                <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>50+</div>
                  <p className="text-gray-600 text-xs">{t('home.yearsExperience')}</p>
                </div>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden md:block relative animate-slide-up">
              <div className="relative">
                {/* Main Illustration Container */}
                <div className="relative w-full h-[500px]">
                  {/* Decorative Circles */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sage-green/20 to-soft-green/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-gold/20 to-yellow-500/20 rounded-full blur-3xl"></div>
                  
                  {/* Illustration SVG/Icon */}
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="w-full max-w-md">
                      {/* Book/Education Illustration */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-sage-green/10 to-soft-green/10 rounded-3xl transform rotate-6"></div>
                        <div className="relative bg-white rounded-3xl p-8 shadow-2xl border" style={{borderColor: 'rgba(134, 176, 189, 0.2)'}}>
                          <div className="text-center">
                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border-4" style={{background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.3)'}}>
                              <i className="fas fa-user-graduate text-white" style={{display: 'block', fontSize: '2.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('home.hero.illustrationTitle')}</h3>
                            <p className="text-gray-600 text-sm">{t('home.hero.illustrationSubtitle')}</p>
                          </div>
                          
                          {/* Decorative Elements */}
                          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-gold to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <i className="fas fa-star text-white" style={{display: 'block', fontSize: '1.25rem'}}></i>
                          </div>
                          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-deep-blue to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <i className="fas fa-graduation-cap text-white" style={{display: 'block', fontSize: '1rem'}}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
          <i className="fas fa-chevron-down text-gray-400 text-xl"></i>
        </div>
      </section>

      {/* Banner Section */}
  <section className="relative py-16 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative">
            {/* Main Banner Image */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <img src="assets/berita2.jpeg"  
           alt="Kampus IAIN Bone" 
           className="w-full h-96 md:h-[500px] object-cover"/>

              {/* Overlay with gradient */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
         </div>

            {/* Decorative elements */}
         <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-sage-green/30 to-soft-green/30 rounded-full animate-float"></div>
         <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-gold/40 to-yellow-500/40 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
         <div className="absolute -bottom-6 -left-4 w-10 h-10 bg-gradient-to-br from-deep-blue/30 to-blue-600/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
         <div className="absolute -bottom-4 -right-6 w-6 h-6 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>

            {/* Corner decorations */}
         <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-sage-green/50 rounded-tl-3xl"></div>
         <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-sage-green/50 rounded-tr-3xl"></div>
         <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-sage-green/50 rounded-bl-3xl"></div>
         <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-sage-green/50 rounded-br-3xl"></div>
       </div>
     </div>
   </section>

      {/* Sambutan Dekan Section */}
   <section className="py-20 bg-white relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="w-64 h-64 mx-auto relative">
                {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-sage-green/10 to-soft-green/10 rounded-full blur-lg"></div>
                {/* Photo frame with gradient border - FIXED */}
            <div className="relative w-full h-full p-3 rounded-full shadow-xl" style={{background: 'linear-gradient(to bottom right, rgba(134, 176, 189, 0.8), rgba(168, 200, 211, 0.8))'}}>
              <div className="w-full h-full bg-white rounded-full p-2">
                <div className="w-full h-full rounded-full overflow-hidden border-4 shadow-inner" style={{borderColor: 'rgba(134, 176, 189, 0.4)'}}>
                  <img
                    src="/assets/astuti.jpg"
                    alt="Prof. Dr. Astuti, S.Ag., M.Pd. - Dekan Fakultas Syariah dan Hukum Islam IAIN Bone"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextSibling) nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
                      <i className="fas fa-user-tie text-4xl text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
                {/* Floating elements */}
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-gold/60 to-yellow-500/60 rounded-full animate-float shadow-lg"></div>
            <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-gradient-to-br from-deep-blue/60 to-blue-600/60 rounded-full animate-float shadow-lg" style={{animationDelay: '1s'}}></div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('home.dean.title')}</h2>
            <div className="w-20 h-1 gradient-primary mb-6"></div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">{t('home.dean.name')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('home.dean.position')}</p>

            <blockquote className="text-gray-700 leading-relaxed italic border-l-4 pl-6" style={{borderColor: 'var(--color-primary)'}}>
              "{t('home.dean.quote')}"
            </blockquote>

            <p className="text-gray-600 text-sm leading-relaxed">
              {t('home.dean.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

      {/* About Section */}
      <section id="tentang" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('home.about.title')}</h2>
            <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.about.description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">

  {/* Card 1 */}
  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-white to-warm-gray shadow-lg card-hover group">
  <div className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-4 
                  group-hover:scale-110 transition-transform duration-300 shadow-xl border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.4)'}}>
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  </div>
  <h3 className="text-xl font-bold text-gray-800 mb-3">{t('home.aboutCards.qualityEducation.title')}</h3>
  <p className="text-gray-600 text-sm leading-relaxed">
    {t('home.aboutCards.qualityEducation.description')}
  </p>
</div>


  {/* Card 2 */}
  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-white to-warm-gray shadow-lg card-hover group">
    <div className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-4 
                    group-hover:scale-110 transition-transform duration-300 shadow-xl border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderColor: 'rgba(245, 158, 11, 0.4)'}}>
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{t('home.aboutCards.practicalApproach.title')}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">
      {t('home.aboutCards.practicalApproach.description')}
    </p>
  </div>

  {/* Card 3 */}
  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-white to-warm-gray shadow-lg card-hover group">
    <div className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-4 
                    group-hover:scale-110 transition-transform duration-300 shadow-xl border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', borderColor: 'rgba(30, 64, 175, 0.4)'}}>
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{t('home.aboutCards.academicCommunity.title')}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">
      {t('home.aboutCards.academicCommunity.description')}
    </p>
  </div>

</div>

        </div>
      </section>

      {/* Pengumuman Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
                <i className="fas fa-bullhorn text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{t('home.announcements.title')}</h2>
                <p className="text-gray-600 text-sm mt-1">{t('home.announcements.subtitle')}</p>
              </div>
            </div>
            <Link href="/pengumuman" className="btn-soft-outline hidden md:flex items-center">
              {t('common.seeAll')} <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>

          {loadingPengumuman ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-soft p-5 border-l-4 animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : pengumuman.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {pengumuman.map((item) => (
                <Link
                  key={item.id}
                  href={`/pengumuman/${item.slug}`}
                  className="card-soft p-5 border-l-4 hover:shadow-lg transition-all duration-300 block"
                  style={{borderColor: 'var(--color-primary)'}}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      {t('home.announcements.badge')}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(item.created_at, localeMap[language])}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">{item.judul}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{createExcerpt(item.konten, 100)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">{t('announcements.noAnnouncements')}</p>
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Link href="/pengumuman" className="btn-soft-outline inline-flex items-center">
              {t('common.seeAll')} <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Berita Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl flex items-center justify-center shadow-md">
                <i className="fas fa-newspaper text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{t('home.news.title')}</h2>
                <p className="text-gray-600 text-sm mt-1">{t('home.news.subtitle')}</p>
              </div>
            </div>
            <Link href="/berita" className="btn-soft-outline hidden md:flex items-center">
              {t('common.seeAll')} <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>

          {loadingBerita ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <article key={i} className="card-soft overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                </article>
              ))}
            </div>
          ) : berita.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {berita.map((item) => {
                const slug = createSlug(item.judul) + '-' + item.id;
                return (
                  <Link
                    key={item.id}
                    href={`/berita/${slug}`}
                    className="card-soft overflow-hidden hover:shadow-lg transition-all duration-300 block"
                  >
                    <div className="h-48 bg-gradient-to-br from-sage-green/15 to-soft-green/15 flex items-center justify-center relative overflow-hidden">
                      {item.gambar ? (
                        <Image
                          src={item.gambar}
                          alt={item.judul}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextSibling = target.nextElementSibling as HTMLElement;
                            if (nextSibling) nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{display: item.gambar ? 'none' : 'flex'}}>
                        <i className="fas fa-newspaper text-2xl text-sage-green/50"></i>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        <span>{formatDate(item.created_at, localeMap[language])}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">{item.judul}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">{createExcerpt(item.konten, 100)}</p>
                      <span className="text-primary hover:opacity-80 text-xs font-medium transition-colors inline-flex items-center">
                        {t('common.readMore')} <i className="fas fa-arrow-right ml-1 text-xs"></i>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">{t('news.noNews')}</p>
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Link href="/berita" className="btn-soft-outline inline-flex items-center">
              {t('common.seeAll')} <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Program Studi Preview Section */}
<section className="py-20 bg-gradient-to-br from-warm-gray to-white relative">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('home.programs.title')}</h2>
      <div className="w-20 h-1 bg-gradient-to-r from-sage-green to-soft-green mx-auto mb-6"></div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        {t('home.programs.subtitle')}
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
            {/* Hukum Tata Negara - Orange Soft */}
      <div className="bg-white rounded-xl shadow-lg card-hover p-6 relative overflow-hidden group border border-orange-100">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full -translate-y-12 translate-x-12 opacity-40 group-hover:scale-110 transition-transform duration-300"></div>
        <div className="relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
            <i className="fas fa-landmark text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">{t('home.programs.constitutionalLaw.title')}</h3>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {t('home.programs.constitutionalLaw.description')}
          </p>
          <a href="/dosen#hukum-tata-negara" className="inline-block bg-gradient-to-r from-orange-500 to-orange-400 text-white px-6 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-500 transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105">
            {t('home.programs.constitutionalLaw.learnMore')}
          </a>
        </div>
      </div>

            {/* Hukum Keluarga Islam - Biru Muda Soft */}
      <div className="bg-white rounded-xl shadow-lg card-hover p-6 relative overflow-hidden group border border-blue-100">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full -translate-y-12 translate-x-12 opacity-40 group-hover:scale-110 transition-transform duration-300"></div>
        <div className="relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
            <i className="fas fa-heart text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">{t('home.programs.familyLaw.title')}</h3>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {t('home.programs.familyLaw.description')}
          </p>
          <a href="/dosen#hukum-keluarga-islam" className="inline-block bg-gradient-to-r from-blue-500 to-blue-400 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105">
            {t('home.programs.familyLaw.learnMore')}
          </a>
        </div>
      </div>

            {/* Hukum Ekonomi Syariah - Hijau Soft */}
      <div className="bg-white rounded-xl shadow-lg card-hover p-6 relative overflow-hidden group border border-emerald-100">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full -translate-y-12 translate-x-12 opacity-40 group-hover:scale-110 transition-transform duration-300"></div>
        <div className="relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
            <i className="fas fa-book-open text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">{t('home.programs.economicLaw.title')}</h3>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {t('home.programs.economicLaw.description')}
          </p>
          <Link href="/dosen#hukum-ekonomi-syariah" className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-400 text-white px-6 py-2.5 rounded-lg hover:from-emerald-600 hover:to-emerald-500 transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105">
          {t('home.programs.economicLaw.learnMore')}
        </Link>
      </div>
    </div>
  </div>
</div>
</section>

      {/* Visi Misi Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('home.visionMission.title')}</h2>
            <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Visi */}
            <div className="card-soft p-8">
              <div className="flex items-center mb-6">
                <div className="w-18 h-18 rounded-2xl flex items-center justify-center mr-4 shadow-lg" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)'}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{t('about.vision.title')}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {t('about.vision.content')}
              </p>
            </div>

            {/* Misi */}
            <div className="card-soft p-8">
              <div className="flex items-center mb-6">
                <div className="w-18 h-18 rounded-2xl flex items-center justify-center mr-4 shadow-lg" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)'}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{t('about.mission.title')}</h3>
              </div>
              <ul className="space-y-3 text-gray-700 leading-relaxed">
                {['about.mission.items.0', 'about.mission.items.1', 'about.mission.items.2', 'about.mission.items.3'].map((key, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check-circle mr-3 mt-1" style={{color: 'var(--color-primary)', display: 'block'}}></i>
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fasilitas Section */}
      <section className="py-20 bg-gradient-to-br from-warm-gray to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('home.facilities.title')}</h2>
            <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.facilities.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-soft p-6 text-center group">
              <div className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #86B0BD 0%, #A8C8D3 100%)', borderColor: 'rgba(134, 176, 189, 0.4)'}}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('home.facilities.library.title')}</h3>
              <p className="text-gray-600 text-sm">{t('home.facilities.library.description')}</p>
            </div>

            <div className="card-soft p-6 text-center group">
              <div className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', borderColor: 'rgba(96, 165, 250, 0.4)'}}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('home.facilities.computerLab.title')}</h3>
              <p className="text-gray-600 text-sm">{t('home.facilities.computerLab.description')}</p>
            </div>

            <div className="card-soft p-6 text-center group">
              <div className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', borderColor: 'rgba(251, 146, 60, 0.4)'}}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('home.facilities.discussionRoom.title')}</h3>
              <p className="text-gray-600 text-sm">{t('home.facilities.discussionRoom.description')}</p>
            </div>

            <div className="card-soft p-6 text-center group">
              <div className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2" style={{width: '4.5rem', height: '4.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: 'rgba(16, 185, 129, 0.4)'}}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('home.facilities.wifi.title')}</h3>
              <p className="text-gray-600 text-sm">{t('home.facilities.wifi.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('home.testimonials.title')}</h2>
            <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="testimoni-swiper"
          >
            <SwiperSlide>
              <div className="bg-gradient-to-br from-white to-warm-gray rounded-2xl p-6 md:p-8 shadow-lg h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sage-green to-soft-green rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white font-bold">PR</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-800 text-base">{t('home.testimonialItems.putra.name')}</h4>
                    <p className="text-xs text-gray-600 leading-tight mt-1">{t('home.testimonialItems.putra.role')}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold text-sm"></i>
                  ))}
                </div>
                <p className="text-gray-800 leading-relaxed text-sm md:text-base flex-1" style={{color: '#1f2937', lineHeight: '1.75'}}>
                  "{t('home.testimonialItems.putra.quote')}"
                </p>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="bg-gradient-to-br from-white to-warm-gray rounded-2xl p-6 md:p-8 shadow-lg h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white font-bold">AA</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-800 text-base">{t('home.testimonialItems.ahmad.name')}</h4>
                    <p className="text-xs text-gray-600 leading-tight mt-1">{t('home.testimonialItems.ahmad.role')}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold text-sm"></i>
                  ))}
                </div>
                <p className="text-gray-800 leading-relaxed text-sm md:text-base flex-1" style={{color: '#1f2937', lineHeight: '1.75'}}>
                  "{t('home.testimonialItems.ahmad.quote')}"
                </p>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="bg-gradient-to-br from-white to-warm-gray rounded-2xl p-6 md:p-8 shadow-lg h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white font-bold">VS</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-800 text-base">{t('home.testimonialItems.vivin.name')}</h4>
                    <p className="text-xs text-gray-600 leading-tight mt-1">{t('home.testimonialItems.vivin.role')}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold text-sm"></i>
                  ))}
                </div>
                <p className="text-gray-800 leading-relaxed text-sm md:text-base flex-1" style={{color: '#1f2937', lineHeight: '1.75'}}>
                  "{t('home.testimonialItems.vivin.quote')}"
                </p>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="bg-gradient-to-br from-white to-warm-gray rounded-2xl p-6 md:p-8 shadow-lg h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white font-bold">AT</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-800 text-base">{t('home.testimonialItems.taufiq.name')}</h4>
                    <p className="text-xs text-gray-600 leading-tight mt-1">{t('home.testimonialItems.taufiq.role')}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-gold text-sm"></i>
                  ))}
                </div>
                <p className="text-gray-800 leading-relaxed text-sm md:text-base flex-1" style={{color: '#1f2937', lineHeight: '1.75'}}>
                  "{t('home.testimonialItems.taufiq.quote')}"
                </p>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* Stats Section */}
<section className="py-20 relative overflow-hidden" style={{background: 'linear-gradient(to right, rgba(134, 176, 189, 0.4), rgba(168, 200, 211, 0.4))'}}>
  <div className="absolute inset-0 bg-white/20"></div>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="grid md:grid-cols-4 gap-8 text-center">
      <div className="group">
        <div className="text-4xl font-bold text-gray-800 mb-3 group-hover:scale-110 transition-transform duration-300">2200+</div>
        <p className="text-gray-700 text-base">{t('home.stats.activeStudents')}</p>
      </div>
      <div className="group">
        <div className="text-4xl font-bold text-gray-800 mb-3 group-hover:scale-110 transition-transform duration-300">50+</div>
        <p className="text-gray-700 text-base">{t('home.stats.expertLecturers')}</p>
      </div>
      <div className="group">
        <div className="text-4xl font-bold text-gray-800 mb-3 group-hover:scale-110 transition-transform duration-300">3</div>
        <p className="text-gray-700 text-base">{t('home.stats.studyPrograms')}</p>
      </div>
      <div className="group">
        <div className="text-4xl font-bold text-gray-800 mb-3 group-hover:scale-110 transition-transform duration-300">50+</div>
        <p className="text-gray-700 text-base">{t('home.stats.yearsExperience')}</p>
      </div>
    </div>
  </div>
</section>

      {/* Partnership Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('home.partnership.title')}</h2>
            <div className="w-20 h-1 gradient-primary mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.partnership.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {/* Lapas */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center group">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors overflow-hidden relative">
                <Image 
                  src="/assets/partners/lapas.png" 
                  alt={t('home.partnership.lapas')} 
                  width={60} 
                  height={60} 
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const icon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'block';
                  }}
                />
                <i className="fas fa-building text-3xl hidden" style={{color: 'var(--color-primary)', position: 'absolute'}}></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center">{t('home.partnership.lapas')}</h3>
            </div>

            {/* Kejaksaan */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center group">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors overflow-hidden relative">
                <Image 
                  src="/assets/partners/kejaksaan.png" 
                  alt={t('home.partnership.kejaksaan')} 
                  width={60} 
                  height={60} 
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const icon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'block';
                  }}
                />
                <i className="fas fa-gavel text-3xl hidden" style={{color: 'var(--color-primary)', position: 'absolute'}}></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center">{t('home.partnership.kejaksaan')}</h3>
            </div>

            {/* Pengadilan Negeri */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center group">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors overflow-hidden relative">
                <Image 
                  src="/assets/partners/pengadilan-negeri.png" 
                  alt={t('home.partnership.pengadilanNegeri')} 
                  width={60} 
                  height={60} 
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const icon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'block';
                  }}
                />
                <i className="fas fa-balance-scale text-3xl hidden" style={{color: 'var(--color-primary)', position: 'absolute'}}></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center">{t('home.partnership.pengadilanNegeri')}</h3>
            </div>

            {/* Pengadilan Agama */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center group">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors overflow-hidden relative">
                <Image 
                  src="/assets/partners/pengadilan-agama.png" 
                  alt={t('home.partnership.pengadilanAgama')} 
                  width={60} 
                  height={60} 
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const icon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'block';
                  }}
                />
                <i className="fas fa-mosque text-3xl hidden" style={{color: 'var(--color-primary)', position: 'absolute'}}></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center">{t('home.partnership.pengadilanAgama')}</h3>
            </div>

            {/* PERADI */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center group">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors overflow-hidden relative">
                <Image 
                  src="/assets/partners/peradi.png" 
                  alt={t('home.partnership.peradi')} 
                  width={60} 
                  height={60} 
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const icon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'block';
                  }}
                />
                <i className="fas fa-briefcase text-3xl hidden" style={{color: 'var(--color-primary)', position: 'absolute'}}></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center">{t('home.partnership.peradi')}</h3>
            </div>

            {/* BSI */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center group">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors overflow-hidden relative">
                <Image 
                  src="/assets/partners/bsi.png" 
                  alt={t('home.partnership.bsi')} 
                  width={60} 
                  height={60} 
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const icon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'block';
                  }}
                />
                <i className="fas fa-university text-3xl hidden" style={{color: 'var(--color-primary)', position: 'absolute'}}></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center">{t('home.partnership.bsi')}</h3>
            </div>

            {/* KEMENAG Kab. Bone */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center group">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors overflow-hidden relative">
                <Image 
                  src="/assets/partners/kemenag.png" 
                  alt={t('home.partnership.kemenag')} 
                  width={60} 
                  height={60} 
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const icon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'block';
                  }}
                />
                <i className="fas fa-landmark text-3xl hidden" style={{color: 'var(--color-primary)', position: 'absolute'}}></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center">{t('home.partnership.kemenag')}</h3>
            </div>

            {/* BAZNAS */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center group">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors overflow-hidden relative">
                <Image 
                  src="/assets/partners/baznas.png" 
                  alt={t('home.partnership.baznas')} 
                  width={60} 
                  height={60} 
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const icon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'block';
                  }}
                />
                <i className="fas fa-hand-holding-heart text-3xl hidden" style={{color: 'var(--color-primary)', position: 'absolute'}}></i>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 text-center">{t('home.partnership.baznas')}</h3>
            </div>
          </div>
        </div>
      </section>
</div>
);
}