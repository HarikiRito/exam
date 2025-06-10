import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AddMultiCollectionToTestMutationVariables = Types.Exact<{
  input: Types.AddMultiCollectionToTestInput;
}>;


export type AddMultiCollectionToTestMutation = { __typename?: 'Mutation', addMultiCollectionToTest: boolean };


export const AddMultiCollectionToTestDocument = gql`
    mutation AddMultiCollectionToTest($input: AddMultiCollectionToTestInput!) {
  addMultiCollectionToTest(input: $input)
}
    `;
export type AddMultiCollectionToTestMutationFn = Apollo.MutationFunction<AddMultiCollectionToTestMutation, AddMultiCollectionToTestMutationVariables>;

/**
 * __useAddMultiCollectionToTestMutation__
 *
 * To run a mutation, you first call `useAddMultiCollectionToTestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMultiCollectionToTestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMultiCollectionToTestMutation, { data, loading, error }] = useAddMultiCollectionToTestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddMultiCollectionToTestMutation(baseOptions?: Apollo.MutationHookOptions<AddMultiCollectionToTestMutation, AddMultiCollectionToTestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddMultiCollectionToTestMutation, AddMultiCollectionToTestMutationVariables>(AddMultiCollectionToTestDocument, options);
      }
export type AddMultiCollectionToTestMutationHookResult = ReturnType<typeof useAddMultiCollectionToTestMutation>;
export type AddMultiCollectionToTestMutationResult = Apollo.MutationResult<AddMultiCollectionToTestMutation>;
export type AddMultiCollectionToTestMutationOptions = Apollo.BaseMutationOptions<AddMultiCollectionToTestMutation, AddMultiCollectionToTestMutationVariables>;