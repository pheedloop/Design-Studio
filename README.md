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

## Scripts

```bash
npm run dev         # Demo dev server
npm run build       # Type-check + production build (demo)
npm run build:lib   # Build the publishable library → dist/
npm run dev:lib     # Rebuild the library on change (for npm link into a host)
npm run lint        # ESLint
```

**Release:** `make release [BUMP=patch|minor|major]` from a clean `develop` —
bumps, tags, and publishes to GitHub Packages. Every push to `develop` also
deploys the demo to GitHub Pages.
</content>
