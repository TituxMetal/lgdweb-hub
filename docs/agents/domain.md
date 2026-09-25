# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the
codebase.

**Layout: single-context.**

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — the glossary.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

This repo's own records sit alongside them and are read the same way:

- **`docs/plans/showroom.md`** — the design record of the showroom unit: the WHAT its tickets
descend from.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't
suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs`
and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get
resolved.

## File structure

```
/
├── CONTEXT.md                  ← created when the first term is resolved
├── docs/adr/                   ← created when the first decision lands
│   ├── 0001-…
│   └── 0002-…
├── docs/plans/showroom.md      ← the unit's design record
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a
test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary
explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing
language the project doesn't use (reconsider) or there's a real gap (note it for
`/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently
overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
