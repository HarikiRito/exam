import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type UserFragment = { __typename?: 'User', id: string, email: string, firstName?: string | null, lastName?: string | null, username: string, isActive: boolean, roles: Array<{ __typename?: 'Role', id: string, name: string }> };

export const UserFragmentDoc = gql`
    fragment User on User {
  id
  email
  firstName
  lastName
  roles {
    id
    name
  }
  username
  isActive
}
    `;