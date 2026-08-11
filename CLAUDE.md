# Design-Studio — Code Guide

Rules for **writing** and **reviewing** code in this repo. Read this before opening or reviewing a PR. AI agents working in this repo should treat these rules as binding.

Design-Studio (`@pheedloop/design-studio`) is a Konva.js + React + TypeScript **component library**. It was built solo with no written conventions — this is the standard the refactor and cleanup tickets in this project are measured against.

---

## What this repo actually is

Design-Studio ships three products, each with an authoring side and/or a display side:

| Product | Authoring (editor) | Display (viewer) | Demo-app wrapper |
|---|---|---|---|
| Maps | `editor/` | `viewer/` | `map/` (`MapApp.tsx`) |
| Seat plans | — | `seatviewer/` (shared: admin *and* attendee modes) | `seatplanner/` (`SeatplannerApp.tsx`) |
| Badges | `badgeeditor/` (editor + preview together) | — | — |

`src/App.tsx` + `src/routes/productRouter.ts` are the **demo app only** — they exist so this repo can run all three products standalone for local development and the GitHub Pages preview. They are not part of the published package.

**Publish surface:** `package.json#exports` and `vite.lib.config.ts` currently publish exactly three entry points — `editor`, `viewer`, `seatviewer` — consumed by raichu (editors) and Charmander + the mobile apps (viewers). `badgeeditor/`, `map/`, and `seatplanner/` are demo-only; they are not built into `dist/` and cannot be imported by a host app. If you're changing one of the three published folders, treat its public API (what `index.ts` re-exports) as a real contract — raichu/Charmander/mobile pull from `dist/`, not from source.

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
  types/                     cross-product shared types
  components/                shared across ≥2 unrelated products
  utils/                     shared across ≥2 unrelated products
```

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

There is no established testing pattern in this repo yet — that's tracked separately (see `ENG-3570`). Until that lands: don't invent a one-off test setup for a single PR, but do call out untested new logic in review rather than blocking on infrastructure that doesn't exist yet. This section will be replaced with real rules once that ticket resolves.

### Strings / i18n

**TBD — deferred pending the localization spike (`ENG-3571`).** Design-Studio has two downstream consumers that translate differently (ditto uses structured keys, Charmander uses the English string as the key and supports user-provided translations), so this repo can't just copy either convention as-is. Do not hardcode a "wrap everything in `t()`" rule until that spike lands with a decision.

### Skills required before opening a PR

- No `console.log`, no commented-out code, no `TODO` without a Linear ticket reference.
- `npm run lint` clean.
- New shared components (`src/components/`, `src/utils/`) have at least two consumers in the same PR — or they don't go there.

---

## Part 2 — Reviewing code

Reject (or block on fix) when you see any of the following. These map 1:1 to the rules above.

### Structural smells

- A new folder containing exactly one file, with no siblings in sight.
- A new addition to top-level `src/components/` or `src/utils/` with only one caller in the PR.
- **Any `from "../...` import outside a `tests/` co-location import.** Same-directory `./` or absolute `@/` only.
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

### Review questions to ask out loud

- **Where else is this used?** If the answer is "nowhere yet, but…" — reject the abstraction.
- **Is this geometry type already drawn somewhere else in the codebase?** If yes, reuse that component instead of writing a second implementation.
- **Could a new dev find this file from the product it belongs to?** If not, the structure is lying.

### Review tone

Block real problems; comment on small ones; don't bikeshed. Every blocking comment should reference a rule in this document by section name. If you find yourself making up a new rule mid-review, raise it as a discussion and add it here before enforcing.

---

## Part 3 — Anti-patterns we've already seen in this repo

These are real examples from this codebase. Don't repeat them.

- **Inline sub-components with independent identity, in the same file as the component that mounts them.** `BadgeCanvas.tsx` (977 lines) defines `BadgeCanvas` plus six more components inline — `FieldShape`, `FieldBody`, `StaticField`, `Slots`, `FoldIndicators`, `FieldContent` — two of which (`StaticField`, `Slots`) are exported and imported by `BadgePreview.tsx`. That's not just size — it means a *second file* now depends on named exports out of what's supposed to be a canvas-orchestration component. `PlacementPanel.tsx` has the same shape: `PlacementPanel` plus `FilterBar`, `Section`, `PlacementRow`, `RecordRow` defined inline, plus a context. Each of these belongs in its own file.
- **Folder-of-one.** Four real instances: `src/utils/` (only `unitConversion.ts`), `src/components/` (only `ProductSwitcher.tsx`), `src/map/` (only `MapApp.tsx` — every other product folder has a real subtree, this one doesn't), and `src/editor/placement/` (only `types.ts`). Flatten these into their parent until real siblings justify the folder.
- **Duplicate element-shape rendering.** `editor/components/canvas/elements/` has one component per geometry type (`RectShape`, `EllipseShape`, `ArcShape`, `PolygonShape`, `ArrowShape`, `LineShape`, ...). `viewer/components/ViewerElement.tsx` (319 lines) reimplements the same rect/ellipse/line/arrow/arc/polygon drawing inline, from scratch, via a big `switch` over raw `react-konva` primitives. Any future fix to how a shape draws now has to be made twice, and the two implementations can already disagree without anyone noticing.
- **`../../` import chains.** Every one of these is a structural lie — either the file is in the wrong place, or the import shape is wrong. Use `@/` for anything off-directory.
