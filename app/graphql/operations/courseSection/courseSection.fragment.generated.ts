import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type CourseSectionItemFragment = { __typename?: 'CourseSection', id: string, title: string, description: string, courseId: string, sectionId?: string | null, order: number };

export const CourseSectionItemFragmentDoc = gql`
    fragment CourseSectionItem on CourseSection {
  id
  title
  description
  courseId
  sectionId
  order
}
    `;