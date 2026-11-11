"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useLanguage } from '@/context/LanguageContext';
import { fetchAnnouncementsI18n, fetchBeritaI18n } from '@/lib/supabase-i18n';
import { usePageTitle } from '@/hooks/usePageTitle';
import HomeProfessors from '@/components/public/HomeProfessors';

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

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function createExcerpt(konten: string, maxLength: number = 100): string {
  const plainText = stripHtml(konten);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function CountValue({ value, locale }: { value: string; locale: string }) {
  const ref = useRef<HTMLElement>(null);
  const match = /^(\d+)(\D*)$/.exec(value);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || !match) return;

    let frame = 0;
    let started = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const run = () => {
      if (started) return;
      started = true;
      if (reduce) {
        setCurrent(target);
        return;
      }
      const duration = 1100;
      const begun = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - begun) / duration);
        const eased = 1 - (1 - progress) ** 3;
        setCurrent(Math.round(eased * target));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        run();
        observer.disconnect();
      }
    }, { threshold: 0.6 });
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, suffix]);

  if (!match) return <strong>{value}</strong>;

  return (
    <strong ref={ref}>
      {current.toLocaleString(locale)}
      {suffix}
    </strong>
  );
}

const PMB_URL = 'https://admisi.iain-bone.ac.id/';

function PartnerCard({ partner }: { partner: { src: string; label: string } }) {
  return (
    <article className="pub-partner h-full">
      <div className="pub-partner-logo">
        <Image
          src={partner.src}
          alt=""
          fill
          className="object-contain"
          sizes="240px"
        />
      </div>
      <h3>{partner.label}</h3>
    </article>
  );
}

function SectionHead({ kicker, title, text }: { kicker?: string; title: string; text?: string }) {
  return (
    <div className="pub-head">
      {kicker ? <p className="pub-pill">{kicker}</p> : null}
      <h2 className="pub-h2">{title}</h2>
      {text ? <p className="pub-head-text">{text}</p> : null}
      <span className="pub-head-rule" aria-hidden="true"></span>
    </div>
  );
}

function HomeNewsCard({
  item,
  locale,
  readMore,
}: {
  item: Berita;
  locale: string;
  readMore: string;
}) {
  const [failed, setFailed] = useState(false);
  const slug = `${createSlug(item.judul)}-${item.id}`;
  const showImage = Boolean(item.gambar) && !failed;

  return (
    <Link href={`/berita/${slug}`} className="pub-card overflow-hidden block h-full">
      <div className="pub-thumb">
        {showImage ? (
          <Image
            src={item.gambar}
            alt={item.judul}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-400">
            <i className="fas fa-newspaper text-2xl" aria-hidden="true"></i>
          </div>
        )}
      </div>
      <div className="p-5">
        <time className="text-xs uppercase tracking-wider text-ink-500">
          {formatDate(item.created_at, locale)}
        </time>
        <h3 className="mt-2 text-lg leading-snug text-ink-900">
          {item.judul}
        </h3>
        <p className="mt-3 text-sm text-ink-600 leading-relaxed">
          {createExcerpt(item.konten, 110)}
        </p>
        <span className="pub-text-link mt-4">
          {readMore} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { language, t } = useLanguage();
  usePageTitle(t('nav.home'));
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [berita, setBerita] = useState<Berita[]>([]);
  const [loadingPengumuman, setLoadingPengumuman] = useState(true);
  const [loadingBerita, setLoadingBerita] = useState(true);

  const localeMap: Record<string, string> = {
    id: 'id-ID',
    en: 'en-US',
    ar: 'ar-SA',
  };
  const locale = localeMap[language] || 'id-ID';

  useEffect(() => {
    async function fetchPengumuman() {
      try {
        setLoadingPengumuman(true);
        const data = await fetchAnnouncementsI18n(language, 1);
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

  useEffect(() => {
    async function fetchBerita() {
      try {
        setLoadingBerita(true);
        const data = await fetchBeritaI18n(language, 2);
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

  const stats = [
    { value: '1566', label: t('home.activeStudents') },
    { value: '4', label: t('home.hero.statProfessors') },
    { value: '50+', label: t('home.expertLecturers') },
    { value: '50+', label: t('home.yearsExperience') },
  ];

  const audiences = [
    {
      icon: 'fa-user-graduate',
      title: t('home.audiences.prospective.title'),
      text: t('home.audiences.prospective.text'),
      links: [
        { href: '#program-studi', label: t('home.programs.title') },
        { href: PMB_URL, label: t('services.items.pmb.name'), external: true },
        { href: '/akreditasi', label: t('nav.accreditation') },
      ],
    },
    {
      icon: 'fa-book-reader',
      title: t('home.audiences.students.title'),
      text: t('home.audiences.students.text'),
      links: [
        { href: '/pengumuman', label: t('home.announcements.title') },
        { href: 'https://tusita.iain-bone.ac.id/gate/login', label: t('services.items.tusita.name'), external: true },
        { href: 'https://edlink.id/', label: t('services.items.elearning.name'), external: true },
      ],
    },
    {
      icon: 'fa-user-tie',
      title: t('home.audiences.lecturers.title'),
      text: t('home.audiences.lecturers.text'),
      links: [
        { href: '/tim-kami', label: t('nav.lecturers') },
        { href: 'https://tusita.iain-bone.ac.id/gate/login', label: t('services.items.tusita.name'), external: true },
        { href: 'https://edlink.id/', label: t('services.items.elearning.name'), external: true },
      ],
    },
    {
      icon: 'fa-handshake',
      title: t('home.audiences.public.title'),
      text: t('home.audiences.public.text'),
      links: [
        { href: '#kerjasama', label: t('home.partnership.title') },
        { href: '/ppid', label: t('nav.ppid') },
        { href: '/kontak', label: t('nav.contact') },
      ],
    },
  ];

  const programs = [
    {
      n: '01',
      icon: 'fa-landmark',
      title: t('home.programs.constitutionalLaw.title'),
      focus: t('home.programs.constitutionalLaw.focus'),
      grade: t('home.programs.constitutionalLaw.grade'),
      text: t('home.programs.constitutionalLaw.description'),
      href: 'https://htn.iain-bone.ac.id/',
      cta: t('home.programs.constitutionalLaw.learnMore'),
    },
    {
      n: '02',
      icon: 'fa-users',
      title: t('home.programs.familyLaw.title'),
      focus: t('home.programs.familyLaw.focus'),
      grade: t('home.programs.familyLaw.grade'),
      text: t('home.programs.familyLaw.description'),
      href: 'https://hki.iain-bone.ac.id/',
      cta: t('home.programs.familyLaw.learnMore'),
    },
    {
      n: '03',
      icon: 'fa-balance-scale',
      title: t('home.programs.economicLaw.title'),
      focus: t('home.programs.economicLaw.focus'),
      grade: t('home.programs.economicLaw.grade'),
      text: t('home.programs.economicLaw.description'),
      href: 'https://hes.iain-bone.ac.id/',
      cta: t('home.programs.economicLaw.learnMore'),
    },
  ];

  const partners = [
    { src: '/assets/partners/lapas.png', label: t('home.partnership.lapas') },
    { src: '/assets/partners/kejaksaan.png', label: t('home.partnership.kejaksaan') },
    { src: '/assets/partners/pengadilan-negeri.png', label: t('home.partnership.pengadilanNegeri') },
    { src: '/assets/partners/pengadilan-agama.png', label: t('home.partnership.pengadilanAgama') },
    { src: '/assets/partners/peradi.png', label: t('home.partnership.peradi') },
    { src: '/assets/partners/bsi.png', label: t('home.partnership.bsi') },
    { src: '/assets/partners/kemenag.png', label: t('home.partnership.kemenag') },
    { src: '/assets/partners/baznas.png', label: t('home.partnership.baznas') },
    { src: '/assets/partners/kppu.png', label: t('home.partnership.kppu') },
    { src: '/assets/partners/kemenhaj.png', label: t('home.partnership.kemenhajBone') },
    { src: '/assets/partners/kemenhaj.png', label: t('home.partnership.kemenhajSulsel') },
    { src: '/assets/partners/bnn.png', label: t('home.partnership.bnnBone') },
    { src: '/assets/partners/pemda-bone.png', label: t('home.partnership.pemdaBone') },
  ];

  // Kata kunci judul diberi warna aksen; jika tidak ditemukan, judul tampil utuh.
  const heroTitle = t('home.hero.title');
  const heroAccent = t('home.hero.titleAccent');
  const accentAt = heroTitle.indexOf(heroAccent);
  const titleParts = accentAt >= 0
    ? [heroTitle.slice(0, accentAt), heroTitle.slice(accentAt + heroAccent.length)]
    : null;

  const latestAnnouncement = pengumuman[0];
  const latestNews = berita.slice(0, 2);
  const loadingUpdates = loadingPengumuman || loadingBerita;

  return (
    <div className="pub-home">
      <section className="pub-hero">
        <div className="pub-hero-bg" aria-hidden="true">
          <Image
            src="/assets/gerbang-iain-bone.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1023px) 100vw, 70vw"
          />
        </div>
        <div className="pub-hero-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pub-hero-grid">
            <div className="pub-hero-copy pub-rise-load">
              <Link href="/akreditasi" className="pub-accredit">
                <i className="fas fa-certificate" aria-hidden="true"></i>
                <span>{t('home.accredited')}</span>
              </Link>
              <h1 className="pub-hero-statement">
                {titleParts ? (
                  <>
                    {titleParts[0]}
                    <span className="pub-hero-accent">{heroAccent}</span>
                    {titleParts[1]}
                  </>
                ) : heroTitle}
              </h1>
              <p className="pub-hero-lead">{t('home.description')}</p>
              <div className="pub-hero-actions">
                <a href={PMB_URL} target="_blank" rel="noopener noreferrer" className="pub-btn pub-btn-solid">
                  {t('home.hero.apply')}
                  <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
                </a>
                <a href="#program-studi" className="pub-btn pub-btn-ghost">
                  <i className="fas fa-graduation-cap text-xs" aria-hidden="true"></i>
                  {t('home.hero.compare')}
                </a>
              </div>
            </div>

            <div className="pub-hero-panel pub-rise-load pub-reveal-d2">
              <div className="pub-hero-panel-head">
                <strong>{t('home.programs.title')}</strong>
                <span>{t('home.programs.level')}</span>
              </div>
              <ul className="pub-hero-roster">
                {programs.map((program) => (
                  <li key={program.href}>
                    <a href={program.href} target="_blank" rel="noopener noreferrer">
                      <span className="pub-hero-roster-icon">
                        <i className={`fas ${program.icon}`} aria-hidden="true"></i>
                      </span>
                      <span className="pub-hero-roster-text">
                        <strong>{program.title}</strong>
                        <small>{program.grade}</small>
                      </span>
                      <i className="fas fa-chevron-right pub-hero-roster-go" aria-hidden="true"></i>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="pub-stats">
                {stats.map((item) => (
                  <article key={item.label}>
                    <CountValue value={item.value} locale={locale} />
                    <span>{item.label}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <nav className="pub-shortcuts" aria-label={t('nav.home')}>
            {audiences.map((item) => (
              <div key={item.title} className="pub-shortcut">
                <strong><i className={`fas ${item.icon}`} aria-hidden="true"></i> {item.title}</strong>
                <div className="pub-shortcut-links">
                  {item.links.map((link) => (
                    link.external ? (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                    ) : (
                      <Link key={link.href} href={link.href}>{link.label}</Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </section>

      <section className="pub-section pub-reveal pub-dean">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead kicker={t('home.kickers.dean')} title={t('home.dean.title')} />
          <div className="pub-dean-grid">
            <figure className="pub-dean-photo">
              <div className="pub-dean-frame">
                <Image
                  src="/assets/dekan-fshi.jpeg"
                  alt={t('home.dean.name')}
                  fill
                  sizes="(max-width: 767px) 70vw, 320px"
                  className="object-cover object-top"
                />
              </div>
              <figcaption className="pub-dean-plate">
                <strong>{t('home.dean.name')}</strong>
                <span>{t('home.dean.position')}</span>
              </figcaption>
            </figure>
            <div className="pub-dean-card">
              <i className="fas fa-quote-left pub-dean-mark" aria-hidden="true"></i>
              <blockquote className="pub-dean-quote">{t('home.dean.quote')}</blockquote>
              <p className="pub-dean-text">{t('home.dean.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="program-studi" className="pub-section pub-reveal pub-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead
            kicker={t('home.kickers.programs')}
            title={t('home.programs.title')}
            text={t('home.programs.subtitle')}
          />
          <div className="grid md:grid-cols-3 gap-5">
            {programs.map((program) => (
              <article key={program.n} className="pub-program">
                <div className="flex items-center justify-between gap-3">
                  <span className="pub-program-icon"><i className={`fas ${program.icon}`} aria-hidden="true"></i></span>
                  <p className="pub-program-grade">{program.grade}</p>
                </div>
                <h3 className="mt-5 text-xl text-ink-900">{program.title}</h3>
                <p className="pub-program-meta">
                  {t('home.programs.level')}{program.focus ? ` · ${program.focus}` : ''}
                </p>
                <p className="mt-3 text-sm text-ink-600 leading-relaxed flex-1">{program.text}</p>
                <a
                  href={program.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pub-text-link mt-5"
                  aria-label={`${program.cta}: ${program.title}`}
                >
                  {program.cta} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
                </a>
              </article>
            ))}
          </div>
          <div className="pub-more">
            <Link href="/tentang?tab=fasilitas" className="pub-btn pub-btn-outline">
              {t('home.programs.facilitiesLink')} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
            <Link href="/tentang?tab=testimoni" className="pub-btn pub-btn-outline">
              {t('home.programs.alumniLink')} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </section>

      <HomeProfessors />

      <section className="pub-section pub-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead
            kicker={t('home.kickers.updates')}
            title={t('home.updates.title')}
            text={t('home.updates.subtitle')}
          />
          {loadingUpdates ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="pub-skeleton h-64 bg-ink-100 animate-pulse" />
              ))}
            </div>
          ) : latestAnnouncement || latestNews.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestAnnouncement ? (
                <Link
                  href={`/pengumuman/${latestAnnouncement.slug}`}
                  className="pub-notice sm:col-span-2 lg:col-span-1"
                >
                  <span className="pub-notice-label">
                    <i className="fas fa-bullhorn" aria-hidden="true"></i>
                    {t('home.announcements.title')}
                  </span>
                  <time>{formatDate(latestAnnouncement.created_at, locale)}</time>
                  <h3>{latestAnnouncement.judul}</h3>
                  <p>{createExcerpt(latestAnnouncement.konten, 160)}</p>
                  <span className="pub-notice-more">
                    {t('common.readMore')} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
                  </span>
                </Link>
              ) : null}
              {latestNews.map((item) => (
                <HomeNewsCard key={item.id} item={item} locale={locale} readMore={t('common.readMore')} />
              ))}
            </div>
          ) : (
            <p className="text-center text-ink-600">{t('news.noNews')}</p>
          )}
          <div className="pub-more">
            <Link href="/pengumuman" className="pub-btn pub-btn-dark">
              {t('home.updates.allAnnouncements')} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
            <Link href="/berita" className="pub-btn pub-btn-outline">
              {t('home.updates.allNews')} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </section>

      <section id="kerjasama" className="pub-section pub-reveal pub-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead
            kicker={t('home.kickers.partnership')}
            title={t('home.partnership.title')}
            text={t('home.partnership.subtitle')}
          />
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={12}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 6 },
            }}
            className="partner-swiper"
          >
            {partners.map((partner) => (
              <SwiperSlide key={partner.label}>
                <PartnerCard partner={partner} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </div>
  );
}
