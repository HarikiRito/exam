import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { editCourseSectionState } from 'app/routes/_auth/admin/courses/$courseId/edit/state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCombobox, ComboboxOption } from 'app/shared/components/combobox/AppCombobox';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/typography/AppTypography';

// Section schema
const sectionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  readonly availableParentSections: ComboboxOption[];
  readonly createSectionLoading: boolean;
  readonly updateSectionLoading: boolean;
  readonly onCreateSection: (data: SectionFormData) => Promise<void>;
  readonly onUpdateSection: (data: SectionFormData) => Promise<void>;
  readonly onCancel: () => void;
}

export function SectionForm({
  availableParentSections,
  createSectionLoading,
  updateSectionLoading,
  onCreateSection,
  onUpdateSection,
  onCancel,
}: SectionFormProps) {
  const snap = editCourseSectionState.useStateSnapshot();
  const mutation = editCourseSectionState.proxyState;

  // Section form
  const sectionForm = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    mode: 'onBlur',
    defaultValues: {
      title: snap.editingSection?.title || '',
      description: snap.editingSection?.description || '',
    },
  });

  // Handle form submission based on whether we're editing or creating
  function handleSubmit(data: SectionFormData) {
    if (snap.editingSectionId) {
      onUpdateSection(data);
    } else {
      onCreateSection(data);
    }
  }

  return (
    <div className='rounded-md border p-4'>
      <AppTypography.h3 className='mb-4'>{snap.editingSectionId ? 'Edit Section' : 'Add New Section'}</AppTypography.h3>
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

          {/* Only show parent section combobox when editing root sections or creating new sections */}
          {(!snap.editingSection || !snap.editingSection.sectionId) && (
            <div className='space-y-2'>
              <AppForm.Label>Parent Section (Optional)</AppForm.Label>
              <AppCombobox
                options={availableParentSections}
                value={snap.parentSectionId}
                onValueChange={(value) => (mutation.parentSectionId = value)}
                placeholder='Select parent section (optional)'
                emptyMessage='No parent sections available.'
                className='w-full'
              />
              <p className='text-xs text-gray-500'>
                Select a parent section to create a sub-section. Leave empty for a top-level section.
              </p>
            </div>
          )}

          <div className='flex justify-end gap-2 pt-2'>
            {snap.editingSectionId && (
              <AppButton type='button' variant='outline' onClick={onCancel}>
                Cancel
              </AppButton>
            )}
            <AppButton type='submit' disabled={createSectionLoading || updateSectionLoading}>
              {snap.editingSectionId
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
