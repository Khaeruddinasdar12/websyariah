"use client";
import { useState, useEffect, useRef } from 'react';
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

function CountValue({ value }: { value: string }) {
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
      {current}
      {suffix}
    </strong>
  );
}

function chunkList<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

function PartnerCards({ partners }: { partners: { src: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {partners.map((partner) => (
        <article key={partner.label} className="pub-partner">
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
      ))}
    </div>
  );
}

function SectionHead({ title, text }: { title: string; text?: string }) {
  return (
    <div className="max-w-2xl mb-10">
      <div className="w-10 h-0.5 bg-gold mb-4" />
      <h2 className="pub-h2 mt-0">{title}</h2>
      {text ? <p className="mt-3 text-ink-600 leading-relaxed">{text}</p> : null}
    </div>
  );
}

function HomeNewsCard({
  item,
  locale,
  featured = false,
  readMore,
}: {
  item: Berita;
  locale: string;
  featured?: boolean;
  readMore: string;
}) {
  const [failed, setFailed] = useState(false);
  const slug = `${createSlug(item.judul)}-${item.id}`;
  const showImage = Boolean(item.gambar) && !failed;

  return (
    <Link href={`/berita/${slug}`} className={featured ? 'pub-feature group' : 'pub-card overflow-hidden block h-full'}>
      <div className={featured ? 'pub-feature-media' : 'pub-thumb'}>
        {showImage ? (
          <Image
            src={item.gambar}
            alt={item.judul}
            fill
            className="object-cover"
            sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-400">
            <i className="fas fa-newspaper text-2xl" aria-hidden="true"></i>
          </div>
        )}
      </div>
      <div className={featured ? 'p-6 md:p-8 flex flex-col justify-center' : 'p-5'}>
        <time className="text-xs uppercase tracking-wider text-ink-500">
          {formatDate(item.created_at, locale)}
        </time>
        <h3 className={featured ? 'mt-2 text-2xl leading-snug text-ink-900' : 'mt-2 text-lg leading-snug text-ink-900'}>
          {item.judul}
        </h3>
        <p className="mt-3 text-sm text-ink-600 leading-relaxed">
          {createExcerpt(item.konten, featured ? 180 : 110)}
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
  const [partnerColumns, setPartnerColumns] = useState(4);

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
        const data = await fetchAnnouncementsI18n(language, 4);
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
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setPartnerColumns(media.matches ? 4 : 2);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    async function fetchBerita() {
      try {
        setLoadingBerita(true);
        const data = await fetchBeritaI18n(language, 4);
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
    { value: '50+', label: t('home.expertLecturers') },
    { value: '3', label: t('home.studyPrograms') },
    { value: '50+', label: t('home.yearsExperience') },
  ];

  const audiences = [
    {
      icon: 'fa-user-graduate',
      title: t('home.audiences.prospective.title'),
      text: t('home.audiences.prospective.text'),
      links: [
        { href: '#program-studi', label: t('home.programs.title') },
        { href: 'https://pmb.iain-bone.ac.id/', label: t('services.items.pmb.name'), external: true },
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

  const quickServices = [
    { icon: 'fa-user-graduate', name: t('services.items.pmb.name'), text: t('services.items.pmb.description'), href: 'https://pmb.iain-bone.ac.id/' },
    { icon: 'fa-graduation-cap', name: t('services.items.tusita.name'), text: t('services.items.tusita.description'), href: 'https://tusita.iain-bone.ac.id/gate/login' },
    { icon: 'fa-laptop', name: t('services.items.elearning.name'), text: t('services.items.elearning.description'), href: 'https://edlink.id/' },
    { icon: 'fa-book-open', name: t('services.items.digilib.name'), text: t('services.items.digilib.description'), href: 'https://kbk2300046.perpustakaandigital.com/' },
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

  const facilities = [
    { icon: 'fa-book', title: t('home.facilities.library.title'), text: t('home.facilities.library.description') },
    { icon: 'fa-desktop', title: t('home.facilities.computerLab.title'), text: t('home.facilities.computerLab.description') },
    { icon: 'fa-comments', title: t('home.facilities.discussionRoom.title'), text: t('home.facilities.discussionRoom.description') },
    { icon: 'fa-wifi', title: t('home.facilities.wifi.title'), text: t('home.facilities.wifi.description') },
    { icon: 'fa-moon', title: t('home.facilities.falakLab.title'), text: t('home.facilities.falakLab.description') },
    { icon: 'fa-balance-scale', title: t('home.facilities.yustisiLab.title'), text: t('home.facilities.yustisiLab.description') },
  ];

  const testimonials = [
    { initials: 'PR', key: 'putra' },
    { initials: 'AA', key: 'ahmad' },
    { initials: 'VS', key: 'vivin' },
    { initials: 'AT', key: 'taufiq' },
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
  const partnerPages = chunkList(partners, partnerColumns * 3);

  const featuredNews = berita[0];
  const otherNews = berita.slice(1, 4);

  return (
    <div>
      <section className="pub-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-6 lg:pb-8">
          <div className="pub-hero-grid">
            <div className="pub-hero-copy pub-rise-load">
              <Link href="/akreditasi" className="pub-accredit">
                <i className="fas fa-certificate" aria-hidden="true"></i>
                <span>{t('home.accredited')}</span>
              </Link>
              <h1 className="pub-hero-statement">
                {t('home.description')}
              </h1>
              <div className="pub-hero-offer">
                <p className="pub-hero-level">{t('home.programs.level')}</p>
                <ul className="pub-hero-roster">
                  {programs.map((program) => (
                    <li key={program.href}>
                      <a href={program.href} target="_blank" rel="noopener noreferrer">{program.title}</a>
                      <span>{program.grade}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pub-hero-actions">
                <Link href="/tentang" className="pub-btn pub-btn-solid">
                  {t('home.learnMore')}
                  <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
                </Link>
                <Link href="/tim-kami" className="pub-btn pub-btn-ghost">
                  {t('home.lecturers')}
                </Link>
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

            <div className="pub-hero-media pub-rise-load pub-reveal-d2">
              <figure className="pub-hero-figure">
                <Image
                  src="/assets/berita2.jpeg"
                  alt="Kampus IAIN Bone"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <figcaption className="pub-hero-caption">
                  <span>{t('home.subtitle')}</span>
                  <strong>{t('home.hero.illustrationTitle')}</strong>
                </figcaption>
              </figure>
            </div>

            <div className="pub-stats pub-rise-load pub-reveal-d3">
              {stats.map((item) => (
                <article key={item.label}>
                  <CountValue value={item.value} />
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pub-section pub-reveal pub-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="pub-portrait">
                <Image
                  src="/assets/dekan-fshi.jpeg"
                  alt={t('home.dean.name')}
                  fill
                  sizes="340px"
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
            <div className="lg:col-span-8">
              <p className="pub-kicker">{t('home.dean.position')}</p>
              <h2 className="pub-h2">{t('home.dean.title')}</h2>
              <p className="mt-3 text-ink-900 font-semibold">{t('home.dean.name')}</p>
              <blockquote className="pub-quote">“{t('home.dean.quote')}”</blockquote>
              <p className="text-ink-600 leading-relaxed">{t('home.dean.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <HomeProfessors />

      <section id="program-studi" className="pub-section pub-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead title={t('home.programs.title')} text={t('home.programs.subtitle')} />
          <div className="grid md:grid-cols-3 gap-4">
            {programs.map((program) => (
              <article key={program.n} className="pub-program">
                <div className="flex items-center justify-between gap-3">
                  <span className="pub-program-icon"><i className={`fas ${program.icon}`} aria-hidden="true"></i></span>
                  <p className="pub-program-meta">{t('home.programs.level')}</p>
                </div>
                <h3 className="mt-4 text-xl text-ink-900">{program.title}</h3>
                <p className="pub-program-grade">{program.grade}</p>
                {program.focus ? <p className="mt-1 text-sm font-semibold text-ink-700">{program.focus}</p> : null}
                <p className="mt-3 text-sm text-ink-600 leading-relaxed flex-1">{program.text}</p>
                <a href={program.href} target="_blank" rel="noopener noreferrer" className="pub-text-link mt-5">
                  {program.cta} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-reveal pub-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHead title={t('services.title')} text={t('services.subtitle')} />
            <Link href="/layanan" className="pub-text-link mb-10 shrink-0">
              {t('common.seeAll')} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
          </div>
          <div className="pub-services">
            {quickServices.map((item) => (
              <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="pub-service">
                <span className="pub-audience-icon"><i className={`fas ${item.icon}`} aria-hidden="true"></i></span>
                <span>
                  <strong>{item.name}</strong>
                  <em>{item.text}</em>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHead title={t('home.announcements.title')} text={t('home.announcements.subtitle')} />
            <Link href="/pengumuman" className="pub-text-link mb-10 shrink-0">
              {t('common.seeAll')} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
          </div>
          {loadingPengumuman ? (
            <div className="grid md:grid-cols-2 gap-x-12">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-20 bg-ink-100 animate-pulse border-t border-ink-200" />
              ))}
            </div>
          ) : pengumuman.length > 0 ? (
            <div className="grid md:grid-cols-2 md:gap-x-12">
              {pengumuman.map((item) => (
                <Link key={item.id} href={`/pengumuman/${item.slug}`} className="pub-announce block">
                  <time>{formatDate(item.created_at, locale)}</time>
                  <div>
                    <h3>{item.judul}</h3>
                    <p>{createExcerpt(item.konten, 110)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-ink-600">{t('announcements.noAnnouncements')}</p>
          )}
        </div>
      </section>

      <section className="pub-section pub-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHead title={t('home.news.title')} text={t('home.news.subtitle')} />
            <Link href="/berita" className="pub-text-link mb-10 shrink-0">
              {t('common.seeAll')} <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
          </div>
          {loadingBerita ? (
            <div className="h-64 bg-ink-100 animate-pulse" />
          ) : berita.length > 0 ? (
            <div className="space-y-4">
              {featuredNews ? (
                <HomeNewsCard item={featuredNews} locale={locale} featured readMore={t('common.readMore')} />
              ) : null}
              {otherNews.length > 0 ? (
                <div className="grid sm:grid-cols-3 gap-4">
                  {otherNews.map((item) => (
                    <HomeNewsCard key={item.id} item={item} locale={locale} readMore={t('common.readMore')} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-ink-600">{t('news.noNews')}</p>
          )}
        </div>
      </section>

      <section className="pub-section pub-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead title={t('home.visionMission.title')} />
          <div className="grid md:grid-cols-2 gap-4">
            <article className="pub-vision">
              <h3 className="text-2xl">{t('about.vision.title')}</h3>
              <p className="mt-4 leading-relaxed">{t('about.vision.content')}</p>
            </article>
            <article className="pub-mission">
              <h3 className="text-2xl text-ink-900">{t('about.mission.title')}</h3>
              <ul className="mt-4 space-y-3 text-ink-700 leading-relaxed">
                {['about.mission.items.0', 'about.mission.items.1', 'about.mission.items.2', 'about.mission.items.3'].map((key) => (
                  <li key={key} className="flex gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-gold shrink-0" aria-hidden="true" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="pub-section pub-reveal pub-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead title={t('home.facilities.title')} text={t('home.facilities.subtitle')} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((item) => (
              <article key={item.title} className="pub-card p-5 flex gap-4">
                <span className="w-10 h-10 shrink-0 bg-ink-50 text-primary flex items-center justify-center">
                  <i className={`fas ${item.icon}`} aria-hidden="true"></i>
                </span>
                <div>
                  <h3 className="text-lg text-ink-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead title={t('home.testimonials.title')} text={t('home.testimonials.subtitle')} />
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="testimoni-swiper !pb-12"
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.key} className="!h-auto">
                <article className="pub-quote-card">
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
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section id="kerjasama" className="pub-section pub-reveal pub-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead title={t('home.partnership.title')} text={t('home.partnership.subtitle')} />
          {partnerPages.length > 1 ? (
            <Swiper
              key={partnerColumns}
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={12}
              className="partner-swiper"
            >
              {partnerPages.map((page, index) => (
                <SwiperSlide key={index}>
                  <PartnerCards partners={page} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <PartnerCards partners={partners} />
          )}
        </div>
      </section>
    </div>
  );
}
