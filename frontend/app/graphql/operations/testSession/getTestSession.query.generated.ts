import type * as Types from '../../graphqlTypes';

import type { TestSessionFragmentFragment } from './testSession.fragment.generated';
import type { UserFragment } from '../user/user.fragment.generated';
import type { TestFragmentFragment } from '../test/test.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { TestSessionFragmentFragmentDoc } from './testSession.fragment.generated';
import { UserFragmentDoc } from '../user/user.fragment.generated';
import { TestFragmentFragmentDoc } from '../test/test.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTestSessionQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetTestSessionQuery = { __typename?: 'Query', testSession: (
    { __typename?: 'TestSession', orderedQuestions: Array<{ __typename?: 'QuestionOrder', questionId: string, order: number }>, test: (
      { __typename?: 'Test' }
      & TestFragmentFragment
    ), questions: Array<{ __typename?: 'Question', id: string, questionText: string, correctOptionCount: number, options: Array<{ __typename?: 'QuestionOption', id: string, optionText: string }> }> }
    & TestSessionFragmentFragment
  ) };


export const GetTestSessionDocument = gql`
    query GetTestSession($id: ID!) {
  testSession(id: $id) {
    ...TestSessionFragment
    orderedQuestions {
      questionId
      order
    }
    test {
      ...TestFragment
    }
    questions {
      id
      questionText
      correctOptionCount
      options {
        id
        optionText
      }
    }
  }
}
    ${TestSessionFragmentFragmentDoc}
${UserFragmentDoc}
${TestFragmentFragmentDoc}`;

/**
 * __useGetTestSessionQuery__
 *
 * To run a query within a React component, call `useGetTestSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestSessionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTestSessionQuery(baseOptions: Apollo.QueryHookOptions<GetTestSessionQuery, GetTestSessionQueryVariables> & ({ variables: GetTestSessionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTestSessionQuery, GetTestSessionQueryVariables>(GetTestSessionDocument, options);
      }
export function useGetTestSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTestSessionQuery, GetTestSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTestSessionQuery, GetTestSessionQueryVariables>(GetTestSessionDocument, options);
        }
export function useGetTestSessionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTestSessionQuery, GetTestSessionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTestSessionQuery, GetTestSessionQueryVariables>(GetTestSessionDocument, options);
        }
export type GetTestSessionQueryHookResult = ReturnType<typeof useGetTestSessionQuery>;
export type GetTestSessionLazyQueryHookResult = ReturnType<typeof useGetTestSessionLazyQuery>;
export type GetTestSessionSuspenseQueryHookResult = ReturnType<typeof useGetTestSessionSuspenseQuery>;
export type GetTestSessionQueryResult = Apollo.QueryResult<GetTestSessionQuery, GetTestSessionQueryVariables>;
export function refetchGetTestSessionQuery(variables: GetTestSessionQueryVariables) {
      return { query: GetTestSessionDocument, variables: variables }
    }