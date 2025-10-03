import type * as Types from '../../graphqlTypes';

import type { QuestionItemFragment } from './question.fragment.generated';
import type { QuestionOptionItemFragment } from './questionOption.fragment.generated';
import type { QuestionCollectionItemFragment } from '../questionCollection/questionCollection.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { QuestionItemFragmentDoc } from './question.fragment.generated';
import { QuestionOptionItemFragmentDoc } from './questionOption.fragment.generated';
import { QuestionCollectionItemFragmentDoc } from '../questionCollection/questionCollection.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateQuestionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Types.UpdateQuestionInput;
}>;


export type UpdateQuestionMutation = { __typename?: 'Mutation', updateQuestion: (
    { __typename?: 'Question', options?: Array<(
      { __typename?: 'QuestionOption' }
      & QuestionOptionItemFragment
    )> | null, collection?: (
      { __typename?: 'QuestionCollection' }
      & QuestionCollectionItemFragment
    ) | null }
    & QuestionItemFragment
  ) };


export const UpdateQuestionDocument = gql`
    mutation UpdateQuestion($id: ID!, $input: UpdateQuestionInput!) {
  updateQuestion(id: $id, input: $input) {
    ...QuestionItem
    options {
      ...QuestionOptionItem
    }
    collection {
      ...QuestionCollectionItem
    }
  }
}
    ${QuestionItemFragmentDoc}
${QuestionOptionItemFragmentDoc}
${QuestionCollectionItemFragmentDoc}`;
export type UpdateQuestionMutationFn = Apollo.MutationFunction<UpdateQuestionMutation, UpdateQuestionMutationVariables>;

/**
 * __useUpdateQuestionMutation__
 *
 * To run a mutation, you first call `useUpdateQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuestionMutation, { data, loading, error }] = useUpdateQuestionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateQuestionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateQuestionMutation, UpdateQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateQuestionMutation, UpdateQuestionMutationVariables>(UpdateQuestionDocument, options);
      }
export type UpdateQuestionMutationHookResult = ReturnType<typeof useUpdateQuestionMutation>;
export type UpdateQuestionMutationResult = Apollo.MutationResult<UpdateQuestionMutation>;
export type UpdateQuestionMutationOptions = Apollo.BaseMutationOptions<UpdateQuestionMutation, UpdateQuestionMutationVariables>;