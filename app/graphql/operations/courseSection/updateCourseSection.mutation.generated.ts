import type * as Types from '../../graphqlTypes';

import type { CourseSectionItemFragment } from './courseSection.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { CourseSectionItemFragmentDoc } from './courseSection.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateCourseSectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Types.UpdateCourseSectionInput;
}>;


export type UpdateCourseSectionMutation = { __typename?: 'Mutation', updateCourseSection: (
    { __typename?: 'CourseSection' }
    & CourseSectionItemFragment
  ) };


export const UpdateCourseSectionDocument = gql`
    mutation UpdateCourseSection($id: ID!, $input: UpdateCourseSectionInput!) {
  updateCourseSection(id: $id, input: $input) {
    ...CourseSectionItem
  }
}
    ${CourseSectionItemFragmentDoc}`;
export type UpdateCourseSectionMutationFn = Apollo.MutationFunction<UpdateCourseSectionMutation, UpdateCourseSectionMutationVariables>;

/**
 * __useUpdateCourseSectionMutation__
 *
 * To run a mutation, you first call `useUpdateCourseSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCourseSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCourseSectionMutation, { data, loading, error }] = useUpdateCourseSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCourseSectionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCourseSectionMutation, UpdateCourseSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCourseSectionMutation, UpdateCourseSectionMutationVariables>(UpdateCourseSectionDocument, options);
      }
export type UpdateCourseSectionMutationHookResult = ReturnType<typeof useUpdateCourseSectionMutation>;
export type UpdateCourseSectionMutationResult = Apollo.MutationResult<UpdateCourseSectionMutation>;
export type UpdateCourseSectionMutationOptions = Apollo.BaseMutationOptions<UpdateCourseSectionMutation, UpdateCourseSectionMutationVariables>;