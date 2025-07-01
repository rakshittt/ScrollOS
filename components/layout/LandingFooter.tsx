import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-gradient-to-br from-background to-muted/20 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-lg">
            <img src="/NEWS360.png" alt="News360 Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:opacity-80 transition">News360</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2 md:mt-0">
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
          <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </nav>
        <div className="text-xs text-muted-foreground mt-2 md:mt-0">© 2025 News360. All rights reserved.</div>
      </div>
    </footer>
  );
} 