import { PaginationFragment } from 'app/graphql/operations/pagination.fragment.generated';
import { AppPagination } from 'app/shared/components/ui/pagination/AppPagination';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';

interface Props {
  readonly pagination: PaginationFragment;
  readonly onPageChange: (page: number) => void;
  readonly totalItems: number;
  readonly currentItemsCount: number;
}

const MAX_VISIBLE_PAGES = 5;
const NEAR_START_THRESHOLD = 3; // Show first 4 pages when current page <= 3
const NEAR_END_OFFSET = 2; // Show last 4 pages when current page >= totalPages - 2
const PAGES_TO_SHOW_AT_START = 4; // Number of pages to show before ellipsis when near start
const PAGES_TO_SHOW_AT_END = 4; // Number of pages to show after ellipsis when near end
const ELLIPSIS_MARKER = -1; // Special value to indicate ellipsis in page array

export function PaginationControls({ pagination, onPageChange, totalItems, currentItemsCount }: Props) {
  const { currentPage, totalPages } = pagination;

  function renderPaginationItem(page: number, index: number) {
    if (page === ELLIPSIS_MARKER) {
      return (
        <AppPagination.Item key={`ellipsis-${index}`}>
          <AppPagination.Ellipsis />
        </AppPagination.Item>
      );
    }

    return (
      <AppPagination.Item key={page}>
        <AppPagination.Link
          isActive={currentPage === page}
          onClick={() => onPageChange(page)}
          className='cursor-pointer'>
          {page}
        </AppPagination.Link>
      </AppPagination.Item>
    );
  }

  function getPageNumbers() {
    // Show all pages if total is 5 or less
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // User is near the start: [1] [2] [3] [4] ... [last]
    if (currentPage <= NEAR_START_THRESHOLD) {
      return [...Array.from({ length: PAGES_TO_SHOW_AT_START }, (_, i) => i + 1), ELLIPSIS_MARKER, totalPages];
    }

    // User is near the end: [1] ... [last-3] [last-2] [last-1] [last]
    if (currentPage >= totalPages - NEAR_END_OFFSET) {
      const startPage = totalPages - PAGES_TO_SHOW_AT_END + 1;
      return [1, ELLIPSIS_MARKER, ...Array.from({ length: PAGES_TO_SHOW_AT_END }, (_, i) => startPage + i)];
    }

    // User is in the middle: [1] ... [current-1] [current] [current+1] ... [last]
    return [1, ELLIPSIS_MARKER, currentPage - 1, currentPage, currentPage + 1, ELLIPSIS_MARKER, totalPages];
  }

  const pages = getPageNumbers();

  return (
    <div className='mt-6 flex items-center justify-between'>
      <AppTypography.p className='text-muted-foreground text-sm'>
        Showing {currentItemsCount} of {totalItems}
      </AppTypography.p>

      <AppPagination.Root>
        <AppPagination.Content>
          <AppPagination.Item>
            <AppPagination.Previous
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </AppPagination.Item>

          {pages.map(renderPaginationItem)}

          <AppPagination.Item>
            <AppPagination.Next
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </AppPagination.Item>
        </AppPagination.Content>
      </AppPagination.Root>
    </div>
  );
}
