import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import postcss from "postcss";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const WRAPPER = ".pl-map-editor";

// Rewrite a single compiled selector so it only matches inside the library's
// `.pl-map-editor` root — as the wrapper element itself AND/OR its descendants.
// Emitting both forms means a root like `<div class="pl-map-editor flex ...">`
// still gets its own utilities, while nested elements get theirs.
function scopeSelector(sel: string): string[] {
  const s = sel.trim();
  if (!s) return [];
  // Already library-scoped (e.g. lib.css's own `.pl-map-editor { --tokens }`).
  if (s.startsWith(WRAPPER)) return [s];
  // Theme tokens land on the wrapper (not global :root), so they can't collide
  // with the host app's own :root variables of the same name.
  if (s === ":root" || s === ":host" || s === "html" || s === "body") {
    return [WRAPPER];
  }
  // Universal reset (Tailwind's `--tw-*` defaults): wrapper + every descendant.
  if (s === "*") return [WRAPPER, `${WRAPPER} *`];
  // Class/id/attr/pseudo-leading: match the wrapper-with-that-class and descendants.
  if (/^[.#[:]/.test(s)) return [`${WRAPPER}${s}`, `${WRAPPER} ${s}`];
  // Bare element/other selectors: descendants only.
  return [`${WRAPPER} ${s}`];
}

// A component library must not leak its Tailwind utilities or theme tokens into the
// host app, nor lose the cascade to the host's preflight. This transform:
//   1. Unwraps all @layer blocks → the library's rules become UNLAYERED, which
//      outrank the host's layered preflight (unlayered beats any cascade layer),
//      so `border-*`/`px-*` win again — and it removes the `@layer utilities` a
//      Tailwind-v3 host's PostCSS chokes on.
//   2. Prefixes every selector with `.pl-map-editor` so the (now high-priority)
//      rules only apply inside the library's own subtree — no host collisions.
const scopeCssPlugin: postcss.PluginCreator<undefined> = () => ({
  postcssPlugin: "pl-scope-css",
  Once(root) {
    // Unwrap @layer (looping covers nested layers); drop `@layer a, b;` statements.
    let hasLayer = true;
    while (hasLayer) {
      hasLayer = false;
      root.walkAtRules("layer", (at) => {
        hasLayer = true;
        if (at.nodes) at.replaceWith(...at.nodes);
        else at.remove();
      });
    }
    root.walkRules((rule) => {
      const parent = rule.parent;
      // Leave @keyframes step selectors (`0%`, `to`, …) untouched.
      if (parent && parent.type === "atrule" && /keyframes$/i.test((parent as postcss.AtRule).name)) {
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
