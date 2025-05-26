import { createColumnHelper } from '@tanstack/react-table';

import { PaginateQuestionsQuery } from 'app/graphql/operations/question/paginateQuestions.query.generated';
import { usePaginateQuestionsQuery } from 'app/graphql/operations/question/paginateQuestions.query.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppDataTable } from 'app/shared/components/table/AppDataTable';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { AppPopover } from 'app/shared/components/popover/AppPopover';
import { AppCommand } from 'app/shared/components/command/AppCommand';
import { Check } from 'lucide-react';

// Type for a single question item from the query
type QuestionItem = PaginateQuestionsQuery['paginatedQuestions']['items'][0];

export default function AdminQuestions() {
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
      header: 'Question Text',
      cell: (info) => {
        const questionText = info.getValue();
        return questionText.length > 100 ? `${questionText.substring(0, 100)}...` : questionText;
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    // Note: Section/Collection field is temporarily disabled due to schema validation issues
    // This column will be added once the GraphQL schema is updated to support the section field
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
                    <AppCommand.Item key={option.id} className='p-3' title={option.optionText}>
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
  ];

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6 flex items-center justify-between'>
        <AppTypography.h1>Questions Management</AppTypography.h1>
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
