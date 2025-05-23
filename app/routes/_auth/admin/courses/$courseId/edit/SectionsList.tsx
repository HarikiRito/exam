import { editCourseSectionState } from 'app/routes/_auth/admin/courses/$courseId/edit/state';
import { AccordionSection, SectionWithChildren } from 'app/shared/components/custom/section/AccordionSection';

export function SectionsList() {
  const snap = editCourseSectionState.useStateSnapshot();
  const mutation = editCourseSectionState.proxyState;

  // Handle editing a section
  function handleEditSection(section: SectionWithChildren) {
    mutation.editingSectionId = section.id;
    mutation.editingSection = section;
    // Ensure the sectionId is string or empty string for type safety
    mutation.parentSectionId = section.sectionId ?? null;
  }

  // Handle deleting a section
  function handleDeleteSection(sectionId: string) {
    mutation.deletingSectionId = sectionId;
  }

  return (
    <div className='mb-6'>
      <AccordionSection
        sections={snap.sections}
        onEdit={handleEditSection}
        onDelete={handleDeleteSection}
        emptyStateMessage='No sections found for this course. Create a section below.'
      />
    </div>
  );
}
