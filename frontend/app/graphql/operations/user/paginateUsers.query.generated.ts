import type * as Types from '../../graphqlTypes';

import type { PaginationFragment } from '../pagination.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { PaginationFragmentDoc } from '../pagination.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PaginateUsersQueryVariables = Types.Exact<{
  paginationInput?: Types.InputMaybe<Types.PaginationInput>;
}>;


export type PaginateUsersQuery = { __typename?: 'Query', paginatedUsers: { __typename?: 'PaginatedUser', pagination: (
      { __typename?: 'Pagination' }
      & PaginationFragment
    ), items: Array<{ __typename?: 'User', id: string, email: string, username: string, firstName?: string | null, lastName?: string | null, isActive: boolean }> } };


export const PaginateUsersDocument = gql`
    query PaginateUsers($paginationInput: PaginationInput) {
  paginatedUsers(paginationInput: $paginationInput) {
    pagination {
      ...Pagination
    }
    items {
      id
      email
      username
      firstName
      lastName
      isActive
    }
  }
}
    ${PaginationFragmentDoc}`;

/**
 * __usePaginateUsersQuery__
 *
 * To run a query within a React component, call `usePaginateUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaginateUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaginateUsersQuery({
 *   variables: {
 *      paginationInput: // value for 'paginationInput'
 *   },
 * });
 */
export function usePaginateUsersQuery(baseOptions?: Apollo.QueryHookOptions<PaginateUsersQuery, PaginateUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaginateUsersQuery, PaginateUsersQueryVariables>(PaginateUsersDocument, options);
      }
export function usePaginateUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaginateUsersQuery, PaginateUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaginateUsersQuery, PaginateUsersQueryVariables>(PaginateUsersDocument, options);
        }
export function usePaginateUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaginateUsersQuery, PaginateUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaginateUsersQuery, PaginateUsersQueryVariables>(PaginateUsersDocument, options);
        }
export type PaginateUsersQueryHookResult = ReturnType<typeof usePaginateUsersQuery>;
export type PaginateUsersLazyQueryHookResult = ReturnType<typeof usePaginateUsersLazyQuery>;
export type PaginateUsersSuspenseQueryHookResult = ReturnType<typeof usePaginateUsersSuspenseQuery>;
export type PaginateUsersQueryResult = Apollo.QueryResult<PaginateUsersQuery, PaginateUsersQueryVariables>;
export function refetchPaginateUsersQuery(variables?: PaginateUsersQueryVariables) {
      return { query: PaginateUsersDocument, variables: variables }
    }