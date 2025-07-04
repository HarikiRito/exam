import { useNavigate, useParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio/react';

import { useGetQuestionCollectionQuery } from 'app/graphql/operations/questionCollection/getQuestionCollection.query.generated';

import { AppAccordion } from 'app/shared/components/ui/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { collectionFormState } from '../state';

import { QuestionData } from 'app/shared/components/custom/question/QuestionItem';
import { isMoreThanOrEqual } from 'app/shared/utils/comparison';
import { CollectionDetailsStep } from './CollectionDetailsStep';
import { ManageQuestionsStep } from './ManageQuestionsStep';
import { useUniqueId } from 'app/shared/hooks/useUniqueId';
import { AppDialog } from 'app/shared/components/ui/dialog/AppDialog';
import { AppProgress } from 'app/shared/components/ui/progress/AppProgress';

interface CollectionEditAndCreatePageProps {
  readonly mode: 'create' | 'edit';
}

export enum CollectionAccordionSteps {
  CollectionDetails = 'collection-details',
  ManageQuestions = 'manage-questions',
}

export function CollectionEditAndCreatePage({ mode }: CollectionEditAndCreatePageProps) {
  collectionFormState.useResetHook();
  const mutation = collectionFormState.proxyState;
  const { isSavingQuestions, savedQuestionCount, totalQuestionsToSave } = useSnapshot(collectionFormState.proxyState);

  const [activeAccordionItem, setActiveAccordionItem] = useState<CollectionAccordionSteps>(
    CollectionAccordionSteps.CollectionDetails,
  );
  const [initialQuestions, setInitialQuestions] = useState<QuestionData[]>([]);
  const [manageQuestionsKey, regenerateManageQuestionsKey] = useUniqueId();

  const isEdit = mode === 'edit';

  const navigate = useNavigate();
  const { collectionId } = useParams();

  // Fetch collection data for edit mode
  const {
    data: collectionData,
    loading: collectionLoading,
    error: collectionError,
  } = useGetQuestionCollectionQuery({
    variables: { id: collectionId! },
    skip: !isEdit || !collectionId,
  });

  useEffect(() => {
    if (collectionData?.questionCollection) {
      regenerateManageQuestionsKey();
    }
  }, [collectionData, regenerateManageQuestionsKey]);

  // Update form when collection data is loaded (edit mode)
  useEffect(() => {
    if (isEdit && collectionData?.questionCollection) {
      const collection = collectionData.questionCollection;

      // If the collection has questions, add them to the questions state
      if (collection.questions && collection.questions.length > 0) {
        const mappedQuestions = collection.questions.map((question) => ({
          id: question.id,
          questionText: question.questionText,
          points: question.points,
          options: question.options.map((option) => ({
            optionText: option.optionText,
            isCorrect: option.isCorrect,
          })),
          allowMultipleCorrect: isMoreThanOrEqual({
            list: question.options,
            condition: (o) => o.isCorrect,
            num: 2,
          }),
          isNew: false,
          isEdited: false,
          isDeleted: false,
        }));

        setInitialQuestions(mappedQuestions);
      } else {
        // Reset questions if collection has no questions
        setInitialQuestions([]);
      }

      mutation.title = collection.title;
      mutation.description = collection.description || '';
      mutation.editingCollectionId = collection.id;
    }
  }, [collectionData, isEdit, mutation]);

  // Handle successful collection creation
  function handleCollectionCreated(newCollectionId: string) {
    setActiveAccordionItem(CollectionAccordionSteps.ManageQuestions);
    navigate(APP_ROUTES.adminCollectionEdit(newCollectionId));
  }

  // Handle successful collection update
  function handleCollectionUpdated() {
    // Collection has been updated - no additional action needed for now
  }

  if (isEdit && collectionLoading) {
    return (
      <div className='p-6'>
        <AppTypography.h1>Loading collection...</AppTypography.h1>
      </div>
    );
  }

  // Handle collection fetch error
  if (isEdit && collectionError) {
    return (
      <div className='p-6'>
        <div className='mb-8 flex items-center justify-between'>
          <AppTypography.h1>Error Loading Collection</AppTypography.h1>
          <AppButton onClick={() => navigate(APP_ROUTES.adminCollections)} variant='outline'>
            Back to Collections
          </AppButton>
        </div>
        <div className='rounded-md border border-red-200 bg-red-50 p-4'>
          <AppTypography.p className='text-red-700'>
            Failed to load collection: {collectionError.message}
          </AppTypography.p>
        </div>
      </div>
    );
  }

  function _renderPendingSaveDialog() {
    const percentage = (savedQuestionCount / totalQuestionsToSave) * 100;
    return (
      <AppDialog.Root open={isSavingQuestions}>
        <AppDialog.Content>
          <AppTypography.p>Saving Questions...</AppTypography.p>
          <AppProgress value={percentage} />
        </AppDialog.Content>
      </AppDialog.Root>
    );
  }

  // Handle case where collection is not found in edit mode
  if (isEdit && !collectionLoading && !collectionError && !collectionData?.questionCollection) {
    return (
      <div className='p-6'>
        <div className='mb-8 flex items-center justify-between'>
          <AppTypography.h1>Collection Not Found</AppTypography.h1>
          <AppButton onClick={() => navigate(APP_ROUTES.adminCollections)} variant='outline'>
            Back to Collections
          </AppButton>
        </div>
        <div className='rounded-md border border-yellow-200 bg-yellow-50 p-4'>
          <AppTypography.p className='text-yellow-700'>
            The requested collection could not be found. It may have been deleted or you may not have permission to
            access it.
          </AppTypography.p>
        </div>
      </div>
    );
  }

  const currentCollectionId = isEdit ? collectionId : mutation.editingCollectionId;

  return (
    <div className='p-6'>
      {_renderPendingSaveDialog()}
      <div className='mb-8 flex items-center justify-between'>
        <AppTypography.h1>{isEdit ? 'Edit Collection' : 'Create New Collection'}</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminCollections)} variant='outline'>
          Back to Collections
        </AppButton>
      </div>

      <div className='space-y-8'>
        <AppAccordion.Root
          type='single'
          value={activeAccordionItem}
          onValueChange={(value) => setActiveAccordionItem(value as CollectionAccordionSteps)}
          collapsible>
          <CollectionDetailsStep
            key={collectionData?.questionCollection?.id}
            mode={mode}
            initialData={{
              title: collectionData?.questionCollection?.title || '',
              description: collectionData?.questionCollection?.description || '',
            }}
            onCollectionCreated={handleCollectionCreated}
            onCollectionUpdated={handleCollectionUpdated}
          />
          {isEdit && (
            <ManageQuestionsStep
              key={manageQuestionsKey}
              collectionId={currentCollectionId || undefined}
              initialQuestions={initialQuestions}
            />
          )}
        </AppAccordion.Root>
      </div>
    </div>
  );
}
