import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-100 text-primary-900 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-100 dark:hover:bg-primary-800',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-error-100 text-error-900 hover:bg-error-200 dark:bg-error-900 dark:text-error-100 dark:hover:bg-error-800',
        outline: 'text-foreground border-border',
        success:
          'border-transparent bg-success-100 text-success-900 hover:bg-success-200 dark:bg-success-900 dark:text-success-100 dark:hover:bg-success-800',
        warning:
          'border-transparent bg-warning-100 text-warning-900 hover:bg-warning-200 dark:bg-warning-900 dark:text-warning-100 dark:hover:bg-warning-800',
        info:
          'border-transparent bg-info-100 text-info-900 hover:bg-info-200 dark:bg-info-900 dark:text-info-100 dark:hover:bg-info-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
