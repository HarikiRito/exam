import type * as Types from '../../graphqlTypes';

import type { QuestionItemFragment } from './question.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { QuestionItemFragmentDoc } from './question.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetQuestionsByIdsQueryVariables = Types.Exact<{
  ids: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
}>;


export type GetQuestionsByIdsQuery = { __typename?: 'Query', questions: Array<(
    { __typename?: 'Question', correctOptionCount: number, options: Array<{ __typename?: 'QuestionOption', id: string, optionText: string }> }
    & QuestionItemFragment
  )> };


export const GetQuestionsByIdsDocument = gql`
    query GetQuestionsByIds($ids: [ID!]!) {
  questions(ids: $ids) {
    ...QuestionItem
    options {
      id
      optionText
    }
    correctOptionCount
  }
}
    ${QuestionItemFragmentDoc}`;

/**
 * __useGetQuestionsByIdsQuery__
 *
 * To run a query within a React component, call `useGetQuestionsByIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionsByIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionsByIdsQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useGetQuestionsByIdsQuery(baseOptions: Apollo.QueryHookOptions<GetQuestionsByIdsQuery, GetQuestionsByIdsQueryVariables> & ({ variables: GetQuestionsByIdsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetQuestionsByIdsQuery, GetQuestionsByIdsQueryVariables>(GetQuestionsByIdsDocument, options);
      }
export function useGetQuestionsByIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetQuestionsByIdsQuery, GetQuestionsByIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetQuestionsByIdsQuery, GetQuestionsByIdsQueryVariables>(GetQuestionsByIdsDocument, options);
        }
export function useGetQuestionsByIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetQuestionsByIdsQuery, GetQuestionsByIdsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetQuestionsByIdsQuery, GetQuestionsByIdsQueryVariables>(GetQuestionsByIdsDocument, options);
        }
export type GetQuestionsByIdsQueryHookResult = ReturnType<typeof useGetQuestionsByIdsQuery>;
export type GetQuestionsByIdsLazyQueryHookResult = ReturnType<typeof useGetQuestionsByIdsLazyQuery>;
export type GetQuestionsByIdsSuspenseQueryHookResult = ReturnType<typeof useGetQuestionsByIdsSuspenseQuery>;
export type GetQuestionsByIdsQueryResult = Apollo.QueryResult<GetQuestionsByIdsQuery, GetQuestionsByIdsQueryVariables>;
export function refetchGetQuestionsByIdsQuery(variables: GetQuestionsByIdsQueryVariables) {
      return { query: GetQuestionsByIdsDocument, variables: variables }
    }