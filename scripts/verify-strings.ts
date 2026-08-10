// Checks the i18n manifest against the source and the emitted declarations.
// Run via `make verify-strings` (needs the Node in .nvmrc).
//
// Imports nothing on purpose: Node's TS resolver will not follow extensionless
// relative specifiers, and reading the manifest as text also lets this enforce
// format rules — sort order, one `"key": "English",` per line.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

/** Which manifest file owns which namespace, and where its keys may be used. */
const SLICES: Record<string, { file: string; dirs: string[] }> = {
  common: { file: "src/i18n/strings.common.ts", dirs: ["src"] },
  viewer: { file: "src/i18n/strings.viewer.ts", dirs: ["src/viewer"] },
  seatviewer: { file: "src/i18n/strings.seatviewer.ts", dirs: ["src/seatviewer"] },
  editor: { file: "src/i18n/strings.editor.ts", dirs: ["src/editor"] },
  badgeeditor: { file: "src/i18n/strings.badgeeditor.ts", dirs: ["src/badgeeditor"] },
};

// Imported by more than one surface, so their strings must be `common.*`.
const CROSS_SURFACE = new Set([
  "src/utils/unitConversion.ts",
  "src/viewer/components/ViewerElement.tsx",
  "src/editor/components/canvas/BackgroundImage.tsx",
  "src/editor/components/canvas/DxfDrawing.tsx",
  "src/editor/utils/iconRegistry.ts",
  // Live under src/editor but are imported by the badge editor, so `editor.*`
  // keys here would render untranslated there.
  "src/editor/components/panels/AlignmentControls.tsx",
  "src/editor/components/ui/DropdownMenu.tsx",
]);

// Deliberate same-English-different-key pairs. Charmander keys its UGC by the
// English string, so a split buys nothing there unless the English diverges too.
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
    // Tests use fixture keys that are deliberately not in the manifest.
    if (/\.test\.tsx?$/.test(rel)) continue;
    const text = readFileSync(path, "utf8");

    // The merged manifest must stay out of component bundles. Type-only imports
    // are erased, so they are fine; src/demo never ships.
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
      // dist/x.js shadows dist/x/index.d.ts, so the import degrades to `any`.
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
  // No dist/ — reported below rather than passing silently.
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
