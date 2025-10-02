import type * as Types from '../../graphqlTypes';

import type { PaginationFragment } from '../pagination.fragment.generated';
import type { TestSessionFragmentFragment } from './testSession.fragment.generated';
import type { UserFragment } from '../user/user.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { PaginationFragmentDoc } from '../pagination.fragment.generated';
import { TestSessionFragmentFragmentDoc } from './testSession.fragment.generated';
import { UserFragmentDoc } from '../user/user.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PaginateTestSessionsQueryVariables = Types.Exact<{
  paginationInput?: Types.InputMaybe<Types.PaginationInput>;
  filterInput?: Types.InputMaybe<Types.TestSessionFilterInput>;
}>;


export type PaginateTestSessionsQuery = { __typename?: 'Query', paginatedTestSessions: { __typename?: 'PaginatedTestSession', pagination: (
      { __typename?: 'Pagination' }
      & PaginationFragment
    ), items: Array<(
      { __typename?: 'TestSession', test: { __typename?: 'Test', id: string, name: string, totalTime?: number | null } }
      & TestSessionFragmentFragment
    )> } };


export const PaginateTestSessionsDocument = gql`
    query PaginateTestSessions($paginationInput: PaginationInput, $filterInput: TestSessionFilterInput) {
  paginatedTestSessions(
    paginationInput: $paginationInput
    filterInput: $filterInput
  ) {
    pagination {
      ...Pagination
    }
    items {
      ...TestSessionFragment
      test {
        id
        name
        totalTime
      }
    }
  }
}
    ${PaginationFragmentDoc}
${TestSessionFragmentFragmentDoc}
${UserFragmentDoc}`;

/**
 * __usePaginateTestSessionsQuery__
 *
 * To run a query within a React component, call `usePaginateTestSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaginateTestSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaginateTestSessionsQuery({
 *   variables: {
 *      paginationInput: // value for 'paginationInput'
 *      filterInput: // value for 'filterInput'
 *   },
 * });
 */
export function usePaginateTestSessionsQuery(baseOptions?: Apollo.QueryHookOptions<PaginateTestSessionsQuery, PaginateTestSessionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaginateTestSessionsQuery, PaginateTestSessionsQueryVariables>(PaginateTestSessionsDocument, options);
      }
export function usePaginateTestSessionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaginateTestSessionsQuery, PaginateTestSessionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaginateTestSessionsQuery, PaginateTestSessionsQueryVariables>(PaginateTestSessionsDocument, options);
        }
export function usePaginateTestSessionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaginateTestSessionsQuery, PaginateTestSessionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaginateTestSessionsQuery, PaginateTestSessionsQueryVariables>(PaginateTestSessionsDocument, options);
        }
export type PaginateTestSessionsQueryHookResult = ReturnType<typeof usePaginateTestSessionsQuery>;
export type PaginateTestSessionsLazyQueryHookResult = ReturnType<typeof usePaginateTestSessionsLazyQuery>;
export type PaginateTestSessionsSuspenseQueryHookResult = ReturnType<typeof usePaginateTestSessionsSuspenseQuery>;
export type PaginateTestSessionsQueryResult = Apollo.QueryResult<PaginateTestSessionsQuery, PaginateTestSessionsQueryVariables>;
export function refetchPaginateTestSessionsQuery(variables?: PaginateTestSessionsQueryVariables) {
      return { query: PaginateTestSessionsDocument, variables: variables }
    }