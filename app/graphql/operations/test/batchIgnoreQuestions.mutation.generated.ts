import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type BatchIgnoreQuestionsMutationVariables = Types.Exact<{
  input: Types.BatchIgnoreQuestionsInput;
}>;


export type BatchIgnoreQuestionsMutation = { __typename?: 'Mutation', batchIgnoreQuestions: boolean };


export const BatchIgnoreQuestionsDocument = gql`
    mutation BatchIgnoreQuestions($input: BatchIgnoreQuestionsInput!) {
  batchIgnoreQuestions(input: $input)
}
    `;
export type BatchIgnoreQuestionsMutationFn = Apollo.MutationFunction<BatchIgnoreQuestionsMutation, BatchIgnoreQuestionsMutationVariables>;

/**
 * __useBatchIgnoreQuestionsMutation__
 *
 * To run a mutation, you first call `useBatchIgnoreQuestionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBatchIgnoreQuestionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [batchIgnoreQuestionsMutation, { data, loading, error }] = useBatchIgnoreQuestionsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBatchIgnoreQuestionsMutation(baseOptions?: Apollo.MutationHookOptions<BatchIgnoreQuestionsMutation, BatchIgnoreQuestionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BatchIgnoreQuestionsMutation, BatchIgnoreQuestionsMutationVariables>(BatchIgnoreQuestionsDocument, options);
      }
export type BatchIgnoreQuestionsMutationHookResult = ReturnType<typeof useBatchIgnoreQuestionsMutation>;
export type BatchIgnoreQuestionsMutationResult = Apollo.MutationResult<BatchIgnoreQuestionsMutation>;
export type BatchIgnoreQuestionsMutationOptions = Apollo.BaseMutationOptions<BatchIgnoreQuestionsMutation, BatchIgnoreQuestionsMutationVariables>;