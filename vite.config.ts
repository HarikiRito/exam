/// <reference types="vitest" />
import { vitePlugin as remix } from '@remix-run/dev';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';
import tsconfigPaths from 'vite-tsconfig-paths';
const ReactCompilerConfig = {
  sources: (filename: string) => {
    return filename.indexOf('app') !== -1;
  },
};
declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true;
  }
}

/**
 * https://akoskm.com/react-router-vitest-example/
 * Vitest not working with react-router and since remix is using react-router internally,
 * we need to disable remix when running tests.
 */
const isVitest = Boolean(process.env.VITEST);

export default defineConfig({
  ssr: {
    // noExternal: true,
  },
  plugins: [
    !isVitest &&
      remix({
        ssr: false,
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
        routes(defineRoutes) {
          return flatRoutes('routes', defineRoutes, {
            ignoredRouteFiles: ['**/.*'], // Ignore dot files (like .DS_Store)
          });
        },
      }),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'], // if you use TypeScript
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './app/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', 'build', 'public', 'app/graphql'],
      include: ['app/**/*.{ts,tsx}'],
    },
  },
});
