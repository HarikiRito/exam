import type * as Types from '../graphqlTypes';

import { gql } from '@apollo/client/index.js';
export type PaginationFragment = { __typename?: 'Pagination', totalItems: number, totalPages: number, currentPage: number, hasNextPage: boolean, hasPreviousPage: boolean };

export const PaginationFragmentDoc = gql`
    fragment Pagination on Pagination {
  totalItems
  totalPages
  currentPage
  hasNextPage
  hasPreviousPage
}
    `;