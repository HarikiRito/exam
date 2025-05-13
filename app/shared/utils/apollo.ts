import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create an HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
});

// Create the Apollo Client instance
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client; 