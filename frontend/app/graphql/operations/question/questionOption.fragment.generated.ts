import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type QuestionOptionItemFragment = { __typename?: 'QuestionOption', id: string, optionText: string, isCorrect: boolean };

export const QuestionOptionItemFragmentDoc = gql`
    fragment QuestionOptionItem on QuestionOption {
  id
  optionText
  isCorrect
}
    `;