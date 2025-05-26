import type * as Types from '../../graphqlTypes';

import type { PaginationFragment } from '../pagination.fragment.generated';
import type { QuestionCollectionItemFragment } from './questionCollection.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { PaginationFragmentDoc } from '../pagination.fragment.generated';
import { QuestionCollectionItemFragmentDoc } from './questionCollection.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PaginateQuestionCollectionsQueryVariables = Types.Exact<{
  paginationInput?: Types.InputMaybe<Types.PaginationInput>;
}>;


export type PaginateQuestionCollectionsQuery = { __typename?: 'Query', paginatedQuestionCollections: { __typename?: 'PaginatedQuestionCollection', pagination: (
      { __typename?: 'Pagination' }
      & PaginationFragment
    ), items: Array<(
      { __typename?: 'QuestionCollection' }
      & QuestionCollectionItemFragment
    )> } };


export const PaginateQuestionCollectionsDocument = gql`
    query PaginateQuestionCollections($paginationInput: PaginationInput) {
  paginatedQuestionCollections(paginationInput: $paginationInput) {
    pagination {
      ...Pagination
    }
    items {
      ...QuestionCollectionItem
    }
  }
}
    ${PaginationFragmentDoc}
${QuestionCollectionItemFragmentDoc}`;

/**
 * __usePaginateQuestionCollectionsQuery__
 *
 * To run a query within a React component, call `usePaginateQuestionCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePaginateQuestionCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePaginateQuestionCollectionsQuery({
 *   variables: {
 *      paginationInput: // value for 'paginationInput'
 *   },
 * });
 */
export function usePaginateQuestionCollectionsQuery(baseOptions?: Apollo.QueryHookOptions<PaginateQuestionCollectionsQuery, PaginateQuestionCollectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PaginateQuestionCollectionsQuery, PaginateQuestionCollectionsQueryVariables>(PaginateQuestionCollectionsDocument, options);
      }
export function usePaginateQuestionCollectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PaginateQuestionCollectionsQuery, PaginateQuestionCollectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PaginateQuestionCollectionsQuery, PaginateQuestionCollectionsQueryVariables>(PaginateQuestionCollectionsDocument, options);
        }
export function usePaginateQuestionCollectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PaginateQuestionCollectionsQuery, PaginateQuestionCollectionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PaginateQuestionCollectionsQuery, PaginateQuestionCollectionsQueryVariables>(PaginateQuestionCollectionsDocument, options);
        }
export type PaginateQuestionCollectionsQueryHookResult = ReturnType<typeof usePaginateQuestionCollectionsQuery>;
export type PaginateQuestionCollectionsLazyQueryHookResult = ReturnType<typeof usePaginateQuestionCollectionsLazyQuery>;
export type PaginateQuestionCollectionsSuspenseQueryHookResult = ReturnType<typeof usePaginateQuestionCollectionsSuspenseQuery>;
export type PaginateQuestionCollectionsQueryResult = Apollo.QueryResult<PaginateQuestionCollectionsQuery, PaginateQuestionCollectionsQueryVariables>;
export function refetchPaginateQuestionCollectionsQuery(variables?: PaginateQuestionCollectionsQueryVariables) {
      return { query: PaginateQuestionCollectionsDocument, variables: variables }
    }