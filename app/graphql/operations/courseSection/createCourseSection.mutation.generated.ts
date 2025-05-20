import type * as Types from '../../graphqlTypes';

import type { CourseSectionItemFragment } from './courseSection.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { CourseSectionItemFragmentDoc } from './courseSection.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateCourseSectionMutationVariables = Types.Exact<{
  input: Types.CreateCourseSectionInput;
}>;


export type CreateCourseSectionMutation = { __typename?: 'Mutation', createCourseSection: (
    { __typename?: 'CourseSection' }
    & CourseSectionItemFragment
  ) };


export const CreateCourseSectionDocument = gql`
    mutation CreateCourseSection($input: CreateCourseSectionInput!) {
  createCourseSection(input: $input) {
    ...CourseSectionItem
  }
}
    ${CourseSectionItemFragmentDoc}`;
export type CreateCourseSectionMutationFn = Apollo.MutationFunction<CreateCourseSectionMutation, CreateCourseSectionMutationVariables>;

/**
 * __useCreateCourseSectionMutation__
 *
 * To run a mutation, you first call `useCreateCourseSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCourseSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCourseSectionMutation, { data, loading, error }] = useCreateCourseSectionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCourseSectionMutation(baseOptions?: Apollo.MutationHookOptions<CreateCourseSectionMutation, CreateCourseSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCourseSectionMutation, CreateCourseSectionMutationVariables>(CreateCourseSectionDocument, options);
      }
export type CreateCourseSectionMutationHookResult = ReturnType<typeof useCreateCourseSectionMutation>;
export type CreateCourseSectionMutationResult = Apollo.MutationResult<CreateCourseSectionMutation>;
export type CreateCourseSectionMutationOptions = Apollo.BaseMutationOptions<CreateCourseSectionMutation, CreateCourseSectionMutationVariables>;