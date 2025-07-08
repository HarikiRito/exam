import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type TestFragmentFragment = { __typename?: 'Test', id: string, name: string, totalTime?: number | null };

export const TestFragmentFragmentDoc = gql`
    fragment TestFragment on Test {
  id
  name
  totalTime
}
    `;