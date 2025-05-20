import type * as Types from '../../graphqlTypes';

import type { CourseSectionItemFragment } from './courseSection.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { CourseSectionItemFragmentDoc } from './courseSection.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetCourseSectionQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetCourseSectionQuery = { __typename?: 'Query', courseSection: (
    { __typename?: 'CourseSection' }
    & CourseSectionItemFragment
  ) };


export const GetCourseSectionDocument = gql`
    query GetCourseSection($id: ID!) {
  courseSection(id: $id) {
    ...CourseSectionItem
  }
}
    ${CourseSectionItemFragmentDoc}`;

/**
 * __useGetCourseSectionQuery__
 *
 * To run a query within a React component, call `useGetCourseSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseSectionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCourseSectionQuery(baseOptions: Apollo.QueryHookOptions<GetCourseSectionQuery, GetCourseSectionQueryVariables> & ({ variables: GetCourseSectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCourseSectionQuery, GetCourseSectionQueryVariables>(GetCourseSectionDocument, options);
      }
export function useGetCourseSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCourseSectionQuery, GetCourseSectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCourseSectionQuery, GetCourseSectionQueryVariables>(GetCourseSectionDocument, options);
        }
export function useGetCourseSectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCourseSectionQuery, GetCourseSectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCourseSectionQuery, GetCourseSectionQueryVariables>(GetCourseSectionDocument, options);
        }
export type GetCourseSectionQueryHookResult = ReturnType<typeof useGetCourseSectionQuery>;
export type GetCourseSectionLazyQueryHookResult = ReturnType<typeof useGetCourseSectionLazyQuery>;
export type GetCourseSectionSuspenseQueryHookResult = ReturnType<typeof useGetCourseSectionSuspenseQuery>;
export type GetCourseSectionQueryResult = Apollo.QueryResult<GetCourseSectionQuery, GetCourseSectionQueryVariables>;
export function refetchGetCourseSectionQuery(variables: GetCourseSectionQueryVariables) {
      return { query: GetCourseSectionDocument, variables: variables }
    }