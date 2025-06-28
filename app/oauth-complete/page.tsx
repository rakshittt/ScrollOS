'use client'

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function OAuthCompleteInner() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const email = searchParams.get('email');
    
    // Send message to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'oauth_complete',
        success: success === 'true',
        error,
        email
      }, '*');
      
      // Close the popup
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      // If no opener, redirect to settings
      window.location.href = '/settings/email';
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-foreground">Completing OAuth...</p>
        <p className="text-sm text-muted-foreground">This window will close automatically.</p>
      </div>
    </div>
  );
}

export default function OAuthCompletePage() {
  return (
    <Suspense>
      <OAuthCompleteInner />
    </Suspense>
  );
} 