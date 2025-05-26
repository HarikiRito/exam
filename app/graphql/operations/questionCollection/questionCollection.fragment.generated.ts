import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type QuestionCollectionItemFragment = { __typename?: 'QuestionCollection', id: string, title: string, description?: string | null, createdAt: string, updatedAt: string };

export const QuestionCollectionItemFragmentDoc = gql`
    fragment QuestionCollectionItem on QuestionCollection {
  id
  title
  description
  createdAt
  updatedAt
}
    `;