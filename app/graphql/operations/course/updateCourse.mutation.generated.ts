import type * as Types from '../../graphqlTypes';

import type { CourseItemFragment } from './course.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { CourseItemFragmentDoc } from './course.fragment.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateCourseMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Types.UpdateCourseInput;
}>;


export type UpdateCourseMutation = { __typename?: 'Mutation', updateCourse: (
    { __typename?: 'Course' }
    & CourseItemFragment
  ) };


export const UpdateCourseDocument = gql`
    mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
  updateCourse(id: $id, input: $input) {
    ...CourseItem
  }
}
    ${CourseItemFragmentDoc}`;
export type UpdateCourseMutationFn = Apollo.MutationFunction<UpdateCourseMutation, UpdateCourseMutationVariables>;

/**
 * __useUpdateCourseMutation__
 *
 * To run a mutation, you first call `useUpdateCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCourseMutation, { data, loading, error }] = useUpdateCourseMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCourseMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCourseMutation, UpdateCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCourseMutation, UpdateCourseMutationVariables>(UpdateCourseDocument, options);
      }
export type UpdateCourseMutationHookResult = ReturnType<typeof useUpdateCourseMutation>;
export type UpdateCourseMutationResult = Apollo.MutationResult<UpdateCourseMutation>;
export type UpdateCourseMutationOptions = Apollo.BaseMutationOptions<UpdateCourseMutation, UpdateCourseMutationVariables>;