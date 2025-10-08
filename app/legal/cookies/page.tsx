import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Cookie, Settings, Eye, Shield } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/legal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Legal
            </Link>
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <Cookie className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-foreground">Cookie Policy</h1>
          </div>
          
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Cookies are small text files that are stored on your device when you visit a website. 
                They help websites remember information about your visit, such as your preferred 
                language and other settings, which can make your next visit easier and more useful.
              </p>
              <p>
                At News360, we use cookies and similar technologies to enhance your experience, 
                analyze how you use our platform, and provide personalized content.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">Essential Cookies</h4>
              <p>
                These cookies are necessary for the website to function properly. They enable basic 
                functions like page navigation, access to secure areas, and user authentication.
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Authentication and session management</li>
                <li>Security and fraud prevention</li>
                <li>Load balancing and performance</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">Functional Cookies</h4>
              <p>
                These cookies enable enhanced functionality and personalization, such as remembering 
                your preferences and settings.
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Language and region preferences</li>
                <li>Newsletter display settings</li>
                <li>User interface customization</li>
                <li>Reading progress and bookmarks</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">Analytics Cookies</h4>
              <p>
                These cookies help us understand how visitors interact with our website by collecting 
                and reporting information anonymously.
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Page views and navigation patterns</li>
                <li>Feature usage and engagement</li>
                <li>Performance monitoring</li>
                <li>Error tracking and debugging</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">Marketing Cookies</h4>
              <p>
                These cookies are used to track visitors across websites to display relevant and 
                engaging advertisements.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ad targeting and personalization</li>
                <li>Campaign effectiveness measurement</li>
                <li>Cross-site tracking for marketing purposes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Specific Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Specific Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-left">Cookie Name</th>
                      <th className="border border-border p-3 text-left">Purpose</th>
                      <th className="border border-border p-3 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3 font-mono text-sm">session_id</td>
                      <td className="border border-border p-3">Maintains your login session</td>
                      <td className="border border-border p-3">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-mono text-sm">theme</td>
                      <td className="border border-border p-3">Remembers your theme preference</td>
                      <td className="border border-border p-3">1 year</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-mono text-sm">language</td>
                      <td className="border border-border p-3">Stores your language preference</td>
                      <td className="border border-border p-3">1 year</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-mono text-sm">_ga</td>
                      <td className="border border-border p-3">Google Analytics tracking</td>
                      <td className="border border-border p-3">2 years</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-mono text-sm">_gid</td>
                      <td className="border border-border p-3">Google Analytics session tracking</td>
                      <td className="border border-border p-3">24 hours</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-mono text-sm">newsletter_prefs</td>
                      <td className="border border-border p-3">Newsletter display preferences</td>
                      <td className="border border-border p-3">6 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We may use third-party services that place cookies on your device. These services help us:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide customer support and chat functionality</li>
                <li>Deliver relevant advertisements</li>
                <li>Monitor website performance and security</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">Google Analytics</h4>
              <p>
                We use Google Analytics to understand how users interact with our website. Google Analytics 
                uses cookies to collect information about your use of our website, including your IP address.
              </p>

              <h4 className="font-semibold text-foreground mb-2">Other Third-Party Services</h4>
              <p>
                We may also use cookies from other third-party services for specific functionality, 
                such as payment processing, customer support, or social media integration.
              </p>
            </CardContent>
          </Card>

          {/* Cookie Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <CardTitle>Managing Your Cookie Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">Browser Settings</h4>
              <p>
                Most web browsers allow you to control cookies through their settings preferences. 
                You can typically:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>View and delete existing cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies</li>
                <li>Set preferences for different types of cookies</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">Cookie Consent</h4>
              <p>
                When you first visit our website, you'll see a cookie consent banner that allows you 
                to accept or decline non-essential cookies. You can change your preferences at any time 
                through our cookie settings.
              </p>

              <h4 className="font-semibold text-foreground mb-2">Impact of Disabling Cookies</h4>
              <p>
                Please note that disabling certain cookies may affect the functionality of our website. 
                Essential cookies cannot be disabled as they are necessary for the website to function properly.
              </p>
            </CardContent>
          </Card>

          {/* Do Not Track */}
          <Card>
            <CardHeader>
              <CardTitle>Do Not Track</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Some browsers include a "Do Not Track" (DNT) feature that sends a signal to websites 
                indicating that you do not want to be tracked. Currently, there is no standard for how 
                websites should respond to DNT signals.
              </p>
              <p className="mt-4">
                We respect your privacy choices and will continue to monitor developments around DNT 
                standards. You can also manage your tracking preferences through our cookie settings.
              </p>
            </CardContent>
          </Card>

          {/* Updates to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Updates to This Cookie Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We will notify you of any 
                material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Posting the updated policy on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying a banner on our website</li>
              </ul>
              <p className="mt-4">
                We encourage you to review this policy periodically to stay informed about how we use cookies.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>If you have any questions about our use of cookies, please contact us:</p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> privacy@news360.com</li>
                <li><strong>Address:</strong> [Your Company Address]</li>
                <li><strong>Phone:</strong> [Your Phone Number]</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/legal">
              Back to Legal Documents
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 