import { useNavigate } from '@remix-run/react';
import { createColumnHelper } from '@tanstack/react-table';
import { EyeIcon, PencilIcon, PlusIcon } from 'lucide-react';

import {
  PaginateQuestionsQuery,
  usePaginateQuestionsQuery,
} from 'app/graphql/operations/question/paginateQuestions.query.generated';
import { UnauthorizedMessage } from 'app/shared/components/custom/Authorized';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppDataTable } from 'app/shared/components/ui/table/AppDataTable';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { PERMISSION_ROUTE } from 'app/shared/constants/permission';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useCheckPermission } from 'app/shared/hooks/useCheckPermission';
import { useImmer } from 'use-immer';

// Type for a single question item from the query
type QuestionItem = PaginateQuestionsQuery['paginatedQuestions']['items'][0];

export default function AdminQuestions() {
  const navigate = useNavigate();

  const hasPermission = useCheckPermission(PERMISSION_ROUTE.adminQuestions);

  const [pagination, setPagination] = useImmer({
    page: 1,
    limit: 20,
    search: '',
  });

  // Fetch questions data
  const { data } = usePaginateQuestionsQuery({
    variables: {
      paginationInput: {
        page: pagination.page,
        limit: pagination.limit,
        search: pagination.search,
      },
    },
    skip: !hasPermission,
  });

  function handlePageChange(page: number, pageSize: number) {
    setPagination((draft) => {
      draft.page = page;
      draft.limit = pageSize;
    });
  }

  // Get table data and total items count
  const tableData = data?.paginatedQuestions.items || [];
  const totalItems = data?.paginatedQuestions.pagination.totalItems || 0;

  // Setup column definitions
  const columnHelper = createColumnHelper<QuestionItem>();
  const columns = [
    columnHelper.accessor('questionText', {
      header: 'Question',
      cell: (info) => {
        const questionText = info.getValue();
        return questionText.length > 100 ? `${questionText.substring(0, 100)}...` : questionText;
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('collection', {
      header: 'Collection',
      cell: (info) => {
        const collection = info.getValue();
        return collection?.title || '-';
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('points', {
      header: 'Points',
      cell: (info) => {
        const points = info.getValue();
        return points;
      },
      enableSorting: true,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => {
        const questionId = info.getValue();
        return (
          <div className='flex items-center gap-2'>
            <AppButton
              size='icon'
              variant='ghost'
              onClick={() => navigate(APP_ROUTES.adminQuestionDetail(questionId))}
              aria-label='View question'>
              <EyeIcon className='h-4 w-4' />
            </AppButton>
            <AppButton
              size='icon'
              variant='ghost'
              onClick={() => navigate(APP_ROUTES.adminQuestionEdit(questionId))}
              aria-label='Edit question'>
              <PencilIcon className='h-4 w-4' />
            </AppButton>
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
        <AppTypography.h1>Questions Management</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminQuestionCreate)} className='flex items-center gap-2'>
          <PlusIcon className='h-4 w-4' />
          Add Question
        </AppButton>
      </div>

      <AppDataTable
        columns={columns}
        data={tableData}
        searchPlaceholder='Search questions...'
        totalItems={totalItems}
        pageSize={pagination.limit}
        currentPage={pagination.page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
