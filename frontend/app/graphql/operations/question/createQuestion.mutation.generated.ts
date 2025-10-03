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
export type CreateQuestionMutationVariables = Types.Exact<{
  input: Types.CreateQuestionInput;
}>;


export type CreateQuestionMutation = { __typename?: 'Mutation', createQuestion: (
    { __typename?: 'Question', options?: Array<(
      { __typename?: 'QuestionOption' }
      & QuestionOptionItemFragment
    )> | null, collection?: (
      { __typename?: 'QuestionCollection' }
      & QuestionCollectionItemFragment
    ) | null }
    & QuestionItemFragment
  ) };


export const CreateQuestionDocument = gql`
    mutation CreateQuestion($input: CreateQuestionInput!) {
  createQuestion(input: $input) {
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
export type CreateQuestionMutationFn = Apollo.MutationFunction<CreateQuestionMutation, CreateQuestionMutationVariables>;

/**
 * __useCreateQuestionMutation__
 *
 * To run a mutation, you first call `useCreateQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createQuestionMutation, { data, loading, error }] = useCreateQuestionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateQuestionMutation(baseOptions?: Apollo.MutationHookOptions<CreateQuestionMutation, CreateQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateQuestionMutation, CreateQuestionMutationVariables>(CreateQuestionDocument, options);
      }
export type CreateQuestionMutationHookResult = ReturnType<typeof useCreateQuestionMutation>;
export type CreateQuestionMutationResult = Apollo.MutationResult<CreateQuestionMutation>;
export type CreateQuestionMutationOptions = Apollo.BaseMutationOptions<CreateQuestionMutation, CreateQuestionMutationVariables>;