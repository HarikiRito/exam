import type * as Types from '../../graphqlTypes';

import type { UserFragment } from './user.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { UserFragmentDoc } from './user.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AdminEditUserMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Types.AdminEditUserInput;
}>;


export type AdminEditUserMutation = { __typename?: 'Mutation', adminEditUser: (
    { __typename?: 'User' }
    & UserFragment
  ) };


export const AdminEditUserDocument = gql`
    mutation AdminEditUser($id: ID!, $input: AdminEditUserInput!) {
  adminEditUser(id: $id, input: $input) {
    ...User
  }
}
    ${UserFragmentDoc}`;
export type AdminEditUserMutationFn = Apollo.MutationFunction<AdminEditUserMutation, AdminEditUserMutationVariables>;

/**
 * __useAdminEditUserMutation__
 *
 * To run a mutation, you first call `useAdminEditUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAdminEditUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [adminEditUserMutation, { data, loading, error }] = useAdminEditUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAdminEditUserMutation(baseOptions?: Apollo.MutationHookOptions<AdminEditUserMutation, AdminEditUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AdminEditUserMutation, AdminEditUserMutationVariables>(AdminEditUserDocument, options);
      }
export type AdminEditUserMutationHookResult = ReturnType<typeof useAdminEditUserMutation>;
export type AdminEditUserMutationResult = Apollo.MutationResult<AdminEditUserMutation>;
export type AdminEditUserMutationOptions = Apollo.BaseMutationOptions<AdminEditUserMutation, AdminEditUserMutationVariables>;