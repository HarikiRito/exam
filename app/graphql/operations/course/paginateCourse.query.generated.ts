import * as Types from '../../graphqlTypes';

import { PaginationFragment } from '../pagination.fragment.generated';
import { CourseItemFragment } from './course.fragment.generated';
import { gql } from '@apollo/client';
import { PaginationFragmentDoc } from '../pagination.fragment.generated';
import { CourseItemFragmentDoc } from './course.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PaginateCoursesQueryVariables = Types.Exact<{
  paginationInput?: Types.InputMaybe<Types.PaginationInput>;
}>;


export type PaginateCoursesQuery = { __typename?: 'Query', paginatedCourses: { __typename?: 'PaginatedCourse', pagination: (
      { __typename?: 'Pagination' }
      & PaginationFragment
    ), items: Array<(
      { __typename?: 'Course' }
      & CourseItemFragment
    )> } };


export const PaginateCoursesDocument = gql`
    query PaginateCourses($paginationInput: PaginationInput) {
  paginatedCourses(paginationInput: $paginationInput) {
    pagination {
      ...Pagination
    }
    items {
      ...CourseItem
    }
  }
}
    ${PaginationFragmentDoc}
${CourseItemFragmentDoc}`;

/**
 * __usePaginateCoursesQuery__
 *
 * To run a query within a React component, call `usePaginateCoursesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaginateCoursesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaginateCoursesQuery({
 *   variables: {
 *      paginationInput: // value for 'paginationInput'
 *   },
 * });
 */
export function usePaginateCoursesQuery(baseOptions?: Apollo.QueryHookOptions<PaginateCoursesQuery, PaginateCoursesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaginateCoursesQuery, PaginateCoursesQueryVariables>(PaginateCoursesDocument, options);
      }
export function usePaginateCoursesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaginateCoursesQuery, PaginateCoursesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaginateCoursesQuery, PaginateCoursesQueryVariables>(PaginateCoursesDocument, options);
        }
export function usePaginateCoursesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaginateCoursesQuery, PaginateCoursesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaginateCoursesQuery, PaginateCoursesQueryVariables>(PaginateCoursesDocument, options);
        }
export type PaginateCoursesQueryHookResult = ReturnType<typeof usePaginateCoursesQuery>;
export type PaginateCoursesLazyQueryHookResult = ReturnType<typeof usePaginateCoursesLazyQuery>;
export type PaginateCoursesSuspenseQueryHookResult = ReturnType<typeof usePaginateCoursesSuspenseQuery>;
export type PaginateCoursesQueryResult = Apollo.QueryResult<PaginateCoursesQuery, PaginateCoursesQueryVariables>;