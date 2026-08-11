import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // The merged manifest carries every surface's English, so a component that
    // imports it for its value drags the editor's strings into a viewer bundle.
    // Type-only imports are erased, so those stay allowed.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/i18n/strings'],
              allowTypeImports: true,
              message:
                "Take strings from your surface's i18n.ts (designStudioStrings, useT, resolveEnglish) — the merged manifest ships every surface's English.",
            },
          ],
        },
      ],
    },
  },
  {
    // Keep the manifest slices sorted so merges are predictable and a translator
    // can find a key by eye.
    files: ['src/i18n/strings.*.ts'],
    rules: {
      'sort-keys': ['error', 'asc', { caseSensitive: true, natural: false }],
    },
  },
  {
    // The `./i18n` subpath is the merged manifest's own entry point; src/demo
    // stands in for a host app and never ships; tests are not bundled at all.
    files: ['src/i18n/index.ts', 'src/demo/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': 'off',
    },
  },
])
