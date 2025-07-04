import { useNavigate } from '@remix-run/react';
import { createColumnHelper } from '@tanstack/react-table';
import { Check, EyeIcon, PencilIcon, PlusIcon } from 'lucide-react';

import { PaginateQuestionsQuery } from 'app/graphql/operations/question/paginateQuestions.query.generated';
import { usePaginateQuestionsQuery } from 'app/graphql/operations/question/paginateQuestions.query.generated';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppDataTable } from 'app/shared/components/ui/table/AppDataTable';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { AppPopover } from 'app/shared/components/ui/popover/AppPopover';
import { AppCommand } from 'app/shared/components/ui/command/AppCommand';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { cn } from 'app/shared/utils/className';

// Type for a single question item from the query
type QuestionItem = PaginateQuestionsQuery['paginatedQuestions']['items'][0];

export default function AdminQuestions() {
  const navigate = useNavigate();

  const state = {
    page: 1,
    limit: 10,
    search: '',
  };

  // Fetch questions data
  const { data } = usePaginateQuestionsQuery({
    variables: {
      paginationInput: {
        page: state.page,
        limit: state.limit,
        search: state.search,
      },
    },
  });

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
    columnHelper.accessor('options', {
      header: 'Options',
      cell: (info) => {
        const options = info.getValue();
        return (
          <AppPopover.Root>
            <AppPopover.Trigger asChild>
              <AppButton variant='outline' size='sm'>
                View Options ({options.length})
              </AppButton>
            </AppPopover.Trigger>
            <AppPopover.Content className='p-0'>
              <AppCommand.Root>
                <AppCommand.List>
                  {options.map((option) => (
                    <AppCommand.Item
                      key={option.id}
                      className={cn('p-3', option.isCorrect && 'bg-green-50')}
                      title={option.optionText}>
                      <span>{option.optionText}</span>
                      {option.isCorrect && <Check className='ml-auto' />}
                    </AppCommand.Item>
                  ))}
                </AppCommand.List>
              </AppCommand.Root>
            </AppPopover.Content>
          </AppPopover.Root>
        );
      },
      enableSorting: false,
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
      />
    </div>
  );
}
