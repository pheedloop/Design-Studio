// Test config, kept separate from vite.config.ts (the demo app) and
// vite.lib.config.ts (the published library) so neither carries test concerns.
//
// Tests are co-located as *.test.ts(x) next to what they cover. They must never
// reach the package: tsconfig.lib.json and vite.lib.config.ts both exclude them,
// and scripts/verify-strings.ts skips them so their fixture keys are not mistaken
// for real manifest references.

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom for the context tests — provider inheritance and hook identity can
    // only be observed through an actual render.
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    // No globals: tests import describe/it/expect explicitly, matching the
    // repo's `verbatimModuleSyntax` explicitness elsewhere.
    globals: false,
  },
});
