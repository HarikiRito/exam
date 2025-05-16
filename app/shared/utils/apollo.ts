import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { clientEnvironment } from 'app/shared/constants/environment';

// Create an HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: clientEnvironment.graphqlUrl,
});

// Authentication link to add token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');

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
