import type * as Types from '../../graphqlTypes';

import type { TestSessionFragmentFragment } from './testSession.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { TestSessionFragmentFragmentDoc } from './testSession.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SubmitTestSessionMutationVariables = Types.Exact<{
  sessionId: Types.Scalars['ID']['input'];
  input: Types.SubmitTestSessionInput;
}>;


export type SubmitTestSessionMutation = { __typename?: 'Mutation', submitTestSession: (
    { __typename?: 'TestSession' }
    & TestSessionFragmentFragment
  ) };


export const SubmitTestSessionDocument = gql`
    mutation SubmitTestSession($sessionId: ID!, $input: SubmitTestSessionInput!) {
  submitTestSession(sessionId: $sessionId, input: $input) {
    ...TestSessionFragment
  }
}
    ${TestSessionFragmentFragmentDoc}`;
export type SubmitTestSessionMutationFn = Apollo.MutationFunction<SubmitTestSessionMutation, SubmitTestSessionMutationVariables>;

/**
 * __useSubmitTestSessionMutation__
 *
 * To run a mutation, you first call `useSubmitTestSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitTestSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitTestSessionMutation, { data, loading, error }] = useSubmitTestSessionMutation({
 *   variables: {
 *      sessionId: // value for 'sessionId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitTestSessionMutation(baseOptions?: Apollo.MutationHookOptions<SubmitTestSessionMutation, SubmitTestSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitTestSessionMutation, SubmitTestSessionMutationVariables>(SubmitTestSessionDocument, options);
      }
export type SubmitTestSessionMutationHookResult = ReturnType<typeof useSubmitTestSessionMutation>;
export type SubmitTestSessionMutationResult = Apollo.MutationResult<SubmitTestSessionMutation>;
export type SubmitTestSessionMutationOptions = Apollo.BaseMutationOptions<SubmitTestSessionMutation, SubmitTestSessionMutationVariables>;