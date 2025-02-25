// @ts-check
import js from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: js.configs.recommended,
//   allConfig: js.configs.all,
// });

export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...storybook.configs['flat/recommended'],
  eslintPluginPrettierRecommended,
  {
    ...perfectionist.configs['recommended-natural'],
    files: ['app/**/*.{tsx,ts}'],
    rules: {
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-enums': 'off',
    },
  },
  {
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    plugins: {
      react,
    },
    settings: {
      react: {
        version: '19',
      },
    },
    rules: {
      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
          children: 'ignore',
        },
      ],
    },
  },
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    files: ['app/**/*.{tsx,ts}'],
    ignores: ['!**/.server', '!**/.client', 'postcss.config.js'],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {},
    },
    rules: {
      // 'prettier/prettier': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',
      'react/prefer-read-only-props': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-misused-promises': 'off',
      'prefer-template': 'error',
      'no-console': [
        'warn',
        {
          allow: ['error', 'warn', 'info'],
        },
      ],
      eqeqeq: 'error',
      'no-restricted-imports': [
        'warn',
        {
          patterns: ['../../*'],
        },
      ],
    },
  },
];
