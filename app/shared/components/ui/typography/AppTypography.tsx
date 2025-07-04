import { cn } from 'app/shared/utils/className';
import React from 'react';

// H1 Component
function AppH1({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)} {...props}>
      {children}
    </h1>
  );
}

// H2 Component
function AppH2({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', className)}
      {...props}>
      {children}
    </h2>
  );
}

// H3 Component
function AppH3({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

// H4 Component
function AppH4({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4 className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)} {...props}>
      {children}
    </h4>
  );
}

// Paragraph Component
function AppP({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props}>
      {children}
    </p>
  );
}

// Blockquote Component
function AppBlockquote({ className, children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} {...props}>
      {children}
    </blockquote>
  );
}

// List Component - Unordered List
function AppUl({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)} {...props}>
      {children}
    </ul>
  );
}

// List Component - Ordered List
function AppOl({ className, children, ...props }: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol className={cn('my-6 ml-6 list-decimal [&>li]:mt-2', className)} {...props}>
      {children}
    </ol>
  );
}

// List Item Component
function AppLi({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn('mt-2', className)} {...props}>
      {children}
    </li>
  );
}

// Inline Code Component
function AppInlineCode({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn('bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)}
      {...props}>
      {children}
    </code>
  );
}

// Lead Paragraph Component
function AppLead({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-muted-foreground text-xl', className)} {...props}>
      {children}
    </p>
  );
}

// Large Text Component
function AppLarge({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-lg font-semibold', className)} {...props}>
      {children}
    </div>
  );
}

// Small Text Component
function AppSmall({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <small className={cn('text-sm leading-none font-medium', className)} {...props}>
      {children}
    </small>
  );
}

// Muted Text Component
function AppMuted({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-muted-foreground text-sm', className)} {...props}>
      {children}
    </p>
  );
}

// Table Components
function AppTable({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className='my-6 w-full overflow-y-auto'>
      <table className={cn('w-full', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

function AppTr({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('even:bg-muted m-0 border-t p-0', className)} {...props}>
      {children}
    </tr>
  );
}

function AppTh({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}>
      {children}
    </th>
  );
}

function AppTd({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right', className)}
      {...props}>
      {children}
    </td>
  );
}

// Create a namespace object for better organization
export const AppTypography = {
  h1: AppH1,
  h2: AppH2,
  h3: AppH3,
  h4: AppH4,
  p: AppP,
  blockquote: AppBlockquote,
  ul: AppUl,
  ol: AppOl,
  li: AppLi,
  inlineCode: AppInlineCode,
  lead: AppLead,
  large: AppLarge,
  small: AppSmall,
  muted: AppMuted,
  table: AppTable,
  tr: AppTr,
  th: AppTh,
  td: AppTd,
};
