import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectTriggerVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-border',
        error: 'border-error focus:ring-error',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const selectContentVariants = cva(
  'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-background text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        default: 'border-border',
        error: 'border-error',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const selectItemVariants = cva(
  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        error: 'text-error',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SelectTriggerProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof selectTriggerVariants> {}

export interface SelectContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectContentVariants> {}

export interface SelectItemProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof selectItemVariants> {}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(selectTriggerVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(selectContentVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
SelectContent.displayName = 'SelectContent';

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(selectItemVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
SelectItem.displayName = 'SelectItem';

const SelectLabel = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold text-foreground', className)}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';

const SelectSeparator = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
SelectSeparator.displayName = 'SelectSeparator';

export {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
}; 