import type * as Types from '../../graphqlTypes';

import type { QuestionCollectionItemFragment } from './questionCollection.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { QuestionCollectionItemFragmentDoc } from './questionCollection.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateQuestionCollectionMutationVariables = Types.Exact<{
  input: Types.CreateQuestionCollectionInput;
}>;


export type CreateQuestionCollectionMutation = { __typename?: 'Mutation', createQuestionCollection: (
    { __typename?: 'QuestionCollection' }
    & QuestionCollectionItemFragment
  ) };


export const CreateQuestionCollectionDocument = gql`
    mutation CreateQuestionCollection($input: CreateQuestionCollectionInput!) {
  createQuestionCollection(input: $input) {
    ...QuestionCollectionItem
  }
}
    ${QuestionCollectionItemFragmentDoc}`;
export type CreateQuestionCollectionMutationFn = Apollo.MutationFunction<CreateQuestionCollectionMutation, CreateQuestionCollectionMutationVariables>;

/**
 * __useCreateQuestionCollectionMutation__
 *
 * To run a mutation, you first call `useCreateQuestionCollectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateQuestionCollectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createQuestionCollectionMutation, { data, loading, error }] = useCreateQuestionCollectionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateQuestionCollectionMutation(baseOptions?: Apollo.MutationHookOptions<CreateQuestionCollectionMutation, CreateQuestionCollectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateQuestionCollectionMutation, CreateQuestionCollectionMutationVariables>(CreateQuestionCollectionDocument, options);
      }
export type CreateQuestionCollectionMutationHookResult = ReturnType<typeof useCreateQuestionCollectionMutation>;
export type CreateQuestionCollectionMutationResult = Apollo.MutationResult<CreateQuestionCollectionMutation>;
export type CreateQuestionCollectionMutationOptions = Apollo.BaseMutationOptions<CreateQuestionCollectionMutation, CreateQuestionCollectionMutationVariables>;