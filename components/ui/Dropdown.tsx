import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const dropdownVariants = cva(
  'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-background p-1 shadow-md animate-in fade-in-80',
  {
    variants: {
      align: {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
      },
      side: {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
      },
    },
    defaultVariants: {
      align: 'start',
      side: 'bottom',
    },
  }
);

export interface DropdownProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownVariants> {}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ className, align, side, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(dropdownVariants({ align, side, className }))}
        {...props}
      />
    );
  }
);
Dropdown.displayName = 'Dropdown';

interface DropdownTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ className, asChild, children, ...props }, ref) => {
    if (asChild) {
      return children;
    }
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownTrigger.displayName = 'DropdownTrigger';

const DropdownContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-1', className)}
    {...props}
  />
));
DropdownContent.displayName = 'DropdownContent';

const DropdownItem = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  />
));
DropdownItem.displayName = 'DropdownItem';

const DropdownSeparator = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
DropdownSeparator.displayName = 'DropdownSeparator';

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
}; 