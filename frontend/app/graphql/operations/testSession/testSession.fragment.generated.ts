import type * as Types from '../../graphqlTypes';

import type { UserFragment } from '../user/user.fragment.generated';
import { gql } from '@apollo/client/index.js';
import { UserFragmentDoc } from '../user/user.fragment.generated';
export type TestSessionFragmentFragment = { __typename?: 'TestSession', id: string, createdAt: string, updatedAt: string, startedAt?: string | null, completedAt?: string | null, expiredAt?: string | null, status: Types.TestSessionStatus, maxPoints: number, pointsEarned: number, testId: string, userId?: string | null, user?: (
    { __typename?: 'User' }
    & UserFragment
  ) | null };

export const TestSessionFragmentFragmentDoc = gql`
    fragment TestSessionFragment on TestSession {
  id
  createdAt
  updatedAt
  startedAt
  completedAt
  expiredAt
  status
  maxPoints
  pointsEarned
  testId
  userId
  user {
    ...User
  }
}
    `;