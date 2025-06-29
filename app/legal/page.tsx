import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Shield, Scale, HelpCircle, Mail } from 'lucide-react';

export default function LegalPage() {
  const legalDocuments = [
    {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information',
      href: '/legal/privacy',
      icon: Shield,
      color: 'text-blue-600',
    },
    {
      title: 'Terms of Service',
      description: 'The terms and conditions for using our newsletter platform',
      href: '/legal/terms',
      icon: FileText,
      color: 'text-green-600',
    },
    {
      title: 'Cookie Policy',
      description: 'How we use cookies and similar technologies',
      href: '/legal/cookies',
      icon: HelpCircle,
      color: 'text-purple-600',
    },
    {
      title: 'Data Processing Agreement',
      description: 'How we process your data in compliance with GDPR',
      href: '/legal/data-processing',
      icon: Scale,
      color: 'text-orange-600',
    },
    {
      title: 'Contact Information',
      description: 'How to reach us for legal inquiries',
      href: '/legal/contact',
      icon: Mail,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Legal Information
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Important legal documents and policies that govern your use of News360. 
            We're committed to transparency and protecting your rights.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {legalDocuments.map((doc) => (
            <Card key={doc.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <doc.icon className={`h-6 w-6 ${doc.color}`} />
                  <CardTitle className="text-xl">{doc.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={doc.href}>
                    Read More
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                If you have any questions about these legal documents, please don't hesitate to{' '}
                <Link href="/legal/contact" className="text-primary hover:underline">
                  contact us
                </Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 