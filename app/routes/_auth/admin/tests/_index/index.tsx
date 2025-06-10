import { useNavigate } from '@remix-run/react';
import { createColumnHelper } from '@tanstack/react-table';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PaginateTestsQuery } from 'app/graphql/operations/test/paginateTests.query.generated';
import { usePaginateTestsQuery } from 'app/graphql/operations/test/paginateTests.query.generated';
import { useDeleteTestMutation } from 'app/graphql/operations/test/deleteTest.mutation.generated';
import { PaginateTestsDocument } from 'app/graphql/operations/test/paginateTests.query.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppDataTable } from 'app/shared/components/table/AppDataTable';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { AppAlertDialog } from 'app/shared/components/alert-dialog/AppAlertDialog';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { apolloService } from 'app/shared/services/apollo.service';
import { useState } from 'react';

// Type for a single test item from the query
type TestItem = PaginateTestsQuery['paginatedTests']['items'][0];

export default function AdminTests() {
  const navigate = useNavigate();
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);

  const state = {
    page: 1,
    limit: 10,
    search: '',
  };

  // Fetch tests data
  const { data } = usePaginateTestsQuery({
    variables: {
      paginationInput: {
        page: state.page,
        limit: state.limit,
        search: state.search,
      },
    },
  });

  // Delete test mutation
  const [deleteTest, { loading: deleteLoading }] = useDeleteTestMutation({
    onCompleted: () => {
      toast.success('Test deleted successfully!');
      apolloService.invalidateQueries([PaginateTestsDocument]);
      setDeletingTestId(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete test: ${error.message}`);
      setDeletingTestId(null);
    },
  });

  // Get table data and total items count
  const tableData = data?.paginatedTests.items || [];
  const totalItems = data?.paginatedTests.pagination.totalItems || 0;

  // Handle delete test
  function handleDeleteTest(testId: string) {
    deleteTest({
      variables: { id: testId },
    });
  }

  // Setup column definitions
  const columnHelper = createColumnHelper<TestItem>();
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => {
        const name = info.getValue();
        return <span className='font-medium'>{name}</span>;
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => {
        const testId = info.getValue();
        const test = info.row.original;
        return (
          <div className='flex items-center gap-2'>
            <AppButton
              size='icon'
              variant='ghost'
              onClick={() => navigate(APP_ROUTES.adminTestDetail(testId))}
              aria-label='View test'>
              <EyeIcon className='h-4 w-4' />
            </AppButton>
            <AppButton
              size='icon'
              variant='ghost'
              onClick={() => navigate(APP_ROUTES.adminTestEdit(testId))}
              aria-label='Edit test'>
              <PencilIcon className='h-4 w-4' />
            </AppButton>
            <AppAlertDialog.Root>
              <AppAlertDialog.Trigger asChild>
                <AppButton
                  size='icon'
                  variant='ghost'
                  onClick={() => setDeletingTestId(testId)}
                  aria-label='Delete test'
                  className='text-destructive hover:text-destructive'>
                  <TrashIcon className='h-4 w-4' />
                </AppButton>
              </AppAlertDialog.Trigger>
              <AppAlertDialog.Content>
                <AppAlertDialog.Header>
                  <AppAlertDialog.Title>Delete Test</AppAlertDialog.Title>
                  <AppAlertDialog.Description>
                    Are you sure you want to delete "{test.name}"? This action cannot be undone and will remove all
                    associated test data.
                  </AppAlertDialog.Description>
                </AppAlertDialog.Header>
                <AppAlertDialog.Footer>
                  <AppAlertDialog.Cancel onClick={() => setDeletingTestId(null)}>Cancel</AppAlertDialog.Cancel>
                  <AppAlertDialog.Action
                    onClick={() => handleDeleteTest(testId)}
                    disabled={deleteLoading && deletingTestId === testId}
                    className='bg-destructive hover:bg-destructive/90 text-white'>
                    {deleteLoading && deletingTestId === testId ? 'Deleting...' : 'Delete'}
                  </AppAlertDialog.Action>
                </AppAlertDialog.Footer>
              </AppAlertDialog.Content>
            </AppAlertDialog.Root>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ];

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6 flex items-center justify-between'>
        <AppTypography.h1>Tests Management</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminTestCreate)} className='flex items-center gap-2'>
          <PlusIcon className='h-4 w-4' />
          Add Test
        </AppButton>
      </div>

      <AppDataTable columns={columns} data={tableData} searchPlaceholder='Search tests...' totalItems={totalItems} />
    </div>
  );
}
