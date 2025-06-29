import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <FileText className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
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
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                These Terms of Service ("Terms") govern your use of News360, a newsletter platform 
                operated by [Your Company Name] ("we," "our," or "us"). By accessing or using our 
                service, you agree to be bound by these Terms.
              </p>
              <p>
                If you disagree with any part of these terms, then you may not access the service. 
                These Terms apply to all visitors, users, and others who access or use the service.
              </p>
            </CardContent>
          </Card>

          {/* Description of Service */}
          <Card>
            <CardHeader>
              <CardTitle>Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                News360 is an all-in-one newsletter platform that allows users to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Connect and sync multiple email accounts</li>
                <li>Import and organize newsletters</li>
                <li>Categorize and filter newsletters</li>
                <li>Read newsletters in a unified interface</li>
                <li>Set up rules and preferences for newsletter management</li>
                <li>Export and backup newsletter data</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">Account Creation</h4>
              <p>
                To use certain features of our service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your account credentials secure</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Account Security</h4>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials 
                and for all activities that occur under your account. You must notify us immediately 
                of any unauthorized use of your account.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle>Acceptable Use</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use the service to transmit harmful or malicious content</li>
                <li>Attempt to reverse engineer or decompile our software</li>
                <li>Use automated systems to access the service without permission</li>
              </ul>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <CardTitle>Prohibited Activities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>The following activities are strictly prohibited:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sharing account credentials with others</li>
                <li>Using the service to distribute spam or unsolicited emails</li>
                <li>Attempting to access other users' accounts or data</li>
                <li>Using the service for commercial purposes without authorization</li>
                <li>Circumventing any security measures</li>
                <li>Using the service to store or transmit illegal content</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">Our Rights</h4>
              <p>
                The service and its original content, features, and functionality are owned by us and 
                are protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Your Content</h4>
              <p>
                You retain ownership of any content you upload or create using our service. By using 
                our service, you grant us a limited license to process and store your content solely 
                for the purpose of providing the service to you.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Third-Party Content</h4>
              <p>
                Our service may contain content from third parties, including newsletters and other 
                materials. We do not claim ownership of such content and respect the intellectual 
                property rights of third parties.
              </p>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Your privacy is important to us. Our collection and use of personal information is 
                governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="mt-4">
                By using our service, you consent to the collection and use of your information as 
                described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We strive to provide reliable service but cannot guarantee uninterrupted availability. 
                The service may be temporarily unavailable due to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Scheduled maintenance</li>
                <li>Technical issues or system updates</li>
                <li>Force majeure events</li>
                <li>Third-party service disruptions</li>
              </ul>
              <p className="mt-4">
                We will make reasonable efforts to notify users of planned maintenance and minimize 
                service disruptions.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle>Limitation of Liability</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                To the maximum extent permitted by law, we shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Loss of profits, data, or use</li>
                <li>Business interruption</li>
                <li>Damages resulting from service interruptions</li>
                <li>Loss of or damage to your content</li>
              </ul>
              <p className="mt-4">
                Our total liability to you for any claims arising from these Terms or your use of 
                the service shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties that the service will be uninterrupted or error-free</li>
                <li>Warranties regarding the accuracy or reliability of content</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">Termination by You</h4>
              <p>
                You may terminate your account at any time by contacting us or using the account 
                deletion feature in your settings.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Termination by Us</h4>
              <p>
                We may terminate or suspend your account immediately, without prior notice, for conduct 
                that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Effect of Termination</h4>
              <p>
                Upon termination, your right to use the service will cease immediately. We may delete 
                your account and data, though we may retain certain information as required by law or 
                for legitimate business purposes.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of 
                [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
              <p className="mt-4">
                Any disputes arising from these Terms or your use of the service shall be resolved 
                in the courts of [Your Jurisdiction].
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of 
                significant changes by:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Posting the updated Terms on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying in-app notifications</li>
              </ul>
              <p className="mt-4">
                Your continued use of the service after changes become effective constitutes acceptance 
                of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> legal@news360.com</li>
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