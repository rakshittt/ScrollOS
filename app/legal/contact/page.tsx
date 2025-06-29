import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

export default function LegalContactPage() {
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
            <Mail className="h-8 w-8 text-red-600" />
            <h1 className="text-4xl font-bold text-foreground">Contact Information</h1>
          </div>
          
          <p className="text-lg text-muted-foreground">
            Get in touch with us for legal inquiries, privacy concerns, or general questions about our policies.
          </p>
        </div>

        <div className="space-y-8">
          {/* General Contact */}
          <Card>
            <CardHeader>
              <CardTitle>General Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Email</h4>
                  <p className="text-muted-foreground">info@news360.com</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    For general inquiries and support
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Phone</h4>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monday to Friday, 9:00 AM - 6:00 PM EST
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Address</h4>
                  <p className="text-muted-foreground">
                    News360 Inc.<br />
                    123 Innovation Drive<br />
                    Tech City, TC 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Team */}
          <Card>
            <CardHeader>
              <CardTitle>Legal Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Legal Inquiries</h4>
                  <p className="text-muted-foreground">legal@news360.com</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    For questions about Terms of Service, contracts, and legal matters
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Privacy & Data Protection</h4>
                  <p className="text-muted-foreground">privacy@news360.com</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    For privacy policy questions, data requests, and GDPR inquiries
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Data Protection Officer</h4>
                  <p className="text-muted-foreground">dpo@news360.com</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    For GDPR compliance and data protection matters
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle>Business Hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">General Support</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>Monday - Friday: 9:00 AM - 6:00 PM EST</li>
                    <li>Saturday: 10:00 AM - 4:00 PM EST</li>
                    <li>Sunday: Closed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Legal Team</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>Monday - Friday: 9:00 AM - 5:00 PM EST</li>
                    <li>Weekends: Closed</li>
                    <li>Emergency: Available 24/7 for urgent matters</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Times */}
          <Card>
            <CardHeader>
              <CardTitle>Expected Response Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold text-foreground">General Inquiries</h4>
                    <p className="text-sm text-muted-foreground">Support and general questions</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">24-48 hours</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold text-foreground">Legal Inquiries</h4>
                    <p className="text-sm text-muted-foreground">Terms, contracts, legal matters</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">2-3 business days</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold text-foreground">Privacy Requests</h4>
                    <p className="text-sm text-muted-foreground">Data access, deletion, GDPR</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">30 days</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold text-foreground">Urgent Matters</h4>
                    <p className="text-sm text-muted-foreground">Security incidents, legal emergencies</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">Immediate</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <CardTitle>Send Us a Message</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For non-urgent inquiries, you can also use our contact form. We'll get back to you as soon as possible.
              </p>
              <Button asChild>
                <Link href="/contact">
                  Contact Form
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">For Data Subject Requests</h4>
              <p>
                If you're making a data subject request (access, correction, deletion, etc.), please include:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Your full name and email address</li>
                <li>The specific type of request you're making</li>
                <li>Any relevant account information</li>
                <li>Proof of identity (if required)</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">For Legal Inquiries</h4>
              <p>
                When contacting our legal team, please provide:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Your name and contact information</li>
                <li>The nature of your inquiry</li>
                <li>Any relevant account or transaction details</li>
                <li>Your preferred method of response</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2">Confidentiality</h4>
              <p>
                All communications with our legal team are treated as confidential. We take your privacy 
                seriously and will protect any sensitive information you share with us.
              </p>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-200">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 dark:text-red-300 mb-4">
                For urgent security incidents, data breaches, or legal emergencies:
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-red-800 dark:text-red-200">
                  Emergency Hotline: +1 (555) 999-8888
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Available 24/7 for critical issues only
                </p>
              </div>
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