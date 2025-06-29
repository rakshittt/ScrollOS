import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Scale, Database, Shield, Users } from 'lucide-react';

export default function DataProcessingAgreementPage() {
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
            <Scale className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-foreground">Data Processing Agreement</h1>
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
                This Data Processing Agreement ("DPA") forms part of our Terms of Service and Privacy Policy. 
                It outlines how we process personal data in compliance with the General Data Protection 
                Regulation (GDPR) and other applicable data protection laws.
              </p>
              <p>
                This agreement applies to all users of News360 who are located in the European Economic Area (EEA) 
                or whose personal data is processed in the EEA.
              </p>
            </CardContent>
          </Card>

          {/* Definitions */}
          <Card>
            <CardHeader>
              <CardTitle>Definitions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">GDPR Terms</h4>
              <ul className="space-y-2">
                <li><strong>Personal Data:</strong> Any information relating to an identified or identifiable natural person</li>
                <li><strong>Data Controller:</strong> The entity that determines the purposes and means of processing personal data</li>
                <li><strong>Data Processor:</strong> The entity that processes personal data on behalf of the controller</li>
                <li><strong>Data Subject:</strong> The individual whose personal data is being processed</li>
                <li><strong>Processing:</strong> Any operation performed on personal data</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Roles and Responsibilities</h4>
              <p>
                <strong>You (the User):</strong> Act as the Data Controller for personal data you provide to us, 
                including email content and contact information.
              </p>
              <p>
                <strong>News360:</strong> Acts as the Data Processor, processing your personal data to provide 
                our newsletter platform services.
              </p>
            </CardContent>
          </Card>

          {/* Data Processing Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <CardTitle>Data Processing Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">Subject Matter</h4>
              <p>
                The subject matter of the data processing is the provision of newsletter management and 
                reading services through the News360 platform.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Duration</h4>
              <p>
                The duration of the data processing is for the period during which you use our services, 
                plus any additional period required for legal compliance or legitimate business purposes.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Nature and Purpose</h4>
              <p>The nature and purpose of the data processing includes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Providing newsletter synchronization and management services</li>
                <li>Personalizing your reading experience</li>
                <li>Analyzing usage patterns to improve our services</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Providing customer support</li>
                <li>Complying with legal obligations</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Types of Personal Data</h4>
              <p>We process the following types of personal data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Account information (email address, name)</li>
                <li>Email content and metadata</li>
                <li>Newsletter preferences and reading history</li>
                <li>Usage analytics and interaction data</li>
                <li>Technical information (IP address, device information)</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Categories of Data Subjects</h4>
              <p>The categories of data subjects include:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>News360 platform users</li>
                <li>Newsletter subscribers and authors</li>
                <li>Email account holders</li>
              </ul>
            </CardContent>
          </Card>

          {/* Our Obligations */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle>Our Obligations as Data Processor</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">Processing Instructions</h4>
              <p>
                We will process personal data only on your documented instructions, including regarding 
                transfers of personal data to a third country or international organization.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Confidentiality</h4>
              <p>
                We ensure that persons authorized to process personal data have committed themselves 
                to confidentiality or are under an appropriate statutory obligation of confidentiality.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Security Measures</h4>
              <p>We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of personal data in transit and at rest</li>
                <li>Regular testing and evaluation of security measures</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security assessments and updates</li>
                <li>Incident detection and response procedures</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Subprocessors</h4>
              <p>
                We may engage subprocessors to assist in providing our services. We ensure that any 
                subprocessor is bound by data protection obligations at least as protective as those 
                in this agreement.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Data Subject Rights</h4>
              <p>
                We will assist you in responding to data subject requests, including requests for 
                access, rectification, erasure, and data portability.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Data Breach Notification</h4>
              <p>
                We will notify you without undue delay after becoming aware of a personal data breach, 
                providing relevant information to assist you in meeting your breach notification obligations.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Deletion or Return</h4>
              <p>
                Upon termination of our services, we will delete or return all personal data to you, 
                unless retention is required by law.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Audit Rights</h4>
              <p>
                We will make available to you all information necessary to demonstrate compliance 
                with this agreement and allow for and contribute to audits and inspections.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <CardTitle>Your Rights as Data Controller</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-2">Instruction Rights</h4>
              <p>
                You have the right to provide us with instructions regarding the processing of your 
                personal data, and we will follow those instructions.
              </p>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Access and Control</h4>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Request data portability</li>
                <li>Object to processing</li>
                <li>Request restriction of processing</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-2 mt-4">Compliance Monitoring</h4>
              <p>
                You have the right to audit our compliance with this agreement and request information 
                about our data processing activities.
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
                We may transfer personal data to countries outside the EEA. When we do so, we ensure 
                appropriate safeguards are in place, such as:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Adequacy decisions by the European Commission</li>
                <li>Standard contractual clauses</li>
                <li>Binding corporate rules</li>
                <li>Other appropriate safeguards</li>
              </ul>
              <p className="mt-4">
                We will inform you of any international transfers and the safeguards in place to 
                protect your personal data.
              </p>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card>
            <CardHeader>
              <CardTitle>Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Each party shall be liable to the other party for any damages caused by its breach 
                of this agreement. Our liability is limited as set forth in our Terms of Service.
              </p>
              <p className="mt-4">
                In the event of a personal data breach caused by our failure to comply with this 
                agreement, we shall be liable for any damages resulting from such breach.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                This agreement will terminate automatically upon the termination of our Terms of Service 
                or when we cease to process your personal data.
              </p>
              <p className="mt-4">
                Upon termination, we will delete or return all personal data to you, unless retention 
                is required by law or for legitimate business purposes.
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
                This agreement is governed by the laws of [Your Jurisdiction] and the GDPR, where applicable. 
                Any disputes will be resolved in accordance with our Terms of Service.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>For questions about this Data Processing Agreement, please contact us:</p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> privacy@news360.com</li>
                <li><strong>Data Protection Officer:</strong> dpo@news360.com</li>
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