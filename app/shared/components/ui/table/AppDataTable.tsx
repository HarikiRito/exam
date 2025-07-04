import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon, FilterIcon, SearchIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppDropdown } from 'app/shared/components/ui/dropdown/AppDropdown';
import { AppInput } from 'app/shared/components/ui/input/AppInput';
import { AppPagination } from 'app/shared/components/ui/pagination/AppPagination';
import { AppSelect } from 'app/shared/components/ui/select/AppSelect';
import { AppTable } from 'app/shared/components/ui/table/AppTable';

interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly columns: ColumnDef<TData, any>[];
  readonly data: TData[];
  readonly searchPlaceholder?: string;
  readonly totalItems?: number;
  readonly pageSize?: number;
  readonly currentPage?: number;
  readonly onPageChange?: (page: number, pageSize: number) => void;
}

function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  totalItems,
  pageSize: initialPageSize = 20,
  currentPage: externalCurrentPage,
  onPageChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageIndex, setPageIndex] = useState((externalCurrentPage ?? 1) - 1);

  // Sync external currentPage with internal pageIndex
  useEffect(() => {
    if (externalCurrentPage !== undefined) {
      const newPageIndex = externalCurrentPage - 1;
      if (newPageIndex !== pageIndex) {
        setPageIndex(newPageIndex);
      }
    }
  }, [externalCurrentPage, pageIndex]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Disable native pagination when totalItems is provided (server-side pagination)
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      // Handle both function updater and direct value assignment
      if (typeof updater === 'function') {
        const newPagination = updater(table.getState().pagination);
        setPageIndex(newPagination.pageIndex);
        setPageSize(newPagination.pageSize);
        return;
      }

      setPageIndex(updater.pageIndex);
      setPageSize(updater.pageSize);
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    // Override pagination methods for server-side pagination
    ...(totalItems
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          manualPagination: true,
          pageCount: Math.ceil(totalItems / pageSize),
        }
      : {}),
  });

  const tableState = table.getState();
  const tablePagination = tableState.pagination;
  const currentPage = tablePagination.pageIndex + 1;
  const tableTotalItems = totalItems ?? table.getFilteredRowModel().rows.length;
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : table.getPageCount();

  // Calculate visible page numbers (max 5 pages)
  function getVisiblePages() {
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return { startPage, endPage };
  }

  const { startPage, endPage } = getVisiblePages();
  const showStartEllipsis = startPage > 1;
  const showEndEllipsis = endPage < totalPages;

  function handleGlobalFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
    setGlobalFilter(e.target.value);
  }

  function handlePageSizeChange(value: string) {
    const newPageSize = Number(value);
    setPageSize(newPageSize);
    table.setPageSize(newPageSize);
    onPageChange?.(pageIndex + 1, newPageSize);
  }

  function handlePageChange(newPageIndex: number) {
    setPageIndex(newPageIndex);
    table.setPageIndex(newPageIndex);
    onPageChange?.(newPageIndex + 1, pageSize);
  }

  function isColumnFilterable(columnId: string) {
    const column = table.getAllColumns().find((col) => col.id === columnId);
    return column?.getCanFilter();
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-2'>
        <div className='relative max-w-sm'>
          <SearchIcon className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
          <AppInput
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            className='pl-8'
          />
        </div>
        <div className='flex items-center gap-2'>
          <AppSelect.Root value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <AppSelect.Trigger className='h-8 w-[70px]'>
              <AppSelect.Value placeholder={String(pageSize)} />
            </AppSelect.Trigger>
            <AppSelect.Content>
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <AppSelect.Item key={size} value={String(size)}>
                  {size}
                </AppSelect.Item>
              ))}
            </AppSelect.Content>
          </AppSelect.Root>
        </div>
      </div>

      <div className='rounded-md border'>
        <AppTable.Root>
          <AppTable.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <AppTable.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <AppTable.Head key={header.id} className='whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center gap-1'
                              : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUpIcon className='h-4 w-4' />,
                            desc: <ChevronDownIcon className='h-4 w-4' />,
                          }[header.column.getIsSorted() as string] ??
                            (header.column.getCanSort() ? <ChevronsUpDownIcon className='h-4 w-4' /> : null)}
                        </div>
                      )}
                      {isColumnFilterable(header.id) && (
                        <AppDropdown.Root>
                          <AppDropdown.Trigger asChild>
                            <AppButton size='icon' variant='ghost' className='h-6 w-6 p-0'>
                              <FilterIcon className='h-3 w-3' />
                            </AppButton>
                          </AppDropdown.Trigger>
                          <AppDropdown.Content align='start'>
                            <div className='p-2'>
                              <AppInput
                                placeholder={`Filter ${header.column.columnDef.header?.toString()}`}
                                value={(header.column.getFilterValue() as string) ?? ''}
                                onChange={(e) => header.column.setFilterValue(e.target.value)}
                                className='h-8 w-full'
                              />
                            </div>
                          </AppDropdown.Content>
                        </AppDropdown.Root>
                      )}
                    </div>
                  </AppTable.Head>
                ))}
              </AppTable.Row>
            ))}
          </AppTable.Header>
          <AppTable.Body>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <AppTable.Row key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <AppTable.Cell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </AppTable.Cell>
                  ))}
                </AppTable.Row>
              ))
            ) : (
              <AppTable.Row>
                <AppTable.Cell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </AppTable.Cell>
              </AppTable.Row>
            )}
          </AppTable.Body>
        </AppTable.Root>
      </div>

      <div className='flex items-center justify-between space-x-2 py-4'>
        <div className='text-muted-foreground text-sm'>
          Showing {pageIndex * pageSize + 1} to {Math.min(currentPage * pageSize, tableTotalItems)} of {tableTotalItems}{' '}
          entries
        </div>
        <AppPagination.Root>
          <AppPagination.Content>
            <AppPagination.Item>
              <AppPagination.Previous
                onClick={() => currentPage > 1 && handlePageChange(pageIndex - 1)}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </AppPagination.Item>

            {/* First page if not visible */}
            {showStartEllipsis && (
              <>
                <AppPagination.Item>
                  <AppPagination.Link isActive={false} onClick={() => handlePageChange(0)}>
                    1
                  </AppPagination.Link>
                </AppPagination.Item>
                <AppPagination.Item>
                  <AppPagination.Ellipsis />
                </AppPagination.Item>
              </>
            )}

            {/* Visible page numbers */}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
              <AppPagination.Item key={page}>
                <AppPagination.Link isActive={pageIndex === page - 1} onClick={() => handlePageChange(page - 1)}>
                  {page}
                </AppPagination.Link>
              </AppPagination.Item>
            ))}

            {/* Last page if not visible */}
            {showEndEllipsis && (
              <>
                <AppPagination.Item>
                  <AppPagination.Ellipsis />
                </AppPagination.Item>
                <AppPagination.Item>
                  <AppPagination.Link isActive={false} onClick={() => handlePageChange(totalPages - 1)}>
                    {totalPages}
                  </AppPagination.Link>
                </AppPagination.Item>
              </>
            )}

            <AppPagination.Item>
              <AppPagination.Next
                onClick={() => currentPage < totalPages && handlePageChange(pageIndex + 1)}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </AppPagination.Item>
          </AppPagination.Content>
        </AppPagination.Root>
      </div>
    </div>
  );
}

export const AppDataTable = DataTable;
