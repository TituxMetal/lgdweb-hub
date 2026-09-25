# Projects Showroom — Design Specification

Date: 2026-05-10 Status: Spec consolidated, ready for migration to `lgdweb-hub` repo Source
brainstorms (in this folder):

- `seed.md` (seed)
- `brainstorm-overall.md` (parent / overall design)
- `brainstorm-server.md` (server pass)
- `brainstorm-client.md` (client pass)
- `brainstorm-visual-identity.md` (visual identity, foundation level)

This spec is the single source of truth for the feature shape and implementation plan that will be
produced inside the `lgdweb-hub` repo once it is created. The brainstorms above remain as the
rationale and historical record of the decisions; this spec presents the conclusions.

## Overview

A landing page served at the apex of `lgdweb.fr` that lists the author's **old projects** and lets
visitors enter each one at `/projects/<slug>`. The same codebase modernizes every old project —
rewriting in the current canonical stack while preserving the identity (look, gameplay, content) of
the original.

This page is the **first concrete piece** of the future `lgdweb.fr` Hub. It occupies the apex domain
on its own for now — the rest of the Hub (skills section, navigation toward the blog and journal
subdomains) comes later in its own design.

The `lgdweb.fr` ecosystem as a whole — hub + journal + blog — **is** the author's current portfolio.
The old projects in the showroom are **historical artefacts** from the learning years, displayed as
such; the recent ones (Road to Six initiative) signal that the parcours continues.

## Repo

**Name**: `lgdweb-hub`. Reflects the long-term target (the future Hub), not just the immediate
showroom scope. Avoids a rename when the skills section and navigation pieces land later.

This spec stays in the incubator (`projects-ideas`) as historical record; the repo is created when
the spec is approved.

## Architecture

**Single package, no monorepo.** Server and client cohabit under `src/`, share the root
`package.json`. Vite builds the client to `dist/`; at runtime, the Hono server in `src/server/`
serves that `dist/` plus its own routes.

Stack:

- **Bun** as runtime + package manager + test runner.
- **Vite 7** (build), **React 19**, **Tailwind 4**.
- **Hono** (server, modular).
- **Custom mini-router** at `src/lib/router.tsx` — no React Router, no TanStack Router, no Wouter.
- **Biome** for lint and format.
- **TypeScript strict**, no semicolons, arrow functions only, named exports only (user's code-style
  rules).

### Repo layout

```text
lgdweb-hub/
├── index.html              # Vite entry, must stay at repo root
├── package.json            # single package, no workspaces
├── tsconfig.*.json         # base + client + server configs
├── vite.config.ts
├── biome.json
├── docker/                 # Dockerfile + compose
├── public/                 # static assets (favicon, etc.)
└── src/
    ├── main.tsx            # client entry
    ├── App.tsx             # mounts the mini-router
    ├── styles/
    ├── lib/
    │   └── router.tsx      # custom mini-router
    ├── components/         # shell: Layout, ProjectCard, ExternalArrow, BackToList
    ├── data/               # project manifest — consumed by both client and server
    ├── features/
    │   ├── home/           # the project-list page itself
    │   ├── snake/
    │   ├── tic-tac-toe/
    │   ├── memory/
    │   ├── portfolio/
    │   ├── chess/
    │   ├── tetris/
    │   └── game-of-life/
    └── server/             # Hono, modular — never a single server.ts blob
        ├── index.ts        # composes route groups, starts serve()
        ├── routes/         # health, static
        ├── games/          # server-side pieces for games that need them
        │   └── tetris/     # WS handler + room + matchmaking
        └── lib/            # config, helpers
```

Per-feature folders follow the user's `frontend-architecture` skill conventions: `components/`,
`hooks/`, `lib/`, `types.ts`, `index.ts` barrel, `assets/` when needed.

`src/data/` lives at the top because both client and server consume the project manifest.

## Projects

### Old projects (modernized in place at `/projects/<slug>`)

| Slug         | Source                                                                            | Notes                                                                         |
| ------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| snake        | `oldProjects/snakeJs`                                                             | Vanilla JS, very small                                                        |
| tic-tac-toe  | `oldProjects/ticTacToe` (2017) + `oldProjects/20210211-simple-tic-tac-toe` (2021) | Two original sources, single rewritten feature                                |
| memory       | `oldProjects/memoryGame`                                                          | Card matching                                                                 |
| portfolio    | `oldProjects/20210406-portfolio`                                                  | End-of-training project. Identity preserved, code modernized                  |
| chess        | `TituxMetal/react-chess-game-learning`                                            | TS + React, infra in place, content + finishing remain                        |
| tetris       | `TituxMetal/tetrisGame`                                                           | **Multiplayer preserved** — implies WebSocket + in-memory rooms on the server |
| game of life | `TituxMetal/tuximetal-game-of-life-engine` + `TituxMetal/tuximetal-game-of-life`  | Engine + viewer, ported separately                                            |

**"Modernized" means**: rewritten in the current canonical stack while porting the original logic.
The visual look, gameplay, and content of each project are **preserved**; only the code is replaced.

For **chess** specifically, modernization includes swapping `react-router-dom` v7 for the custom
mini-router. The chess feature exposes 3 internal URLs today, which become sub-routes of
`/projects/chess/*`.

### Recent projects (external link cards)

Three projects from the Road to Six initiative, listed to signal that the parcours continues — not
just learning-year work. Each card opens its `liveUrl` in a new tab when present; otherwise links to
the repo.

| Slug       | Repo                          | Live URL                      | Notes                                  |
| ---------- | ----------------------------- | ----------------------------- | -------------------------------------- |
| pif        | `TituxMetal/pif-is-fake`      | `https://pif.tuxlab.fr`       | Shipped 2026-05-04.                    |
| cubemaster | `TituxMetal/cube-master`      | `https://cube-master.fly.dev` | Paused 2026-04-12. Deployed on Fly.io. |
| costlog    | `TituxMetal/car-cost-tracker` | `https://cost-log.tuxlab.fr`  | Shipped 2026-04-30. Nicknamed CostLog. |

Live deployments sit under `tuxlab.fr` and `fly.dev`, not `lgdweb.fr`. Different domains; not an
issue, just a fact of the current hosting layout.

### Future candidates (deferred)

Three projects intentionally **not** in the recent list yet, with explicit conditions for inclusion
later:

- **Astro Warehouse Visualizer** — eligible when re-hosted from Vercel onto the user's own server.
- **Logi Prod Report** — needs a full rewrite with simplified authentication first.
- **Warehouse Manager** — still in active development, not yet presentable.

When any of these matures, it joins the Recent list as another external link card. No design change
needed at that point — just a new entry in the manifest.

## Server design

### Project manifest

**Imported statically at build time** by the client. **No `/api/projects` endpoint.** The manifest
in `src/data/projects.ts` is bundled by both sides; updating it requires a rebuild + redeploy
regardless. An API would not buy the "live update" benefit it normally suggests.

If the manifest ever needs to live outside the bundle (external JSON, database, CMS), an endpoint
can be added then.

### Hono module breakdown

Application composed in `src/server/index.ts` from independently defined route groups, each mounted
via `app.route(prefix, group)`.

- `routes/health.ts` → `GET /api/health` returning `{ status: 'ok' }`.
- `routes/static.ts` → `/assets/*` + catch-all `*` to `dist/index.html` (SPA fallback).
- `games/tetris/` → WebSocket endpoint at `/ws/tetris` (see below).
- `lib/config.ts` → `PORT`, `NODE_ENV`, bare-minimum runtime config.

One file per route group. No preemptive empty structure for middlewares (logging, error handling,
CORS) — added when actually needed.

### Tetris WebSocket

**Endpoint**: `/ws/tetris`. **Runtime**: Hono + Bun, **no external WebSocket library** — Bun has
native WS support via `Bun.serve()`, Hono's `upgradeWebSocket` helper delegates to it on the Bun
runtime.

#### Identity: parallel side-by-side play

The original `TituxMetal/tetrisGame` multi mode is **parallel side-by-side play**: each player plays
their own game and sees the opponent's grid animate in real time. **No PvP interaction** (no garbage
lines, no shared piece queue, no attacks). This identity is preserved unchanged.

#### Protocol (preserved + hardened)

Message types client → server: `initSession`, `joinSession`, `stateUpdate`. Message types server →
client: `sessionInitialized`, `sessionBroadcast`, `stateUpdate`.

Hardening on top of the preserved protocol:

- TypeScript strict with discriminated unions for every message type.
- Input validation at the WS boundary (Zod or equivalent lightweight validator).
- Ping-pong heartbeat to detect dead connections.
- Reconnection with a stable client ID (refresh doesn't drop room membership).
- Proper error handling — no `throw` inside WS handlers; structured error message back to the
  affected client, never propagated to crash the process.

#### Rooms

- **2 players per room** (head-to-head). `joinSession` rejected with error if the room is full.
- **Total room count not capped** — added later if traffic ever justifies.
- **Room ID** = 6-character alphanum, generated server-side at `initSession`.

#### Room ID transport: URL hash

Room ID lives client-side in the URL hash: `/projects/tetris#abc123`. The client reads
`window.location.hash` and sends `joinSession` with the ID over WS. The server never sees the room
ID in any HTTP URL.

### State authority

**No server authority.** The server is a router of `stateUpdate` messages between peers in the same
room. Each client owns its own game-state and broadcasts updates to the other peer. Sufficient for
parallel side-by-side play (no cheating consequences without PvP interaction).

## Client design

### Mini-router — central + per-feature sub-routing

**Central router** at `src/lib/router.tsx`:

- History API based (`pushState` + `popstate` + custom subscribers).
- Declarative route map: `'/' → render`, `'/projects/:slug' → ({ slug }) => render`.
- Route parameters supported. **No wildcards** at the central level.
- Public API: `navigate(to)`, `<Link to>`, `useCurrentPath()`, `useRouteParams(pattern)`.

**Per-feature sub-routing** for features that need it (chess today, possibly tetris later). The
feature reads `window.location.pathname` past its own prefix, matches its own internal routes, and
calls `navigate('/projects/<slug>/<sub-path>')` when navigating internally.

### Code splitting

Each feature loaded via `React.lazy(() => import('~/features/<slug>'))`. **A single
`<Suspense fallback>` at the Layout level**, not one per feature. Initial bundle = home + shell
only; each project feature fetched on first visit.

### `BackToList` cleanup — hybrid pragmatic

1. **In-SPA by default**: `BackToList` is `<Link to="/">`, no flash, shell stays mounted.
2. **Cleanup discipline obligatoire** in every feature. Code review enforces:
   - `cancelAnimationFrame` for game loops (snake, tetris, game-of-life).
   - Explicit `ws.close()` for tetris (avoid ghost rooms server-side).
   - Audio: stop sources / close `audioContext`.
   - Global event listeners (`window.addEventListener`, etc.) removed in cleanup.
3. **Per-feature full-reload fallback**: if a feature shows a leak that resists discipline, expose
   its `BackToList` as `<a href="/">` (HTML anchor, full reload) instead of `<Link>`. Granular
   escape hatch.

### Tetris mobile-friendly + touch input

Goal: **playable on mobile without frustration for one or two games** — not a pro mobile tetris
experience.

- **Virtual buttons** at the bottom: ← (left), → (right), ↻ (rotate), ↓ (soft drop), optional ⤓
  (hard drop). **No swipe gestures** in the first implementation — too many false positives.
- **Keyboard and touch always active in parallel.** No device detection, no mode switch. On-screen
  buttons are visible on desktop too; keyboard works on mobile too if a Bluetooth keyboard is
  attached.
- **Responsive layout via Tailwind v4 utilities** (`md:`, `lg:`). Mobile portrait: grid full width,
  score / next piece above, controls below. Desktop: grid centered, controls compact.
- In multi on mobile portrait: opponent's grid likely shown at reduced size (~1/4) at the top —
  final layout decided at implementation.

## Visual identity (foundation)

> Foundation only. The visual identity is intentionally minimal and is expected to be revisited as
> the rest of the Hub (skills section, navigation toward blog and journal) lands. The user framed
> this pass explicitly as "juste une fondation, ça se peut que dans trois mois on refasse une grosse
> partie".

### Palette

Dark by default, monochrome zinc base, one warm accent.

- **Background shell**: `zinc-900` (`#18181B`).
- **Surface (cards)**: `zinc-800`.
- **Borders subtle**: `zinc-700`.
- **Text primary**: `zinc-100`.
- **Text secondary / metadata**: `zinc-400`.
- **Single accent**: `amber-400` (`#FBBF24`) — links, focus states, interactive hover, the
  external-card `↗` glyph.

**No second accent**, no diluted "success / error / warning" palette. **No pure black `#000`, no
pure white `#fff`** (user's hard rule).

Reference register: Linear, Vercel, Cursor docs.

### Contrast guarantee

Load-bearing constraint, explicitly required by the user:

- `zinc-100` on `zinc-900` ≈ 16:1 → WCAG AAA.
- `zinc-400` on `zinc-900` ≈ 7:1 → WCAG AA (normal), AAA (large).
- `amber-400` on `zinc-900` ≈ 10:1 → AAA (large), AA (normal).

Any future change must preserve at least WCAG AA for normal text and AAA for primary text on the
shell background.

### Typography

- **Geist Sans** for the UI: titles, body, labels.
- **Geist Mono** for technical artefacts: tech badges, slugs, URLs, code samples.

Geist (OFL license, two variants matched visually by construction) is the chosen pair. Credible
alternatives kept on file: **Inter** + **JetBrains Mono** (or **Fira Code**).

### Tone and voice

Same as the rest of the `lgdweb.fr` ecosystem: raw, honest, personal. Open journal of a technical
journey. Not marketing, not a CV. Project descriptions stay short, direct, sometimes
self-deprecating where it fits.

### Card style — single minimalist style

Single style for both old and recent projects. Difference conveyed by **a single signal** (`↗`), not
by a different card.

- **Surface**: `zinc-800`, border `zinc-700`. Hover: border `amber-400` or subtle elevation (one of
  the two, picked at implementation).
- **Padding**: generous; corners `rounded-lg`.
- **Content**:
  - Title — Geist Sans, medium, `zinc-100`.
  - Year — Geist Mono small, `zinc-400`.
  - One-line description — Geist Sans, `zinc-300`.
  - Tech badges — pills, Geist Mono very small, `zinc-200` on `zinc-700`.
  - Thumbnail — above the text block when present.
  - Link to original repo — discreet, below.

### Old vs recent — single distinguishing signal

- **Old (modernized in place)**: card as above, click navigates internally to `/projects/<slug>`.
- **Recent (external)**: same card, **`↗` in `amber-400` next to the title**, click opens `liveUrl`
  in a new tab. No other visual distinction.

If the showroom one day grows enough that this single signal becomes insufficient (e.g. 20+ projects
mixed), revisit then.

### List layout

Vertical list, one card per row. Mobile: full-width. Desktop: max-width centered. Generous spacing.
**Chronological order, newest first.** No grouping by type — old and recent intermixed by date.

### Per-project visual identity

Each modernized project re-implements its **original visual identity** (look from the era it was
made) using Tailwind v4. The shell's identity does **not** propagate inside features. Style
isolation is by convention: no global CSS beyond `globals.css` reset + shell tokens; the shell's
tokens are not exposed to features. Enforcement is by code review, not tooling.

## Hosting and deployment

Single Docker image, multi-stage build under `docker/`:

1. Builder stage: install Bun deps, run `vite build` → `dist/`.
2. Runtime stage: copy `dist/`, `src/server/`, `node_modules`, run `bun src/server/index.ts`.

Deployed on the user's Debian + Docker setup, behind Nginx Proxy Manager, on the `lgdweb.fr` apex
domain.

## Risks acknowledged (not blocking)

- **Tetris multiplayer state in memory** — server restart loses in-flight games. Acceptable at this
  scale; persistence is out of scope.
- **Code splitting + custom mini-router compatibility** — handled via `React.lazy` + `Suspense` at
  the Layout level; the central router design must expose lazy boundaries cleanly.
- **`BackToList` cleanup** in modernized old code — addressed by the cleanup discipline + the
  per-feature full-reload fallback.
- **Manifest shared by client and server** — `src/data/projects.ts` must stay pure TypeScript with
  no DOM-only or Node-only imports.
- **Style isolation between features** — convention "no global CSS beyond `globals.css` + shell
  tokens"; enforcement by code review, not tooling.

## Out of scope here

- The full Hub (skills section, navigation toward blog and journal subdomains). Separate design.
- The other parts of the ecosystem — blog (Strapi + frontend), journal (Astro static + GitHub Pages
  automation). Separate specs.

## Next steps (after this spec)

1. **Create `lgdweb-hub` repo** and scaffold the structure described above. Last step that happens
   in `projects-ideas`.
2. **In `lgdweb-hub`**: generate feature shape + implementation plan from this spec, then start
   shipping. Out of scope of this incubator.

## Anti-patterns

Carried from the brainstorms — apply to anyone (human or AI) continuing this work:

- **No release-cycle vocabulary** ("V1", "V2", "MVP", "phase 1", "iteration N") unless the user
  introduces those words first.
- **No copy-pasting** of `cube-master` or `pif-is-fake` as templates. Inspiration only.
- **No code in `projects-ideas`.** This is the incubator. Code lives in `lgdweb-hub`.
- **No commit pressure.** The user manages commits himself.
- **No re-asking** of questions the user already answered by default.
- **No premature implementation detail.** This spec stops at design level — exact APIs, exact pixel
  values, exact font loading config, exact Dockerfile content all belong to the implementation plan,
  not here.
- **No tentative phrasing after a closing signal** ("ok", "compris", "noté"). Execute the next
  obvious step directly.
