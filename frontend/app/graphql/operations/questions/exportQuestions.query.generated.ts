import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExportQuestionsQueryVariables = Types.Exact<{
  questionIds: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
}>;


export type ExportQuestionsQuery = { __typename?: 'Query', exportQuestions: string };


export const ExportQuestionsDocument = gql`
    query ExportQuestions($questionIds: [ID!]!) {
  exportQuestions(questionIds: $questionIds)
}
    `;

/**
 * __useExportQuestionsQuery__
 *
 * To run a query within a React component, call `useExportQuestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExportQuestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExportQuestionsQuery({
 *   variables: {
 *      questionIds: // value for 'questionIds'
 *   },
 * });
 */
export function useExportQuestionsQuery(baseOptions: Apollo.QueryHookOptions<ExportQuestionsQuery, ExportQuestionsQueryVariables> & ({ variables: ExportQuestionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExportQuestionsQuery, ExportQuestionsQueryVariables>(ExportQuestionsDocument, options);
      }
export function useExportQuestionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExportQuestionsQuery, ExportQuestionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExportQuestionsQuery, ExportQuestionsQueryVariables>(ExportQuestionsDocument, options);
        }
export function useExportQuestionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ExportQuestionsQuery, ExportQuestionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ExportQuestionsQuery, ExportQuestionsQueryVariables>(ExportQuestionsDocument, options);
        }
export type ExportQuestionsQueryHookResult = ReturnType<typeof useExportQuestionsQuery>;
export type ExportQuestionsLazyQueryHookResult = ReturnType<typeof useExportQuestionsLazyQuery>;
export type ExportQuestionsSuspenseQueryHookResult = ReturnType<typeof useExportQuestionsSuspenseQuery>;
export type ExportQuestionsQueryResult = Apollo.QueryResult<ExportQuestionsQuery, ExportQuestionsQueryVariables>;
export function refetchExportQuestionsQuery(variables: ExportQuestionsQueryVariables) {
      return { query: ExportQuestionsDocument, variables: variables }
    }