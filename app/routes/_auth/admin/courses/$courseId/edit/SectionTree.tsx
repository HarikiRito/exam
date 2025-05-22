import { editCourseSectionState } from './state';

export function SectionTree() {
  const snap = editCourseSectionState.useStateSnapshot();

  return <div>{JSON.stringify(snap.sections)}</div>;
}
