import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateTestQuestionRequirementMutationVariables = Types.Exact<{
  testId: Types.Scalars['ID']['input'];
  input: Array<Types.UpdateTestQuestionRequirementInput> | Types.UpdateTestQuestionRequirementInput;
}>;


export type UpdateTestQuestionRequirementMutation = { __typename?: 'Mutation', updateTestQuestionRequirement: boolean };


export const UpdateTestQuestionRequirementDocument = gql`
    mutation UpdateTestQuestionRequirement($testId: ID!, $input: [UpdateTestQuestionRequirementInput!]!) {
  updateTestQuestionRequirement(testId: $testId, input: $input)
}
    `;
export type UpdateTestQuestionRequirementMutationFn = Apollo.MutationFunction<UpdateTestQuestionRequirementMutation, UpdateTestQuestionRequirementMutationVariables>;

/**
 * __useUpdateTestQuestionRequirementMutation__
 *
 * To run a mutation, you first call `useUpdateTestQuestionRequirementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTestQuestionRequirementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTestQuestionRequirementMutation, { data, loading, error }] = useUpdateTestQuestionRequirementMutation({
 *   variables: {
 *      testId: // value for 'testId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTestQuestionRequirementMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTestQuestionRequirementMutation, UpdateTestQuestionRequirementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTestQuestionRequirementMutation, UpdateTestQuestionRequirementMutationVariables>(UpdateTestQuestionRequirementDocument, options);
      }
export type UpdateTestQuestionRequirementMutationHookResult = ReturnType<typeof useUpdateTestQuestionRequirementMutation>;
export type UpdateTestQuestionRequirementMutationResult = Apollo.MutationResult<UpdateTestQuestionRequirementMutation>;
export type UpdateTestQuestionRequirementMutationOptions = Apollo.BaseMutationOptions<UpdateTestQuestionRequirementMutation, UpdateTestQuestionRequirementMutationVariables>;