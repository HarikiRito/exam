import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useCreateQuestionCollectionMutation } from 'app/graphql/operations/questionCollection/createQuestionCollection.mutation.generated';
import { useGetQuestionCollectionQuery } from 'app/graphql/operations/questionCollection/getQuestionCollection.query.generated';
import { PaginateQuestionCollectionsDocument } from 'app/graphql/operations/questionCollection/paginateQuestionCollections.query.generated';
import { useUpdateQuestionCollectionMutation } from 'app/graphql/operations/questionCollection/updateQuestionCollection.mutation.generated';

import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { apolloService } from 'app/shared/services/apollo.service';
import { collectionFormState } from '../state';

import { QuestionData } from 'app/shared/components/custom/question/QuestionItem';
import { QuestionManager } from 'app/shared/components/custom/question/QuestionManager';

// Collection form schema
const collectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;

interface CollectionEditAndCreatePageProps {
  readonly mode: 'create' | 'edit';
}

export function CollectionEditAndCreatePage({ mode }: CollectionEditAndCreatePageProps) {
  // Define enum inside the component
  enum CollectionAccordionSteps {
    CollectionDetails = 'collection-details',
    ManageQuestions = 'manage-questions',
  }

  // Initialize state
  collectionFormState.useResetHook();
  const state = collectionFormState.useStateSnapshot();
  const mutation = collectionFormState.proxyState;

  const [isQuestionsStepEnabled, setIsQuestionsStepEnabled] = useState(false);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<CollectionAccordionSteps>(
    CollectionAccordionSteps.CollectionDetails,
  );
  const [questions, setQuestions] = useState<QuestionData[]>([]);

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

  // Create collection mutation
  const [createCollection, { loading: createLoading }] = useCreateQuestionCollectionMutation({
    onCompleted: (data) => {
      toast.success('Collection created successfully!');
      apolloService.invalidateQueries([PaginateQuestionCollectionsDocument]);

      // Enable the questions step and update the form with the new collection ID
      setIsQuestionsStepEnabled(true);
      setActiveAccordionItem(CollectionAccordionSteps.ManageQuestions);

      // Store the newly created collection ID
      const newCollectionId = data.createQuestionCollection.id;
      mutation.editingCollectionId = newCollectionId;
    },
    onError: (error) => {
      toast.error(`Failed to create collection: ${error.message}`);
    },
  });

  // Update collection mutation
  const [updateCollection, { loading: updateLoading }] = useUpdateQuestionCollectionMutation({
    onCompleted: () => {
      toast.success('Collection updated successfully!');
      apolloService.invalidateQueries([PaginateQuestionCollectionsDocument]);
    },
    onError: (error) => {
      toast.error(`Failed to update collection: ${error.message}`);
    },
  });

  // Initialize form
  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Update form when collection data is loaded (edit mode)
  useEffect(() => {
    if (isEdit && collectionData?.questionCollection) {
      const collection = collectionData.questionCollection;

      // Enable questions step in edit mode
      setIsQuestionsStepEnabled(true);

      // Set collection details
      const formData: CollectionFormData = {
        title: collection.title,
        description: collection.description || '',
      };

      // If the collection has questions, add them to the questions state
      if (collection.questions && collection.questions.length > 0) {
        const mappedQuestions = collection.questions.map((question) => ({
          id: question.id,
          questionText: question.questionText,
          options: question.options.map((option) => ({
            id: option.id,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
          })),
          allowMultipleCorrect: question.options.filter((o) => o.isCorrect).length > 1,
          isNew: false,
          isEdited: false,
          isDeleted: false,
        }));

        setQuestions(mappedQuestions);
      } else {
        // Reset questions if collection has no questions
        setQuestions([]);
      }

      form.reset(formData);
      mutation.title = collection.title;
      mutation.description = collection.description || '';
      mutation.editingCollectionId = collection.id;
    }
  }, [collectionData, form, isEdit, mutation]);

  // Handle collection form submission
  async function handleSubmit(data: CollectionFormData) {
    mutation.isSaving = true;

    if (isEdit && collectionId) {
      await updateCollection({
        variables: {
          id: collectionId,
          input: {
            title: data.title,
            description: data.description || null,
          },
        },
      });
    } else {
      await createCollection({
        variables: {
          input: {
            title: data.title,
            description: data.description || null,
          },
        },
      });
    }

    mutation.isSaving = false;
  }

  // Handle saving questions
  function handleSaveQuestions() {
    setIsSavingQuestions(true);

    const currentCollectionId = isEdit ? collectionId : mutation.editingCollectionId;

    if (!currentCollectionId) {
      toast.error('No collection ID found. Please create or select a collection first.');
      setIsSavingQuestions(false);
      return;
    }

    // Validate that there are questions to save
    if (!questions || questions.length === 0) {
      toast.error('No questions to save. Please add at least one question.');
      setIsSavingQuestions(false);
      return;
    }

    // TODO: Implement question saving logic
    // This will handle:
    // - Creating new questions (isNew: true)
    // - Updating existing questions (isEdited: true)
    // - Deleting questions (isDeleted: true)
    // - Managing question options for each question

    // For now, simulate successful save
    setTimeout(() => {
      toast.success('Questions saved successfully!');
      setIsSavingQuestions(false);
    }, 1000);
  }

  function handleQuestionsChange(updatedQuestions: QuestionData[]) {
    setQuestions(updatedQuestions);
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

  const isLoading = createLoading || updateLoading || state.isSaving;

  function renderCollectionDetailsStep() {
    // Helper function to determine the submit button text
    function _renderSubmitButtonText(): string {
      if (isLoading) {
        return isEdit ? 'Updating...' : 'Creating...';
      }
      return isEdit ? 'Update Collection' : 'Create Collection';
    }

    return (
      <AppAccordion.Item value={CollectionAccordionSteps.CollectionDetails} className='mb-4 rounded-md border'>
        <AppAccordion.Trigger className='px-4'>
          <div className='flex w-full items-center'>
            <AppTypography.h3 className='flex-1 text-left'>Collection Details</AppTypography.h3>
            <span className='text-muted-foreground text-sm'>Step 1</span>
          </div>
        </AppAccordion.Trigger>
        <AppAccordion.Content className='px-4 pb-4'>
          <AppForm.Root {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
              {/* Collection Title */}
              <AppForm.Field
                control={form.control}
                name='title'
                render={({ field }) => (
                  <AppForm.Item>
                    <AppForm.Label>Title</AppForm.Label>
                    <AppForm.Control>
                      <AppInput placeholder='Enter collection title' {...field} />
                    </AppForm.Control>
                    <AppForm.Description>A descriptive title for this question collection.</AppForm.Description>
                    <AppForm.Message />
                  </AppForm.Item>
                )}
              />

              {/* Collection Description */}
              <AppForm.Field
                control={form.control}
                name='description'
                render={({ field }) => (
                  <AppForm.Item>
                    <AppForm.Label>Description</AppForm.Label>
                    <AppForm.Control>
                      <AppTextarea placeholder='Enter collection description (optional)' rows={4} {...field} />
                    </AppForm.Control>
                    <AppForm.Description>
                      Optional description to provide more context about this collection.
                    </AppForm.Description>
                    <AppForm.Message />
                  </AppForm.Item>
                )}
              />

              {/* Submit Button */}
              <div className='flex justify-end pt-4'>
                <AppButton type='submit' disabled={isLoading}>
                  {_renderSubmitButtonText()}
                </AppButton>
              </div>
            </form>
          </AppForm.Root>
        </AppAccordion.Content>
      </AppAccordion.Item>
    );
  }

  function renderManageQuestionsStep() {
    const currentCollectionId = isEdit ? collectionId : mutation.editingCollectionId;

    return (
      <AppAccordion.Item
        value={CollectionAccordionSteps.ManageQuestions}
        className='mb-4 rounded-md border'
        disabled={!isQuestionsStepEnabled}>
        <AppAccordion.Trigger className='px-4'>
          <div className='flex w-full items-center'>
            <AppTypography.h3 className='flex-1 text-left'>Manage Questions</AppTypography.h3>
            <span className='text-muted-foreground text-sm'>Step 2</span>
          </div>
        </AppAccordion.Trigger>
        <AppAccordion.Content className='px-4 pb-4'>
          {isQuestionsStepEnabled && currentCollectionId ? (
            <div>
              <QuestionManager
                questions={questions}
                collectionId={currentCollectionId}
                onQuestionsChange={handleQuestionsChange}
                onSaveQuestions={handleSaveQuestions}
                isSaving={isSavingQuestions}
              />
            </div>
          ) : (
            <div className='p-4 text-center'>
              <AppTypography.muted>
                {!isQuestionsStepEnabled
                  ? 'Please create the collection first to manage questions.'
                  : 'Collection ID is required to manage questions.'}
              </AppTypography.muted>
            </div>
          )}
        </AppAccordion.Content>
      </AppAccordion.Item>
    );
  }

  return (
    <div className='p-6'>
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
          {renderCollectionDetailsStep()}
          {renderManageQuestionsStep()}
        </AppAccordion.Root>
      </div>
    </div>
  );
}
