import type * as Types from '../../graphqlTypes';

import type { QuestionCollectionItemFragment } from './questionCollection.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { QuestionCollectionItemFragmentDoc } from './questionCollection.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateQuestionCollectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Types.UpdateQuestionCollectionInput;
}>;


export type UpdateQuestionCollectionMutation = { __typename?: 'Mutation', updateQuestionCollection: (
    { __typename?: 'QuestionCollection' }
    & QuestionCollectionItemFragment
  ) };


export const UpdateQuestionCollectionDocument = gql`
    mutation UpdateQuestionCollection($id: ID!, $input: UpdateQuestionCollectionInput!) {
  updateQuestionCollection(id: $id, input: $input) {
    ...QuestionCollectionItem
  }
}
    ${QuestionCollectionItemFragmentDoc}`;
export type UpdateQuestionCollectionMutationFn = Apollo.MutationFunction<UpdateQuestionCollectionMutation, UpdateQuestionCollectionMutationVariables>;

/**
 * __useUpdateQuestionCollectionMutation__
 *
 * To run a mutation, you first call `useUpdateQuestionCollectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuestionCollectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuestionCollectionMutation, { data, loading, error }] = useUpdateQuestionCollectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateQuestionCollectionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateQuestionCollectionMutation, UpdateQuestionCollectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateQuestionCollectionMutation, UpdateQuestionCollectionMutationVariables>(UpdateQuestionCollectionDocument, options);
      }
export type UpdateQuestionCollectionMutationHookResult = ReturnType<typeof useUpdateQuestionCollectionMutation>;
export type UpdateQuestionCollectionMutationResult = Apollo.MutationResult<UpdateQuestionCollectionMutation>;
export type UpdateQuestionCollectionMutationOptions = Apollo.BaseMutationOptions<UpdateQuestionCollectionMutation, UpdateQuestionCollectionMutationVariables>;