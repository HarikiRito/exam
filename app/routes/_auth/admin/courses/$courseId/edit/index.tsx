import { useNavigate, useParams } from '@remix-run/react';
import { useEffect } from 'react';

import { useGetCourseQuery } from 'app/graphql/operations/course/getCourse.query.generated';
import { useCourseSectionsByCourseIdQuery } from 'app/graphql/operations/courseSection/courseSectionsByCourseId.query.generated';
import { editCourseSectionState } from 'app/routes/_auth/admin/courses/$courseId/edit/state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { ComboboxOption } from 'app/shared/components/combobox/AppCombobox';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';

import { CourseForm } from './CourseForm';
import { DeleteSectionDialog } from './DeleteSectionDialog';
import { SectionForm } from './SectionForm';
import { SectionsList } from './SectionsList';
import { SectionWithChildren } from 'app/shared/components/custom/section/AccordionSection';

const mutation = editCourseSectionState.proxyState;

export default function EditCourse() {
  // Initialize state
  editCourseSectionState.useResetHook();
  const state = editCourseSectionState.useStateSnapshot();
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Fetch course data
  const { data: courseData, loading: courseLoading } = useGetCourseQuery({
    variables: { id: courseId! },
    skip: !courseId,
  });

  // Fetch course sections
  const { data: sectionsData, loading: sectionsLoading } = useCourseSectionsByCourseIdQuery({
    variables: { courseId: courseId! },
    skip: !courseId,
  });

  // Map sections to ComboboxOption for combobox - only root sections (no sectionId)
  const availableParentSections: ComboboxOption[] =
    sectionsData?.courseSectionsByCourseId
      .filter((section) => {
        // If we're editing a section, don't allow it to be its own parent
        if (state.editingSectionId && section.id === state.editingSectionId) return false;

        // Don't allow a section to be a parent of itself (circular dependency prevention)
        if (state.editingSectionId && section.sectionId === state.editingSectionId) return false;

        // Only include top-level sections (no sectionId) as potential parents
        return !section.sectionId;
      })
      .map((section) => ({
        value: section.id,
        label: section.title,
      })) || [];

  // Process sections data into parent-child structure
  useEffect(() => {
    if (!sectionsData?.courseSectionsByCourseId) return;

    const allSections = sectionsData.courseSectionsByCourseId;

    // Helper function to build tree
    function buildSectionTree(): SectionWithChildren[] {
      // First, map all sections to include empty children array
      const sectionsWithEmptyChildren: SectionWithChildren[] = allSections.map((section) => ({
        ...section,
        children: [],
      }));

      // Create a lookup map for quick access
      const sectionsMap: Record<string, SectionWithChildren> = {};
      sectionsWithEmptyChildren.forEach((section) => {
        sectionsMap[section.id] = section;
      });
      // Build the tree structure
      const rootSections: SectionWithChildren[] = [];

      sectionsWithEmptyChildren.forEach((section) => {
        // If the section has a parent, add it to the parent's children
        const parent = section.sectionId ? sectionsMap[section.sectionId] : null;
        if (parent) {
          parent.children.push(section);
        } else {
          // This is a root section
          rootSections.push(section);
        }
      });

      return rootSections;
    }

    const sectionTree = buildSectionTree();
    mutation.sections = sectionTree;
  }, [sectionsData]);

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
        />

        {/* Course Sections */}
        <div className='rounded-lg border p-6 shadow-sm'>
          <div className='mb-6 flex items-center justify-between'>
            <AppTypography.h2>Course Sections</AppTypography.h2>
          </div>

          {/* Accordion to display sections */}
          <SectionsList />

          {/* Create/Edit Section Form */}
          <SectionForm availableParentSections={availableParentSections} />
        </div>
      </div>

      {/* Delete Section Confirmation Dialog */}
      <DeleteSectionDialog />
    </div>
  );
}
