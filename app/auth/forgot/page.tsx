"use client"

import { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(null);
    setError(null);
    // TODO: Implement backend logic to send reset email
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('If an account with that email exists, a password reset link has been sent.');
    }, 1200);
  }

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
                  className="pl-10"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {error && (
              <div className="text-sm text-error-500 text-center">{error}</div>
            )}
            {success && (
              <div className="text-sm text-success-500 text-center">{success}</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
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