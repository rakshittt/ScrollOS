'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Inbox,
  Mail,
  Sparkles,
  ArrowRight,
  BookOpen,
  Filter,
  Settings,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

interface EmptyInboxStateProps {
  onStartOnboarding: () => void;
  hasEmailConnected: boolean;
}

export function EmptyInboxState({ onStartOnboarding, hasEmailConnected }: EmptyInboxStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Main Icon */}
        <div className="w-24 h-24 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-6">
          <Inbox className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Your inbox is empty
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {hasEmailConnected 
            ? "You haven't imported any newsletters yet. Try syncing your email or check your email settings to get started."
            : "Welcome to News360! Let's get you set up to manage all your newsletters in one beautiful place."
          }
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {!hasEmailConnected && (
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Connect Email</h3>
                  <p className="text-sm text-muted-foreground">Import newsletters from Gmail or Outlook</p>
                </div>
              </div>
              <Link href="/settings/email">
                <Button className="w-full">
                  Connect Email
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>
          )}

          {!hasEmailConnected && (
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Take a Tour</h3>
                  <p className="text-sm text-muted-foreground">Learn about all the features</p>
                </div>
              </div>
              <Button 
                onClick={onStartOnboarding}
                variant="outline"
                className="w-full"
              >
                Start Tour
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          )}

          {hasEmailConnected && (
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">Get support and learn more</p>
                </div>
              </div>
              <Link href="/help">
                <Button 
                  variant="outline"
                  className="w-full"
                >
                  Visit Help Center
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <h4 className="font-medium text-sm">Beautiful Reading</h4>
              <p className="text-xs text-muted-foreground">Distraction-free experience</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
            <Filter className="h-5 w-5 text-purple-600" />
            <div className="text-left">
              <h4 className="font-medium text-sm">Smart Organization</h4>
              <p className="text-xs text-muted-foreground">Categories & filters</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
            <Settings className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <h4 className="font-medium text-sm">Customizable</h4>
              <p className="text-xs text-muted-foreground">Personalize your experience</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="h-3 w-3 text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-blue-900 text-sm mb-1">Pro Tip</h4>
              <p className="text-blue-700 text-sm">
                {hasEmailConnected 
                  ? "Your email is connected! Try syncing your newsletters or check your email settings if you're not seeing any newsletters yet."
                  : "Connect your email first to automatically import all your newsletters, then organize them with categories and filters."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 