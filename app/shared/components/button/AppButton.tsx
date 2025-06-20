'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';

import { cn } from 'app/shared/utils/className';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive: 'bg-destructive shadow-xs hover:bg-destructive/90 text-white',
        outline: 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        lightBlue: 'bg-blue-50 text-blue-600 shadow-xs hover:bg-blue-100',
        lightPurple: 'bg-purple-50 text-purple-600 shadow-xs hover:bg-purple-100',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
      shadow: {
        default: 'shadow-sm',
        none: 'shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shadow: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  disabled,
  children,
  loadingSpinnerOnly = false,
  shadow = 'default',
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    readonly asChild?: boolean;
    readonly isLoading?: boolean;
    readonly loadingSpinnerOnly?: boolean;
  }) {
  const Comp = asChild ? 'span' : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, shadow, className }))}
      disabled={isLoading || disabled}
      {...props}>
      {isLoading && <Loader2Icon className='size-4 animate-spin' aria-hidden='true' />}
      {!(isLoading && loadingSpinnerOnly) && children}
    </Comp>
  );
}

export const AppButton = Button;
export { buttonVariants };
