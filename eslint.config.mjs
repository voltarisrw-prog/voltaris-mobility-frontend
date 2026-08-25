import next from 'eslint-config-next';
import tseslint from 'typescript-eslint';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
  ...next,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      // The API client is fully typed; `any` anywhere is a contract that was skipped.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    rules: {
      // Sessions are httpOnly cookies. There is nothing to put in web storage, and
      // anything put there would be readable by any injected script.
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message:
            'Never store auth or sensitive state in localStorage. Sessions are httpOnly cookies.',
        },
        {
          name: 'sessionStorage',
          message:
            'Never store auth or sensitive state in sessionStorage. Sessions are httpOnly cookies.',
        },
      ],
    },
  },
];

export default config;
