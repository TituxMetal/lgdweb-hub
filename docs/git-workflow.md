# Git workflow

This project's git posture. The spine and its instruments read it through
[`../AGENTS.md`](../AGENTS.md).

## Remote

`origin` is an **ssh** remote (`git@github.com:…`). The URL is fixed: a push that would
need a different one is a question for the human, never an edit.

## Branches

- Work happens on a branch; the default branch only ever fast-forwards.
- Ticket branches: `<slug>-<n>` unless the conventions above say otherwise, forked from
  the remote tip of the default branch.
- The default branch is never rebased, and the remote is never force-pushed.
- `ship` deletes the merged head branches by name.

## Commits

- Signed by the global `commit.gpgsign`; pass no signing flag, `-S` included.
- A blocked GPG passphrase stops the run and asks the human: no agent workaround, no
  unsigned fallback.
- The default branch carries no commit from hand — the one exception is the workflow
  index entry, written by `ticket` and `ship`.

## Pull requests

- The PR body carries `Fixes #<n>`, so the merge closes the ticket.
- One ticket, one branch, one PR: the tail opens it and babysits it.
