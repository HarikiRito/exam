import type * as Types from '../../graphqlTypes';

import type { PaginationFragment } from '../pagination.fragment.generated';
import type { TestFragmentFragment } from './test.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { PaginationFragmentDoc } from '../pagination.fragment.generated';
import { TestFragmentFragmentDoc } from './test.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PaginateTestsQueryVariables = Types.Exact<{
  paginationInput?: Types.InputMaybe<Types.PaginationInput>;
}>;


export type PaginateTestsQuery = { __typename?: 'Query', paginatedTests: { __typename?: 'PaginatedTest', pagination: (
      { __typename?: 'Pagination' }
      & PaginationFragment
    ), items: Array<(
      { __typename?: 'Test' }
      & TestFragmentFragment
    )> } };


export const PaginateTestsDocument = gql`
    query PaginateTests($paginationInput: PaginationInput) {
  paginatedTests(paginationInput: $paginationInput) {
    pagination {
      ...Pagination
    }
    items {
      ...TestFragment
    }
  }
}
    ${PaginationFragmentDoc}
${TestFragmentFragmentDoc}`;

/**
 * __usePaginateTestsQuery__
 *
 * To run a query within a React component, call `usePaginateTestsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaginateTestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaginateTestsQuery({
 *   variables: {
 *      paginationInput: // value for 'paginationInput'
 *   },
 * });
 */
export function usePaginateTestsQuery(baseOptions?: Apollo.QueryHookOptions<PaginateTestsQuery, PaginateTestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaginateTestsQuery, PaginateTestsQueryVariables>(PaginateTestsDocument, options);
      }
export function usePaginateTestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaginateTestsQuery, PaginateTestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaginateTestsQuery, PaginateTestsQueryVariables>(PaginateTestsDocument, options);
        }
export function usePaginateTestsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaginateTestsQuery, PaginateTestsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaginateTestsQuery, PaginateTestsQueryVariables>(PaginateTestsDocument, options);
        }
export type PaginateTestsQueryHookResult = ReturnType<typeof usePaginateTestsQuery>;
export type PaginateTestsLazyQueryHookResult = ReturnType<typeof usePaginateTestsLazyQuery>;
export type PaginateTestsSuspenseQueryHookResult = ReturnType<typeof usePaginateTestsSuspenseQuery>;
export type PaginateTestsQueryResult = Apollo.QueryResult<PaginateTestsQuery, PaginateTestsQueryVariables>;
export function refetchPaginateTestsQuery(variables?: PaginateTestsQueryVariables) {
      return { query: PaginateTestsDocument, variables: variables }
    }