# Coding standards

The judgement calls this project's guardrails cannot decide. Read it **at review**, next to the
diff: the type checker, the linter and CI have already run, so nothing here restates them. The
reasoning behind the architectural rules lives in `docs/adr/`.

## Feature boundaries

A feature lives at `src/features/<slug>/` and publishes its surface through its `index.ts`;
another feature imports only that file, its internals staying private.
Its top-level component is exported under its own name — `Snake`, `Home` — and mounted from the
route map in `App.tsx` (reasoning: `docs/adr/0002`).

## Per-feature visual identity

A modernized project re-implements the look of its original era, as a table in
`src/features/<slug>/palette.md`: each original colour, the archived file it was read from (e.g.
`~/archived/webdev/oldProjects/snakeJs/public/css/app.css`), and the nearest Tailwind default
palette entry it maps to.
Canvas, SVG and inline styles carry that entry's hex, tagged `// Tailwind <name>`.
The shell's tokens — zinc surfaces, amber accent — stay inside the shell; `home` is the shell's own
page, so it is the one feature whose palette is the shell's (reasoning: `docs/adr/0003`).

## Colour

A feature's palette anchors on the Tailwind defaults: the nearest default entry to the original,
so every colour written in a class names one (a bespoke value in a class string is a lint error).
Black is `neutral-900` and white is `neutral-50`, or the nearest non-pure neighbour.

## Tests

Component behaviour is proven by integration and by a human, so `src/components/` and
`src/features/*/components/` carry no unit tests.
Tests cover routing primitives, data manifests, server modules and pure logic.

## Cleanup

A feature that opens an active resource releases it on unmount: `cancelAnimationFrame` for a game
loop, `ws.close()` for tetris, stopped audio sources and a closed `audioContext`, removed global
listeners.
Every feature PR adding a loop, a socket or audio gets this check.

## Accessibility and contrast

Shell text holds WCAG AA for normal text and AAA for primary text on the shell background — the
contrast table in the archived `brainstorm-visual-identity.md`.
A feature's interior is exempt, preserving its era's choices.

## Language

Reviewing language: one language per document, English, with French in user-facing UI copy only.

## Defaults

A hedged default is a decision: "maybe X" means X gets built, and a deviation from it is surfaced,
never re-asked.
