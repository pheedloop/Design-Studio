# Design-Studio — Code Guide

Rules for **writing** and **reviewing** code in this repo. Read this before opening or reviewing a PR. AI agents working in this repo should treat these rules as binding.

Design-Studio (`@pheedloop/design-studio`) is a Konva.js + React + TypeScript **component library**.

---

## What this repo actually is

Design-Studio ships three products, each with an authoring side and/or a display side:

| Product | Authoring (editor) | Display (viewer) | Demo-app wrapper |
|---|---|---|---|
| Maps | `editor/` | `viewer/` | `map/` (`MapApp.tsx`) |
| Seat plans | — | `seatviewer/` (shared: admin *and* attendee modes) | `seatplanner/` (`SeatplannerApp.tsx`) |
| Badges | `badgeeditor/` (editor + preview together) | — | — |

`src/App.tsx` + `src/routes/productRouter.ts` are the **demo app only** — they exist so this repo can run all three products standalone for local development and the GitHub Pages preview. They are not part of the published package.

**Publish surface:** `package.json#exports` and `vite.lib.config.ts` currently publish four entry points — `editor`, `viewer`, `seatviewer` (consumed by raichu for editors, Charmander + the mobile apps for viewers) and `i18n` (the merged string manifest, for host build steps that seed a translation catalog). `badgeeditor/`, `map/`, and `seatplanner/` are demo-only; they are not built into `dist/` and cannot be imported by a host app. If you're changing one of the published folders, treat its public API (what `index.ts` re-exports) as a real contract — raichu/Charmander/mobile pull from `dist/`, not from source. **String keys are part of that contract too**: a host that has translated `seatviewer.assign.cta` is broken by a rename exactly as much as by a renamed export.

### Konva / react-konva conventions

- Describe the canvas declaratively — a component's JSX *is* the shape tree. Don't reach into `stage.find(...)` or mutate a Konva node imperatively from render code; that belongs in a dedicated hook (see `editor/hooks/`, `editor/tools/hooks/`) or a one-off utility like `editor/utils/captureThumbnail.ts`, not inline in a component body.
- One shape geometry = one component, in `editor/components/canvas/elements/` (`RectShape`, `EllipseShape`, `PolygonShape`, `ArcShape`, `ArrowShape`, `LineShape`, `BoothShape`, `TableShape`, `SessionAreaShape`, `MeetingRoomShape`, `TextShape`, `IconShape`). That folder is the source of truth for how each geometry type draws. Any other product that needs to draw the same geometry **reuses that component** — it does not reimplement the shape's drawing logic in a switch/case (see anti-pattern below).
- Konva's own naming (`x`, `y`, `radiusX`, `fill`, ...) is allowed to leak into props for shape components — don't wrap it in a redundant abstraction just to avoid Konva-flavored prop names.

### The tiers gating model

`tiers.ts` gates capabilities behind subscription tiers (`basic` → `advanced` → `premium`, cumulative) via a tri-state per feature: `"enabled" | "locked" | "hidden"` — `hidden` means "not part of this product," `locked` means "real but needs an upsell." When a new capability needs tier-gating, add a `FeatureKey` and a `FEATURE_MIN_TIER` entry and resolve it through `resolveFeatures`/`showTrophy` — don't hand-roll a second tier check somewhere else.

---

## Part 1 — Writing code

### Stack defaults (don't reinvent these)

- Path alias `@/` resolves to `src/`. Use it for anything not in the same directory.
- Shape rendering for a geometry type lives once, in `editor/components/canvas/elements/`. Reuse it; don't duplicate it in `viewer/` or elsewhere.
- Tier-gating goes through `tiers.ts`. Don't invent a parallel flag.

### Where files go

```
src/
  <product>/                badgeeditor/, map/, seatplanner/ — demo apps, one per product
  editor/                    maps authoring (published)
    components/
      canvas/elements/       one file per shape geometry
      panels/                editor side panels
      ui/                    editor-local primitives
    tools/                   drawing tools (+ handles/, hooks/, previews/)
    hooks/                   editor-local hooks
    utils/                   editor-local utils (+ dxf/)
  viewer/                    maps display (published)
    components/
    hooks/
    utils/
  seatviewer/                seat plans, admin + attendee modes (published)
    components/
    i18n.ts                  this surface's narrowed t() — one per surface
    labels.ts                branchy label logic, pulled out to be testable
  i18n/                      the i18n machinery + strings.ts (published)
  types/                     cross-product shared types
  components/                shared across ≥2 unrelated products
  utils/                     shared across ≥2 unrelated products
```

Tests sit flat beside their subject (`labels.ts` + `labels.test.ts`), so they aren't shown separately above.

### Colocation rules (non-negotiable)

1. **A component lives next to the feature that mounts it.** If a sibling feature also uses it, move it up to the nearest common parent — not straight to top-level `src/components/`.
2. **Top-level `src/components/` or `src/utils/` requires ≥2 consumers across unrelated products.** "Might be reused" doesn't count. Promotion happens when the second caller appears, in the same PR.
3. **No folder-of-one.** Don't create `foo/components/Bar.tsx` (or `foo/anything/OneFile.ts`) until there are at least a couple of siblings to group. Until then, the file sits flat next to its neighbors.
4. **Pick one sibling style per feature.** Either every sibling sits flat, or every sibling lives in a named subfolder (`components/`, `hooks/`, `tools/`). Don't mix within the same feature.

### One component per file (with one exception)

A second component in a file is allowed only if **all** of these are true:
- no own `Props` interface
- no own hooks
- no own state
- ≤10 lines

Anything else gets its own file. If the helper has state, hooks, or a typed props interface, it has independent identity — extract it. This applies just as much to Konva sub-shapes (a `<Group>` wrapper with its own layout logic) as to regular React components.

### Repetitive siblings → config-driven loop

If you're writing near-identical shape/handling logic for N variants that differ only by data, that's one component (or one `switch`) plus a config/lookup keyed by the variant — not N copies. `BadgeCanvas.tsx`'s `SLOT_SPECS` map is a reasonable existing example of this pattern; follow its shape rather than writing out each slot layout by hand.

### Naming

- **React components are always PascalCase. Their files are always PascalCase. The file name matches the exported component exactly.**
- Folders: `PascalCase` for components, `camelCase` for hooks/utils/features.
- The folder is `components/`. Singular `component/` is never correct.
- Hooks: `useFoo.ts`, exporting `useFoo`. Utils: `fooHelpers.ts` / `fooUtils.ts`, exporting named functions.

### Imports

**Only two import shapes are allowed:**
- `./Sibling` — file lives in the same directory.
- `@/...` — absolute import from `src/`.

**`../` is never acceptable.** If the importer and importee don't live in the same directory, use `@/`. This is mechanical and easy to enforce — search for `from "..` in any PR diff and reject every hit.

**Exception — test files:** A test file that lives in a `tests/` subfolder next to the component it covers may import its subject with `../ComponentName`. This single-level relative import is intentional: it acts as a co-location contract. If the component is ever promoted to a shared location, the broken import is an immediate signal that the test file must move too. Use `@/` for everything else the test imports.

### Tests

Vitest + jsdom + Testing Library. `npm test` runs once, `npm run test:watch` watches. Config is `vitest.config.ts` (separate from `vite.config.ts`); `vitest.setup.ts` registers Testing Library's `afterEach(cleanup)` — the suite runs with `globals: false`, so **import `describe`/`it`/`expect` from `vitest` explicitly** in every test file.

A pre-commit hook (husky + lint-staged) runs `tsc -b --noEmit`, `eslint --max-warnings=0`, and the **full** suite on any staged `.ts`/`.tsx`. A failing test blocks the commit, so keep the suite fast — it currently runs in about a second, and it should stay that way.

**Where tests go.** Flat next to their subject, named after it: `labels.ts` → `labels.test.ts`, `TableDetailPopover.tsx` → `TableDetailPopover.test.tsx`. No `tests/` subfolder — the no-folder-of-one rule applies to tests too. Import the subject as `./Subject`.

**What to test.** Pure logic over rendered output, wherever the logic can be reached without a canvas:

- **Extract branchy label/state logic out of the component so it can be tested directly.** `seatviewer/labels.ts` exists precisely for this — `assignCta` has a dozen branches over mode, lock state, occupancy and eligibility, and testing it through a mounted Konva stage would be slow and brittle. A function taking `(input, t)` and returning `{ label, disabled, hint }` tests exhaustively in milliseconds. Do the same when you find comparable logic inline in a component.
- **Render tests are for what only rendering can prove** — pluralization actually reaching the DOM, a provider override winning, an element appearing or not. `TableDetailPopover.test.tsx` is the model: render inside `I18nProvider`, assert on `screen.getByText`.
- **Regressions get a test with the old behavior named in a comment.** See the `"1 seats free"` note in `TableDetailPopover.test.tsx` — it says what was broken, so nobody "simplifies" the fix away later.

Konva components that need a real stage stay untested for now; there is no canvas harness in this repo. Don't build one for a single PR — extract the logic instead and test that.

> **Known drift:** test files use `../` chains (`../i18n/context`) rather than the `@/` alias the Imports rule mandates, because `vitest.config.ts` has no `resolve.alias` — `@/` does not resolve under the test runner. In fact no file in `src/` uses `@/` today. Either add the alias to `vitest.config.ts` and migrate, or amend the Imports rule; until that's decided, don't fail a review over `../` in a test file.

### Strings / i18n

Two kinds of text, two mechanisms. Getting the split right is the whole design:

| | **UI chrome** — text this repo authors | **Content** — text the event author typed |
|---|---|---|
| Examples | "Assign", "No one seated yet", "Table locked" | booth names, legend labels, exhibitor names |
| Mechanism | key → `t("seatviewer.assign.cta")` | `TranslateContent`: English string in, translation out |
| Declared in | `src/i18n/strings.ts` | nowhere — unknown until runtime |
| Host prop | `translate` | `translateContent` |

This satisfies both consumers: ditto gets structured keys, Charmander keeps English-as-key for user-provided translations.

**Adding UI text.** Put the English in the right namespace const in `src/i18n/strings.ts` (`COMMON`, `VIEWER`, `SEATVIEWER`, `EDITOR`, `BADGEEDITOR`) and call `t("<namespace>.<key>")`. Never inline a user-visible literal in a component.

- **`COMMON` is for strings rendered from more than one surface**, nothing else. A string used by one surface lives in that surface's const, even if it feels generic.
- **Keys are sorted within each namespace** — `sort-keys` is lint-enforced on this file (ASCII, case-sensitive: `allSeated` sorts before `alreadySeated`). Predictable merges, findable keys.
- **Plurals** are `key_one` / `key_other`, selected by a `count` var. The type layer collapses them, so you still call `t("table.seatsFree", { count: n, total: m })` — never branch on `count` at the call site.
- **Interpolation** is `{{name}}`, filled by `Vars`. Build sentences from one key with variables; never concatenate fragments — word order is not universal.
- **Use `Intl` for anything locale-shaped.** `formatList` for "a, b, or c" (also keeps the key count linear — one noun per element type, not one key per combination) and `formatNumber` instead of `toFixed`. Grab the tag from `useLocale()`.

**Reaching `t`.** Inside a component, `const t = useT()` from the surface's own `i18n.ts` — it returns the host translator when a provider supplies one, the built-in English otherwise, so a component renders correctly with no provider at all. Each surface calls `createSurfaceI18n` once with only the namespaces it needs, and the returned `T` is **narrowed to that surface** — another surface's key is a compile error. That's deliberate; don't widen it to `AnyTranslate` to make an import work.

**Module scope can't call a hook.** A module-level table of user-visible text stores *keys*, not English, and the render site translates: see `OCCUPANCY_LEGEND`'s `labelKey` and `SEAT_FLAG_LABEL_KEYS` in `seatviewer/logic.ts`. Typing these as `StringKey` means a typo fails the build.

**Pure functions take `t` as a parameter.** `assignCta(input, t)` and `occupantHeading(state, t)` in `seatviewer/labels.ts` — that keeps them testable without mounting anything, which is the same reason the Tests section wants them extracted.

**Entry components own the provider.** Every published entry point (`MapViewer`, `MapEditor`, `SeatPlanViewer`, `SeatPlanCanvas`, `BadgeEditor`) accepts optional `translate` + `locale` and wraps its tree in `I18nProvider`. The provider **inherits** rather than overrides, so a nested entry component doesn't reset its subtree to English. Both props must be **referentially stable** — memoized UI keys off the translator's identity, so an inline arrow re-renders the tree every frame.

**Content translation is applied to the data, once — not per render site.** `translateFloorPlan` / `translateExhibitors` in `src/i18n/content.ts` map over the data before it reaches the tree. This is load-bearing: search has to match against the same text it displays, or a user gets hits they cannot see.

**Renaming a key is a breaking change** for any host that has already translated it. See the Publish surface note.

### Skills required before opening a PR

- No `console.log`, no commented-out code, no `TODO` without a Linear ticket reference.
- `npm run lint` clean.
- `npm test` green, and `tsc -b --noEmit` clean. The pre-commit hook enforces both; don't `--no-verify` past it.
- No user-visible string literal left in a component — every one goes through `t()`.
- New branchy label/state logic is extracted and has tests. New keys are sorted, and plural keys have both `_one` and `_other`.
- New shared components (`src/components/`, `src/utils/`) have at least two consumers in the same PR — or they don't go there.

---

## Part 2 — Reviewing code

Reject (or block on fix) when you see any of the following. These map 1:1 to the rules above.

### Structural smells

- A new folder containing exactly one file, with no siblings in sight.
- A new addition to top-level `src/components/` or `src/utils/` with only one caller in the PR.
- **Any `from "../...` import in non-test code.** Same-directory `./` or absolute `@/` only. (Test files are exempt for now — see the drift note under Tests.)
- **Any file whose name doesn't match the PascalCase component it exports.**
- Mixed sibling style within one feature: some helpers flat, some in a named subfolder.
- A shape-drawing switch/case reimplementing a geometry that already has a dedicated component in `editor/components/canvas/elements/`.

### File-level smells

- A second component in a file that has its own hooks, its own props interface, its own state, or is over ~10 lines.
- Three-plus components in one file with similar shape — that's a config-driven loop, not three components.
- A file that's grown into an implicit shared module — other files importing named exports out of a component file that isn't meant to be a shared entry point (e.g. reaching into a canvas/orchestration component to get a rendering primitive it happens to export). That primitive should live in its own file.

### Re-use smells

- A new domain-specific helper added to `src/components/` or `src/utils/` instead of living next to its one consumer.
- A tier check that doesn't go through `tiers.ts`'s `resolveFeatures`/`showTrophy`.

### i18n smells

- **A user-visible string literal in JSX, or in a `label`/`title`/`placeholder`/`aria-label` prop.** These are the ones that slip through — a translated component with one hardcoded `aria-label` is still untranslated for a screen reader.
- **A sentence assembled by concatenation or a ternary over fragments.** One key with `{{vars}}`; word order differs by language.
- **A `count`-driven `? :` at the call site** instead of `_one`/`_other` keys.
- **English text in a module-scope constant** that ends up rendered — store a `StringKey` and translate at the render site.
- **A new string added to `COMMON` with one consumer.** Same ≥2-consumer bar as `src/components/`.
- **An existing key renamed or its English reworded without a note in the PR description** — downstream catalogs key off it.
- **`translateContent` threaded to render sites** instead of applied to the data once, which silently desyncs search from display.
- **A non-stable `translate` / `translateContent` prop** (inline arrow, object literal rebuilt each render).

### Test smells

- **New branchy logic testable only through a mounted component.** Ask for the extraction — that's what `labels.ts` is for.
- **A `tests/` subfolder**, or a test file not named after its subject.
- **`describe`/`it`/`expect` used without importing them** — passes in your editor, fails under `globals: false`.
- **A bug fix with no test naming the old behavior.** The regression comes back otherwise.
- **A test that slows the suite disproportionately.** It runs on every commit for everyone.

### Review questions to ask out loud

- **Where else is this used?** If the answer is "nowhere yet, but…" — reject the abstraction.
- **Is this geometry type already drawn somewhere else in the codebase?** If yes, reuse that component instead of writing a second implementation.
- **Could a new dev find this file from the product it belongs to?** If not, the structure is lying.
- **Would this read correctly in French?** Longer strings, different word order, different plural rules.
- **Does this PR rename or reword an existing key?** If so, it's a breaking change for hosts — call it out in the description.

### Review tone

Block real problems; comment on small ones; don't bikeshed. Every blocking comment should reference a rule in this document by section name. If you find yourself making up a new rule mid-review, raise it as a discussion and add it here before enforcing.

---

## Part 3 — Anti-patterns we've already seen in this repo

These are real examples from this codebase. Don't repeat them.

- **Inline sub-components with independent identity, in the same file as the component that mounts them.** `BadgeCanvas.tsx` (977 lines) defines `BadgeCanvas` plus six more components inline — `FieldShape`, `FieldBody`, `StaticField`, `Slots`, `FoldIndicators`, `FieldContent` — two of which (`StaticField`, `Slots`) are exported and imported by `BadgePreview.tsx`. That's not just size — it means a *second file* now depends on named exports out of what's supposed to be a canvas-orchestration component. `PlacementPanel.tsx` has the same shape: `PlacementPanel` plus `FilterBar`, `Section`, `PlacementRow`, `RecordRow` defined inline, plus a context. Each of these belongs in its own file.
- **Folder-of-one.** Four real instances: `src/utils/` (only `unitConversion.ts`), `src/components/` (only `ProductSwitcher.tsx`), `src/map/` (only `MapApp.tsx` — every other product folder has a real subtree, this one doesn't), and `src/editor/placement/` (only `types.ts`). Flatten these into their parent until real siblings justify the folder.
- **Duplicate element-shape rendering.** `editor/components/canvas/elements/` has one component per geometry type (`RectShape`, `EllipseShape`, `ArcShape`, `PolygonShape`, `ArrowShape`, `LineShape`, ...). `viewer/components/ViewerElement.tsx` (319 lines) reimplements the same rect/ellipse/line/arrow/arc/polygon drawing inline, from scratch, via a big `switch` over raw `react-konva` primitives. Any future fix to how a shape draws now has to be made twice, and the two implementations can already disagree without anyone noticing.
- **`../../` import chains.** Every one of these is a structural lie — either the file is in the wrong place, or the import shape is wrong. Use `@/` for anything off-directory. (Caveat: `@/` currently resolves in `vite.config.ts` but not `vitest.config.ts`, and no file in `src/` actually uses it — see the drift note under Tests before enforcing this on a test file.)
- **Branchy label logic living inside a component.** The seat-plan assign CTA started as a ~35-line `useMemo` inside `SeatPlanViewer.tsx`, branching over mode, lock state, occupancy and eligibility, and returning `{ label, disabled, hint }`. Nothing about it needed React, but every branch was unreachable from a test without mounting a Konva stage — so none of them were tested. It now lives in `seatviewer/labels.ts` as `assignCta(input, t)` with a test per branch. When you catch yourself writing a `useMemo` that only maps state to strings, that's the same shape.
- **Two eligibility rules drifting apart.** `isEligible` once answered a single yes/no, and the CTA re-derived the *reasons* inline with its own copy of the ticket-type and tag checks. The copies disagreed: one treated an empty `eligibleTicketCodes` allowlist as "nothing is allowed", the other as "everything is allowed". `seatEligibility` is now the one source for both the boolean and the reasons — `isEligible` is a thin wrapper over it. Don't re-derive a rule a shared helper already answers.
