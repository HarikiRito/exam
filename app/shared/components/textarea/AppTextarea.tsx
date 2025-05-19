import * as React from 'react';

import { cn } from 'app/shared/utils/className';

/**
 * # AppTextarea Component
 *
 * `AppTextarea` is a customizable textarea component that uses TailwindCSS for styling.
 *
 * ## Features
 * - Supports all standard HTML textarea attributes.
 * - Uses the `cn` utility for conditionally applying class names.
 * - Adheres to accessibility best practices with proper data attributes.
 */

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:aria-invalid:outline-destructive ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 aria-invalid:outline-destructive/60 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-destructive/20 aria-invalid:border-destructive/60 dark:aria-invalid:border-destructive flex min-h-[80px] w-full resize-y rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:focus-visible:ring-[3px] aria-invalid:focus-visible:outline-none md:text-sm dark:aria-invalid:focus-visible:ring-4',

        className,
      )}
      {...props}
    />
  );
}

export const AppTextarea = Textarea;
