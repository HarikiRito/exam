'use client';

import { Slot } from '@radix-ui/react-slot';
import { Link, type LinkProps } from '@remix-run/react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from 'app/shared/utils/className';

const linkVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 aria-[current=page]:font-semibold',
  {
    variants: {
      variant: {
        default: 'text-primary hover:text-primary/90 hover:underline underline-offset-4',
        destructive: 'text-destructive hover:text-destructive/90 hover:underline',
        muted: 'text-muted-foreground hover:text-foreground hover:underline',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 text-base has-[>svg]:px-4',
        inline: 'h-auto p-0 text-inherit',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'inline',
    },
  },
);

function AppLink({
  className,
  variant,
  size,
  asChild = false,
  href,
  ...props
}: Omit<LinkProps, 'to'> &
  VariantProps<typeof linkVariants> & {
    readonly asChild?: boolean;
    readonly href?: string;
  }) {
  const Comp = asChild ? Slot : Link;

  return (
    <Comp data-slot='link' to={href || ''} className={cn(linkVariants({ variant, size, className }))} {...props} />
  );
}

export { AppLink, linkVariants };
