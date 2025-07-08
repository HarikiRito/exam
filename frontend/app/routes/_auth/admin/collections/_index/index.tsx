import { useNavigate } from '@remix-run/react';
import { createColumnHelper } from '@tanstack/react-table';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

import { useDeleteQuestionCollectionMutation } from 'app/graphql/operations/questionCollection/deleteQuestionCollection.mutation.generated';
import {
  PaginateQuestionCollectionsDocument,
  PaginateQuestionCollectionsQuery,
  usePaginateQuestionCollectionsQuery,
} from 'app/graphql/operations/questionCollection/paginateQuestionCollections.query.generated';
import { AppAlertDialog } from 'app/shared/components/ui/alert-dialog/AppAlertDialog';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppDataTable } from 'app/shared/components/ui/table/AppDataTable';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { apolloService } from 'app/shared/services/apollo.service';
import { useState } from 'react';
import { useCheckPermission } from 'app/shared/hooks/useCheckPermission';
import { PERMISSION_ROUTE } from 'app/shared/constants/permission';
import { UnauthorizedMessage } from 'app/shared/components/custom/Authorized';

// Type for a single collection item from the query
type CollectionItem = PaginateQuestionCollectionsQuery['paginatedQuestionCollections']['items'][0];

export default function AdminCollections() {
  const navigate = useNavigate();
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null);
  const hasPermission = useCheckPermission(PERMISSION_ROUTE.adminCollections);

  const state = {
    page: 1,
    limit: 10,
    search: '',
  };

  // Fetch collections data
  const { data } = usePaginateQuestionCollectionsQuery({
    variables: {
      paginationInput: {
        page: state.page,
        limit: state.limit,
        search: state.search,
      },
    },
  });

  // Delete collection mutation
  const [deleteCollection, { loading: deleteLoading }] = useDeleteQuestionCollectionMutation({
    onCompleted: () => {
      toast.success('Collection deleted successfully!');
      apolloService.invalidateQueries([PaginateQuestionCollectionsDocument]);
      setDeletingCollectionId(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete collection: ${error.message}`);
      setDeletingCollectionId(null);
    },
  });

  // Get table data and total items count
  const tableData = data?.paginatedQuestionCollections.items || [];
  const totalItems = data?.paginatedQuestionCollections.pagination.totalItems || 0;

  // Handle delete collection
  function handleDeleteCollection(collectionId: string) {
    deleteCollection({
      variables: { id: collectionId },
    });
  }

  // Setup column definitions
  const columnHelper = createColumnHelper<CollectionItem>();
  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => {
        const title = info.getValue();
        return <span className='font-medium'>{title}</span>;
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => {
        const description = info.getValue();
        if (!description) return;
        return description.length > 100 ? `${description.substring(0, 100)}...` : description;
      },
      enableSorting: false,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => {
        const date = new Date(info.getValue());
        return date.toLocaleDateString();
      },
      enableSorting: true,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated',
      cell: (info) => {
        const date = new Date(info.getValue());
        return date.toLocaleDateString();
      },
      enableSorting: true,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => {
        const collectionId = info.getValue();
        const collection = info.row.original;
        return (
          <div className='flex items-center gap-2'>
            <AppButton
              size='icon'
              variant='ghost'
              onClick={() => navigate(APP_ROUTES.adminCollectionDetail(collectionId))}
              aria-label='View collection'>
              <EyeIcon className='h-4 w-4' />
            </AppButton>
            <AppButton
              size='icon'
              variant='ghost'
              onClick={() => navigate(APP_ROUTES.adminCollectionEdit(collectionId))}
              aria-label='Edit collection'>
              <PencilIcon className='h-4 w-4' />
            </AppButton>
            <AppAlertDialog.Root>
              <AppAlertDialog.Trigger asChild>
                <AppButton
                  size='icon'
                  variant='ghost'
                  onClick={() => setDeletingCollectionId(collectionId)}
                  aria-label='Delete collection'
                  className='text-destructive hover:text-destructive'>
                  <TrashIcon className='h-4 w-4' />
                </AppButton>
              </AppAlertDialog.Trigger>
              <AppAlertDialog.Content>
                <AppAlertDialog.Header>
                  <AppAlertDialog.Title>Delete Collection</AppAlertDialog.Title>
                  <AppAlertDialog.Description>
                    Are you sure you want to delete "{collection.title}"? This action cannot be undone and will remove
                    all questions associated with this collection.
                  </AppAlertDialog.Description>
                </AppAlertDialog.Header>
                <AppAlertDialog.Footer>
                  <AppAlertDialog.Cancel onClick={() => setDeletingCollectionId(null)}>Cancel</AppAlertDialog.Cancel>
                  <AppAlertDialog.Action
                    onClick={() => handleDeleteCollection(collectionId)}
                    disabled={deleteLoading && deletingCollectionId === collectionId}
                    className='bg-destructive hover:bg-destructive/90 text-white'>
                    {deleteLoading && deletingCollectionId === collectionId ? 'Deleting...' : 'Delete'}
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

  if (!hasPermission) {
    return <UnauthorizedMessage />;
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6 flex items-center justify-between'>
        <AppTypography.h1>Collections Management</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminCollectionCreate)} className='flex items-center gap-2'>
          <PlusIcon className='h-4 w-4' />
          Add Collection
        </AppButton>
      </div>

      <AppDataTable
        columns={columns}
        data={tableData}
        searchPlaceholder='Search collections...'
        totalItems={totalItems}
      />
    </div>
  );
}
