'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function ConnectEmailButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button 
      onClick={() => setIsModalOpen(true)}
      variant="outline"
      className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Connect Email Account
      </Button>

      <Modal
        open={isModalOpen}
        className='bg-background'
        onClose={() => setIsModalOpen(false)}
        title="Connect Email Account"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Choose an email provider to connect:
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className='bg-primary text-primary-foreground hover:bg-primary/90'
              onClick={() => handleConnect('gmail')}
              disabled={isLoading}
            >
              Gmail
            </Button>
            <Button
              variant="outline"
              className='bg-primary text-primary-foreground hover:bg-primary/90'
              onClick={() => handleConnect('outlook')}
              disabled={isLoading}
            >
              Outlook
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
} 