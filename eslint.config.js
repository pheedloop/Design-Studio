import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
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
    rules: {
      // A console.log is debug residue by the time it reaches a PR. warn/error
      // stay allowed — those are deliberate diagnostics on a failure path (see
      // useDxfBackgroundHydration's catch).
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    // A CLI compatibility gate, run by hand — its console output is the point.
    files: ["src/badgeeditor/verify.ts"],
    rules: { "no-console": "off" },
  },
  {
    // Sorted within each namespace: predictable merges, findable keys.
    files: ["src/i18n/strings.ts"],
    rules: {
      "sort-keys": ["error", "asc", { caseSensitive: true, natural: false }],
    },
  },
]);
