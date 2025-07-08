import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteQuestionCollectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type DeleteQuestionCollectionMutation = { __typename?: 'Mutation', deleteQuestionCollection: boolean };


export const DeleteQuestionCollectionDocument = gql`
    mutation DeleteQuestionCollection($id: ID!) {
  deleteQuestionCollection(id: $id)
}
    `;
export type DeleteQuestionCollectionMutationFn = Apollo.MutationFunction<DeleteQuestionCollectionMutation, DeleteQuestionCollectionMutationVariables>;

/**
 * __useDeleteQuestionCollectionMutation__
 *
 * To run a mutation, you first call `useDeleteQuestionCollectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteQuestionCollectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteQuestionCollectionMutation, { data, loading, error }] = useDeleteQuestionCollectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteQuestionCollectionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteQuestionCollectionMutation, DeleteQuestionCollectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteQuestionCollectionMutation, DeleteQuestionCollectionMutationVariables>(DeleteQuestionCollectionDocument, options);
      }
export type DeleteQuestionCollectionMutationHookResult = ReturnType<typeof useDeleteQuestionCollectionMutation>;
export type DeleteQuestionCollectionMutationResult = Apollo.MutationResult<DeleteQuestionCollectionMutation>;
export type DeleteQuestionCollectionMutationOptions = Apollo.BaseMutationOptions<DeleteQuestionCollectionMutation, DeleteQuestionCollectionMutationVariables>;