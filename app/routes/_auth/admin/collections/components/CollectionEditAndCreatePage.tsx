import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@remix-run/react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { useGetQuestionCollectionQuery } from 'app/graphql/operations/questionCollection/getQuestionCollection.query.generated';
import { useCreateQuestionCollectionMutation } from 'app/graphql/operations/questionCollection/createQuestionCollection.mutation.generated';
import { useUpdateQuestionCollectionMutation } from 'app/graphql/operations/questionCollection/updateQuestionCollection.mutation.generated';
import { PaginateQuestionCollectionsDocument } from 'app/graphql/operations/questionCollection/paginateQuestionCollections.query.generated';
import { collectionFormState } from '../state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { apolloService } from 'app/shared/services/apollo.service';

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
  // Initialize state
  collectionFormState.useResetHook();
  const state = collectionFormState.useStateSnapshot();
  const mutation = collectionFormState.proxyState;

  const isEdit = mode === 'edit';

  const navigate = useNavigate();
  const { collectionId } = useParams();

  // Fetch collection data for edit mode
  const { data: collectionData, loading: collectionLoading } = useGetQuestionCollectionQuery({
    variables: { id: collectionId! },
    skip: !isEdit || !collectionId,
  });

  // Create collection mutation
  const [createCollection, { loading: createLoading }] = useCreateQuestionCollectionMutation({
    onCompleted: () => {
      toast.success('Collection created successfully!');
      apolloService.invalidateQueries([PaginateQuestionCollectionsDocument]);
      navigate(APP_ROUTES.adminCollections);
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
      navigate(APP_ROUTES.adminCollections);
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
      const formData = {
        title: collection.title,
        description: collection.description || '',
      };

      form.reset(formData);
      mutation.title = collection.title;
      mutation.description = collection.description || '';
      mutation.editingCollectionId = collection.id;
    }
  }, [collectionData, form, isEdit, mutation]);

  // Handle form submission
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

  if (isEdit && collectionLoading) {
    return (
      <div className='p-6'>
        <AppTypography.h1>Loading collection...</AppTypography.h1>
      </div>
    );
  }

  const isLoading = createLoading || updateLoading || state.isSaving;

  // Helper function to determine the submit button text
  function _renderSubmitButtonText(): string {
    if (isLoading) {
      return isEdit ? 'Updating...' : 'Creating...';
    }
    return isEdit ? 'Update Collection' : 'Create Collection';
  }

  return (
    <div className='p-6'>
      <div className='mb-8 flex items-center justify-between'>
        <AppTypography.h1>{isEdit ? 'Edit Collection' : 'Create New Collection'}</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminCollections)} variant='outline'>
          Back to Collections
        </AppButton>
      </div>

      <div className='max-w-2xl space-y-8'>
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
      </div>
    </div>
  );
}
