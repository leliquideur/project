import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    env: {
      browser: true,
      es2021: true,
      node: true
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended'
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    parser: '@typescript-eslint/parser',
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react': 'react',
      '@typescript-eslint': '@typescript-eslint'
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-warning-comments': [
        'error',
        {
          terms: ['A supprimer après les tests'],
          location: 'anywhere'
        }
      ],
      // Ajoutez d'autres règles ici
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
);
