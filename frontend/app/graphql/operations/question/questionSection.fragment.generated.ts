import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type QuestionSectionItemFragment = { __typename?: 'CourseSection', id: string, title: string };

export const QuestionSectionItemFragmentDoc = gql`
    fragment QuestionSectionItem on CourseSection {
  id
  title
}
    `;