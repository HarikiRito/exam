import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteTestSessionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type DeleteTestSessionMutation = { __typename?: 'Mutation', deleteTestSession: boolean };


export const DeleteTestSessionDocument = gql`
    mutation DeleteTestSession($id: ID!) {
  deleteTestSession(id: $id)
}
    `;
export type DeleteTestSessionMutationFn = Apollo.MutationFunction<DeleteTestSessionMutation, DeleteTestSessionMutationVariables>;

/**
 * __useDeleteTestSessionMutation__
 *
 * To run a mutation, you first call `useDeleteTestSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTestSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTestSessionMutation, { data, loading, error }] = useDeleteTestSessionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTestSessionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTestSessionMutation, DeleteTestSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTestSessionMutation, DeleteTestSessionMutationVariables>(DeleteTestSessionDocument, options);
      }
export type DeleteTestSessionMutationHookResult = ReturnType<typeof useDeleteTestSessionMutation>;
export type DeleteTestSessionMutationResult = Apollo.MutationResult<DeleteTestSessionMutation>;
export type DeleteTestSessionMutationOptions = Apollo.BaseMutationOptions<DeleteTestSessionMutation, DeleteTestSessionMutationVariables>;