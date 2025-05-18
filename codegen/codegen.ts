import type { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../.env' });

const config: CodegenConfig = {
  schema: process.env.VITE_GRAPHQL_URL || 'http://localhost:8082/graphql',
  documents: ['app/graphql/**/*.gql'],
  ignoreNoDocuments: true,
  generates: {
    'app/graphql/schema.json': {
      plugins: ['introspection'],
      config: {
        minify: false, // Set to true if you want a minified output
        descriptions: true,
      },
    },
    'app/graphql/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
        commentDescriptions: true,
      },
    },
    './app/graphql/graphqlTypes.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          DateTime: {
            input: 'string',
            output: 'string',
          },
        },
      },
    },
    './app/graphql/__generated__/': {
      preset: 'near-operation-file',
      presetConfig: {
        inlineFragmentTypes: 'mask',
        extension: '.generated.ts',
        baseTypesPath: '../graphqlTypes.ts',
      },
      plugins: ['typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        importWithTypeImport: true,
        apolloClientVersion: 3,
        // These options fix the fragment type generation
        inlineFragmentTypes: 'combine',
        dedupeFragments: true,
        scalars: {
          DateTime: {
            input: 'string',
            output: 'string',
          },
        },
        // exportFragmentSpreadSubTypes: true,
        // fragmentSuffix: 'Fragment',
      },
    },
  },
};

export default config;
