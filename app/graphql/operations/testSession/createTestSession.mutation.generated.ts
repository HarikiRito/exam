import type * as Types from '../../graphqlTypes';

import type { TestSessionFragmentFragment } from './testSession.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { TestSessionFragmentFragmentDoc } from './testSession.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateTestSessionMutationVariables = Types.Exact<{
  input: Types.CreateTestSessionInput;
}>;


export type CreateTestSessionMutation = { __typename?: 'Mutation', createTestSession: Array<(
    { __typename?: 'TestSession' }
    & TestSessionFragmentFragment
  )> };


export const CreateTestSessionDocument = gql`
    mutation CreateTestSession($input: CreateTestSessionInput!) {
  createTestSession(input: $input) {
    ...TestSessionFragment
  }
}
    ${TestSessionFragmentFragmentDoc}`;
export type CreateTestSessionMutationFn = Apollo.MutationFunction<CreateTestSessionMutation, CreateTestSessionMutationVariables>;

/**
 * __useCreateTestSessionMutation__
 *
 * To run a mutation, you first call `useCreateTestSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTestSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTestSessionMutation, { data, loading, error }] = useCreateTestSessionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTestSessionMutation(baseOptions?: Apollo.MutationHookOptions<CreateTestSessionMutation, CreateTestSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTestSessionMutation, CreateTestSessionMutationVariables>(CreateTestSessionDocument, options);
      }
export type CreateTestSessionMutationHookResult = ReturnType<typeof useCreateTestSessionMutation>;
export type CreateTestSessionMutationResult = Apollo.MutationResult<CreateTestSessionMutation>;
export type CreateTestSessionMutationOptions = Apollo.BaseMutationOptions<CreateTestSessionMutation, CreateTestSessionMutationVariables>;