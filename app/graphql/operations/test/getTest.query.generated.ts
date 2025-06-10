import type * as Types from '../../graphqlTypes';

import type { TestFragmentFragment } from './test.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { TestFragmentFragmentDoc } from './test.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTestQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetTestQuery = { __typename?: 'Query', test: (
    { __typename?: 'Test' }
    & TestFragmentFragment
  ) };


export const GetTestDocument = gql`
    query GetTest($id: ID!) {
  test(id: $id) {
    ...TestFragment
  }
}
    ${TestFragmentFragmentDoc}`;

/**
 * __useGetTestQuery__
 *
 * To run a query within a React component, call `useGetTestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTestQuery(baseOptions: Apollo.QueryHookOptions<GetTestQuery, GetTestQueryVariables> & ({ variables: GetTestQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTestQuery, GetTestQueryVariables>(GetTestDocument, options);
      }
export function useGetTestLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTestQuery, GetTestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTestQuery, GetTestQueryVariables>(GetTestDocument, options);
        }
export function useGetTestSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTestQuery, GetTestQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTestQuery, GetTestQueryVariables>(GetTestDocument, options);
        }
export type GetTestQueryHookResult = ReturnType<typeof useGetTestQuery>;
export type GetTestLazyQueryHookResult = ReturnType<typeof useGetTestLazyQuery>;
export type GetTestSuspenseQueryHookResult = ReturnType<typeof useGetTestSuspenseQuery>;
export type GetTestQueryResult = Apollo.QueryResult<GetTestQuery, GetTestQueryVariables>;
export function refetchGetTestQuery(variables: GetTestQueryVariables) {
      return { query: GetTestDocument, variables: variables }
    }