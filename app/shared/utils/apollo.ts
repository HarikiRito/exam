import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { clientEnvironment } from 'app/shared/constants/environment';
import { CookieService, CookieKey } from 'app/shared/services/cookie.service';

// Create an HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: clientEnvironment.graphqlUrl,
});

// Authentication link to add token to requests
const authLink = setContext((_, { headers }) => {
  const token = CookieService.getValue(CookieKey.AccessToken);

  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  };
});

const link = authLink.concat(httpLink);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;
