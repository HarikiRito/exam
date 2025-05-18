import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type CourseItemFragment = { __typename?: 'Course', id: string, title: string, description: string, createdAt: string, updatedAt: string };

export const CourseItemFragmentDoc = gql`
    fragment CourseItem on Course {
  id
  title
  description
  createdAt
  updatedAt
}
    `;