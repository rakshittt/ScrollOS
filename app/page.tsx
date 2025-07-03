'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MobileNav } from '@/components/ui/MobileNav';
import { 
  Mail, 
  Inbox, 
  Filter, 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  BarChart3, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Play,
  Github,
  Twitter,
  Linkedin,
  Mail as MailIcon,
  Search,
  FolderOpen,
  Tag,
  Clock,
  Eye,
  BookOpen,
  Settings,
  Bell,
  Lock,
  Sparkles,
  Monitor,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const { data: session, status } = useSession();
  
  // If user is authenticated, redirect to inbox
  if (status === 'loading') return <div>Loading...</div>;
  if (session) redirect('/inbox');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="/NEWS360.png" 
                  alt="News360 Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">News360</span>
            </div>
            
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

      {/* Hero Section - Mobile Only */}
      <section className="block md:hidden relative overflow-hidden py-12">
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-lg text-center flex flex-col items-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-lg bg-white flex items-center justify-center border border-border">
                <img src="/NEWS360.png" alt="News360 Logo" className="w-10 h-10 object-contain" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">News360</span>
            </div>
            <div className="flex flex-col items-center mb-6">
              <Smartphone className="h-12 w-12 text-primary mb-2 animate-bounce" />
              <Monitor className="h-10 w-10 text-accent animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Best experienced on Desktop</h1>
            <p className="text-base text-muted-foreground mb-6">
              News360 is designed for a beautiful, productive experience on larger screens.<br />
              Explore all features, pricing, and more below!
            </p>
            <a href="#features" className="inline-block mt-2">
              <Button size="lg" variant="outline" className="w-full flex items-center justify-center">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>
      {/* Hero Section - Desktop/Tablet Only */}
      <section className="hidden md:block relative overflow-hidden py-16 sm:py-24 lg:py-32 xl:py-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 sm:mb-8 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-border/50 shadow-sm">
              <Inbox className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Modern Newsletter Management
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold tracking-tight leading-tight">
              Take Control of Your
              <span className="block bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Newsletters
              </span>
            </h1>
            
            <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto px-4">
              News360 is the modern way to organize, read, and manage newsletters from all your email accounts. Enjoy powerful filtering, custom categories, distraction-free reading, and a beautiful, productive interface.
            </p>
            
            <div className="mt-8 sm:mt-12 flex flex-col items-center justify-center gap-4 sm:gap-6 sm:flex-row px-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="group w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold border-2 hover:bg-muted/50 transition-all duration-200">
                <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center font-medium">
                <CheckCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-success" />
                No credit card required
              </div>
              <div className="flex items-center font-medium">
                <CheckCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-success" />
                Free 14-day trial
              </div>
              <div className="flex items-center font-medium">
                <CheckCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-success" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Image/Preview */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-4xl lg:max-w-6xl">
              <div className="relative rounded-xl sm:rounded-2xl border border-border/50 bg-background/50 p-2 sm:p-3 shadow-2xl backdrop-blur-sm">
                <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-6 sm:p-8 lg:p-10 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-r from-error to-error/80 shadow-sm"></div>
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-r from-warning to-warning/80 shadow-sm"></div>
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-r from-success to-success/80 shadow-sm"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="h-4 sm:h-5 bg-gradient-to-r from-border/60 to-border/40 rounded-lg w-4/5"></div>
                      <div className="h-3 sm:h-4 bg-gradient-to-r from-border/50 to-border/30 rounded-lg w-2/3"></div>
                      <div className="h-3 sm:h-4 bg-gradient-to-r from-border/40 to-border/20 rounded-lg w-3/4"></div>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                      <div className="h-4 sm:h-5 bg-gradient-to-r from-border/60 to-border/40 rounded-lg w-3/4"></div>
                      <div className="h-3 sm:h-4 bg-gradient-to-r from-border/50 to-border/30 rounded-lg w-4/5"></div>
                      <div className="h-3 sm:h-4 bg-gradient-to-r from-border/40 to-border/20 rounded-lg w-2/3"></div>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                      <div className="h-4 sm:h-5 bg-gradient-to-r from-border/60 to-border/40 rounded-lg w-4/5"></div>
                      <div className="h-3 sm:h-4 bg-gradient-to-r from-border/50 to-border/30 rounded-lg w-3/4"></div>
                      <div className="h-3 sm:h-4 bg-gradient-to-r from-border/40 to-border/20 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
              Everything you need for newsletter productivity
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              All the tools you need to keep your inbox organized, your reading focused, and your workflow efficient.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <Inbox className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mt-4 sm:mt-6">Unified Inbox</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Connect Gmail and Outlook, and see all your newsletters in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <Filter className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mt-4 sm:mt-6">Powerful Filtering</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Filter newsletters by category, status, date, and more. Find what matters, fast.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mt-4 sm:mt-6">Custom Categories</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Create, color-code, and manage your own categories for ultimate organization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mt-4 sm:mt-6">Distraction-Free Reading</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Switch between normal, focus, and fullscreen reading modes. Customize typography and themes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mt-4 sm:mt-6">Reading Analytics</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Track your reading habits, progress, and newsletter stats.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mt-4 sm:mt-6">Privacy & Security</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  Secure authentication, 2FA, and privacy-first design. Your data stays yours.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-background via-background to-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
              How News360 Works
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              Get started in minutes with our simple 3-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center group">
              <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                1
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Connect Your Email</h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                Securely connect your Gmail, Outlook, or other email accounts with just a few clicks.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                2
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Organize & Filter</h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                Create categories, set up rules, and use advanced filters to keep your inbox tidy.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                3
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Enjoy Reading</h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                Read newsletters in a beautiful, distraction-free interface designed for content consumption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              Choose the plan that works best for you. Upgrade anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-3xl mx-auto">
            {/* Pro Plan */}
            <Card className="relative border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow-lg mb-1">
                  Most Popular
                </Badge>
                {/* <Badge className="bg-green-500 text-white px-2 py-1 text-xs font-semibold shadow">7 Day Free Trial</Badge> */}
              </div>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold">Pro</CardTitle>
                <div className="mt-4 sm:mt-6">
                  <span className="text-5xl font-bold">₹299</span>
                  <span className="text-lg sm:text-xl text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base leading-relaxed mt-2">
                  The perfect plan for most users—ample storage, multiple accounts, and fast sync.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 sm:space-y-6 mt-2">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Store up to 1,000 newsletters</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Connect up to 3 Gmail accounts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Unlimited categories</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Basic search & filters</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Priority sync</span>
                  </div>
                </div>
                <div className="mb-2 text-center text-green-600 font-medium text-sm">7 Day Free Trial – Cancel anytime</div>
                <Link href="/auth/signup">
                  <Button className="w-full text-lg py-3 font-semibold shadow-lg">
                    Start Pro Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
            {/* Pro Plus Plan */}
            <Card className="relative border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <Badge className="bg-green-500 text-white px-2 py-1 text-xs font-semibold shadow">7 Day Free Trial</Badge>
              </div>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold">Pro Plus</CardTitle>
                <div className="mt-4 sm:mt-6">
                  <span className="text-5xl font-bold">₹799</span>
                  <span className="text-lg sm:text-xl text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base leading-relaxed mt-2">
                  For power users who need maximum storage and more account connections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 sm:space-y-6 mt-2">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Store up to 5,000 newsletters</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Connect up to 10 Gmail accounts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Unlimited categories</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Basic search & filters</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-success" />
                    <span className="text-base">Priority sync</span>
                  </div>
                </div>
                <div className="mb-2 text-center text-green-600 font-medium text-sm">7 Day Free Trial – Cancel anytime</div>
                <Link href="/auth/signup">
                  <Button className="w-full text-lg py-3 font-semibold" variant="outline">
                    Go Pro Plus
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-background via-background to-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
              Loved by newsletter enthusiasts
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              See what our users are saying about News360
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6 sm:pt-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  "News360 has completely transformed how I manage my newsletters. The categorization is incredibly accurate and saves me hours every week."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-sm sm:text-lg font-bold text-primary">SM</span>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="font-bold text-sm sm:text-lg">Sarah Mitchell</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Product Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6 sm:pt-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  "The reading experience is fantastic. Clean, distraction-free, and the search functionality is lightning fast. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-sm sm:text-lg font-bold text-primary">DJ</span>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="font-bold text-sm sm:text-lg">David Johnson</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Tech Blogger</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6 sm:pt-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  "Finally, a tool that makes sense of my newsletter chaos! The automatic categorization and smart inbox features are game-changers."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-sm sm:text-lg font-bold text-primary">EL</span>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="font-bold text-sm sm:text-lg">Emma Lee</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Marketing Director</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
              Ready to transform your newsletter experience?
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
              Join thousands of users who have already simplified their newsletter management with News360.
            </p>
            <div className="mt-8 sm:mt-12 flex flex-col items-center justify-center gap-4 sm:gap-6 sm:flex-row px-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="group w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/auth/signin" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="/NEWS360.png" 
                    alt="News360 Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">News360</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                The ultimate platform for managing and reading newsletters with modern organization tools.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <Github className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <Linkedin className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Product</h3>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Company</h3>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors duration-200">About</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Support</h3>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors duration-200">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors duration-200">Contact</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-foreground transition-colors duration-200">Privacy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-foreground transition-colors duration-200">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 sm:mt-16 border-t border-border/50 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-sm sm:text-base text-muted-foreground">
                © 2025 News360. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <Link href="/legal/privacy" className="hover:text-foreground transition-colors duration-200">Privacy Policy</Link>
                <Link href="/legal/terms" className="hover:text-foreground transition-colors duration-200">Terms of Service</Link>
                <Link href="/legal/cookies" className="hover:text-foreground transition-colors duration-200">Cookie Policy</Link>
                <Link href="/legal/contact" className="hover:text-foreground transition-colors duration-200">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
