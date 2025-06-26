import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Mail, MessageCircle, HelpCircle, ArrowLeft } from 'lucide-react';

export default function HelpSupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
              <p className="text-muted-foreground">Find answers or contact our team for assistance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FAQ Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">How do I reset my password?</span>
                <br />Use the <span className="font-medium text-primary">Forgot password?</span> link on the sign-in page to receive a reset link.
              </li>
              <li>
                <span className="font-semibold text-foreground">How do I add a new email account?</span>
                <br />Go to <span className="font-medium text-primary">Settings &gt; Email</span> and click <span className="font-medium text-primary">Connect Email Account</span>.
              </li>
              <li>
                <span className="font-semibold text-foreground">How do I organize newsletters?</span>
                <br />Use <span className="font-medium text-primary">categories</span> and <span className="font-medium text-primary">rules</span> in Settings to automatically sort your newsletters.
              </li>
              <li>
                <span className="font-semibold text-foreground">Need more help?</span>
                <br />Contact us using the form!
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Support</CardTitle>
            <CardDescription>We're here to help you with any issues or questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">support@newsletter.com</span>
            </div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Live chat coming soon!</span>
            </div>
            <form className="space-y-4">
              <Input type="email" placeholder="Your email" required />
              <textarea
                className="flex w-full rounded-md border bg-background px-3 py-2 text-sm transition-colors border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="How can we help you?"
                rows={4}
                required
              />
              <Button type="submit" className="w-full transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary-500">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 