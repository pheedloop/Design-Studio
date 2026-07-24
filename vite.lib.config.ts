import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Prefix compiled CSS layers (`@layer utilities` → `@layer pl-utilities`) so our
// precompiled Tailwind-v4 CSS survives a Tailwind-v3 host's PostCSS pipeline, which
// otherwise hard-errors on unclaimed `@layer utilities`. Runs in the build (not a
// post-build script) so it covers `dev:lib` watch rebuilds too.
function namespaceCssLayers() {
  return {
    name: "pl-namespace-css-layers",
    // Run after Vite's core css-post plugin has emitted the final CSS asset.
    enforce: "post" as const,
    generateBundle(
      _options: unknown,
      bundle: Record<
        string,
        { type: string; fileName: string; source?: string | Uint8Array }
      >,
    ) {
      for (const file of Object.values(bundle)) {
        if (file.type === "asset" && file.fileName.endsWith(".css")) {
          const source =
            typeof file.source === "string"
              ? file.source
              : new TextDecoder().decode(file.source);
          file.source = source.replace(
            /@layer(\s+)([a-z][a-z0-9, ]*)([{;])/gi,
            (_m, ws, names, term) =>
              "@layer" +
              ws +
              names
                .split(",")
                .map((n: string) => "pl-" + n.trim())
                .join(",") +
              term,
          );
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    namespaceCssLayers(),
    dts({
      tsconfigPath: "./tsconfig.lib.json",
      include: ["src/editor", "src/viewer", "src/seatviewer", "src/types"],
      insertTypesEntry: false,
    }),
  ],
  resolve: {
    // Prefer the ESM ("module" field) over CJS ("main") for packages that expose both.
    // This ensures react-icons and similar dual-format packages are bundled as ESM,
    // avoiding the rolldown CJS require() shim that throws in ESM environments.
    mainFields: ["module", "browser", "main"],
  },
  build: {
    lib: {
      entry: {
        editor: resolve(__dirname, "src/editor/index.ts"),
        viewer: resolve(__dirname, "src/viewer/index.ts"),
        seatviewer: resolve(__dirname, "src/seatviewer/index.ts"),
        // Style-only entry — produces dist/style.css consumed by the host app
        style: resolve(__dirname, "src/lib-style.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        /^react-dom\//,   // react-dom/server, react-dom/client, etc.
        "react/jsx-runtime",
        "konva",
        "react-konva",
      ],
      output: {
        assetFileNames: (info) =>
          info.name?.endsWith(".css") ? "style.css" : "assets/[name][extname]",
      },
    },
    cssCodeSplit: false,
    outDir: "dist",
    sourcemap: false,
    emptyOutDir: true,
  },
  // Point to the library CSS so Tailwind scans the right source files
  // and the output CSS is named style.css
  css: {
    postcss: {},
  },
});
