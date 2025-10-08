import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Search, BookOpen, MessageSquare, Video, FileText, Mail, Settings, Inbox, Filter, Zap } from 'lucide-react';

export default function HelpPage() {
  const helpCategories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using News360',
      icon: BookOpen,
      color: 'text-blue-600',
      articles: [
        { title: 'How to connect your email accounts', href: '/help/connect-email' },
        { title: 'Setting up your first newsletter', href: '/help/first-newsletter' },
        { title: 'Understanding the interface', href: '/help/interface' },
        { title: 'Quick start guide', href: '/help/quick-start' },
      ]
    },
    {
      title: 'Email Integration',
      description: 'Connect and manage your email accounts',
      icon: Mail,
      color: 'text-green-600',
      articles: [
        { title: 'Connecting Gmail', href: '/help/connect-gmail' },
        { title: 'Connecting Outlook', href: '/help/connect-outlook' },
        { title: 'Managing multiple accounts', href: '/help/multiple-accounts' },
        { title: 'Troubleshooting connection issues', href: '/help/connection-troubleshooting' },
      ]
    },
    {
      title: 'Newsletter Management',
      description: 'Organize and manage your newsletters',
      icon: Inbox,
      color: 'text-purple-600',
      articles: [
        { title: 'Creating categories', href: '/help/create-categories' },
        { title: 'Setting up filters', href: '/help/setup-filters' },
        { title: 'Managing newsletter rules', href: '/help/newsletter-rules' },
        { title: 'Importing existing newsletters', href: '/help/import-newsletters' },
      ]
    },
    {
      title: 'Reading Experience',
      description: 'Customize your reading experience',
      icon: BookOpen,
      color: 'text-orange-600',
      articles: [
        { title: 'Using the reading pane', href: '/help/reading-pane' },
        { title: 'Fullscreen reading mode', href: '/help/fullscreen-reading' },
        { title: 'Customizing appearance', href: '/help/customize-appearance' },
        { title: 'Keyboard shortcuts', href: '/help/keyboard-shortcuts' },
      ]
    },
    {
      title: 'Settings & Preferences',
      description: 'Configure your account and preferences',
      icon: Settings,
      color: 'text-red-600',
      articles: [
        { title: 'Account settings', href: '/help/account-settings' },
        { title: 'Notification preferences', href: '/help/notification-preferences' },
        { title: 'Privacy and security', href: '/help/privacy-security' },
        { title: 'Data export and backup', href: '/help/data-export' },
      ]
    },
    {
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: Zap,
      color: 'text-yellow-600',
      articles: [
        { title: 'Sync issues', href: '/help/sync-issues' },
        { title: 'Performance problems', href: '/help/performance' },
        { title: 'Login problems', href: '/help/login-issues' },
        { title: 'Contact support', href: '/help/contact-support' },
      ]
    }
  ];

  const popularArticles = [
    'How to connect your email accounts',
    'Setting up categories and filters',
    'Using keyboard shortcuts',
    'Troubleshooting sync issues',
    'Customizing your reading experience',
    'Managing newsletter rules',
    'Data export and backup',
    'Privacy and security settings'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Help Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions and learn how to get the most out of News360.
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Link href="/contact">
              <MessageSquare className="h-6 w-6" />
              <span>Contact Support</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Link href="/help/videos">
              <Video className="h-6 w-6" />
              <span>Video Tutorials</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <Link href="/help/api-docs">
              <FileText className="h-6 w-6" />
              <span>API Documentation</span>
            </Link>
          </Button>
        </div>

        {/* Popular Articles */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Popular Articles</CardTitle>
            <CardDescription>
              Most frequently viewed help articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularArticles.map((article, index) => (
                <Link
                  key={index}
                  href={`/help/${article.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <h4 className="font-medium text-foreground mb-1">{article}</h4>
                  <p className="text-sm text-muted-foreground">Learn more about this topic</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Categories */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-foreground">Browse by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category) => (
              <Card key={category.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article.title}>
                        <Link
                          href={article.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Still need help?
            </h3>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:support@news360.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 