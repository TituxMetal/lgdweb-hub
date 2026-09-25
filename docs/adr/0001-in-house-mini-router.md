# In-house mini-router instead of a routing library

The app needs one parameterized route (`/projects/:slug`) plus internal sub-routes for the few
features that have them (chess exposes three URLs today). We hand-write the router at
`src/lib/router.tsx` on the History API — `navigate`, `<Link>`, `useCurrentPath`,
`useRouteParams`, `RouterView` — and split routing in two layers by responsibility: a minimal
central map with a single parameterized route and no wildcards, and per-feature sub-routing where
the feature reads the pathname past its own prefix. React Router was tried on the chess project
and explicitly rejected, which is why the question was reopened rather than defaulted.

## Considered options

- **React Router** — tried on chess, rejected by the author; the app needs a route and a half, not
  a data-loading framework.
- **TanStack Router**, **Wouter** — same mismatch, with different ergonomics.
- **Per-project entries in the central map** — rejected: one parameterized route covers every
  project, and the map stays readable.

## Consequences

The central router carries no wildcards, so a feature that needs internal URLs owns them; the
feature-folder boundary then also applies to routing. Lazy loading is wired at the central level
(`React.lazy` at the route entry), so the central map never learns what a feature contains.
