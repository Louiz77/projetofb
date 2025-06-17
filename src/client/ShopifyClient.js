import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: `https://vanadus.myshopify.com/api/2025-04/graphql.json`, 
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': '50bec48fa70334a463de052a6f2d81a4',
  },
  cache: new InMemoryCache(),
    defaultOptions: {
    query: {
      fetchPolicy: "cache-first",
        },
    }
});

export default client;