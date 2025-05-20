import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@remix-run/react';
import { Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useGetCourseQuery } from 'app/graphql/operations/course/getCourse.query.generated';
import { useUpdateCourseMutation } from 'app/graphql/operations/course/updateCourse.mutation.generated';
import { useCreateCourseSectionMutation } from 'app/graphql/operations/courseSection/createCourseSection.mutation.generated';
import { useRemoveCourseSectionMutation } from 'app/graphql/operations/courseSection/removeCourseSection.mutation.generated';
import { useUpdateCourseSectionMutation } from 'app/graphql/operations/courseSection/updateCourseSection.mutation.generated';
import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppDialog } from 'app/shared/components/dialog/AppDialog';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';

// Define interface for CourseSection (matching our fragment)
interface CourseSection {
  id: string;
  title: string;
  description: string;
  courseId: string;
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

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Section state
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);

  // Fetch course data
  const { data: courseData, loading: courseLoading } = useGetCourseQuery({
    variables: { id: courseId! },
    skip: !courseId,
  });

  // Course mutations
  const [updateCourse, { loading: updateCourseLoading }] = useUpdateCourseMutation();

  // Section mutations
  const [createCourseSection, { loading: createSectionLoading }] = useCreateCourseSectionMutation({
    onCompleted: (data) => {
      const newSection = data.createCourseSection;
      setSections([...sections, newSection]);
      sectionForm.reset();
      toast.success('Section created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create section: ${error.message}`);
    },
  });

  const [updateCourseSection, { loading: updateSectionLoading }] = useUpdateCourseSectionMutation({
    onCompleted: (data) => {
      const updatedSection = data.updateCourseSection;
      setSections(sections.map((section) => (section.id === updatedSection.id ? updatedSection : section)));
      setEditingSectionId(null);
      sectionForm.reset();
      toast.success('Section updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update section: ${error.message}`);
    },
  });

  const [removeCourseSection] = useRemoveCourseSectionMutation({
    onCompleted: () => {
      setSections(sections.filter((section) => section.id !== deletingSectionId));
      setDeletingSectionId(null);
      toast.success('Section deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete section: ${error.message}`);
    },
  });

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
  function startEditingSection(section: CourseSection) {
    setEditingSectionId(section.id);
    sectionForm.reset({
      title: section.title,
      description: section.description,
    });
  }

  // Cancel editing a section
  function cancelEditingSection() {
    setEditingSectionId(null);
    sectionForm.reset();
  }

  if (courseLoading) {
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
                {sections.map((section) => (
                  <AppAccordion.Item key={section.id} value={section.id} className='rounded-md border px-4'>
                    <AppAccordion.Trigger>
                      <div className='flex w-full items-center justify-between'>
                        <span>{section.title}</span>
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
                              setDeletingSectionId(section.id);
                            }}>
                            <Trash2 className='text-destructive h-4 w-4' />
                          </AppButton>
                        </div>
                      </div>
                    </AppAccordion.Trigger>
                    <AppAccordion.Content className='px-2'>
                      <div className='py-2'>
                        <AppTypography.p className='mb-2 text-sm text-gray-600'>{section.description}</AppTypography.p>
                      </div>
                    </AppAccordion.Content>
                  </AppAccordion.Item>
                ))}
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
          if (!open) setDeletingSectionId(null);
        }}>
        <AppDialog.Content>
          <AppDialog.Header>
            <AppDialog.Title>Delete Section</AppDialog.Title>
            <AppDialog.Description>
              Are you sure you want to delete this section? This action cannot be undone.
            </AppDialog.Description>
          </AppDialog.Header>
          <AppDialog.Footer>
            <AppButton variant='outline' onClick={() => setDeletingSectionId(null)}>
              Cancel
            </AppButton>
            <AppButton variant='destructive' onClick={handleDeleteSection}>
              Delete
            </AppButton>
          </AppDialog.Footer>
        </AppDialog.Content>
      </AppDialog.Root>
    </div>
  );
}
