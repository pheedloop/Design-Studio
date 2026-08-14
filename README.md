# PheedLoop Design Studio

Canvas-based design tools for PheedLoop events — three products in one package,
built on a shared Konva.js + React + TypeScript foundation. The editors are
consumed by raichu; the viewers by Charmander and the mobile apps.

## The Tools

**Maps** — PheedLoop's interactive map builder. A floor-plan editor with drawing
tools, booth/session/room placement, DXF import, scale calibration, and A\*
wayfinding — plus an attendee/exhibitor viewer with search, popovers, and
turn-by-turn directions.

**Seat Plans** — table and seat layout editor with an occupancy-aware viewer:
per-table availability, ticket search/filtering, and seat assignment.

**Badges** — print-ready attendee badge designer with a live preview against real
attendee data, rulers, snap-to-grid, and alignment guides.

## Setup

```bash
nvm use           # Node 24 (see .nvmrc)
npm install
npm run dev       # http://localhost:5173
```

Or use the Makefile, which pins the Node version for you: `make install`,
`make start`, `make help`.

The demo hosts all three products. Product lives in the URL path, mode in the
hash — e.g. `/maps#editor`, `/maps#viewer`, `/seatplans#viewer`, `/badges`. Use
the top-nav switcher to jump between them.

## Using in a Host App

Published to GitHub Packages as `@pheedloop/design-studio`. Import the per-product
entry point plus the shared stylesheet (`react`, `react-dom`, `konva`, and
`react-konva` are peer dependencies):

```ts
import { MapEditor } from "@pheedloop/design-studio/editor";
import { MapViewer } from "@pheedloop/design-studio/viewer";
import { SeatPlanViewer } from "@pheedloop/design-studio/seatviewer";
import "@pheedloop/design-studio/style.css";
```

Capabilities are gated by a usage `tier` (`basic` / `advanced` / `premium`), with
optional per-feature overrides. See [tiers.ts](src/tiers.ts).

## Internationalization

Design Studio ships English and owns no i18n runtime — no i18next, no locale
files, no language state. It exports a manifest of stable keys and their English,
and takes a translator from the host:

```tsx
import { MapViewer, designStudioStrings } from "@pheedloop/design-studio/viewer";
import type { Translate } from "@pheedloop/design-studio/viewer";

<MapViewer data={data} exhibitors={exhibitors} translate={translate} locale={language} />
```

**Pass nothing and you get English.** The prop is optional and the manifest value
is the guaranteed fallback, so upgrading changes nothing until you opt in.

Two rules matter:

- **`translate` must be referentially stable.** Wrap it in `useCallback`/`useMemo`
  keyed on your language and catalog. Display strings are memoized off its
  identity, so a fresh function each render re-derives every menu and tool list in
  the editor on every keystroke.
- **Configure i18next with `interpolation: { escapeValue: false }`** for these
  keys. The English uses curly apostrophes (`aren’t`, `can’t`), which default
  escaping turns into numeric entities that render literally.

Placeholders use i18next's `{{name}}` syntax, and plurals use its `_one`/`_other`
key suffixes, so a catalog authored for i18next drops in unchanged.

**Structured keys (ditto).** Namespace the key and let your catalog resolve it:

```tsx
const translate = useCallback<Translate>(
  (key, opts) => i18nT(`designStudio.${key}`, { defaultValue: resolveEnglish(key, opts), ...opts }),
  [i18nT],
);
```

Seed the catalog from the merged manifest at **build** time:

```ts
import { STRINGS } from "@pheedloop/design-studio/i18n";
writeFileSync("src/locales/en-CA.json", JSON.stringify({ designStudio: STRINGS }, null, 2));
```

**English-as-key + user-supplied translations (Charmander).** Where the catalog is
a plain dictionary keyed by the English source, resolve then interpolate:

```tsx
const translate = useMemo<Translate>(
  () => (key, opts) => {
    const english = resolveEnglish(key, opts);
    return interpolate(translations[english] || english, opts);
  },
  [translations],
);
```

`resolveEnglish` returns the **uninterpolated** English with the plural variant
already chosen, and that order is the part to get right: a catalog keyed by
English source is keyed by `"{{count}} seats free"`, not `"3 seats free"`, so
interpolating before the lookup produces a key that can never match and silently
falls back to English.

If your catalog lives in an i18next instance configured with
`keySeparator: false, nsSeparator: false`, the English *is* the key and i18next
does both steps:

```tsx
const translate = useCallback<Translate>(
  (key, opts) => i18n.t(resolveEnglish(key, opts), opts),
  [i18n, i18n.language],
);
```

> Because that lookup is by English text, **changing a DS English value
> un-translates that string** until the catalog entry is re-created. Release notes
> list changed English values, not just new keys.

Import `designStudioStrings` from the entry point you already use — it is scoped
to that surface. `@pheedloop/design-studio/i18n` carries every surface's strings
and is for build steps only.

The [demo](https://pheedloop.github.io/Design-Studio/) has a `Lang:` switcher with
a pseudo-locale (accented, bracketed, padded ~40%) for spotting untranslated
strings and text-expansion clipping, and a mode that renders each string's key.

## Scripts

```bash
npm run dev         # Demo dev server
npm run build       # Type-check + production build (demo)
npm run build:lib   # Build the publishable library → dist/
npm run dev:lib     # Rebuild the library on change (for npm link into a host)
npm run lint        # ESLint
npm test            # Vitest, once
npm run test:watch  # Vitest, watch mode
```

Tests are co-located as `*.test.ts(x)` and excluded from the library build. They
cover the parts neither the compiler nor a reviewer reliably catches — translator
resolution order, plural selection, provider inheritance, and `t` identity.

All the English lives in one file, `src/i18n/strings.ts`, grouped by namespace with
one export per group. Keys are written without their namespace — the const carries
it — so the entry `"menu.duplicate"` under `EDITOR` is addressed as
`t("editor.menu.duplicate")`. Which keys a surface may use is enforced by the
narrowed `T` its `i18n.ts` exports; sort order by `sort-keys` in
`eslint.config.js`.

CI runs typecheck, lint, tests and the library build on every pull request. The
pre-commit hook runs typecheck, lint and tests.

**Release:** `make release [BUMP=patch|minor|major]` from a clean `develop` —
bumps, tags, and publishes to GitHub Packages. Every push to `develop` also
deploys the demo to GitHub Pages.
</content>
