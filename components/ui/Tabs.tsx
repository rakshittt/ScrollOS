import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tabsListVariants = cva(
  'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        secondary: 'bg-secondary/20',
        ghost: 'bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  {
    variants: {
      variant: {
        default: 'data-[state=active]:bg-background data-[state=active]:text-foreground',
        secondary: 'data-[state=active]:bg-background data-[state=active]:text-foreground',
        ghost: 'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const tabsContentVariants = cva(
  'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        ghost: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TabsListProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(tabsListVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(tabsTriggerVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsContentVariants> {}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(tabsContentVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { TabsList, TabsTrigger, TabsContent }; 