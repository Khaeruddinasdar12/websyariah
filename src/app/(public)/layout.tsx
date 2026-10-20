'use client';

import { ReactNode, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/context/LanguageContext';
import '@/app/globals.css';
import '@/app/public.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.querySelector('.public-site');
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('.pub-reveal:not(.is-in)'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-in'));
      return;
    }

    const fold = window.innerHeight * 0.92;
    const pending: HTMLElement[] = [];
    nodes.forEach((node) => {
      if (node.getBoundingClientRect().top >= fold) {
        node.classList.add('is-pending');
        pending.push(node);
      }
    });
    if (!pending.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

    pending.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <LanguageProvider>
      <div className="public-site min-h-screen flex flex-col font-outfit">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}