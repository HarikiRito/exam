import type * as Types from '../../graphqlTypes';

import type { CourseItemFragment } from './course.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { CourseItemFragmentDoc } from './course.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetCourseQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetCourseQuery = { __typename?: 'Query', course: (
    { __typename?: 'Course' }
    & CourseItemFragment
  ) };


export const GetCourseDocument = gql`
    query GetCourse($id: ID!) {
  course(id: $id) {
    ...CourseItem
  }
}
    ${CourseItemFragmentDoc}`;

/**
 * __useGetCourseQuery__
 *
 * To run a query within a React component, call `useGetCourseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCourseQuery(baseOptions: Apollo.QueryHookOptions<GetCourseQuery, GetCourseQueryVariables> & ({ variables: GetCourseQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCourseQuery, GetCourseQueryVariables>(GetCourseDocument, options);
      }
export function useGetCourseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCourseQuery, GetCourseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCourseQuery, GetCourseQueryVariables>(GetCourseDocument, options);
        }
export function useGetCourseSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCourseQuery, GetCourseQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCourseQuery, GetCourseQueryVariables>(GetCourseDocument, options);
        }
export type GetCourseQueryHookResult = ReturnType<typeof useGetCourseQuery>;
export type GetCourseLazyQueryHookResult = ReturnType<typeof useGetCourseLazyQuery>;
export type GetCourseSuspenseQueryHookResult = ReturnType<typeof useGetCourseSuspenseQuery>;
export type GetCourseQueryResult = Apollo.QueryResult<GetCourseQuery, GetCourseQueryVariables>;
export function refetchGetCourseQuery(variables: GetCourseQueryVariables) {
      return { query: GetCourseDocument, variables: variables }
    }