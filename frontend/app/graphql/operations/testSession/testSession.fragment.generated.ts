import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type TestSessionFragmentFragment = { __typename?: 'TestSession', id: string, createdAt: string, updatedAt: string, startedAt?: string | null, completedAt?: string | null, expiredAt?: string | null, status: Types.TestSessionStatus, maxPoints: number, pointsEarned: number, testId: string, userId?: string | null };

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
}
    `;