import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAllPermissionsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAllPermissionsQuery = { __typename?: 'Query', getAllPermissions: Array<Types.PermissionEnum> };


export const GetAllPermissionsDocument = gql`
    query GetAllPermissions {
  getAllPermissions
}
    `;

/**
 * __useGetAllPermissionsQuery__
 *
 * To run a query within a React component, call `useGetAllPermissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllPermissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllPermissionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllPermissionsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllPermissionsQuery, GetAllPermissionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllPermissionsQuery, GetAllPermissionsQueryVariables>(GetAllPermissionsDocument, options);
      }
export function useGetAllPermissionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllPermissionsQuery, GetAllPermissionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllPermissionsQuery, GetAllPermissionsQueryVariables>(GetAllPermissionsDocument, options);
        }
export function useGetAllPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllPermissionsQuery, GetAllPermissionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllPermissionsQuery, GetAllPermissionsQueryVariables>(GetAllPermissionsDocument, options);
        }
export type GetAllPermissionsQueryHookResult = ReturnType<typeof useGetAllPermissionsQuery>;
export type GetAllPermissionsLazyQueryHookResult = ReturnType<typeof useGetAllPermissionsLazyQuery>;
export type GetAllPermissionsSuspenseQueryHookResult = ReturnType<typeof useGetAllPermissionsSuspenseQuery>;
export type GetAllPermissionsQueryResult = Apollo.QueryResult<GetAllPermissionsQuery, GetAllPermissionsQueryVariables>;
export function refetchGetAllPermissionsQuery(variables?: GetAllPermissionsQueryVariables) {
      return { query: GetAllPermissionsDocument, variables: variables }
    }