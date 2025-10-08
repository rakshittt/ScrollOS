import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput: Date | string): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function extractTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getContrastColor(hexColor: string): string {
  // Remove the # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function estimateReadingTime(text: string): number {
  // Remove HTML tags if present
  const plainText = extractTextFromHtml(text);
  const words = plainText.split(/\s+/).filter(Boolean);
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

// Email validation utilities
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'throwaway.email', 'temp-mail.org', 'fakeinbox.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return { isValid: false, error: 'Please use a valid email address (disposable emails not allowed)' };
  }

  return { isValid: true };
}

// Password validation utilities
export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-4 (weak, fair, good, strong, very strong)
  errors: string[];
  warnings: string[];
  requirements: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // Basic requirements
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  // Check requirements
  if (!requirements.length) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!requirements.lowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!requirements.uppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!requirements.numbers) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!requirements.symbols) {
    warnings.push('Consider adding special characters for better security');
  } else {
    score += 1;
  }

  // Additional checks
  if (password.length < 12) {
    warnings.push('Consider using a longer password (12+ characters)');
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Avoid repeating characters');
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    errors.push('Avoid common patterns and words');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    score: Math.min(score, 4),
    errors,
    warnings,
    requirements,
  };
}

export function getPasswordStrengthText(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Very Strong';
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-500';
    case 2:
      return 'text-orange-500';
    case 3:
      return 'text-yellow-500';
    case 4:
      return 'text-green-500';
    default:
      return 'text-emerald-500';
  }
}
