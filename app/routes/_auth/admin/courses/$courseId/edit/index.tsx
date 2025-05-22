import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@remix-run/react';
import { Edit2, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useGetCourseQuery } from 'app/graphql/operations/course/getCourse.query.generated';
import { useUpdateCourseMutation } from 'app/graphql/operations/course/updateCourse.mutation.generated';
import { CourseSectionItemFragment } from 'app/graphql/operations/courseSection/courseSection.fragment.generated';
import { useCourseSectionsByCourseIdQuery } from 'app/graphql/operations/courseSection/courseSectionsByCourseId.query.generated';
import { useCreateCourseSectionMutation } from 'app/graphql/operations/courseSection/createCourseSection.mutation.generated';
import { useRemoveCourseSectionMutation } from 'app/graphql/operations/courseSection/removeCourseSection.mutation.generated';
import { useUpdateCourseSectionMutation } from 'app/graphql/operations/courseSection/updateCourseSection.mutation.generated';
import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCombobox, ComboboxOption } from 'app/shared/components/combobox/AppCombobox';
import { AppDialog } from 'app/shared/components/dialog/AppDialog';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTooltip } from 'app/shared/components/tooltip/AppTooltip';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { createProxyWithReset } from 'app/shared/utils/valtio';
import { useSnapshot } from 'valtio';
// Extended interface for displaying sections with children
interface SectionWithChildren extends CourseSectionItemFragment {
  children: SectionWithChildren[];
}

// Course schema
const courseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
});

// Section schema
const sectionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;
type SectionFormData = z.infer<typeof sectionSchema>;

class EditCourseSectionState {
  sections: SectionWithChildren[] = [];
  editingSectionId: string | null = null;
  deletingSectionId: string | null = null;
  parentSectionId: string = '';
  editingSection: SectionWithChildren | null = null;
}

const { proxyState: mutation, useResetHook } = createProxyWithReset(new EditCourseSectionState());

export default function EditCourse() {
  useResetHook();
  const { deletingSectionId, editingSectionId, editingSection, parentSectionId, sections } = useSnapshot(mutation);
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Fetch course data
  const { data: courseData, loading: courseLoading } = useGetCourseQuery({
    variables: { id: courseId! },
    skip: !courseId,
  });

  // Fetch course sections
  const {
    data: sectionsData,
    loading: sectionsLoading,
    refetch: refetchCourseSections,
  } = useCourseSectionsByCourseIdQuery({
    variables: { courseId: courseId! },
    skip: !courseId,
  });

  // Map sections to ComboboxOption for combobox - only root sections (no sectionId)
  const availableParentSections: ComboboxOption[] =
    sectionsData?.courseSectionsByCourseId
      .filter((section) => {
        // If we're editing a section, don't allow it to be its own parent
        if (editingSectionId && section.id === editingSectionId) return false;
        // Only include top-level sections (no sectionId)
        return !section.sectionId;
      })
      .map((section) => ({
        value: section.id,
        label: section.title,
      })) || [];

  // Course mutations
  const [updateCourse, { loading: updateCourseLoading }] = useUpdateCourseMutation();

  // Section mutations
  const [createCourseSection, { loading: createSectionLoading }] = useCreateCourseSectionMutation({
    onCompleted: () => {
      sectionForm.reset();
      mutation.parentSectionId = '';
      toast.success('Section created successfully!');
      // Refresh the sections
      refetchSections();
    },
    onError: (error) => {
      toast.error(`Failed to create section: ${error.message}`);
    },
  });

  const [updateCourseSection, { loading: updateSectionLoading }] = useUpdateCourseSectionMutation({
    onCompleted: () => {
      mutation.editingSectionId = null;
      mutation.editingSection = null;
      sectionForm.reset();
      mutation.parentSectionId = '';
      toast.success('Section updated successfully!');
      // Refresh the sections
      refetchSections();
    },
    onError: (error) => {
      toast.error(`Failed to update section: ${error.message}`);
    },
  });

  const [removeCourseSection, { loading: removeSectionLoading }] = useRemoveCourseSectionMutation({
    onCompleted: () => {
      mutation.deletingSectionId = null;
      toast.success('Section deleted successfully!');
      // Refresh the sections
      refetchSections();
    },
    onError: (error) => {
      toast.error(`Failed to delete section: ${error.message}`);
    },
  });

  // Refetch sections helper
  function refetchSections() {
    if (!courseId) return;

    refetchCourseSections();
  }

  // Course form
  const courseForm = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Section form
  const sectionForm = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Process sections data into parent-child structure
  useEffect(() => {
    if (sectionsData?.courseSectionsByCourseId) {
      const allSections = [...sectionsData.courseSectionsByCourseId];

      // Helper function to build tree
      function buildSectionTree(): SectionWithChildren[] {
        // First, map all sections to include empty children array
        const sectionsWithEmptyChildren: SectionWithChildren[] = allSections.map((section) => ({
          ...section,
          children: [],
        }));

        // Create a lookup map for quick access
        const sectionsMap = new Map<string, SectionWithChildren>();
        sectionsWithEmptyChildren.forEach((section) => {
          sectionsMap.set(section.id, section);
        });

        // Build the tree structure
        const rootSections: SectionWithChildren[] = [];

        sectionsWithEmptyChildren.forEach((section) => {
          // If the section has a parent, add it to the parent's children
          if (section.sectionId) {
            const parent = sectionsMap.get(section.sectionId);
            if (parent) {
              parent.children.push(section);
            } else {
              // If parent not found, treat as root
              rootSections.push(section);
            }
          } else {
            // This is a root section
            rootSections.push(section);
          }
        });

        return rootSections;
      }

      const sectionTree = buildSectionTree();
      mutation.sections = sectionTree;
    }
  }, [sectionsData]);

  // Update course form when data is loaded
  useEffect(() => {
    if (courseData?.course) {
      courseForm.reset({
        title: courseData.course.title,
        description: courseData.course.description || '',
      });
    }
  }, [courseData, courseForm]);

  // Handle update course form submission
  async function handleUpdateCourse(data: CourseFormData) {
    if (!courseId) return;

    try {
      const result = await updateCourse({
        variables: {
          id: courseId,
          input: {
            title: data.title,
            description: data.description,
          },
        },
      });

      if (result.data?.updateCourse) {
        toast.success('Course updated successfully!');
      }
    } catch (error) {
      toast.error(`Failed to update course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Handle create section form submission
  async function handleCreateSection(data: SectionFormData) {
    if (!courseId) return;

    await createCourseSection({
      variables: {
        input: {
          courseId,
          title: data.title,
          description: data.description || '',
          // TODO: We can't include parentId in the input since it's not in the schema
          // Instead, we'll need to update the backend to support this feature
        },
      },
    });
  }

  // Handle update section form submission
  async function handleUpdateSection(data: SectionFormData) {
    if (!editingSectionId) return;

    await updateCourseSection({
      variables: {
        id: editingSectionId,
        input: {
          title: data.title,
          description: data.description,
          // TODO: We can't include parentId in the input since it's not in the schema
          // Instead, we'll need to update the backend to support this feature
        },
      },
    });
  }

  // Handle section deletion
  async function handleDeleteSection() {
    if (!deletingSectionId) return;

    await removeCourseSection({
      variables: {
        id: deletingSectionId,
      },
    });
  }

  // Start editing a section
  function startEditingSection(section: (typeof sections)[number]) {
    mutation.editingSectionId = section.id;
    mutation.editingSection = section as SectionWithChildren;
    // Ensure the sectionId is string or empty string for type safety
    mutation.parentSectionId = section.sectionId ? section.sectionId : '';
    sectionForm.reset({
      title: section.title,
      description: section.description,
    });
  }

  // Cancel editing a section
  function cancelEditingSection() {
    mutation.editingSectionId = null;
    mutation.editingSection = null;
    mutation.parentSectionId = '';
    sectionForm.reset();
  }

  // Recursive section renderer
  function renderSectionItem(section: (typeof sections)[number]) {
    // Determine if this section has children
    const hasChildren = section.children && section.children.length > 0;

    return (
      <AppAccordion.Item key={section.id} value={section.id} className='mb-2 rounded-md border px-4'>
        <AppAccordion.Trigger className={hasChildren ? '' : '[&[data-state=open]>svg]:hidden'}>
          {section.description ? (
            <AppTooltip.Root>
              <AppTooltip.Trigger asChild>
                <div className='flex w-full items-center justify-between'>
                  <div className='flex flex-col items-start text-left'>
                    <h3 className='text-base font-semibold'>{section.title}</h3>
                    <p className='max-w-[400px] truncate text-sm text-gray-600'>{section.description}</p>
                  </div>
                  <div className='flex gap-2'>
                    <AppButton
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingSection(section);
                      }}>
                      <Edit2 className='h-4 w-4' />
                    </AppButton>
                    <AppButton
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={(e) => {
                        e.stopPropagation();
                        mutation.deletingSectionId = section.id;
                      }}>
                      <Trash2 className='text-destructive h-4 w-4' />
                    </AppButton>
                  </div>
                </div>
              </AppTooltip.Trigger>
              <AppTooltip.Content>
                <p>{section.description}</p>
              </AppTooltip.Content>
            </AppTooltip.Root>
          ) : (
            <div className='flex w-full items-center justify-between'>
              <div className='flex flex-col items-start text-left'>
                <h3 className='text-base font-semibold'>{section.title}</h3>
                <p className='max-w-[400px] truncate text-sm text-gray-600'>{section.description}</p>
              </div>
              <div className='flex gap-2'>
                <AppButton
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingSection(section);
                  }}>
                  <Edit2 className='h-4 w-4' />
                </AppButton>
                <AppButton
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={(e) => {
                    e.stopPropagation();
                    mutation.deletingSectionId = section.id;
                  }}>
                  <Trash2 className='text-destructive h-4 w-4' />
                </AppButton>
              </div>
            </div>
          )}
        </AppAccordion.Trigger>

        {hasChildren && (
          <AppAccordion.Content>
            <div className='space-y-2 py-2'>
              {/* Render child sections */}
              <div className='pl-4'>
                {section.children.map((childSection) => (
                  <AppAccordion.Item
                    key={childSection.id}
                    value={childSection.id}
                    className='mb-2 rounded-md border px-4'>
                    <AppAccordion.Trigger className='[&[data-state=open]>svg]:hidden'>
                      {childSection.description ? (
                        <AppTooltip.Root>
                          <AppTooltip.Trigger asChild>
                            <div className='flex w-full items-center justify-between'>
                              <div className='flex flex-col items-start text-left'>
                                <h3 className='text-base font-semibold'>{childSection.title}</h3>
                                <p className='max-w-[400px] truncate text-sm text-gray-600'>
                                  {childSection.description}
                                </p>
                              </div>
                              <div className='flex gap-2'>
                                <AppButton
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingSection(childSection);
                                  }}>
                                  <Edit2 className='h-4 w-4' />
                                </AppButton>
                                <AppButton
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    mutation.deletingSectionId = childSection.id;
                                  }}>
                                  <Trash2 className='text-destructive h-4 w-4' />
                                </AppButton>
                              </div>
                            </div>
                          </AppTooltip.Trigger>
                          <AppTooltip.Content>
                            <p>{childSection.description}</p>
                          </AppTooltip.Content>
                        </AppTooltip.Root>
                      ) : (
                        <div className='flex w-full items-center justify-between'>
                          <div className='flex flex-col items-start text-left'>
                            <h3 className='text-base font-semibold'>{childSection.title}</h3>
                            <p className='max-w-[400px] truncate text-sm text-gray-600'>{childSection.description}</p>
                          </div>
                          <div className='flex gap-2'>
                            <AppButton
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingSection(childSection);
                              }}>
                              <Edit2 className='h-4 w-4' />
                            </AppButton>
                            <AppButton
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={(e) => {
                                e.stopPropagation();
                                mutation.deletingSectionId = childSection.id;
                              }}>
                              <Trash2 className='text-destructive h-4 w-4' />
                            </AppButton>
                          </div>
                        </div>
                      )}
                    </AppAccordion.Trigger>
                  </AppAccordion.Item>
                ))}
              </div>
            </div>
          </AppAccordion.Content>
        )}
      </AppAccordion.Item>
    );
  }

  if (courseLoading || sectionsLoading) {
    return (
      <div className='p-6'>
        <AppTypography.h1>Loading course...</AppTypography.h1>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='mb-8 flex items-center justify-between'>
        <AppTypography.h1>Edit Course</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminCourses)} variant='outline'>
          Back to Courses
        </AppButton>
      </div>

      <div className='space-y-8'>
        {/* Course Edit Form */}
        <div className='rounded-lg border p-6 shadow-sm'>
          <AppTypography.h2 className='mb-4'>Course Details</AppTypography.h2>
          <AppForm.Root {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(handleUpdateCourse)} className='space-y-6'>
              <AppForm.Field
                control={courseForm.control}
                name='title'
                render={({ field }) => (
                  <AppForm.Item>
                    <AppForm.Label>Course Title</AppForm.Label>
                    <AppForm.Control>
                      <AppInput placeholder='Enter course title' {...field} />
                    </AppForm.Control>
                    <AppForm.Message />
                  </AppForm.Item>
                )}
              />

              <AppForm.Field
                control={courseForm.control}
                name='description'
                render={({ field }) => (
                  <AppForm.Item>
                    <AppForm.Label>Course Description</AppForm.Label>
                    <AppForm.Control>
                      <AppTextarea placeholder='Enter course description' rows={4} {...field} />
                    </AppForm.Control>
                    <AppForm.Message />
                  </AppForm.Item>
                )}
              />

              <div className='flex justify-end pt-4'>
                <AppButton type='submit' disabled={updateCourseLoading}>
                  {updateCourseLoading ? 'Updating...' : 'Update Course'}
                </AppButton>
              </div>
            </form>
          </AppForm.Root>
        </div>

        {/* Course Sections */}
        <div className='rounded-lg border p-6 shadow-sm'>
          <div className='mb-6 flex items-center justify-between'>
            <AppTypography.h2>Course Sections</AppTypography.h2>
          </div>

          {/* Accordion to display sections */}
          <div className='mb-6'>
            {sections.length > 0 ? (
              <AppAccordion.Root type='multiple' className='space-y-2'>
                {sections.map((section) => renderSectionItem(section))}
              </AppAccordion.Root>
            ) : (
              <div className='rounded-md border p-8 text-center'>
                <AppTypography.p className='text-muted-foreground'>
                  No sections found for this course. Create a section below.
                </AppTypography.p>
              </div>
            )}
          </div>

          {/* Create/Edit Section Form */}
          <div className='rounded-md border p-4'>
            <AppTypography.h3 className='mb-4'>
              {editingSectionId ? 'Edit Section' : 'Add New Section'}
            </AppTypography.h3>
            <AppForm.Root {...sectionForm}>
              <form
                onSubmit={sectionForm.handleSubmit(editingSectionId ? handleUpdateSection : handleCreateSection)}
                className='space-y-4'>
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
                {(!editingSection || !editingSection.sectionId) && (
                  <div className='space-y-2'>
                    <AppForm.Label>Parent Section (Optional)</AppForm.Label>
                    <AppCombobox
                      options={availableParentSections}
                      value={parentSectionId}
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
                  {editingSectionId && (
                    <AppButton type='button' variant='outline' onClick={cancelEditingSection}>
                      Cancel
                    </AppButton>
                  )}
                  <AppButton type='submit' disabled={createSectionLoading || updateSectionLoading}>
                    {editingSectionId
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
        </div>
      </div>

      {/* Delete Section Confirmation Dialog */}
      <AppDialog.Root
        open={!!deletingSectionId}
        onOpenChange={(open) => {
          if (!open) mutation.deletingSectionId = null;
        }}>
        <AppDialog.Content>
          <AppDialog.Header>
            <AppDialog.Title>Delete Section</AppDialog.Title>
            <AppDialog.Description>
              Are you sure you want to delete this section? This action cannot be undone.
            </AppDialog.Description>
          </AppDialog.Header>
          <AppDialog.Footer>
            <AppButton variant='outline' onClick={() => (mutation.deletingSectionId = null)}>
              Cancel
            </AppButton>
            <AppButton
              variant='destructive'
              className='text-white'
              onClick={handleDeleteSection}
              disabled={removeSectionLoading}>
              {removeSectionLoading ? 'Deleting...' : 'Delete'}
            </AppButton>
          </AppDialog.Footer>
        </AppDialog.Content>
      </AppDialog.Root>
    </div>
  );
}
