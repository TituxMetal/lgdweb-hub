# lgdweb-hub

The showroom of the author's old learning projects, served at the apex of `lgdweb.fr`, and the
first piece of the Hub — the skills section and the navigation toward the blog and the journal
come later, in their own design.

## Language

### The showroom

**Hub**:
The whole `lgdweb.fr` ecosystem — hub + journal + blog — which together *are* the author's
portfolio.
_Avoid_: site, portfolio, ecosystem

**Showroom**:
The landing page at the apex listing the old and recent projects and letting a visitor enter each
one. The first concrete piece of the Hub.
_Avoid_: gallery, index, catalogue, list page

**Old project**:
A project from the learning years, modernized in place and served at `/projects/<slug>` inside
this codebase.
_Avoid_: legacy project, archive project, project

**Recent project**:
A project of the Road to Six initiative, displayed as an external link card; it keeps living on
its own deployment and the showroom only signals its existence.
_Avoid_: new project, side project, project

**Source project**:
The original code of an old project, kept in the archive or on GitHub and linked from its card.
_Avoid_: original repo, legacy code, upstream

**Modernization**:
Rewriting an old project in the current canonical stack while preserving its visual look,
gameplay and content. The code is replaced; the identity is not.
_Avoid_: port, migration, rewrite, refactor

**Project manifest**:
The single list of projects — slug, title, date, description, tech, links — that belongs to
neither side of the app and describes reality for both.
_Avoid_: registry, catalogue, projects file

### The codebase

**Shell**:
The layout, the project list, the cards and the `BackToList` control: the Hub's own visual
identity, at the top level of the app.
_Avoid_: app, chrome, framework, layout

**Feature**:
All the code for one old project — components, hooks, lib, types — self-contained under
`src/features/<slug>/` and exposed through its `index.ts`.
_Avoid_: page, view, module, mini-app, project

**Area**:
The part of the codebase a ticket touches; a ticket declares it through its `area/*` label.
_Avoid_: scope, domain, component, module

### Delivery

**Slice**:
One delivery unit — one ticket, one branch, one PR.
_Avoid_: sprint, milestone, phase, iteration, step

**Checkpoint**:
A slice where something beyond the ordinary happens — today, the first production deploy.
_Avoid_: milestone, release, V1, deadline
