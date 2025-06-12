import { useParams } from '@remix-run/react';
import { SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';

import { AddMultiCollectionToTestInput } from 'app/graphql/graphqlTypes';
import { usePaginateQuestionCollectionsQuery } from 'app/graphql/operations/questionCollection/paginateQuestionCollections.query.generated';
import { useAddMultiCollectionToTestMutation } from 'app/graphql/operations/test/addMultiCollectionToTest.mutation.generated';
import { GetTestDocument } from 'app/graphql/operations/test/getTest.query.generated';
import { AppBadge } from 'app/shared/components/badge/AppBadge';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppCheckbox } from 'app/shared/components/checkbox/AppCheckbox';
import { AppCommand } from 'app/shared/components/command/AppCommand';
import { AppPopover } from 'app/shared/components/popover/AppPopover';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { useDebounceValue } from 'app/shared/hooks/useDebounce';
import { apolloService } from 'app/shared/services/apollo.service';
import { cn } from 'app/shared/utils/className';
import { testEditStore } from './testEditStore';

export function TestQuestionCollectionsManager() {
  const { testId } = useParams();
  const testEditState = testEditStore.useStateSnapshot();

  // Component-specific state (not shared)
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const debouncedSearchTerm = useDebounceValue(searchTerm, 300);

  const currentCollectionsInTest = useMemo(
    () => testEditState.testDetails?.questionCollections || [],
    [testEditState.testDetails],
  );

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

  // Add collections to test mutation
  const [addCollectionsToTest, { loading: addCollectionsLoading }] = useAddMultiCollectionToTestMutation({
    onCompleted: () => {
      toast.success('Collections added to test successfully!');
      apolloService.invalidateQueries([GetTestDocument]);
      setSelectedCollectionIds([]);
      setIsPopoverOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to add collections: ${error.message}`);
    },
  });

  // Initialize selected collections when test data loads
  useEffect(() => {
    setSelectedCollectionIds(currentCollectionsInTest.map((collection) => collection.id));
  }, [currentCollectionsInTest]);

  function handleUpdateCollections() {
    if (!testId) {
      toast.error('Test not found');
      return;
    }

    const input: AddMultiCollectionToTestInput = {
      testId: testId,
      collectionIds: selectedCollectionIds,
    };

    addCollectionsToTest({
      variables: { input },
    });
  }

  function handleCollectionSelect(collectionId: string, isSelected: boolean) {
    if (isSelected) {
      setSelectedCollectionIds((prev) => [...prev, collectionId]);
      return;
    }

    setSelectedCollectionIds((prev) => prev.filter((id) => id !== collectionId));
  }

  const collections = collectionsData?.paginatedQuestionCollections.items || [];

  function _renderCurrentCollections() {
    return (
      <div>
        <AppTypography.h4 className='mb-3'>Current Collections</AppTypography.h4>
        {currentCollectionsInTest.length === 0 ? (
          <span className='text-muted-foreground'>No collections associated with this test yet.</span>
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
        <AppTypography.h4 className='mb-3'>Update Collections</AppTypography.h4>
        <AppPopover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <AppPopover.Trigger asChild>
            <AppButton variant='outline' className='w-full justify-start'>
              <SearchIcon className='mr-2 h-4 w-4' />
              Search collections...
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
                          return handleCollectionSelect(collection.id, !selectedCollectionIds.includes(collection.id));
                        }}
                        key={collection.id}
                        className={cn('flex items-center space-x-2')}>
                        <AppCheckbox
                          checked={selectedCollectionIds.includes(collection.id)}
                          onCheckedChange={(checked) => handleCollectionSelect(collection.id, !!checked)}
                        />
                        <div className='font-medium'>{collection.title}</div>
                      </AppCommand.Item>
                    );
                  })}
                </AppCommand.Group>
              </AppCommand.List>
            </AppCommand.Root>

            <div className='border-t p-2'>
              <div className='mb-2 text-sm'>Selected: {selectedCollectionIds.length} collection(s)</div>
              <AppButton
                size='sm'
                className='w-full'
                onClick={handleUpdateCollections}
                disabled={addCollectionsLoading}>
                {addCollectionsLoading ? 'Updating...' : 'Update selected collections'}
              </AppButton>
            </div>
          </AppPopover.Content>
        </AppPopover.Root>
      </div>
    );
  }

  return (
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
  );
}
