import type * as Types from '../../graphqlTypes';

import type { UserFragment } from './user.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { UserFragmentDoc } from './user.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AdminCreateUserMutationVariables = Types.Exact<{
  input: Types.AdminCreateUserInput;
}>;


export type AdminCreateUserMutation = { __typename?: 'Mutation', adminCreateUser: (
    { __typename?: 'User' }
    & UserFragment
  ) };


export const AdminCreateUserDocument = gql`
    mutation AdminCreateUser($input: AdminCreateUserInput!) {
  adminCreateUser(input: $input) {
    ...User
  }
}
    ${UserFragmentDoc}`;
export type AdminCreateUserMutationFn = Apollo.MutationFunction<AdminCreateUserMutation, AdminCreateUserMutationVariables>;

/**
 * __useAdminCreateUserMutation__
 *
 * To run a mutation, you first call `useAdminCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAdminCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [adminCreateUserMutation, { data, loading, error }] = useAdminCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAdminCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<AdminCreateUserMutation, AdminCreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AdminCreateUserMutation, AdminCreateUserMutationVariables>(AdminCreateUserDocument, options);
      }
export type AdminCreateUserMutationHookResult = ReturnType<typeof useAdminCreateUserMutation>;
export type AdminCreateUserMutationResult = Apollo.MutationResult<AdminCreateUserMutation>;
export type AdminCreateUserMutationOptions = Apollo.BaseMutationOptions<AdminCreateUserMutation, AdminCreateUserMutationVariables>;