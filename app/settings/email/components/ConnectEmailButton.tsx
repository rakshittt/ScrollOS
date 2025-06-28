'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Mail, ChevronDown, Plus, Shield, Sparkles, Zap } from 'lucide-react';

export function ConnectEmailButton() {
  const [isLoading, setIsLoading] = useState(false);

  // Handle OAuth completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'oauth_complete') {
        window.location.reload();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/email/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();
      if (data.authUrl) {
        // Try to open popup first
        const popup = window.open(
          data.authUrl,
          'oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes,status=yes'
        );

        if (popup) {
          // Monitor popup for completion
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              // Check if OAuth was successful by looking for success/error in URL
              window.location.reload();
            }
          }, 1000);

          // Fallback: if popup is blocked or fails, use same window
          setTimeout(() => {
            if (popup.closed || popup.location.href === 'about:blank') {
              clearInterval(checkClosed);
              // Popup was blocked, use same window
              window.location.href = data.authUrl;
            }
          }, 2000);
        } else {
          // Popup blocked, use same window
          window.location.href = data.authUrl;
        }
      }
    } catch (error) {
      console.error('Error connecting email account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button 
          variant="outline"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Connect Email Account
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          align="end" 
          className="w-80 p-4 z-50 rounded-lg border bg-background shadow-lg"
          sideOffset={8}
        >
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Choose Provider</h4>
                <p className="text-xs text-muted-foreground">
                  Select your email provider to connect
                </p>
              </div>
            </div>
          </div>
          
          <DropdownMenu.Separator className="mb-4 h-px bg-border" />
          
          {/* Provider Options */}
          <div className="space-y-2">
            {/* Gmail Option */}
            <DropdownMenu.Item
              onSelect={() => handleConnect('gmail')}
              disabled={isLoading}
              className="flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed outline-none"
            >
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-foreground">Gmail</span>
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  Connect your Gmail account
                </p>
                <div className="flex items-center space-x-1">
                  <Zap className="h-2.5 w-2.5 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Most Popular</span>
                </div>
              </div>
            </DropdownMenu.Item>

            {/* Outlook Option */}
            <DropdownMenu.Item
              onSelect={() => handleConnect('outlook')}
              disabled={isLoading}
              className="flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed outline-none"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-foreground">Outlook</span>
                  <Sparkles className="h-3 w-3 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  Connect your Outlook account
                </p>
                <div className="flex items-center space-x-1">
                  <Zap className="h-2.5 w-2.5 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Enterprise Ready</span>
                </div>
              </div>
            </DropdownMenu.Item>
          </div>

          {/* Footer */}
          <DropdownMenu.Separator className="mt-4 mb-3 h-px bg-border" />
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>All connections are secure and encrypted</span>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
} 