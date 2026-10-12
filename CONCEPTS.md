# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with
project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and
ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or
catch-all.

## Relationships

A Project manifest entry is described by exactly one Old project or Recent project. An Old project
is rendered by at most one Feature, resolved through its Slug; a Recent project has no Feature and
lives off-site. A Feature belongs to exactly one identity level — the shell's, or its own era's.
The realtime vocabulary is unrelated to the rest: a Room holds Seats, and a Seat is bound to one
Peer connection.

## The showroom

### Hub
The whole `lgdweb.fr` ecosystem — hub, journal and blog — which together are the author's
portfolio. The showroom is its first concrete piece; the rest arrives in its own design.

*Avoid:* site, portfolio, ecosystem

### Showroom
The landing page at the apex, listing the projects and letting a visitor enter each one. It presents
projects, it does not host the recent ones.

*Avoid:* gallery, index, catalogue, list page

### Old project
A project from the learning years, modernized in place and served inside this codebase under its own
URL. Its source of truth for colour and behaviour is the archived original, not a description of it.

*Avoid:* legacy project, archive project, project

### Recent project
A project of the Road to Six initiative, displayed as an external link card. It keeps living on its
own deployment and the showroom only signals its existence — it has no Feature here.

*Avoid:* new project, side project, project

### Source project
The original code of an old project, kept in the archive or on GitHub and linked from its card. It
is read-only reference: the modernization reads it to preserve identity, and never executes it.

*Avoid:* original repo, legacy code, upstream

### Modernization
Rewriting an old project in the current canonical stack while preserving its visual look, gameplay
and content. The code is replaced; the identity is not. This is why a modernized feature may
deliberately keep behaviour a fresh implementation would have dropped.

*Avoid:* port, migration, rewrite, refactor

### Thumbnail
The captured screenshot an old project's card and social preview carry. A project without one renders
without an image rather than with a substitute; recent projects never carry one, since the showroom
does not own their appearance.

### Slug
The short stable identifier a project is addressed by — in its URL, its manifest entry, its feature
folder and its registry key. The four must agree; a slug present in one and absent from another is a
disagreement the showroom must not ship.

## The codebase

### Shell
The layout, the project list, the cards and the back-to-list control: the Hub's own visual identity,
at the top level of the app. It stays ignorant of what any feature contains, including its routes.

*Avoid:* app, chrome, framework, layout

### Feature
All the code for one old project — components, hooks, logic, types — self-contained in its own
folder and exposed through one public entry file. Another feature imports only that entry; reaching
past it is a review failure, not a build failure, since nothing enforces the boundary.

*Avoid:* page, view, module, mini-app, project

### Home
The shell's own page, sitting in a feature folder like the others. It is the one feature whose palette
*is* the shell's, because it is the shell's page rather than a guest inside it.

### Placeholder
What the showroom renders for a manifest project whose feature has not landed yet — the project's
title and a notice that it is coming. It is the designed outcome of the two lists disagreeing in that
direction, not an error; the opposite direction — a feature with no manifest entry — is the failure
the showroom refuses.

### Project manifest
The single list of projects — slug, title, date, description, tech, links, and which kind each one is
— that belongs to neither the client nor the server side and describes reality for both. Every other
surface derives from it: the cards, the routes, the emitted documents. A second source of the same
facts is the defect, not the redundancy.

*Avoid:* registry, catalogue, projects file

### Feature registry
The map from slug to the lazily-loaded feature that renders it — the one line an author adds when a
project lands, and the seam the manifest is checked against. It is not a second manifest: it holds
no project facts, only the wiring.

### Route map
The central declaration of which URLs the app answers and what each renders. It stays minimal and
feature-agnostic: a project's internal paths are not declared here, they belong to the feature
mounted at the project's prefix.

### Project route
The URL branch that mounts a project's feature and matches by prefix, so any path under it reaches
that project however deep it goes. The remainder past the prefix belongs to the feature, which reads
it itself to address its own sub-routes — which is why a feature's internal paths stay shareable and
reloadable without the central map learning about them.

### Area
The part of the codebase a ticket touches, declared through the ticket's own label. It is a delivery
concept, not a code boundary — it never corresponds to a folder or a module.

*Avoid:* scope, domain, component, module

## Visual identity

### Shell identity
The one look the showroom itself wears — its surfaces and its single accent — carried by the shell
and by no feature interior. Its contrast minimums apply here.

### Era identity
The look a modernized feature re-implements from its original, since modernization replaces the code
and not the identity. A feature reads only its own colours, and its interior is exempt from the
shell's contrast minimums, because it preserves its era's choices.

### Palette record
The per-feature file listing each original colour, the archived file it was read from, and the
current colour it maps to. It is the evidence that an era identity was reproduced rather than
invented, and the reason a feature's colours can be reviewed at all.

## Delivery

### Slice
One delivery unit — one ticket, one branch, one pull request. Work is planned and reviewed in these,
so a change spanning several is several slices.

*Avoid:* sprint, milestone, phase, iteration, step

### Checkpoint
A slice where something beyond the ordinary happens — the first production deploy, for instance.
Marking one changes how a slice is treated; it is not a synonym for a release or a version.

*Avoid:* milestone, release, V1, deadline

## Realtime

The vocabulary of the one feature that carries a server-held session. It is unrelated to the
showroom's own vocabulary and appears only where a project's gameplay spans two browsers.

### Room
A code and a fixed, small number of seats, held in server memory and nowhere else. A room is
addressed by its code and lasts as long as its seats do; a server restart loses every room, which
the design accepts. A room carries a player's board to the other seat and never reads a board for
itself — it holds no game rules and decides nothing.

### Seat
A player's place in a room, scoped to one connection. A seat is released when its occupant leaves,
and held briefly after a connection drops so a refresh or a quick reconnect reclaims it rather than
arriving as a newcomer — a room with no seats left is gone.

### Seat token
A seat's proof of ownership, known to its holder alone. Identity alone does not make someone a seat's
holder: a claim without the matching proof is refused, which is what makes reconnecting after a
reload work without letting anyone take over an occupied seat.

### Peer
The other player in a room, as seen from one seat. What one player sends is their own board as they
compute it; the other player draws that, and neither side derives a game from the other's board.

### Snapshot
One player's board relayed as it stands, already complete as the opponent will draw it. The sender
computes it, the server only carries it, and it is never treated as authoritative game state.

### Peer status
What a player reports their own game as doing. It is reported, never inferred: each player's status
is their own claim about their own board, so the other seat learns it only because it was sent.

### Refusal
A structured rejection of a request the room will not serve, carrying a code naming why. It is an
answer, never a dropped connection or a thrown error, and the code is what the sender is told.

### Recovery action
What a refused player can do about it — asked for a fresh room, or play alone. It is the endpoint's
policy, told with the refusal code rather than beside it, so every refusal names both what happened
and what to do next.

## Flagged ambiguities

- "project" had been used for every kind of entry — old, recent and feature folder alike. These are
  distinct: an **old project** and a **recent project** are manifest entries, a **feature** is the
  code that renders one, and a **source project** is the archived original.
- "placeholder" had been used both for the showroom's not-yet-built project page and as a UI word for
  an input hint. The domain term is the page; the other is ordinary interface vocabulary.
