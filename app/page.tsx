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
  Sparkles
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
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">News360</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Features</a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Testimonials</a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/auth/signin"><Button variant="ghost" size="sm" className="font-medium">Sign In</Button></Link>
                <Link href="/auth/signup"><Button size="sm" className="font-medium shadow-lg hover:shadow-xl transition-shadow duration-200">Get Started</Button></Link>
              </div>
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm font-medium border border-border/50 shadow-sm">
              <Inbox className="mr-2 h-4 w-4" />
              Modern Newsletter Management
            </Badge>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl leading-tight">
              Take Control of Your
              <span className="block bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Newsletters
              </span>
            </h1>
            
            <p className="mt-8 text-xl text-muted-foreground sm:text-2xl leading-relaxed max-w-3xl mx-auto">
              News360 is the modern way to organize, read, and manage newsletters from all your email accounts. Enjoy powerful filtering, custom categories, distraction-free reading, and a beautiful, productive interface.
            </p>
            
            <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link href="/auth/signup">
                <Button size="lg" className="group text-lg px-8 py-4 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 font-semibold border-2 hover:bg-muted/50 transition-all duration-200">
                <Play className="mr-3 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-12 text-sm text-muted-foreground">
              <div className="flex items-center font-medium">
                <CheckCircle className="mr-2 h-5 w-5 text-success" />
                No credit card required
              </div>
              <div className="flex items-center font-medium">
                <CheckCircle className="mr-2 h-5 w-5 text-success" />
                Free 14-day trial
              </div>
              <div className="flex items-center font-medium">
                <CheckCircle className="mr-2 h-5 w-5 text-success" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Image/Preview */}
        <div className="mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-6xl">
              <div className="relative rounded-2xl border border-border/50 bg-background/50 p-3 shadow-2xl backdrop-blur-sm">
                <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-10 backdrop-blur-sm">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-error to-error/80 shadow-sm"></div>
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-warning to-warning/80 shadow-sm"></div>
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-success to-success/80 shadow-sm"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-6">
                      <div className="h-5 bg-gradient-to-r from-border/60 to-border/40 rounded-lg w-4/5"></div>
                      <div className="h-4 bg-gradient-to-r from-border/50 to-border/30 rounded-lg w-2/3"></div>
                      <div className="h-4 bg-gradient-to-r from-border/40 to-border/20 rounded-lg w-3/4"></div>
                    </div>
                    <div className="space-y-6">
                      <div className="h-5 bg-gradient-to-r from-border/60 to-border/40 rounded-lg w-3/4"></div>
                      <div className="h-4 bg-gradient-to-r from-border/50 to-border/30 rounded-lg w-4/5"></div>
                      <div className="h-4 bg-gradient-to-r from-border/40 to-border/20 rounded-lg w-2/3"></div>
                    </div>
                    <div className="space-y-6">
                      <div className="h-5 bg-gradient-to-r from-border/60 to-border/40 rounded-lg w-4/5"></div>
                      <div className="h-4 bg-gradient-to-r from-border/50 to-border/30 rounded-lg w-3/4"></div>
                      <div className="h-4 bg-gradient-to-r from-border/40 to-border/20 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 lg:py-40 bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Everything you need for newsletter productivity
            </h2>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              All the tools you need to keep your inbox organized, your reading focused, and your workflow efficient.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <Inbox className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold mt-6">Unified Inbox</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Connect Gmail and Outlook, and see all your newsletters in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <Filter className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold mt-6">Powerful Filtering</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Filter newsletters by category, status, date, and more. Find what matters, fast.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <Tag className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold mt-6">Custom Categories</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Create, color-code, and manage your own categories for ultimate organization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold mt-6">Distraction-Free Reading</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Switch between normal, focus, and fullscreen reading modes. Customize typography and themes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold mt-6">Reading Analytics</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Track your reading habits, progress, and newsletter stats.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80">
              <CardHeader className="pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-lg">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold mt-6">Privacy & Security</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Secure authentication, 2FA, and privacy-first design. Your data stays yours.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 sm:py-32 lg:py-40 bg-gradient-to-br from-background via-background to-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              How News360 Works
            </h2>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Get started in minutes with our simple 3-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="text-center group">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl font-bold mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                1
              </div>
              <h3 className="text-2xl font-bold mb-6">Connect Your Email</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Securely connect your Gmail, Outlook, or other email accounts with just a few clicks.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl font-bold mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                2
              </div>
              <h3 className="text-2xl font-bold mb-6">Organize & Filter</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Create categories, set up rules, and use advanced filters to keep your inbox tidy.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl font-bold mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                3
              </div>
              <h3 className="text-2xl font-bold mb-6">Enjoy Reading</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Read newsletters in a beautiful, distraction-free interface designed for content consumption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 lg:py-40 bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Choose the plan that works best for you. Start free, upgrade anytime.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
            <Card className="relative border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold">Free</CardTitle>
                <div className="mt-6">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  Perfect for getting started with newsletter management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Connect 1 email account</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Basic categorization</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">100 newsletters per month</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Basic search</span>
                  </div>
                </div>
                <Link href="/auth/signup">
                  <Button className="w-full text-lg py-3 font-semibold" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 text-sm font-semibold shadow-lg">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                <div className="mt-6">
                  <span className="text-5xl font-bold">$9</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  For power users who want advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Connect up to 5 email accounts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Advanced categorization</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Unlimited newsletters</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Advanced search & filters</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Reading analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Custom categories & rules</span>
                  </div>
                </div>
                <Link href="/auth/signup">
                  <Button className="w-full text-lg py-3 font-semibold shadow-lg">
                    Start Pro Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
                <div className="mt-6">
                  <span className="text-5xl font-bold">$29</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  For teams and organizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Everything in Pro</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Unlimited email accounts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Team collaboration</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-4 h-5 w-5 text-success" />
                    <span className="text-base">Custom integrations</span>
                  </div>
                </div>
                <Link href="/auth/signup">
                  <Button className="w-full text-lg py-3 font-semibold" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 sm:py-32 lg:py-40 bg-gradient-to-br from-background via-background to-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Loved by newsletter enthusiasts
            </h2>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              See what our users are saying about News360
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  "News360 has completely transformed how I manage my newsletters. The categorization is incredibly accurate and saves me hours every week."
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">SM</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-lg">Sarah Mitchell</p>
                    <p className="text-muted-foreground">Product Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  "The reading experience is fantastic. Clean, distraction-free, and the search functionality is lightning fast. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">DJ</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-lg">David Johnson</p>
                    <p className="text-muted-foreground">Tech Blogger</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-8">
                <div className="flex items-center mb-6">
                  <div className="flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  "Finally, a tool that makes sense of my newsletter chaos! The automatic categorization and smart inbox features are game-changers."
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">EL</span>
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-lg">Emma Lee</p>
                    <p className="text-muted-foreground">Marketing Director</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 lg:py-40 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Ready to transform your newsletter experience?
            </h2>
            <p className="mt-6 text-xl text-primary-foreground/90 leading-relaxed">
              Join thousands of users who have already simplified their newsletter management with News360.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="group text-lg px-8 py-4 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 font-semibold border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                  <Mail className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">News360</span>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                The ultimate platform for managing and reading newsletters with modern organization tools.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Product</h3>
              <ul className="space-y-3 text-base text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Company</h3>
              <ul className="space-y-3 text-base text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3 text-base text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors duration-200">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 border-t border-border/50 pt-8 text-center">
            <p className="text-base text-muted-foreground">
              © 2024 News360. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
