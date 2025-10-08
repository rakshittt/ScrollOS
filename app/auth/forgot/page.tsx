"use client"

import { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { validateEmail } from '@/lib/utils';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: false });
  const [isFormValid, setIsFormValid] = useState(false);

  // Real-time email validation
  useEffect(() => {
    if (email) {
      setEmailValidation(validateEmail(email));
    }
  }, [email]);

  useEffect(() => {
    setIsFormValid(emailValidation.isValid);
  }, [emailValidation]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError(null);
    setSuccess(null);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('If an account with that email exists, a password reset link has been sent.');
        setEmail('');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const renderEmailValidation = () => {
    if (!email) return null;
    
    return (
      <div className={`flex items-center gap-2 text-sm ${emailValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
        {emailValidation.isValid ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <span>{emailValidation.isValid ? 'Valid email' : emailValidation.error}</span>
      </div>
    );
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset your password."
    >
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} autoComplete="on">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  className={`pl-10 ${email && !emailValidation.isValid ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {renderEmailValidation()}
            </div>
            {error && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-200">{error}</div>
            )}
            {success && (
              <div className="text-sm text-green-600 text-center bg-green-50 p-3 rounded-md border border-green-200">{success}</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
            <a
              href="/auth/signin"
              className="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
            >
              &larr; Back to sign in
            </a>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
} 