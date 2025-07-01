import SignedInHeader from '@/components/layout/SignedInHeader';
import LandingFooter from '@/components/layout/LandingFooter';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedInHeader />
      {children}
      <LandingFooter />
    </>
  );
} 