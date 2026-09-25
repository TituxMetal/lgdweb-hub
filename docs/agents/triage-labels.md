# Triage Labels

The skills speak in terms of canonical triage roles. This file maps those roles to the actual
label strings used in this repo's issue tracker (`TituxMetal/lgdweb-hub`, GitHub).

## State roles (exactly one per triaged issue)

| Role in the skills | Label in our tracker | Meaning                                  |
| ------------------ | -------------------- | ---------------------------------------- |
| `needs-triage`     | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`       | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`  | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`  | `ready-for-human`    | Requires human implementation            |
| `wontfix`          | `wontfix`            | Will not be actioned                     |

## Category roles (exactly one per triaged issue)

| Role in the skills | Label in our tracker | Meaning                     |
| ------------------ | -------------------- | --------------------------- |
| `bug`              | `bug`                | Something isn't working     |
| `enhancement`      | `enhancement`        | New feature or improvement  |

## The spine's own families

Orthogonal to the triage roles above; `triage` leaves them alone.

| Family | Applied by | Meaning |
|---|---|---|
| `slice/<n>-<name>` | the human, when `ticket` writes a set | the slice of `docs/PROGRESS.md` |
| `area/<subsystem>` | the human, when `ticket` writes a set | the codebase area touched |
| `review/required`, `review/optional` | the human | the merge gate |

`ready-for-agent` is the label the spine (`orchestrator spec` / `ticket`) applies to a gated
spec and to its tickets: it is the repo's mapping of the AFK-ready role, and it is applied on
top of the families above, never instead of them.

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding
label string from these tables.
