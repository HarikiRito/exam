import type * as Types from '../../graphqlTypes';

import type { PaginationFragment } from '../pagination.fragment.generated';
import type { QuestionItemFragment } from './question.fragment.generated';
import type { QuestionOptionItemFragment } from './questionOption.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { PaginationFragmentDoc } from '../pagination.fragment.generated';
import { QuestionItemFragmentDoc } from './question.fragment.generated';
import { QuestionOptionItemFragmentDoc } from './questionOption.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PaginateQuestionsQueryVariables = Types.Exact<{
  paginationInput?: Types.InputMaybe<Types.PaginationInput>;
}>;


export type PaginateQuestionsQuery = { __typename?: 'Query', paginatedQuestions: { __typename?: 'PaginatedQuestion', pagination: (
      { __typename?: 'Pagination' }
      & PaginationFragment
    ), items: Array<(
      { __typename?: 'Question', options: Array<(
        { __typename?: 'QuestionOption' }
        & QuestionOptionItemFragment
      )> }
      & QuestionItemFragment
    )> } };


export const PaginateQuestionsDocument = gql`
    query PaginateQuestions($paginationInput: PaginationInput) {
  paginatedQuestions(paginationInput: $paginationInput) {
    pagination {
      ...Pagination
    }
    items {
      ...QuestionItem
      options {
        ...QuestionOptionItem
      }
    }
  }
}
    ${PaginationFragmentDoc}
${QuestionItemFragmentDoc}
${QuestionOptionItemFragmentDoc}`;

/**
 * __usePaginateQuestionsQuery__
 *
 * To run a query within a React component, call `usePaginateQuestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaginateQuestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaginateQuestionsQuery({
 *   variables: {
 *      paginationInput: // value for 'paginationInput'
 *   },
 * });
 */
export function usePaginateQuestionsQuery(baseOptions?: Apollo.QueryHookOptions<PaginateQuestionsQuery, PaginateQuestionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaginateQuestionsQuery, PaginateQuestionsQueryVariables>(PaginateQuestionsDocument, options);
      }
export function usePaginateQuestionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaginateQuestionsQuery, PaginateQuestionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaginateQuestionsQuery, PaginateQuestionsQueryVariables>(PaginateQuestionsDocument, options);
        }
export function usePaginateQuestionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaginateQuestionsQuery, PaginateQuestionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaginateQuestionsQuery, PaginateQuestionsQueryVariables>(PaginateQuestionsDocument, options);
        }
export type PaginateQuestionsQueryHookResult = ReturnType<typeof usePaginateQuestionsQuery>;
export type PaginateQuestionsLazyQueryHookResult = ReturnType<typeof usePaginateQuestionsLazyQuery>;
export type PaginateQuestionsSuspenseQueryHookResult = ReturnType<typeof usePaginateQuestionsSuspenseQuery>;
export type PaginateQuestionsQueryResult = Apollo.QueryResult<PaginateQuestionsQuery, PaginateQuestionsQueryVariables>;
export function refetchPaginateQuestionsQuery(variables?: PaginateQuestionsQueryVariables) {
      return { query: PaginateQuestionsDocument, variables: variables }
    }