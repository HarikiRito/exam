import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAllRolesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAllRolesQuery = { __typename?: 'Query', getAllRoles: Array<{ __typename?: 'Role', id: string, name: string }> };


export const GetAllRolesDocument = gql`
    query GetAllRoles {
  getAllRoles {
    id
    name
  }
}
    `;

/**
 * __useGetAllRolesQuery__
 *
 * To run a query within a React component, call `useGetAllRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllRolesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllRolesQuery(baseOptions?: Apollo.QueryHookOptions<GetAllRolesQuery, GetAllRolesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllRolesQuery, GetAllRolesQueryVariables>(GetAllRolesDocument, options);
      }
export function useGetAllRolesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllRolesQuery, GetAllRolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllRolesQuery, GetAllRolesQueryVariables>(GetAllRolesDocument, options);
        }
export function useGetAllRolesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllRolesQuery, GetAllRolesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllRolesQuery, GetAllRolesQueryVariables>(GetAllRolesDocument, options);
        }
export type GetAllRolesQueryHookResult = ReturnType<typeof useGetAllRolesQuery>;
export type GetAllRolesLazyQueryHookResult = ReturnType<typeof useGetAllRolesLazyQuery>;
export type GetAllRolesSuspenseQueryHookResult = ReturnType<typeof useGetAllRolesSuspenseQuery>;
export type GetAllRolesQueryResult = Apollo.QueryResult<GetAllRolesQuery, GetAllRolesQueryVariables>;
export function refetchGetAllRolesQuery(variables?: GetAllRolesQueryVariables) {
      return { query: GetAllRolesDocument, variables: variables }
    }