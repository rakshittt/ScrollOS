'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword, getPasswordStrengthText, getPasswordStrengthColor } from '@/lib/utils';

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  // Validation state
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: false });
  const [passwordValidation, setPasswordValidation] = useState<any>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Real-time validation
  useEffect(() => {
    if (formData.email) {
      setEmailValidation(validateEmail(formData.email));
    }
  }, [formData.email]);

  useEffect(() => {
    if (formData.password) {
      setPasswordValidation(validatePassword(formData.password));
    } else {
      setPasswordValidation(null);
    }
  }, [formData.password]);

  useEffect(() => {
    const isValid = 
      formData.name.trim() !== '' &&
      emailValidation.isValid &&
      passwordValidation?.isValid &&
      formData.password.length >= 8;
    
    setIsFormValid(isValid);
  }, [formData.name, emailValidation, passwordValidation, formData.password]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear errors when user types
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      router.push('/auth/signin?registered=true');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const renderEmailValidation = () => {
    if (!formData.email) return null;
    
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

  return (
    <AuthLayout
      title="Create your account"
      description="Sign up to get started with the most beautiful newsletter reader."
    >
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} autoComplete="on">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Enter your name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
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
                  className={`pl-10 ${formData.email && !emailValidation.isValid ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {renderEmailValidation()}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Create a password"
                  className={`pl-10 pr-10 ${formData.password && passwordValidation && !passwordValidation.isValid ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {renderPasswordRequirements()}
            </div>
            
            {error && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary-500 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
} 