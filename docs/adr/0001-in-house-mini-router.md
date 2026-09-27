# In-house mini-router instead of a routing library

The app needs one parameterized route (`/projects/:slug`) plus internal sub-routes for the few
features that have them (chess exposes three URLs today). We hand-write the router at
`src/lib/router.tsx` on the History API — `navigate`, `<Link>`, `useCurrentPath`,
`useRouteParams`, `RouterView` — and split routing in two layers by responsibility: a minimal
central map with a single parameterized route, and per-feature sub-routing where the feature reads
the pathname past its own prefix. The project route matches by **prefix**: a URL under
`/projects/<slug>` reaches that project however deep it goes, and the feature owns everything past
its prefix — the central map still carries no route, and no knowledge, of any feature's internals.
React Router was tried on the chess project and explicitly rejected, which is why the question was
reopened rather than defaulted.

## Considered options

- **React Router** — tried on chess, rejected by the author; the app needs a route and a half, not
  a data-loading framework.
- **TanStack Router**, **Wouter** — same mismatch, with different ergonomics.
- **Per-project entries in the central map** — rejected: one parameterized route covers every
  project, and the map stays readable.

## Consequences

The central map carries no wildcard pattern: the project route matches the leading segments of a URL
(`matchRoutePrefix`), whatever follows them belongs to the feature mounted there, and the feature
reads that remainder itself — so its internal paths stay addressable, shareable and reloadable. The
feature-folder boundary then also applies to routing. Lazy loading is wired at the central level
(`React.lazy` at the route entry), so the central map never learns what a feature contains.
