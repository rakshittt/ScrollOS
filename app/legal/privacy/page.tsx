import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Shield, Eye, Lock, Users, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
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
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                At News360 ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our 
                newsletter platform and related services.
              </p>
              <p>
                By using our service, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our service.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-600" />
                <CardTitle>Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">Personal Information</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email address and name when you create an account</li>
                <li>Profile information you choose to provide</li>
                <li>Email account credentials (when connecting external email accounts)</li>
                <li>Newsletter preferences and reading history</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Usage Information</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>How you interact with our platform</li>
                <li>Newsletters you read, save, or categorize</li>
                <li>Device information and browser type</li>
                <li>IP address and general location data</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Technical Information</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Log files and analytics data</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Performance and error data</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <CardTitle>How We Use Your Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and maintain our newsletter platform</li>
                <li>Sync and import your newsletters from connected email accounts</li>
                <li>Personalize your reading experience and recommendations</li>
                <li>Send you important service updates and notifications</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <CardTitle>Information Sharing and Disclosure</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
              
              <h4 className="font-semibold text-foreground mb-2 mt-4">Service Providers</h4>
              <p>We may share information with trusted third-party service providers who assist us in operating our platform, such as:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email service providers for newsletter delivery</li>
                <li>Cloud hosting and storage services</li>
                <li>Analytics and monitoring services</li>
                <li>Customer support platforms</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Legal Requirements</h4>
              <p>We may disclose your information if required by law or in response to valid legal requests.</p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Business Transfers</h4>
              <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-red-600" />
                <CardTitle>Data Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our platform</li>
                <li>Provide personalized content and features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="mt-4">
                You can control cookie settings through your browser preferences. 
                However, disabling certain cookies may affect the functionality of our platform.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and believe 
                your child has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure that such transfers comply with applicable data protection laws and implement 
                appropriate safeguards to protect your information.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date. 
                We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>If you have any questions about this privacy policy or our data practices, please contact us:</p>
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