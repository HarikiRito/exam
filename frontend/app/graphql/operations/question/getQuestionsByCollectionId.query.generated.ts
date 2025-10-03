import type * as Types from '../../graphqlTypes';

import type { QuestionCollectionItemFragment } from '../questionCollection/questionCollection.fragment.generated';
import type { QuestionItemFragment } from './question.fragment.generated';
import type { QuestionOptionItemFragment } from './questionOption.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { QuestionCollectionItemFragmentDoc } from '../questionCollection/questionCollection.fragment.generated';
import { QuestionItemFragmentDoc } from './question.fragment.generated';
import { QuestionOptionItemFragmentDoc } from './questionOption.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetQuestionsByCollectionIdQueryVariables = Types.Exact<{
  collectionId: Types.Scalars['ID']['input'];
}>;


export type GetQuestionsByCollectionIdQuery = { __typename?: 'Query', questionCollection: (
    { __typename?: 'QuestionCollection', questions: Array<(
      { __typename?: 'Question', options?: Array<(
        { __typename?: 'QuestionOption' }
        & QuestionOptionItemFragment
      )> | null }
      & QuestionItemFragment
    )> }
    & QuestionCollectionItemFragment
  ) };


export const GetQuestionsByCollectionIdDocument = gql`
    query GetQuestionsByCollectionId($collectionId: ID!) {
  questionCollection(id: $collectionId) {
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
 * __useGetQuestionsByCollectionIdQuery__
 *
 * To run a query within a React component, call `useGetQuestionsByCollectionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionsByCollectionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionsByCollectionIdQuery({
 *   variables: {
 *      collectionId: // value for 'collectionId'
 *   },
 * });
 */
export function useGetQuestionsByCollectionIdQuery(baseOptions: Apollo.QueryHookOptions<GetQuestionsByCollectionIdQuery, GetQuestionsByCollectionIdQueryVariables> & ({ variables: GetQuestionsByCollectionIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetQuestionsByCollectionIdQuery, GetQuestionsByCollectionIdQueryVariables>(GetQuestionsByCollectionIdDocument, options);
      }
export function useGetQuestionsByCollectionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetQuestionsByCollectionIdQuery, GetQuestionsByCollectionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetQuestionsByCollectionIdQuery, GetQuestionsByCollectionIdQueryVariables>(GetQuestionsByCollectionIdDocument, options);
        }
export function useGetQuestionsByCollectionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetQuestionsByCollectionIdQuery, GetQuestionsByCollectionIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetQuestionsByCollectionIdQuery, GetQuestionsByCollectionIdQueryVariables>(GetQuestionsByCollectionIdDocument, options);
        }
export type GetQuestionsByCollectionIdQueryHookResult = ReturnType<typeof useGetQuestionsByCollectionIdQuery>;
export type GetQuestionsByCollectionIdLazyQueryHookResult = ReturnType<typeof useGetQuestionsByCollectionIdLazyQuery>;
export type GetQuestionsByCollectionIdSuspenseQueryHookResult = ReturnType<typeof useGetQuestionsByCollectionIdSuspenseQuery>;
export type GetQuestionsByCollectionIdQueryResult = Apollo.QueryResult<GetQuestionsByCollectionIdQuery, GetQuestionsByCollectionIdQueryVariables>;
export function refetchGetQuestionsByCollectionIdQuery(variables: GetQuestionsByCollectionIdQueryVariables) {
      return { query: GetQuestionsByCollectionIdDocument, variables: variables }
    }