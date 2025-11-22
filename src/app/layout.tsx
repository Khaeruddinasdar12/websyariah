import { Outfit } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
