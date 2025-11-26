import { Outfit } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import AuthErrorWrapper from '@/components/auth/AuthErrorWrapper';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'FSHI IAIN Bone',
  description: 'Fakultas Syariah dan Hukum Islam IAIN Bone',
  icons: {
    icon: [
      { url: '/assets/iain.png', type: 'image/png', sizes: 'any' },
    ],
    shortcut: '/assets/iain.png',
    apple: '/assets/iain.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <SidebarProvider>
                {children}
                <AuthErrorWrapper />
              </SidebarProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
