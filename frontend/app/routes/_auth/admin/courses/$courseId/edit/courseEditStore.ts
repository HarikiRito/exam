import { SectionWithChildren } from 'app/shared/components/custom/section/AccordionSection';
import { createProxyWithReset } from 'app/shared/utils/valtio';

class EditCourseSectionState {
  sections: SectionWithChildren[] = [];
  editingSectionId: string | null = null;
  deletingSectionId: string | null = null;
  parentSectionId: string | null = null;
  editingSection: SectionWithChildren | null = null;
}
export const editCourseSectionState = createProxyWithReset(new EditCourseSectionState());
