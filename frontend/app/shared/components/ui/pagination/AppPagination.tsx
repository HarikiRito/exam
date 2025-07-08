import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';

import { cn } from 'app/shared/utils/className';
import { AppButton, buttonVariants } from 'app/shared/components/ui/button/AppButton';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role='navigation'
      aria-label='pagination'
      data-slot='pagination'
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot='pagination-content' className={cn('flex flex-row items-center gap-1', className)} {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot='pagination-item' {...props} />;
}

type PaginationLinkProps = {
  readonly isActive?: boolean;
} & Pick<React.ComponentProps<typeof AppButton>, 'size'> &
  React.ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot='pagination-link'
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'default' : 'ghost',
          size,
          shadow: 'none',
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label='Go to previous page'
      size='default'
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}>
      <ChevronLeftIcon />
      <span className='hidden sm:block'>Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label='Go to next page'
      size='default'
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}>
      <span className='hidden sm:block'>Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot='pagination-ellipsis'
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}>
      <MoreHorizontalIcon className='size-4' />
      <span className='sr-only'>More pages</span>
    </span>
  );
}

/**
 * Detailed Usage Instructions and Example Usage
 *
 * The `AppPagination` component provides a flexible and accessible
 * pagination system for navigating through large datasets.
 *
 * ## Key Features
 * - Responsive pagination controls
 * - Customizable page navigation
 * - Accessibility-first design
 * - Tailwind CSS styling
 * - Support for various pagination scenarios
 *
 * ## Example Usage
 * ```tsx
 * import { useState } from 'react';
 * import { AppPagination } from 'app/shared/components/pagination/AppPagination';
 *
 * function DataTablePagination() {
 *   const [currentPage, setCurrentPage] = useState(1);
 *   const totalPages = 10;
 *   const totalItems = 250;
 *   const itemsPerPage = 25;
 *
 *   return (
 *     <AppPagination.Root>
 *       <AppPagination.Content>
 *         <AppPagination.Item>
 *           <AppPagination.Previous
 *             onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
 *             disabled={currentPage === 1}
 *           />
 *         </AppPagination.Item>
 *
 *         {Array.from({ length: totalPages }, (_, i) => (
 *           <AppPagination.Item key={i}>
 *             <AppPagination.Link
 *               isActive={currentPage === i + 1}
 *               onClick={() => setCurrentPage(i + 1)}
 *             >
 *               {i + 1}
 *             </AppPagination.Link>
 *           </AppPagination.Item>
 *         ))}
 *
 *         <AppPagination.Item>
 *           <AppPagination.Next
 *             onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
 *             disabled={currentPage === totalPages}
 *           />
 *         </AppPagination.Item>
 *       </AppPagination.Content>
 *     </AppPagination.Root>
 *   );
 * }
 * ```
 *
 * ## Detailed Instructions
 * 1. Import `AppPagination` components from the correct path
 * 2. Use `AppPagination.Root` as the container
 * 3. Wrap pagination items in `AppPagination.Content`
 * 4. Use `AppPagination.Previous` and `AppPagination.Next` for navigation
 * 5. Generate page links dynamically or statically
 * 6. Manage current page state in your component
 *
 * ## Pagination Components
 * - `Root`: Main pagination container
 * - `Content`: Wrapper for pagination items
 * - `Item`: Individual pagination item container
 * - `Link`: Clickable page number link
 * - `Previous`: Previous page navigation
 * - `Next`: Next page navigation
 * - `Ellipsis`: Indicates skipped pages
 *
 * ## Customization Options
 * - Custom page link styling
 * - Disabled state handling
 * - Responsive design
 * - Accessibility attributes
 *
 * ## Best Practices
 * - Always provide clear navigation
 * - Handle edge cases (first/last page)
 * - Use meaningful aria labels
 * - Consider user experience in large datasets
 * - Implement keyboard navigation
 *
 * @see https://ui.shadcn.com/docs/components/pagination Shadcn UI Pagination Documentation
 * @category Components
 * @category Navigation
 */
export const AppPagination = {
  Root: Pagination,
  Content: PaginationContent,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
};
