export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import SignedInHeader from '@/components/layout/SignedInHeader';
import LandingFooter from '@/components/layout/LandingFooter';

const inter = Inter({ subsets: ['latin'] });

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  let themeClass = 'h-full';
  try {
    const cookieStore = await cookies();
    const theme = cookieStore.get('theme');
    if (theme?.value === 'dark') themeClass += ' dark';
    if (theme?.value === 'light') themeClass += ' light';
  } catch {}
  return (
    <html lang="en" className={themeClass}>
      <body className={`${inter.className} h-full bg-background antialiased`}>
        <SignedInHeader />
        {children}
        <LandingFooter />
      </body>
    </html>
  );
} 