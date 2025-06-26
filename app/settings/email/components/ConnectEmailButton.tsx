'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function ConnectEmailButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        window.location.href = data.authUrl;
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