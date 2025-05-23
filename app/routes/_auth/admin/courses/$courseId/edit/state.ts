import { createProxyWithReset } from 'app/shared/utils/valtio';
import { CourseSectionItemFragment } from 'app/graphql/operations/courseSection/courseSection.fragment.generated';
export interface SectionWithChildren extends CourseSectionItemFragment {
  children: SectionWithChildren[];
}
class EditCourseSectionState {
  sections: SectionWithChildren[] = [];
  editingSectionId: string | null = null;
  deletingSectionId: string | null = null;
  parentSectionId: string | null = null;
  editingSection: SectionWithChildren | null = null;
}
export const editCourseSectionState = createProxyWithReset(new EditCourseSectionState());
