import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useCreateQuestionCollectionMutation } from 'app/graphql/operations/questionCollection/createQuestionCollection.mutation.generated';
import { PaginateQuestionCollectionsDocument } from 'app/graphql/operations/questionCollection/paginateQuestionCollections.query.generated';
import { useUpdateQuestionCollectionMutation } from 'app/graphql/operations/questionCollection/updateQuestionCollection.mutation.generated';

import { useParams } from '@remix-run/react';
import { CollectionAccordionSteps } from 'app/routes/_auth/admin/collections/components/CollectionEditAndCreatePage';
import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { apolloService } from 'app/shared/services/apollo.service';

// Collection form schema
const collectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;

interface CollectionDetailsStepProps {
  readonly mode: 'create' | 'edit';
  readonly initialData?: CollectionFormData;
  readonly onCollectionCreated: (collectionId: string) => void;
  readonly onCollectionUpdated: () => void;
}

export function CollectionDetailsStep({
  mode,
  initialData,
  onCollectionCreated,
  onCollectionUpdated,
}: CollectionDetailsStepProps) {
  const { collectionId } = useParams();
  const isEdit = mode === 'edit';

  // Create collection mutation
  const [createCollection, { loading: createLoading }] = useCreateQuestionCollectionMutation({
    onCompleted: (data) => {
      toast.success('Collection created successfully!');
      apolloService.invalidateQueries([PaginateQuestionCollectionsDocument]);
      onCollectionCreated(data.createQuestionCollection.id);
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
      onCollectionUpdated();
    },
    onError: (error) => {
      toast.error(`Failed to update collection: ${error.message}`);
    },
  });

  // Initialize form
  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    mode: 'onBlur',
    defaultValues: initialData || {
      title: '',
      description: '',
    },
  });

  // Handle collection form submission
  async function handleSubmit(data: CollectionFormData) {
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
  }

  // Helper function to determine the submit button text
  function renderSubmitButtonText(): string {
    const isLoading = createLoading || updateLoading;
    if (isLoading) {
      return isEdit ? 'Updating...' : 'Creating...';
    }
    return isEdit ? 'Update Collection' : 'Create Collection';
  }

  const isLoading = createLoading || updateLoading;

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
                {renderSubmitButtonText()}
              </AppButton>
            </div>
          </form>
        </AppForm.Root>
      </AppAccordion.Content>
    </AppAccordion.Item>
  );
}
