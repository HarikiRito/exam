import * as Types from '../graphqlTypes';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TodoListQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type TodoListQuery = { __typename?: 'Query', todos: Array<{ __typename?: 'Todo', id: string, text: string }> };


export const TodoListDocument = gql`
    query TodoList {
  todos {
    id
    text
  }
}
    `;

/**
 * __useTodoListQuery__
 *
 * To run a query within a React component, call `useTodoListQuery` and pass it any options that fit your needs.
 * When your component renders, `useTodoListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTodoListQuery({
 *   variables: {
 *   },
 * });
 */
export function useTodoListQuery(baseOptions?: Apollo.QueryHookOptions<TodoListQuery, TodoListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TodoListQuery, TodoListQueryVariables>(TodoListDocument, options);
      }
export function useTodoListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TodoListQuery, TodoListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TodoListQuery, TodoListQueryVariables>(TodoListDocument, options);
        }
export function useTodoListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TodoListQuery, TodoListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TodoListQuery, TodoListQueryVariables>(TodoListDocument, options);
        }
export type TodoListQueryHookResult = ReturnType<typeof useTodoListQuery>;
export type TodoListLazyQueryHookResult = ReturnType<typeof useTodoListLazyQuery>;
export type TodoListSuspenseQueryHookResult = ReturnType<typeof useTodoListSuspenseQuery>;
export type TodoListQueryResult = Apollo.QueryResult<TodoListQuery, TodoListQueryVariables>;