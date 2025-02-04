import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from "globals";
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier';
import storybook from 'eslint-plugin-storybook';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
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
  // eslintPluginPrettierRecommended,
  {
    ...perfectionist.configs['recommended-natural'],
    files: ['app/**/*.{tsx,ts}'],
    rules: {
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-enums': 'off',
    },
  },
  {
    plugins: {
      react,
    },
    rules: {
      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
          children: 'ignore',
        },
      ]
    },
  },
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    files: ['app/**/*.{tsx,ts}'],
    ignores: ["!**/.server", "!**/.client"],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // 'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',
      'react/prefer-read-only-props': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
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