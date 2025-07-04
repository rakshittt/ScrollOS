import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import { Toaster } from 'sonner';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://news360.com'),
  title: 'News360 - Your Newsletter Ecosystem',
  description: 'All-in-one newsletter platform for creators and consumers',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/NEWS360.png', type: 'image/png', sizes: '16x16' },
      { url: '/NEWS360.png', type: 'image/png', sizes: '32x32' },
      { url: '/NEWS360.png', type: 'image/png', sizes: '48x48' },
      { url: '/NEWS360.png', type: 'image/png', sizes: '96x96' },
      { url: '/NEWS360.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/NEWS360.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/NEWS360.png',
  },
  openGraph: {
    title: 'News360 - Your Newsletter Ecosystem',
    description: 'All-in-one newsletter platform for creators and consumers',
    images: ['/NEWS360.png'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read theme from cookie (set by client on first visit)
  let themeClass = 'h-full';
  try {
    const cookieStore = await cookies();
    const theme = cookieStore.get('theme');
    // Debug: log the theme cookie value
    console.log('[SSR] theme cookie:', theme);
    if (theme?.value === 'dark') themeClass += ' dark';
    if (theme?.value === 'light') themeClass += ' light';
    // Debug: log the computed themeClass
    console.log('[SSR] themeClass:', themeClass);
  } catch (e) {
    console.error('[SSR] Error reading theme cookie:', e);
  }
  return (
    <html lang="en" className={themeClass}>
      <head />
      <body className={`${inter.className} h-full bg-background antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
