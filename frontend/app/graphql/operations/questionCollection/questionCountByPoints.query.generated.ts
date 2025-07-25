import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type QuestionCountByPointsQueryVariables = Types.Exact<{
  collectionIds: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
}>;


export type QuestionCountByPointsQuery = { __typename?: 'Query', questionCountByPoints: Array<{ __typename?: 'QuestionPointsCount', points: number, count: number }> };


export const QuestionCountByPointsDocument = gql`
    query QuestionCountByPoints($collectionIds: [ID!]!) {
  questionCountByPoints(collectionIds: $collectionIds) {
    points
    count
  }
}
    `;

/**
 * __useQuestionCountByPointsQuery__
 *
 * To run a query within a React component, call `useQuestionCountByPointsQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuestionCountByPointsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuestionCountByPointsQuery({
 *   variables: {
 *      collectionIds: // value for 'collectionIds'
 *   },
 * });
 */
export function useQuestionCountByPointsQuery(baseOptions: Apollo.QueryHookOptions<QuestionCountByPointsQuery, QuestionCountByPointsQueryVariables> & ({ variables: QuestionCountByPointsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<QuestionCountByPointsQuery, QuestionCountByPointsQueryVariables>(QuestionCountByPointsDocument, options);
      }
export function useQuestionCountByPointsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<QuestionCountByPointsQuery, QuestionCountByPointsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<QuestionCountByPointsQuery, QuestionCountByPointsQueryVariables>(QuestionCountByPointsDocument, options);
        }
export function useQuestionCountByPointsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<QuestionCountByPointsQuery, QuestionCountByPointsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<QuestionCountByPointsQuery, QuestionCountByPointsQueryVariables>(QuestionCountByPointsDocument, options);
        }
export type QuestionCountByPointsQueryHookResult = ReturnType<typeof useQuestionCountByPointsQuery>;
export type QuestionCountByPointsLazyQueryHookResult = ReturnType<typeof useQuestionCountByPointsLazyQuery>;
export type QuestionCountByPointsSuspenseQueryHookResult = ReturnType<typeof useQuestionCountByPointsSuspenseQuery>;
export type QuestionCountByPointsQueryResult = Apollo.QueryResult<QuestionCountByPointsQuery, QuestionCountByPointsQueryVariables>;
export function refetchQuestionCountByPointsQuery(variables: QuestionCountByPointsQueryVariables) {
      return { query: QuestionCountByPointsDocument, variables: variables }
    }