import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RemoveCourseSectionMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type RemoveCourseSectionMutation = { __typename?: 'Mutation', removeCourseSection: boolean };


export const RemoveCourseSectionDocument = gql`
    mutation RemoveCourseSection($id: ID!) {
  removeCourseSection(id: $id)
}
    `;
export type RemoveCourseSectionMutationFn = Apollo.MutationFunction<RemoveCourseSectionMutation, RemoveCourseSectionMutationVariables>;

/**
 * __useRemoveCourseSectionMutation__
 *
 * To run a mutation, you first call `useRemoveCourseSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCourseSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCourseSectionMutation, { data, loading, error }] = useRemoveCourseSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveCourseSectionMutation(baseOptions?: Apollo.MutationHookOptions<RemoveCourseSectionMutation, RemoveCourseSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveCourseSectionMutation, RemoveCourseSectionMutationVariables>(RemoveCourseSectionDocument, options);
      }
export type RemoveCourseSectionMutationHookResult = ReturnType<typeof useRemoveCourseSectionMutation>;
export type RemoveCourseSectionMutationResult = Apollo.MutationResult<RemoveCourseSectionMutation>;
export type RemoveCourseSectionMutationOptions = Apollo.BaseMutationOptions<RemoveCourseSectionMutation, RemoveCourseSectionMutationVariables>;