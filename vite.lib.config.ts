import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import postcss from "postcss";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const WRAPPER = ".pl-map-editor";
// Matches the wrapper element and its descendants in one selector. :is() takes
// the specificity of its most specific argument, both of which are a single
// class here, so `SCOPE.foo` scores the same (0,2,0) as the `WRAPPERfoo,
// WRAPPER foo` pair it replaces.
const SCOPE = `:is(${WRAPPER}, ${WRAPPER} *)`;

// Rewrite a compiled selector to match only inside `.pl-map-editor` — as both the
// wrapper element and its descendants (so the root div gets its own utilities too).
function scopeSelector(sel: string): string[] {
  const s = sel.trim();
  if (!s) return [];
  if (s.includes(WRAPPER)) return [s];
  // Map :root/html/body → wrapper so theme tokens can't collide with the host's :root.
  if (s === ":root" || s === ":host" || s === "html" || s === "body") {
    return [WRAPPER];
  }
  if (s === "*") return [SCOPE];
  if (/^[.#[:]/.test(s)) return [`${SCOPE}${s}`];
  return [`${WRAPPER} ${s}`];
}

// Unwrap every @layer so the library's rules go UNLAYERED — unlayered beats any
// host cascade layer, so utilities win again and a Tailwind-v3 host's PostCSS
// won't choke on `@layer utilities` — then scope every selector under .pl-map-editor.
const scopeCssPlugin: postcss.PluginCreator<undefined> = () => ({
  postcssPlugin: "pl-scope-css",
  Once(root) {
    // Unwrap @layer (looping covers nested layers); drop `@layer a, b;` statements.
    let hasLayer = true;
    while (hasLayer) {
      hasLayer = false;
      root.walkAtRules("layer", at => {
        hasLayer = true;
        if (at.nodes) at.replaceWith(...at.nodes);
        else at.remove();
      });
    }
    root.walkRules(rule => {
      const parent = rule.parent;
      // Leave @keyframes step selectors (`0%`, `to`, …) untouched.
      if (
        parent &&
        parent.type === "atrule" &&
        /keyframes$/i.test((parent as postcss.AtRule).name)
      ) {
        return;
      }
      const scoped = new Set<string>();
      for (const s of rule.selectors) {
        for (const out of scopeSelector(s)) scoped.add(out);
      }
      rule.selectors = [...scoped];
    });
  },
});
scopeCssPlugin.postcss = true;

function scopeCss() {
  return {
    name: "pl-scope-css",
    // Run after Vite's core css-post plugin has emitted the final CSS asset.
    enforce: "post" as const,
    async generateBundle(
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
          const result = await postcss([scopeCssPlugin()]).process(source, {
            from: undefined,
          });
          file.source = result.css;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    scopeCss(),
    dts({
      tsconfigPath: "./tsconfig.lib.json",
      // Keep in sync with tsconfig.lib.json's `include`.
      include: [
        "src/editor",
        "src/viewer",
        "src/seatviewer",
        "src/components",
        "src/hooks",
        "src/types",
        "src/i18n",
        "src/utils",
        "src/tiers.ts",
      ],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      insertTypesEntry: false,
    }),
  ],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
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
        // Merged English manifest, for host build steps.
        i18n: resolve(__dirname, "src/i18n/index.ts"),
        // Style-only entry — produces dist/style.css consumed by the host app
        style: resolve(__dirname, "src/lib-style.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        /^react-dom\//, // react-dom/server, react-dom/client, etc.
        "react/jsx-runtime",
        "konva",
        "react-konva",
      ],
      output: {
        assetFileNames: info =>
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
