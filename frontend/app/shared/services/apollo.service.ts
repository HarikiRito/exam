import { ApolloCache, ApolloClient, DocumentNode, NormalizedCacheObject } from '@apollo/client/index.js';
import client from 'app/shared/utils/apollo';
import { Kind } from 'graphql';

enum InvalidateCacheStrategy {
  Delete = 'DELETE',
  Invalidate = 'INVALIDATE',
}

type CacheModifiers = Parameters<ApolloCache<NormalizedCacheObject>['modify']>[0]['fields'];

export class ApolloService {
  constructor(private readonly client: ApolloClient<NormalizedCacheObject>) {}

  invalidateQueries(
    documents: DocumentNode[],
    options?: {
      strategy: InvalidateCacheStrategy;
    },
  ) {
    const fields: CacheModifiers = {};
    const { strategy } = options ?? {};
    for (const document of documents) {
      const operation = document.definitions.find((definition) => definition.kind === Kind.OPERATION_DEFINITION);
      if (!operation) {
        continue;
      }

      if (operation.selectionSet.kind !== Kind.SELECTION_SET) {
        continue;
      }

      const firstSelection = operation.selectionSet.selections[0];

      if (firstSelection?.kind !== Kind.FIELD || firstSelection.name.kind !== Kind.NAME) {
        continue;
      }

      fields[firstSelection.name.value] = (_, { DELETE, INVALIDATE }) => {
        if (strategy === InvalidateCacheStrategy.Invalidate) {
          return INVALIDATE;
        }

        return DELETE;
      };
    }

    this.client.cache.modify({
      fields,
    });
  }
}

export const apolloService = new ApolloService(client);
