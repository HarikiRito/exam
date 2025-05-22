import { useNavigate, useParams } from '@remix-run/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { useGetCourseQuery } from 'app/graphql/operations/course/getCourse.query.generated';
import { useUpdateCourseMutation } from 'app/graphql/operations/course/updateCourse.mutation.generated';
import { useCourseSectionsByCourseIdQuery } from 'app/graphql/operations/courseSection/courseSectionsByCourseId.query.generated';
import { useCreateCourseSectionMutation } from 'app/graphql/operations/courseSection/createCourseSection.mutation.generated';
import { useRemoveCourseSectionMutation } from 'app/graphql/operations/courseSection/removeCourseSection.mutation.generated';
import { useUpdateCourseSectionMutation } from 'app/graphql/operations/courseSection/updateCourseSection.mutation.generated';
import { editCourseSectionState, SectionWithChildren } from 'app/routes/_auth/admin/courses/$courseId/edit/state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { ComboboxOption } from 'app/shared/components/combobox/AppCombobox';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';

import { CourseForm, CourseFormData } from './CourseForm';
import { DeleteSectionDialog } from './DeleteSectionDialog';
import { SectionForm, SectionFormData } from './SectionForm';
import { SectionsList } from './SectionsList';

const mutation = editCourseSectionState.proxyState;

export default function EditCourse() {
  // Initialize state
  editCourseSectionState.useResetHook();
  const snap = editCourseSectionState.useStateSnapshot();
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

  // Course mutations
  const [updateCourse, { loading: updateCourseLoading }] = useUpdateCourseMutation();

  // Section mutations
  const [createCourseSection, { loading: createSectionLoading }] = useCreateCourseSectionMutation({
    onCompleted: () => {
      mutation.parentSectionId = '';
      toast.success('Section created successfully!');
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
      mutation.parentSectionId = '';
      toast.success('Section updated successfully!');
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
      refetchSections();
    },
    onError: (error) => {
      toast.error(`Failed to delete section: ${error.message}`);
    },
  });

  // Map sections to ComboboxOption for combobox - only root sections (no sectionId)
  const availableParentSections: ComboboxOption[] =
    sectionsData?.courseSectionsByCourseId
      .filter((section) => {
        // If we're editing a section, don't allow it to be its own parent
        if (snap.editingSectionId && section.id === snap.editingSectionId) return false;
        // Only include top-level sections (no sectionId)
        return !section.sectionId;
      })
      .map((section) => ({
        value: section.id,
        label: section.title,
      })) || [];

  // Refetch sections helper
  function refetchSections() {
    if (!courseId) return;
    refetchCourseSections();
  }

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
    if (!snap.editingSectionId) return;

    await updateCourseSection({
      variables: {
        id: snap.editingSectionId,
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
    if (!snap.deletingSectionId) return;

    await removeCourseSection({
      variables: {
        id: snap.deletingSectionId,
      },
    });
  }

  // Start editing a section
  function startEditingSection(section: SectionWithChildren) {
    mutation.editingSectionId = section.id;
    mutation.editingSection = section;
    // Ensure the sectionId is string or empty string for type safety
    mutation.parentSectionId = section.sectionId ? section.sectionId : '';
  }

  // Cancel editing a section
  function cancelEditingSection() {
    mutation.editingSectionId = null;
    mutation.editingSection = null;
    mutation.parentSectionId = '';
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
        <CourseForm
          initialData={{
            title: courseData?.course?.title || '',
            description: courseData?.course?.description || '',
          }}
          isLoading={updateCourseLoading}
          onSubmit={handleUpdateCourse}
        />

        {/* Course Sections */}
        <div className='rounded-lg border p-6 shadow-sm'>
          <div className='mb-6 flex items-center justify-between'>
            <AppTypography.h2>Course Sections</AppTypography.h2>
          </div>

          {/* Accordion to display sections */}
          <SectionsList onStartEditingSection={startEditingSection} />

          {/* Create/Edit Section Form */}
          <SectionForm
            availableParentSections={availableParentSections}
            createSectionLoading={createSectionLoading}
            updateSectionLoading={updateSectionLoading}
            onCreateSection={handleCreateSection}
            onUpdateSection={handleUpdateSection}
            onCancel={cancelEditingSection}
          />
        </div>
      </div>

      {/* Delete Section Confirmation Dialog */}
      <DeleteSectionDialog isLoading={removeSectionLoading} onConfirm={handleDeleteSection} />
    </div>
  );
}
