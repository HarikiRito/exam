import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type QuestionItemFragment = { __typename?: 'Question', id: string, questionText: string };

export const QuestionItemFragmentDoc = gql`
    fragment QuestionItem on Question {
  id
  questionText
}
    `;