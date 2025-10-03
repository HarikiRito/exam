import type * as Types from '../../graphqlTypes';

import type { TestSessionFragmentFragment } from './testSession.fragment.generated';
import type { UserFragment } from '../user/user.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { TestSessionFragmentFragmentDoc } from './testSession.fragment.generated';
import { UserFragmentDoc } from '../user/user.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTestSessionResultQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetTestSessionResultQuery = { __typename?: 'Query', testSessionResult: { __typename?: 'TestSessionResult', id: string, testSession: (
      { __typename?: 'TestSession', test: { __typename?: 'Test', id: string, name: string, totalTime?: number | null }, user?: { __typename?: 'User', id: string, email: string } | null }
      & TestSessionFragmentFragment
    ), questions: Array<{ __typename?: 'QuestionResult', isCorrect: boolean, selectedOptions?: Array<{ __typename?: 'SelectedOption', optionText: string }> | null, question: { __typename?: 'Question', id: string, questionText: string } }> } };


export const GetTestSessionResultDocument = gql`
    query GetTestSessionResult($id: ID!) {
  testSessionResult(id: $id) {
    id
    testSession {
      ...TestSessionFragment
      test {
        id
        name
        totalTime
      }
      user {
        id
        email
      }
    }
    questions {
      isCorrect
      selectedOptions {
        optionText
      }
      question {
        id
        questionText
      }
    }
  }
}
    ${TestSessionFragmentFragmentDoc}
${UserFragmentDoc}`;

/**
 * __useGetTestSessionResultQuery__
 *
 * To run a query within a React component, call `useGetTestSessionResultQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestSessionResultQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestSessionResultQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTestSessionResultQuery(baseOptions: Apollo.QueryHookOptions<GetTestSessionResultQuery, GetTestSessionResultQueryVariables> & ({ variables: GetTestSessionResultQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTestSessionResultQuery, GetTestSessionResultQueryVariables>(GetTestSessionResultDocument, options);
      }
export function useGetTestSessionResultLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTestSessionResultQuery, GetTestSessionResultQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTestSessionResultQuery, GetTestSessionResultQueryVariables>(GetTestSessionResultDocument, options);
        }
export function useGetTestSessionResultSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTestSessionResultQuery, GetTestSessionResultQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTestSessionResultQuery, GetTestSessionResultQueryVariables>(GetTestSessionResultDocument, options);
        }
export type GetTestSessionResultQueryHookResult = ReturnType<typeof useGetTestSessionResultQuery>;
export type GetTestSessionResultLazyQueryHookResult = ReturnType<typeof useGetTestSessionResultLazyQuery>;
export type GetTestSessionResultSuspenseQueryHookResult = ReturnType<typeof useGetTestSessionResultSuspenseQuery>;
export type GetTestSessionResultQueryResult = Apollo.QueryResult<GetTestSessionResultQuery, GetTestSessionResultQueryVariables>;
export function refetchGetTestSessionResultQuery(variables: GetTestSessionResultQueryVariables) {
      return { query: GetTestSessionResultDocument, variables: variables }
    }