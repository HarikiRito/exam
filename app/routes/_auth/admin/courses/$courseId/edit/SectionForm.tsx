import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useParams } from '@remix-run/react';
import { toast } from 'sonner';
import { z } from 'zod';

import { editCourseSectionState } from 'app/routes/_auth/admin/courses/$courseId/edit/state';
import { useCreateCourseSectionMutation } from 'app/graphql/operations/courseSection/createCourseSection.mutation.generated';
import { useUpdateCourseSectionMutation } from 'app/graphql/operations/courseSection/updateCourseSection.mutation.generated';
import { CourseSectionsByCourseIdDocument } from 'app/graphql/operations/courseSection/courseSectionsByCourseId.query.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCombobox, ComboboxOption } from 'app/shared/components/combobox/AppCombobox';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { apolloService } from 'app/shared/services/apollo.service';

// Section schema
const sectionSchema = z.object({
  title: z.string().min(1, 'Title must be at least 1 characters'),
  description: z.string().optional(),
  parentSectionId: z.string().optional(),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  readonly availableParentSections: ComboboxOption[];
}

const mutation = editCourseSectionState.proxyState;

export function SectionForm({ availableParentSections }: SectionFormProps) {
  const state = editCourseSectionState.useStateSnapshot();
  const { courseId } = useParams();

  // Cancel editing a section
  function cancelEditingSection() {
    mutation.editingSectionId = null;
    mutation.editingSection = null;
    mutation.parentSectionId = null;
  }

  const [createCourseSection, { loading: createSectionLoading }] = useCreateCourseSectionMutation({
    onCompleted: () => {
      mutation.parentSectionId = null;
      toast.success('Section created successfully!');
      apolloService.invalidateQueries([CourseSectionsByCourseIdDocument]);
    },
    onError: (error) => {
      toast.error(`Failed to create section: ${error.message}`);
    },
  });

  const [updateCourseSection, { loading: updateSectionLoading }] = useUpdateCourseSectionMutation({
    onCompleted: () => {
      mutation.editingSectionId = null;
      mutation.editingSection = null;
      mutation.parentSectionId = null;
      toast.success('Section updated successfully!');
      apolloService.invalidateQueries([CourseSectionsByCourseIdDocument]);
    },
    onError: (error) => {
      toast.error(`Failed to update section: ${error.message}`);
    },
  });

  // Section form
  const sectionForm = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    mode: 'onBlur',
    defaultValues: {
      title: state.editingSection?.title || '',
      description: state.editingSection?.description || '',
      parentSectionId: state.editingSection?.sectionId || '',
    },
  });

  useEffect(() => {
    sectionForm.reset({
      title: state.editingSection?.title || '',
      description: state.editingSection?.description || '',
      parentSectionId: state.editingSection?.sectionId || '',
    });
  }, [state.editingSection, sectionForm]);

  // Handle form submission based on whether we're editing or creating
  async function handleSubmit(data: SectionFormData) {
    if (!courseId) return;

    if (state.editingSectionId) {
      await updateCourseSection({
        variables: {
          id: state.editingSectionId,
          input: {
            title: data.title,
            description: data.description,
            sectionId: data.parentSectionId || undefined,
          },
        },
      });
      return;
    }

    await createCourseSection({
      variables: {
        input: {
          courseId,
          title: data.title,
          description: data.description || '',
          sectionId: data.parentSectionId || undefined,
        },
      },
    });

    mutation.parentSectionId = null;
  }

  const showParentSectionSelector = !state.editingSection || (state.editingSection && state.editingSection.sectionId);

  return (
    <div className='rounded-md border p-4'>
      <AppTypography.h3 className='mb-4'>
        {state.editingSectionId ? 'Edit Section' : 'Add New Section'}
      </AppTypography.h3>
      <AppForm.Root {...sectionForm}>
        <form onSubmit={sectionForm.handleSubmit(handleSubmit)} className='space-y-4'>
          <AppForm.Field
            control={sectionForm.control}
            name='title'
            render={({ field }) => (
              <AppForm.Item>
                <AppForm.Label>Section Title</AppForm.Label>
                <AppForm.Control>
                  <AppInput placeholder='Enter section title' {...field} />
                </AppForm.Control>
                <AppForm.Message />
              </AppForm.Item>
            )}
          />

          <AppForm.Field
            control={sectionForm.control}
            name='description'
            render={({ field }) => (
              <AppForm.Item>
                <AppForm.Label>Section Description</AppForm.Label>
                <AppForm.Control>
                  <AppTextarea placeholder='Enter section description' rows={3} {...field} />
                </AppForm.Control>
                <AppForm.Message />
              </AppForm.Item>
            )}
          />

          {/* Show parent section selector for new sections or when editing child sections */}
          {showParentSectionSelector && (
            <AppForm.Field
              control={sectionForm.control}
              name='parentSectionId'
              render={({ field }) => (
                <AppForm.Item>
                  <AppForm.Label>Parent Section (Optional)</AppForm.Label>
                  <AppForm.Control>
                    {/* TODO: Handle case where selected parent becomes invalid (e.g., another user adds a child to it) */}
                    <AppCombobox
                      options={availableParentSections}
                      value={field.value ?? ''}
                      onValueChange={(value) => field.onChange(value)}
                      placeholder='Select parent section (optional)'
                      emptyMessage='No parent sections available.'
                      className='w-full'
                    />
                  </AppForm.Control>
                  <p className='text-xs text-gray-500'>
                    Select a parent section to create a sub-section. Leave empty for a top-level section.
                  </p>
                  <AppForm.Message />
                </AppForm.Item>
              )}
            />
          )}
          <div className='flex justify-end gap-2 pt-2'>
            {state.editingSectionId && (
              <AppButton type='button' variant='outline' onClick={cancelEditingSection}>
                Cancel
              </AppButton>
            )}
            <AppButton type='submit' disabled={createSectionLoading || updateSectionLoading}>
              {state.editingSectionId
                ? updateSectionLoading
                  ? 'Updating...'
                  : 'Update Section'
                : createSectionLoading
                  ? 'Creating...'
                  : 'Add Section'}
            </AppButton>
          </div>
        </form>
      </AppForm.Root>
    </div>
  );
}
