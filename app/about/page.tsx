import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Users, Target, Zap, Heart, Award, Globe, Mail, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              About News360
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to transform how people consume and manage newsletters, 
              making information discovery more efficient and enjoyable.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Mission */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-blue-600" />
                <CardTitle>Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                In today's information-rich world, newsletters have become a primary source of 
                knowledge and insights. However, managing multiple newsletters across different 
                email accounts can be overwhelming and inefficient.
              </p>
              <p>
                News360 was born from the frustration of having valuable content scattered across 
                multiple inboxes. We believe that knowledge should be easily accessible, well-organized, 
                and enjoyable to consume. Our platform brings all your newsletters together in one 
                beautiful, intelligent interface.
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Zap className="h-6 w-6 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Efficiency</h4>
                    <p className="text-sm text-muted-foreground">
                      We optimize every aspect of newsletter management to save you time and reduce cognitive load.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Heart className="h-6 w-6 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">User-Centric</h4>
                    <p className="text-sm text-muted-foreground">
                      Every feature is designed with our users in mind, prioritizing their needs and feedback.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Privacy</h4>
                    <p className="text-sm text-muted-foreground">
                      We respect your privacy and handle your data with the utmost care and security.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Globe className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Accessibility</h4>
                    <p className="text-sm text-muted-foreground">
                      We believe knowledge should be accessible to everyone, regardless of their abilities.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-indigo-600" />
                <CardTitle>Our Team</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                News360 is built by a small, passionate team of developers, designers, and product 
                enthusiasts who understand the challenges of information overload.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">JD</span>
                  </div>
                  <h4 className="font-semibold text-foreground">John Doe</h4>
                  <p className="text-sm text-muted-foreground">Founder & CEO</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">JS</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Jane Smith</h4>
                  <p className="text-sm text-muted-foreground">Head of Product</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">MJ</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Mike Johnson</h4>
                  <p className="text-sm text-muted-foreground">Lead Developer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>By the Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                  <div className="text-sm text-muted-foreground">Newsletters Processed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology */}
          <Card>
            <CardHeader>
              <CardTitle>Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                News360 is built with modern, scalable technologies to ensure reliability, 
                performance, and security.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Badge variant="secondary" className="justify-center">Next.js</Badge>
                <Badge variant="secondary" className="justify-center">TypeScript</Badge>
                <Badge variant="secondary" className="justify-center">PostgreSQL</Badge>
                <Badge variant="secondary" className="justify-center">Tailwind CSS</Badge>
                <Badge variant="secondary" className="justify-center">Drizzle ORM</Badge>
                <Badge variant="secondary" className="justify-center">NextAuth.js</Badge>
                <Badge variant="secondary" className="justify-center">Vercel</Badge>
                <Badge variant="secondary" className="justify-center">Resend</Badge>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to transform your newsletter experience?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of users who have already simplified their newsletter management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/auth/signup">
                    Start Free Trial
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 