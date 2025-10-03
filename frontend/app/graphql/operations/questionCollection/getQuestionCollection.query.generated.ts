import type * as Types from '../../graphqlTypes';

import type { QuestionCollectionItemFragment } from './questionCollection.fragment.generated';
import type { QuestionItemFragment } from '../question/question.fragment.generated';
import type { QuestionOptionItemFragment } from '../question/questionOption.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { QuestionCollectionItemFragmentDoc } from './questionCollection.fragment.generated';
import { QuestionItemFragmentDoc } from '../question/question.fragment.generated';
import { QuestionOptionItemFragmentDoc } from '../question/questionOption.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetQuestionCollectionQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetQuestionCollectionQuery = { __typename?: 'Query', questionCollection: (
    { __typename?: 'QuestionCollection', questions: Array<(
      { __typename?: 'Question', options?: Array<(
        { __typename?: 'QuestionOption' }
        & QuestionOptionItemFragment
      )> | null }
      & QuestionItemFragment
    )> }
    & QuestionCollectionItemFragment
  ) };


export const GetQuestionCollectionDocument = gql`
    query GetQuestionCollection($id: ID!) {
  questionCollection(id: $id) {
    ...QuestionCollectionItem
    questions {
      ...QuestionItem
      options {
        ...QuestionOptionItem
      }
    }
  }
}
    ${QuestionCollectionItemFragmentDoc}
${QuestionItemFragmentDoc}
${QuestionOptionItemFragmentDoc}`;

/**
 * __useGetQuestionCollectionQuery__
 *
 * To run a query within a React component, call `useGetQuestionCollectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionCollectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionCollectionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetQuestionCollectionQuery(baseOptions: Apollo.QueryHookOptions<GetQuestionCollectionQuery, GetQuestionCollectionQueryVariables> & ({ variables: GetQuestionCollectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetQuestionCollectionQuery, GetQuestionCollectionQueryVariables>(GetQuestionCollectionDocument, options);
      }
export function useGetQuestionCollectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetQuestionCollectionQuery, GetQuestionCollectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetQuestionCollectionQuery, GetQuestionCollectionQueryVariables>(GetQuestionCollectionDocument, options);
        }
export function useGetQuestionCollectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetQuestionCollectionQuery, GetQuestionCollectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetQuestionCollectionQuery, GetQuestionCollectionQueryVariables>(GetQuestionCollectionDocument, options);
        }
export type GetQuestionCollectionQueryHookResult = ReturnType<typeof useGetQuestionCollectionQuery>;
export type GetQuestionCollectionLazyQueryHookResult = ReturnType<typeof useGetQuestionCollectionLazyQuery>;
export type GetQuestionCollectionSuspenseQueryHookResult = ReturnType<typeof useGetQuestionCollectionSuspenseQuery>;
export type GetQuestionCollectionQueryResult = Apollo.QueryResult<GetQuestionCollectionQuery, GetQuestionCollectionQueryVariables>;
export function refetchGetQuestionCollectionQuery(variables: GetQuestionCollectionQueryVariables) {
      return { query: GetQuestionCollectionDocument, variables: variables }
    }