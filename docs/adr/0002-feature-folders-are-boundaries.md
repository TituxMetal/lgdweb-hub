# Feature folders are boundaries, not routes

This is a SPA without filesystem routing: routes are declared in `App.tsx`, and each feature is
mounted from `src/features/<slug>/` through its `index.ts`. A feature groups all the code for one
old project — components, hooks, lib, types — and exports its view under its own name (`Snake`,
`Home`), never with a `Page`, `Route` or `View` suffix; the `pages/` convention of the referenced
Astro-oriented architecture skill does not transpose here. `Home` is a feature too, which keeps
`App.tsx` to route wiring, and the two shared locations follow from the same reasoning: the
manifest sits outside both trees because it belongs to neither side, and `src/server/` sits under
`src/` so there is one import root and one base tsconfig, the client/server isolation being
carried by one tsconfig per side.

## Considered options

- **A `pages/` directory with a `Page` suffix per top-level component** — the Astro/monorepo
  convention the architecture skill was written for; meaningless without filesystem routing.
- **Sibling folders per feature** — no single place to state a feature's public surface.

## Consequences

Adding a feature is a folder, an `index.ts` export and one entry in the route map; the feature's
entry point is what `React.lazy` imports, whatever the exported component is called. Nothing
enforces the boundary but review — a feature importing another feature's internals stays possible
and is a review failure, not a build failure.
