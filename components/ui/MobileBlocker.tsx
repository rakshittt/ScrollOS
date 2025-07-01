'use client';
import { useEffect, useState } from 'react';
import { Smartphone, Monitor, Zap, Heart, Shield, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  const ua = navigator.userAgent.toLowerCase();
  // Tablet detection (iPad, Android tablets, etc.)
  const isTablet =
    (/ipad/.test(ua) ||
      (/(android(?!.*mobile))/i.test(ua)) ||
      (/tablet/.test(ua)) ||
      (width >= 768 && width <= 1200));
  // True mobile phone detection
  const isMobile =
    (/iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/.test(ua) || width < 768) && !isTablet;
  return isMobile;
}

export default function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#f8fafc] via-background/90 to-muted/90 dark:from-background dark:via-background/90 dark:to-muted/90 backdrop-blur-2xl px-4 animate-fade-in">
      {/* News360 Header */}
      <div className="flex items-center space-x-3 mb-8 mt-4">
        <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-lg bg-white flex items-center justify-center border border-border">
          <img src="/NEWS360.png" alt="News360 Logo" className="w-10 h-10 object-contain" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">News360</span>
      </div>
      <Card className="w-full max-w-md shadow-2xl border border-border animate-fade-in-up bg-background/95 rounded-3xl">
        <CardHeader className="items-center pb-2">
          <Badge variant="secondary" className="mb-4 px-3 py-1.5 text-xs font-medium border border-border/50 shadow-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Desktop or Tablet Experience
          </Badge>
          <CardTitle className="text-center text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">Switch to Desktop or Tablet</CardTitle>
          <CardDescription className="text-center text-base sm:text-lg mt-2">
            <span className="text-primary font-semibold">News360</span> is designed for a beautiful, productive experience on larger screens.<br />
            Please use a Desktop or Tablet for the best experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center mt-2">
          <Monitor className="h-20 w-20 text-accent mb-4 animate-pulse drop-shadow-lg" />
          <div className="grid grid-cols-1 gap-4 w-full mt-2 mb-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-warning" />
              <span className="font-medium text-foreground">Efficient Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-error" />
              <span className="font-medium text-foreground">User-Centric Design</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-success" />
              <span className="font-medium text-foreground">Privacy First</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 pb-6">
          <Button size="lg" className="w-full cursor-not-allowed opacity-80" disabled tabIndex={-1} aria-disabled>
            Try on Desktop or Tablet <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground mt-2">Mobile support coming soon!</span>
        </CardFooter>
      </Card>
      <footer className="mt-8 text-xs text-muted-foreground text-center opacity-80">
        &copy; {new Date().getFullYear()} News360. All rights reserved.
      </footer>
      <style>{`
        body { overflow: hidden !important; }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 