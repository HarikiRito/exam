/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { ApolloProvider } from '@apollo/client';
import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import client from './shared/utils/apollo';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import * as stagewise from '@stagewise-plugins/react';

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <ApolloProvider client={client}>
        <StagewiseToolbar config={{ plugins: [stagewise.ReactPlugin] }} />
        <RemixBrowser />;
      </ApolloProvider>
    </StrictMode>,
  );
});
