import type * as Types from '../../graphqlTypes';

import type { QuestionItemFragment } from './question.fragment.generated';
import type { QuestionOptionItemFragment } from './questionOption.fragment.generated';
import type { QuestionCollectionItemFragment } from '../questionCollection/questionCollection.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { QuestionItemFragmentDoc } from './question.fragment.generated';
import { QuestionOptionItemFragmentDoc } from './questionOption.fragment.generated';
import { QuestionCollectionItemFragmentDoc } from '../questionCollection/questionCollection.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetQuestionQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetQuestionQuery = { __typename?: 'Query', question: (
    { __typename?: 'Question', options?: Array<(
      { __typename?: 'QuestionOption' }
      & QuestionOptionItemFragment
    )> | null, collection?: (
      { __typename?: 'QuestionCollection' }
      & QuestionCollectionItemFragment
    ) | null }
    & QuestionItemFragment
  ) };


export const GetQuestionDocument = gql`
    query GetQuestion($id: ID!) {
  question(id: $id) {
    ...QuestionItem
    options {
      ...QuestionOptionItem
    }
    collection {
      ...QuestionCollectionItem
    }
  }
}
    ${QuestionItemFragmentDoc}
${QuestionOptionItemFragmentDoc}
${QuestionCollectionItemFragmentDoc}`;

/**
 * __useGetQuestionQuery__
 *
 * To run a query within a React component, call `useGetQuestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetQuestionQuery(baseOptions: Apollo.QueryHookOptions<GetQuestionQuery, GetQuestionQueryVariables> & ({ variables: GetQuestionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetQuestionQuery, GetQuestionQueryVariables>(GetQuestionDocument, options);
      }
export function useGetQuestionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetQuestionQuery, GetQuestionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetQuestionQuery, GetQuestionQueryVariables>(GetQuestionDocument, options);
        }
export function useGetQuestionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetQuestionQuery, GetQuestionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetQuestionQuery, GetQuestionQueryVariables>(GetQuestionDocument, options);
        }
export type GetQuestionQueryHookResult = ReturnType<typeof useGetQuestionQuery>;
export type GetQuestionLazyQueryHookResult = ReturnType<typeof useGetQuestionLazyQuery>;
export type GetQuestionSuspenseQueryHookResult = ReturnType<typeof useGetQuestionSuspenseQuery>;
export type GetQuestionQueryResult = Apollo.QueryResult<GetQuestionQuery, GetQuestionQueryVariables>;
export function refetchGetQuestionQuery(variables: GetQuestionQueryVariables) {
      return { query: GetQuestionDocument, variables: variables }
    }