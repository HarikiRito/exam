import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@remix-run/react';
import { SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AddMultiCollectionToTestInput, UpdateTestInput } from 'app/graphql/graphqlTypes';
import { usePaginateQuestionCollectionsQuery } from 'app/graphql/operations/questionCollection/paginateQuestionCollections.query.generated';
import { useAddMultiCollectionToTestMutation } from 'app/graphql/operations/test/addMultiCollectionToTest.mutation.generated';
import { GetTestDocument, useGetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';
import { PaginateTestsDocument } from 'app/graphql/operations/test/paginateTests.query.generated';
import { useUpdateTestMutation } from 'app/graphql/operations/test/updateTest.mutation.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppCheckbox } from 'app/shared/components/checkbox/AppCheckbox';
import { AppCommand } from 'app/shared/components/command/AppCommand';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppPopover } from 'app/shared/components/popover/AppPopover';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useDebounceValue } from 'app/shared/hooks/useDebounce';
import { apolloService } from 'app/shared/services/apollo.service';
import { cn } from 'app/shared/utils/className';
import { AppBadge } from 'app/shared/components/badge/AppBadge';

// Validation schema
const updateTestSchema = z.object({
  name: z.string().min(1, 'Test name is required').max(255, 'Test name must be less than 255 characters'),
});

type UpdateTestFormData = z.infer<typeof updateTestSchema>;

export default function EditTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const debouncedSearchTerm = useDebounceValue(searchTerm, 300);

  if (!testId) {
    navigate(APP_ROUTES.adminTests);
    return null;
  }

  // Fetch test data
  const { data: testData, loading: testLoading } = useGetTestQuery({
    variables: { id: testId },
  });

  const currentCollectionsInTest = useMemo(() => testData?.test?.questionCollections || [], [testData]);

  // Fetch collections for search
  const { data: collectionsData } = usePaginateQuestionCollectionsQuery({
    variables: {
      paginationInput: {
        page: 1,
        limit: 50,
        search: debouncedSearchTerm,
      },
    },
  });

  // Update test mutation
  const [updateTest, { loading: updateLoading }] = useUpdateTestMutation({
    onCompleted: () => {
      toast.success('Test updated successfully!');
      apolloService.invalidateQueries([PaginateTestsDocument]);
    },
    onError: (error) => {
      toast.error(`Failed to update test: ${error.message}`);
    },
  });

  // Add collections to test mutation
  const [addCollectionsToTest, { loading: addCollectionsLoading }] = useAddMultiCollectionToTestMutation({
    onCompleted: () => {
      toast.success('Collections added to test successfully!');
      apolloService.invalidateQueries([GetTestDocument]);
      setSelectedCollections([]);
      setIsPopoverOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to add collections: ${error.message}`);
    },
  });

  // Form setup
  const form = useForm<UpdateTestFormData>({
    resolver: zodResolver(updateTestSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onBlur',
  });

  // Update form when test data loads
  useEffect(() => {
    if (testData?.test) {
      form.reset({
        name: testData.test.name,
      });
    }
  }, [testData, form]);

  useEffect(() => {
    setSelectedCollections(currentCollectionsInTest.map((collection) => collection.id));
  }, [currentCollectionsInTest]);

  function onSubmit(data: UpdateTestFormData) {
    const input: UpdateTestInput = {
      name: data.name,
    };

    updateTest({
      variables: { id: testId as string, input },
    });
  }

  function handleUpdateCollections() {
    if (selectedCollections.length === 0) {
      toast.error('Please select at least one collection');
      return;
    }

    if (!testId) {
      toast.error('Test not found');
      return;
    }

    const input: AddMultiCollectionToTestInput = {
      testId: testId,
      collectionIds: selectedCollections,
    };

    addCollectionsToTest({
      variables: { input },
    });
  }

  function handleCollectionSelect(collectionId: string, isSelected: boolean) {
    if (isSelected) {
      setSelectedCollections((prev) => [...prev, collectionId]);
    } else {
      setSelectedCollections((prev) => prev.filter((id) => id !== collectionId));
    }
  }

  const test = testData?.test;
  const collections = collectionsData?.paginatedQuestionCollections.items || [];

  function _renderCurrentCollections() {
    return (
      <div>
        <AppTypography.h4 className='mb-3'>Current Collections</AppTypography.h4>
        {currentCollectionsInTest.length === 0 ? (
          <AppTypography.p className='text-muted-foreground'>
            No collections associated with this test yet.
          </AppTypography.p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {currentCollectionsInTest.map((collection) => (
              <AppBadge key={collection.id} variant='outline'>
                {collection.title}
              </AppBadge>
            ))}
          </div>
        )}
      </div>
    );
  }

  function _renderAddCollections() {
    return (
      <div>
        <AppTypography.h4 className='mb-3'>Add Collections</AppTypography.h4>
        <AppPopover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <AppPopover.Trigger asChild>
            <AppButton variant='outline' className='w-full justify-start'>
              <SearchIcon className='mr-2 h-4 w-4' />
              Search and add collections...
            </AppButton>
          </AppPopover.Trigger>
          <AppPopover.Content className='w-80 p-0' align='start'>
            <AppCommand.Root>
              <AppCommand.Input placeholder='Search collections...' value={searchTerm} onValueChange={setSearchTerm} />
              <AppCommand.List>
                <AppCommand.Empty>No collections found.</AppCommand.Empty>
                <AppCommand.Group>
                  {collections.map((collection) => {
                    return (
                      <AppCommand.Item
                        onSelect={() => {
                          return handleCollectionSelect(collection.id, !selectedCollections.includes(collection.id));
                        }}
                        key={collection.id}
                        className={cn('flex items-center space-x-2')}>
                        <AppCheckbox
                          checked={selectedCollections.includes(collection.id)}
                          onCheckedChange={(checked) => handleCollectionSelect(collection.id, !!checked)}
                        />
                        <div className='font-medium'>{collection.title}</div>
                      </AppCommand.Item>
                    );
                  })}
                </AppCommand.Group>
              </AppCommand.List>
            </AppCommand.Root>
            {selectedCollections.length > 0 && (
              <div className='border-t p-2'>
                <div className='mb-2 text-sm'>Selected: {selectedCollections.length} collection(s)</div>
                <AppButton
                  size='sm'
                  className='w-full'
                  onClick={handleUpdateCollections}
                  disabled={addCollectionsLoading}>
                  {addCollectionsLoading ? 'Updating...' : 'Update selected collections'}
                </AppButton>
              </div>
            )}
          </AppPopover.Content>
        </AppPopover.Root>
      </div>
    );
  }

  if (testLoading) {
    return (
      <div className='container mx-auto py-6'>
        <AppTypography.h1>Loading...</AppTypography.h1>
      </div>
    );
  }

  if (!test) {
    return (
      <div className='container mx-auto py-6'>
        <AppTypography.h1>Test not found</AppTypography.h1>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <AppTypography.h1>Edit Test: {test.name}</AppTypography.h1>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Test Information Form */}
        <AppCard.Root>
          <AppCard.Header>
            <AppCard.Title>Test Information</AppCard.Title>
            <AppCard.Description>Update the basic information for your test.</AppCard.Description>
          </AppCard.Header>
          <AppCard.Content>
            <AppForm.Root {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <AppForm.Field
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <AppForm.Item>
                      <AppForm.Label>Test Name</AppForm.Label>
                      <AppForm.Control>
                        <AppInput placeholder='Enter test name' {...field} />
                      </AppForm.Control>
                      <AppForm.Message />
                    </AppForm.Item>
                  )}
                />

                <div className='flex justify-end gap-4'>
                  <AppButton type='button' variant='outline' onClick={() => navigate(APP_ROUTES.adminTests)}>
                    Cancel
                  </AppButton>
                  <AppButton type='submit' disabled={updateLoading}>
                    {updateLoading ? 'Updating...' : 'Update Test'}
                  </AppButton>
                </div>
              </form>
            </AppForm.Root>
          </AppCard.Content>
        </AppCard.Root>

        {/* Collections Management */}
        <AppCard.Root>
          <AppCard.Header>
            <AppCard.Title>Question Collections</AppCard.Title>
            <AppCard.Description>Manage the question collections associated with this test.</AppCard.Description>
          </AppCard.Header>
          <AppCard.Content className='space-y-4'>
            {_renderCurrentCollections()}
            {_renderAddCollections()}
          </AppCard.Content>
        </AppCard.Root>
      </div>
    </div>
  );
}
