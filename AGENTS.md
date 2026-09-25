# lgdweb-hub

## Mission

Serve the author's old learning projects at `lgdweb.fr` — listed by a showroom landing page,
each entered at `/projects/<slug>` and rewritten in the current canonical stack while keeping
the identity (look, gameplay, content) of the original. It is the first piece of the future
`lgdweb.fr` Hub, and that ecosystem — hub + journal + blog — **is** the author's portfolio.
Success: a visitor recognizes a project from the learning years, and every project runs on one
codebase.

## Stack

Bun (runtime, package manager, test runner) + Vite 7 / React 19 / Tailwind 4 client + Hono
server, single package, Biome for lint and format.

## Archived sources

The originals — each feature's source and the source of its original colours — are frozen
read-only at `~/archived/webdev/oldProjects/<project>/`.
The showroom brainstorms and design (`brainstorm-overall.md`, `-server.md`, `-client.md`,
`-visual-identity.md`, `design.md` — the source of `docs/SPECS.md`) are frozen read-only at
`~/archived/webdev/projects-ideas/showroom/`.

## Verify

Before a task is called done, these pass:

| What | Command |
|---|---|
| Build | `bun run build` |
| Tests | `bun test` |
| Types | `bun run typecheck` |
| Lint | `bun run lint:check` |
| Format | `bun run format:check` |

`bun run check` runs Format, Lint, Types and Tests in one pass; Build stays on its own.

An agent that cannot run them **says so**. It does not call a task done on a reading of the
code alone.

## Language

- This project's docs: **EN** — locked at the start, and it wins over the
  workspace rule. The one exception is **UI copy, which is written in FR**: the site is
  served to French-speaking visitors.
- Code is English: identifiers, comments, code filenames.
- One language per document.

## Conventions

Run `setup-matt-pocock-skills` once, when the project starts: it writes the tracker
conventions below, and the spine reads them through this list.

| File | What it holds |
|---|---|
| `docs/agents/issue-tracker.md` | the tracker and its conventions |
| `docs/agents/triage-labels.md` | the triage roles mapped onto this repo's labels |
| `docs/agents/domain.md` | where the glossary and the ADRs are read from |
| `docs/git-workflow.md` | this project's git posture |

`CODING_STANDARDS.md` holds the judgement calls the guardrails cannot decide; it is read at
review, when judging a diff.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `TituxMetal/lgdweb-hub`, driven by the `gh` CLI; PRs are a triage surface too. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical state roles keep their own names (`ready-for-agent` is the one the spine applies), alongside the `slice/*` and `area/*` families. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the root, next to this repo's `docs/SPECS.md` and `docs/PROGRESS.md`. See `docs/agents/domain.md`.

## Where artifacts go

| Folder | Written by | What |
|---|---|---|
| `docs/plans/` | `ce-brainstorm` | the requirements-only unified plan — the WHAT |
| `docs/ideation/` | `ce-ideate` | ranked directions, HTML by default |
| `docs/solutions/` | `ce-compound` | one solved problem, as a durable learning |
| `docs/agents/workflow/<slug>.md` | `orchestrator` (`ticket`, `ship`) | the workflow index: stable identifiers only, never state |
| `CONTEXT.md`, `docs/adr/` | `domain-modeling` | the glossary and the decisions, created when the first one lands |
| `CONCEPTS.md`, `STRATEGY.md` | `ce-compound`, `ce-strategy` | created when they have a reason to exist — never by hand |

The workflow index sits at `docs/agents/workflow/`; the spine is its only writer.

Categories inside `docs/solutions/` are emergent: a sub-folder appears when a theme does.

**The spine** needs an ssh remote, `gh` authenticated, and signed commits from the
global `commit.gpgsign`. It touches the default branch only for its own index entry.

`docs/SPECS.md` and `docs/PROGRESS.md` are this repo's own records: the consolidated design
and the slice tracker. They are inputs, not template artifacts.

## Definition of done

A task is done when:

- [ ] the verification commands above pass;
- [ ] the changed surface has been exercised for real — a game plays in a browser, a route
      resolves with its status code — not merely typed;
- [ ] `src/data/projects.ts` still describes reality: no listed project 404s, no reachable
      project is missing from the list;
- [ ] what was learned and will serve again is banked (`ce-compound`) — once really
      implemented **and** tested, not before.

## Discipline

Skill routing, folder conventions and adoption rules live at the workspace root:
[`../AGENTS.md`](../AGENTS.md). **Do not copy them here** — they change in one place.
