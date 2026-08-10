// ---------------------------------------------------------------------------
// i18n manifest gate (no test runner in this repo — run via the Makefile):
//   make verify-strings
//
// Checks the string manifest against the source that uses it, and against the
// emitted declaration files. The TypeScript StringKey union already makes a
// typo'd key a compile error; this covers what a type cannot see — dead keys,
// namespace leaks across surfaces, malformed manifest entries, and dangling
// imports in dist/.
//
// This script deliberately IMPORTS NOTHING from src/. Two reasons:
//   1. src/badgeeditor/verify.ts documents `node src/badgeeditor/verify.ts` but
//      does not actually run — Node's TS resolver does not follow extensionless
//      relative specifiers, so it dies before its first assertion. Parsing text
//      sidesteps the whole problem.
//   2. Reading the manifest as text lets us enforce FORMAT — sort order, one
//      entry per line — which a runtime import cannot observe.
//
// The format contract for src/i18n/strings.<surface>.ts is therefore load-bearing:
//   ^  "some.key": "English text",$
// ---------------------------------------------------------------------------

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

/** Which manifest file owns which namespace, and where its keys may be used. */
const SLICES: Record<string, { file: string; dirs: string[] }> = {
  // `common.*` is for modules imported ACROSS surface directories — src/utils/*,
  // and the src/editor canvas components the viewers pull in. Usable anywhere.
  common: { file: "src/i18n/strings.common.ts", dirs: ["src"] },
  viewer: { file: "src/i18n/strings.viewer.ts", dirs: ["src/viewer"] },
  seatviewer: { file: "src/i18n/strings.seatviewer.ts", dirs: ["src/seatviewer"] },
  editor: { file: "src/i18n/strings.editor.ts", dirs: ["src/editor"] },
  badgeeditor: { file: "src/i18n/strings.badgeeditor.ts", dirs: ["src/badgeeditor"] },
};

// Modules that render under whichever surface's provider happens to be mounted,
// because more than one surface imports them. Their strings must be `common.*`
// or the English fallback silently disappears depending on the entry point.
const CROSS_SURFACE = new Set([
  "src/utils/unitConversion.ts",
  "src/viewer/components/ViewerElement.tsx",
  "src/editor/components/canvas/BackgroundImage.tsx",
  "src/editor/components/canvas/DxfDrawing.tsx",
  "src/editor/utils/iconRegistry.ts",
]);

// Intentional same-English-different-key pairs. Charmander's UGC catalog is keyed
// by the English string, so two keys with identical English ALWAYS resolve to the
// same translation there — a split buys nothing unless the English diverges too.
// Anything listed here is a deliberate exception with a stated reason.
const ALLOWED_DUPES: Record<string, string> = {};

const ENTRY = /^ {2}"([a-z][A-Za-z0-9_.]*)": "((?:[^"\\]|\\.)*)",$/;
/** t("key") / t("key", { … }) */
const CALL = /\bt\(\s*"([a-z][A-Za-z0-9_.]*)"/g;
/** Keys carried as data on module-level tables, translated at the render site. */
const DATA_KEY = /\b(?:labelKey|categoryKey|titleKey|hintKey|fallbackKey)\s*:\s*"([a-z][A-Za-z0-9_.]*)"/g;

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

// --- load the manifest, enforcing format ------------------------------------

const english = new Map<string, string>();
const sliceOf = new Map<string, string>();

for (const [slice, { file }] of Object.entries(SLICES)) {
  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
  let previous = "";
  lines.forEach((line, i) => {
    if (!line.startsWith('  "')) return; // banners, braces, the export statement
    const at = `${file}:${i + 1}`;
    const match = ENTRY.exec(line);
    if (!match) {
      fail(`${at} malformed entry — expected one   "key": "English",   per line`);
      return;
    }
    const [, key, value] = match;
    if (english.has(key)) {
      fail(`${at} duplicate key "${key}" (also in ${sliceOf.get(key)}) — the merge drops one silently`);
    }
    if (key <= previous) {
      fail(`${at} out of order — "${key}" follows "${previous}"`);
    }
    if (!key.startsWith(`${slice}.`)) {
      fail(`${at} "${key}" must start with "${slice}."`);
    }
    if (value.trim() === "") {
      fail(`${at} "${key}" has empty English — English is the guaranteed fallback`);
    }
    if (value !== value.trim()) {
      fail(`${at} "${key}" has leading or trailing whitespace`);
    }
    if (value.includes("...")) {
      fail(`${at} "${key}" uses "..." — use the ellipsis character …`);
    }
    english.set(key, value);
    sliceOf.set(key, slice);
    previous = key;
  });
}

// --- plural pairing ---------------------------------------------------------

const pluralBases = new Set<string>();
for (const key of english.keys()) {
  const isOne = key.endsWith("_one");
  if (!isOne && !key.endsWith("_other")) continue;
  const base = key.slice(0, key.lastIndexOf("_"));
  pluralBases.add(base);
  const mate = isOne ? `${base}_other` : `${base}_one`;
  if (!english.has(mate)) fail(`plural "${key}" has no matching "${mate}"`);
  if (english.has(base)) fail(`plural base "${base}" must not also exist unsuffixed`);
}

/** The keys t() may legally be called with — variants collapse to their base. */
const callable = new Set<string>([
  ...[...english.keys()].filter((k) => !/_one$|_other$/.test(k)),
  ...pluralBases,
]);

// --- duplicate English ------------------------------------------------------

const byEnglish = new Map<string, string[]>();
for (const [key, value] of english) {
  byEnglish.set(value, [...(byEnglish.get(value) ?? []), key]);
}
for (const [value, keys] of byEnglish) {
  if (keys.length < 2) continue;
  if (keys.every((k) => k in ALLOWED_DUPES)) continue;
  fail(
    `${keys.length} keys share the English "${value}" (${keys.join(", ")}) — ` +
      `merge them, or add each to ALLOWED_DUPES with a reason`,
  );
}

// --- walk the source --------------------------------------------------------

const used = new Set<string>();

function walk(dir: string): void {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.tsx?$/.test(path)) continue;

    const rel = relative(ROOT, path);
    if (rel.startsWith("src/i18n/strings")) continue; // the manifest itself
    // Tests exercise the resolution machinery with fixture keys that are not,
    // and should not be, in the manifest.
    if (/\.test\.tsx?$/.test(rel)) continue;
    const text = readFileSync(path, "utf8");

    // The merged manifest must stay out of component bundles: it is one object
    // literal, and Rollup does not tree-shake object properties, so importing it
    // anywhere under a surface ships every other surface's English along with it.
    // Type-only imports are erased, so they are fine. src/demo never ships.
    const importsMerged = /^(?!.*\b(?:import|export) type\b).*from ["'][^"']*i18n\/strings["']/m.test(text);
    if (importsMerged && rel !== "src/i18n/index.ts" && !rel.startsWith("src/demo/")) {
      fail(`${rel} imports the merged manifest for its value — use this surface's slice instead`);
    }

    for (const pattern of [CALL, DATA_KEY]) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const key = match[1];
        used.add(key);

        if (!callable.has(key)) {
          fail(`${rel} references unknown key "${key}"`);
          continue;
        }
        const namespace = key.slice(0, key.indexOf("."));
        if (namespace === "common") continue;

        if (CROSS_SURFACE.has(rel)) {
          fail(`${rel} is imported across surfaces — "${key}" must be a common.* key`);
          continue;
        }
        const allowed = SLICES[namespace].dirs;
        if (!allowed.some((d) => rel.startsWith(d))) {
          fail(`${rel} uses "${key}" but lives outside ${allowed.join(", ")}`);
        }
      }
    }
  }
}

walk(SRC);

// --- dead keys --------------------------------------------------------------

for (const key of callable) {
  if (!used.has(key)) fail(`dead key "${key}" — in the manifest, referenced nowhere`);
}

// --- emitted declarations resolve -------------------------------------------
//
// dist/tiers.d.ts was missing for months while five shipped .d.ts files imported
// it; only skipLibCheck kept hosts from noticing. Now that the props type every
// host instantiates imports from src/i18n, a repeat would be a hard error.

const dist = join(ROOT, "dist");
let checkedDecls = 0;

function checkDecls(dir: string): void {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      checkDecls(path);
      continue;
    }
    if (!path.endsWith(".d.ts")) continue;
    checkedDecls++;
    const text = readFileSync(path, "utf8");
    for (const match of text.matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const target = resolve(dir, match[1]);
      const isFile = (p: string) => {
        try {
          return statSync(p).isFile();
        } catch {
          return false;
        }
      };
      const asDeclaration = isFile(`${target}.d.ts`);
      const asDirectory = isFile(join(target, "index.d.ts"));

      if (!asDeclaration && !asDirectory) {
        fail(`${relative(ROOT, path)} imports "${match[1]}", which was never emitted`);
        continue;
      }
      // A bundle entry named `x` sits at dist/x.js while its declarations sit at
      // dist/x/. A relative "./x" then resolves to the JS file, finds no adjacent
      // x.d.ts, and degrades the whole import to `any` — silently, because
      // skipLibCheck hides it. Import the specific declaration file instead.
      if (!asDeclaration && asDirectory && isFile(`${target}.js`)) {
        fail(
          `${relative(ROOT, path)} imports "${match[1]}", which is ambiguous — ` +
            `${relative(ROOT, `${target}.js`)} shadows ${relative(ROOT, join(target, "index.d.ts"))}, ` +
            `so the types silently resolve to any. Import the declaration file directly.`,
        );
      }
    }
  }
}

let distChecked = false;
try {
  if (statSync(dist).isDirectory()) {
    checkDecls(dist);
    distChecked = true;
  }
} catch {
  // No dist/ — a source-only run. Reported below so it is never mistaken for a pass.
}

// --- report -----------------------------------------------------------------

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s)`);
  errors.forEach((e) => console.error("   " + e));
  throw new Error(`i18n manifest verification FAILED (${errors.length} problem(s))`);
}

console.log(
  `✓ ${english.size} strings, ${callable.size} callable keys, ${used.size} referenced — manifest and source agree`,
);
console.log(
  distChecked
    ? `✓ ${checkedDecls} declaration files — every relative import resolves`
    : "• dist/ not built — skipped the declaration check (run make build-lib first)",
);
