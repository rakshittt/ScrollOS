"use client"

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { validatePassword, getPasswordStrengthText, getPasswordStrengthColor } from '@/lib/utils';

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState<any>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  // Real-time password validation
  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  useEffect(() => {
    const isValid = token && passwordValidation?.isValid && password.length >= 8;
    setIsFormValid(isValid);
  }, [token, passwordValidation, password]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError(null);
    setSuccess(null);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Your password has been reset. You can now sign in.');
        setPassword('');
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  const renderPasswordRequirements = () => {
    if (!passwordValidation) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Password strength:</span>
          <span className={`text-sm font-medium ${getPasswordStrengthColor(passwordValidation.score)}`}>
            {getPasswordStrengthText(passwordValidation.score)}
          </span>
        </div>
        
        <div className="space-y-1">
          {Object.entries(passwordValidation.requirements).map(([req, met]) => (
            <div key={req} className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-red-600'}`}>
              {met ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              <span className="capitalize">
                {req === 'length' && 'At least 8 characters'}
                {req === 'lowercase' && 'One lowercase letter'}
                {req === 'uppercase' && 'One uppercase letter'}
                {req === 'numbers' && 'One number'}
                {req === 'symbols' && 'One special character'}
              </span>
            </div>
          ))}
        </div>

        {passwordValidation.warnings.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs font-medium">Suggestions:</span>
            </div>
            <ul className="mt-1 text-xs text-yellow-700 space-y-1">
              {passwordValidation.warnings.map((warning: string, index: number) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        description="The password reset link is invalid or has expired."
      >
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-sm">
                Invalid or expired reset link. Please request a new password reset.
              </div>
              <a
                href="/auth/forgot"
                className="text-primary-500 hover:underline text-sm"
              >
                Request new reset link
              </a>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter a new password for your account."
    >
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-center">Set a new password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} autoComplete="on">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Enter a new password"
                  className={`pl-10 pr-10 ${password && passwordValidation && !passwordValidation.isValid ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {renderPasswordRequirements()}
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
              {isLoading ? 'Resetting...' : 'Reset password'}
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

export default function ResetPasswordPageWithSuspense() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
} 