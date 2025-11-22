'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/context/LanguageContext';
import '@/app/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-outfit">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}