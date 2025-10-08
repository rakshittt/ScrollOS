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
          'border-error/20 bg-error/10 text-error',
        success:
          'border-success/20 bg-success/10 text-success',
        warning:
          'border-warning/20 bg-warning/10 text-warning',
        info:
          'border-info/20 bg-info/10 text-info',
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
    className={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-error/20 group-[.destructive]:hover:border-error/30 group-[.destructive]:hover:bg-error/10 group-[.destructive]:hover:text-error group-[.destructive]:focus:ring-error group-[.success]:border-success/20 group-[.success]:hover:border-success/30 group-[.success]:hover:bg-success/10 group-[.success]:hover:text-success group-[.success]:focus:ring-success group-[.warning]:border-warning/20 group-[.warning]:hover:border-warning/30 group-[.warning]:hover:bg-warning/10 group-[.warning]:hover:text-warning group-[.warning]:focus:ring-warning group-[.info]:border-info/20 group-[.info]:hover:border-info/30 group-[.info]:hover:bg-info/10 group-[.info]:hover:text-info group-[.info]:focus:ring-info', className)}
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
      'absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-error/70 group-[.destructive]:hover:text-error group-[.destructive]:focus:ring-error group-[.success]:text-success/70 group-[.success]:hover:text-success group-[.success]:focus:ring-success group-[.warning]:text-warning/70 group-[.warning]:hover:text-warning group-[.warning]:focus:ring-warning group-[.info]:text-info/70 group-[.info]:hover:text-info group-[.info]:focus:ring-info',
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