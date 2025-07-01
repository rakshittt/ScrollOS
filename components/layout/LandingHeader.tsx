"use client";
import Link from "next/link";
import { Button } from '@/components/ui/Button';
import { MobileNav } from '@/components/ui/MobileNav';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg">
              <img src="/NEWS360.png" alt="News360 Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:opacity-80 transition">News360</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Pricing</a>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">About</Link>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Testimonials</a>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Contact</Link>
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/signin"><Button variant="ghost" size="sm" className="font-medium">Sign In</Button></Link>
              <Link href="/auth/signup"><Button size="sm" className="font-medium shadow-lg hover:shadow-xl transition-shadow duration-200">Get Started</Button></Link>
            </div>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
} 