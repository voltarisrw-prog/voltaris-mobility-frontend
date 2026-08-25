import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/**
 * Flat config, wired from the underlying rule packages rather than the
 * `eslint-config-next` preset.
 *
 * The preset bundles its own `eslint-plugin-react`, which still calls
 * `context.getFilename()` — removed in ESLint 10 — so linting crashes on every
 * file. Composing the plugins directly keeps every rule that matters and gets us
 * onto a supported ESLint major, which is what the deprecation notice was about.
 *
 * What is kept: the Next.js correctness rules (`core-web-vitals`), the React
 * hooks rules, and the TypeScript rules. What is dropped: `eslint-plugin-react`'s
 * prop-types and JSX-style checks, which are aimed at untyped React — TypeScript
 * already covers that ground here.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },

  // Next.js rules. `core-web-vitals` is the stricter preset: it promotes things
  // like <img> over next/image from warning to error, which is the whole reason
  // to have it on an image-heavy marketplace.
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },

  // The hooks rules. Not cosmetic here: `set-state-in-effect` caught four real
  // cascading-render bugs in this codebase.
  //
  // Note `configs.flat[...]`, not `configs[...]`. The plugin still ships the
  // legacy eslintrc shape under the top-level key, where `plugins` is an array;
  // flat config requires an object and fails with a migration message that does
  // not say which config is at fault.
  reactHooks.configs.flat['recommended-latest'],

  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // The API client is fully typed; `any` anywhere is a contract that was skipped.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  {
    rules: {
      // Sessions are httpOnly cookies. There is nothing to put in web storage,
      // and anything put there is readable by any injected script.
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message: 'Never store auth or sensitive state in localStorage. Sessions are httpOnly cookies.',
        },
        {
          name: 'sessionStorage',
          message: 'Never store auth or sensitive state in sessionStorage. Sessions are httpOnly cookies.',
        },
      ],
    },
  },
];

export default config;
