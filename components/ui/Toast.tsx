import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        destructive:
          'border-error-200 bg-error-50 text-error-900 dark:border-error-800 dark:bg-error-950 dark:text-error-100',
        success:
          'border-success-200 bg-success-50 text-success-900 dark:border-success-800 dark:bg-success-950 dark:text-success-100',
        warning:
          'border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-100',
        info:
          'border-info-200 bg-info-50 text-info-900 dark:border-info-800 dark:bg-info-950 dark:text-info-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
Toast.displayName = 'Toast';

const ToastTitle = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';

const ToastAction = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-error-200 group-[.destructive]:hover:border-error-300 group-[.destructive]:hover:bg-error-100 group-[.destructive]:hover:text-error-900 group-[.destructive]:focus:ring-error-500 group-[.success]:border-success-200 group-[.success]:hover:border-success-300 group-[.success]:hover:bg-success-100 group-[.success]:hover:text-success-900 group-[.success]:focus:ring-success-500 group-[.warning]:border-warning-200 group-[.warning]:hover:border-warning-300 group-[.warning]:hover:bg-warning-100 group-[.warning]:hover:text-warning-900 group-[.warning]:focus:ring-warning-500 group-[.info]:border-info-200 group-[.info]:hover:border-info-300 group-[.info]:hover:bg-info-100 group-[.info]:hover:text-info-900 group-[.info]:focus:ring-info-500', className)}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

const ToastClose = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-error-300 group-[.destructive]:hover:text-error-900 group-[.destructive]:focus:ring-error-500 group-[.success]:text-success-300 group-[.success]:hover:text-success-900 group-[.success]:focus:ring-success-500 group-[.warning]:text-warning-300 group-[.warning]:hover:text-warning-900 group-[.warning]:focus:ring-warning-500 group-[.info]:text-info-300 group-[.info]:hover:text-info-900 group-[.info]:focus:ring-info-500',
      className
    )}
    toast-close=""
    {...props}
  >
    <span className="sr-only">Close</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  </button>
));
ToastClose.displayName = 'ToastClose';

export {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
}; 