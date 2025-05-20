import type * as Types from '../../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type UserFragment = { __typename?: 'User', id: string, email: string };

export const UserFragmentDoc = gql`
    fragment User on User {
  id
  email
}
    `;