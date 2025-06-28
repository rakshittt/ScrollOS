'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ChevronRight,
  HelpCircle,
  Mail,
  Palette,
  Settings,
  Shield,
  ShieldCheck,
  Tag,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'email',
    title: 'Email Accounts',
    description: 'Connect and manage your email accounts for newsletter syncing',
    icon: Mail,
    href: '/settings/email',
    color: 'text-blue-600'
  },
  {
    id: 'whitelist',
    title: 'Email Whitelist',
    description: 'Manage which email addresses can send newsletters to your inbox',
    icon: ShieldCheck,
    href: '/settings/whitelist',
    color: 'text-green-600'
  },
//   {
//     id: 'reading',
//     title: 'Reading Preferences',
//     description: 'Customize your reading experience with font size, theme, and layout',
//     icon: BookOpen,
//     href: '/settings/reading',
//     color: 'text-green-600'
//   },
//   {
//     id: 'categories',
//     title: 'Categories',
//     description: 'Organize newsletters with custom categories and colors',
//     icon: Tag,
//     href: '/settings/categories',
//     color: 'text-purple-600'
//   },
//   {
//     id: 'rules',
//     title: 'Automation Rules',
//     description: 'Set up rules to automatically categorize and organize newsletters',
//     icon: Zap,
//     href: '/settings/rules',
//     color: 'text-orange-600'
//   },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the app theme, colors, and visual preferences',
    icon: Palette,
    href: '/settings/appearance',
    color: 'text-pink-600'
  },
//   {
//     id: 'notifications',
//     title: 'Notifications',
//     description: 'Configure email and browser notifications for new newsletters',
//     icon: Bell,
//     href: '/settings/notifications',
//     color: 'text-red-600'
//   },
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Manage your profile, password, and account preferences',
    icon: User,
    href: '/settings/account',
    color: 'text-indigo-600'
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Control data access, privacy settings, and security options',
    icon: Shield,
    href: '/settings/security',
    color: 'text-gray-600'
  }
];

export default function SettingsPage() {
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    switch (action) {
    //   case 'connect-email':
    //     router.push('/settings/email');
    //     break;
      case 'manage-whitelist':
        router.push('/settings/whitelist');
        break;
      case 'create-category':
        router.push('/settings/categories');
        break;
    //   case 'add-rule':
    //     router.push('/settings/rules');
    //     break;
      case 'get-help':
        // Open help documentation or contact support
        window.open('https://docs.newsletter-reader.com', '_blank');
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your newsletter reading experience</p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => (
          <Link key={section.id} href={section.href}>
            <Card className="h-full hover:shadow-md transition-all duration-200 cursor-pointer group border-border hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                  {section.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {section.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-xl font-medium text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => handleQuickAction('connect-email')}
          >
            <Mail className="h-5 w-5" />
            <span className="text-sm font-medium">Connect Email</span>
          </Button> */}
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => handleQuickAction('manage-whitelist')}
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Manage Whitelist</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => handleQuickAction('create-category')}
          >
            <Tag className="h-5 w-5" />
            <span className="text-sm font-medium">Create Category</span>
          </Button>
          {/* <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => handleQuickAction('add-rule')}
          >
            <Zap className="h-5 w-5" />
            <span className="text-sm font-medium">Add Rule</span>
          </Button> */}
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => handleQuickAction('get-help')}
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Get Help</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 