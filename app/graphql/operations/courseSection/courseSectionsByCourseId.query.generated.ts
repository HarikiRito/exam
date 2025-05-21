import type * as Types from '../../graphqlTypes';

import type { CourseSectionItemFragment } from './courseSection.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { CourseSectionItemFragmentDoc } from './courseSection.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CourseSectionsByCourseIdQueryVariables = Types.Exact<{
  courseId: Types.Scalars['ID']['input'];
}>;


export type CourseSectionsByCourseIdQuery = { __typename?: 'Query', courseSectionsByCourseId: Array<(
    { __typename?: 'CourseSection' }
    & CourseSectionItemFragment
  )> };


export const CourseSectionsByCourseIdDocument = gql`
    query CourseSectionsByCourseId($courseId: ID!) {
  courseSectionsByCourseId(courseId: $courseId) {
    ...CourseSectionItem
  }
}
    ${CourseSectionItemFragmentDoc}`;

/**
 * __useCourseSectionsByCourseIdQuery__
 *
 * To run a query within a React component, call `useCourseSectionsByCourseIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useCourseSectionsByCourseIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCourseSectionsByCourseIdQuery({
 *   variables: {
 *      courseId: // value for 'courseId'
 *   },
 * });
 */
export function useCourseSectionsByCourseIdQuery(baseOptions: Apollo.QueryHookOptions<CourseSectionsByCourseIdQuery, CourseSectionsByCourseIdQueryVariables> & ({ variables: CourseSectionsByCourseIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CourseSectionsByCourseIdQuery, CourseSectionsByCourseIdQueryVariables>(CourseSectionsByCourseIdDocument, options);
      }
export function useCourseSectionsByCourseIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CourseSectionsByCourseIdQuery, CourseSectionsByCourseIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CourseSectionsByCourseIdQuery, CourseSectionsByCourseIdQueryVariables>(CourseSectionsByCourseIdDocument, options);
        }
export function useCourseSectionsByCourseIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CourseSectionsByCourseIdQuery, CourseSectionsByCourseIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CourseSectionsByCourseIdQuery, CourseSectionsByCourseIdQueryVariables>(CourseSectionsByCourseIdDocument, options);
        }
export type CourseSectionsByCourseIdQueryHookResult = ReturnType<typeof useCourseSectionsByCourseIdQuery>;
export type CourseSectionsByCourseIdLazyQueryHookResult = ReturnType<typeof useCourseSectionsByCourseIdLazyQuery>;
export type CourseSectionsByCourseIdSuspenseQueryHookResult = ReturnType<typeof useCourseSectionsByCourseIdSuspenseQuery>;
export type CourseSectionsByCourseIdQueryResult = Apollo.QueryResult<CourseSectionsByCourseIdQuery, CourseSectionsByCourseIdQueryVariables>;
export function refetchCourseSectionsByCourseIdQuery(variables: CourseSectionsByCourseIdQueryVariables) {
      return { query: CourseSectionsByCourseIdDocument, variables: variables }
    }