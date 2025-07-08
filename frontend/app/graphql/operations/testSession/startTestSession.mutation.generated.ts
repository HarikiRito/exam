import type * as Types from '../../graphqlTypes';

import type { TestSessionFragmentFragment } from './testSession.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { TestSessionFragmentFragmentDoc } from './testSession.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type StartTestSessionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type StartTestSessionMutation = { __typename?: 'Mutation', startTestSession: (
    { __typename?: 'TestSession' }
    & TestSessionFragmentFragment
  ) };


export const StartTestSessionDocument = gql`
    mutation StartTestSession($id: ID!) {
  startTestSession(id: $id) {
    ...TestSessionFragment
  }
}
    ${TestSessionFragmentFragmentDoc}`;
export type StartTestSessionMutationFn = Apollo.MutationFunction<StartTestSessionMutation, StartTestSessionMutationVariables>;

/**
 * __useStartTestSessionMutation__
 *
 * To run a mutation, you first call `useStartTestSessionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartTestSessionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startTestSessionMutation, { data, loading, error }] = useStartTestSessionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useStartTestSessionMutation(baseOptions?: Apollo.MutationHookOptions<StartTestSessionMutation, StartTestSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StartTestSessionMutation, StartTestSessionMutationVariables>(StartTestSessionDocument, options);
      }
export type StartTestSessionMutationHookResult = ReturnType<typeof useStartTestSessionMutation>;
export type StartTestSessionMutationResult = Apollo.MutationResult<StartTestSessionMutation>;
export type StartTestSessionMutationOptions = Apollo.BaseMutationOptions<StartTestSessionMutation, StartTestSessionMutationVariables>;