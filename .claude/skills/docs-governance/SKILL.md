---
name: docs-governance
description: Use whenever you change behavior, decisions, paths, content schemas, or workflows that the documentation describes. Trigger when adding or removing scripts, modifying a content collection schema, revisiting a deferred decision, closing a NEXT_STEPS item, persisting a session-learning worth keeping, when the user asks "is this documented?", or when you spot drift between docs and code.
---

# Docs governance

Rules for keeping the documentation alive: where each fact lives, when to update what, what NOT to do.

## Root principle

**Each technical fact lives in exactly ONE place (the authoritative source). Everything else links, doesn't copy.** If a fact appears in two places, the moment one changes there will be drift. CLAUDE.md is a router, not a container.

## Map: what goes where

| If what you learn or change is...                                                                                  | It goes to...                                                                                | NOT to...                                                                          |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A big decision with its *why*                                                                                      | [`docs/DECISIONS.md`](../../../docs/DECISIONS.md)                                            | NEXT_STEPS, memory                                                                 |
| Folder structure, paths, stack, content collection schemas, routing, build, deploy, recovery                       | [`docs/ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md)                                      | NEXT_STEPS (only a one-line summary if relevant)                                   |
| Current project state / next thing to do                                                                           | [`docs/NEXT_STEPS.md`](../../../docs/NEXT_STEPS.md)                                          | DECISIONS, memory                                                                  |
| Product concept, audiences, page structure, success criteria, scope                                                | [`docs/PRODUCT.md`](../../../docs/PRODUCT.md)                                                | other                                                                              |
| Operational recipe for a domain (how to author MDX, how to add a project, how to add an MDX component)             | The corresponding skill in `.claude/skills/<area>/SKILL.md` (today: [`content-authoring`](../content-authoring/SKILL.md)) | DECISIONS (only if the recipe encodes a non-negotiable decision) |
| Idea / question / scratch with no definitive home yet                                                              | [`docs/my-notes.md`](../../../docs/my-notes.md) — migrates when it matures                   | authoritative docs                                                                 |
| A script's behavior                                                                                                | The script's docstring or top-of-file comment                                                | docs (only a summary + link if needed)                                             |
| Exact version of a dependency                                                                                      | `package.json` / `pnpm-lock.yaml`                                                            | other                                                                              |
| Persistent memory (`~/.claude/projects/.../memory/`)                                                               | Only `user` and `feedback` types. **No project facts.**                                      | any project fact (those go to versioned docs)                                      |

## When to update docs (in the SAME commit as the change)

Any change that invalidates an existing claim in the documentation must update the authoritative doc in the same commit. If the commit changes behavior and doesn't touch docs, something is missing.

Concrete triggers to review and update:

- **Add or remove a script** → [`ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md) (folder structure, build & deploy, or a new "scripts" subsection if a script lives outside the standard `pnpm` flow) + reference in the relevant skill if it changes an operational recipe.
- **Change a content collection schema** (`articles`, `projects`, or any future collection) → [`DECISIONS.md`](../../../docs/DECISIONS.md) (the *why*) + [`ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md) "Content collections" table (the schema itself) + [`content-authoring`](../content-authoring/SKILL.md) (the authoring guidance).
- **Change `.gitignore` or what is considered versioned** → [`ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md) "Recovery table" + the surrounding context.
- **Change i18n behavior** (default locale, fallback semantics, locale list) → [`DECISIONS.md`](../../../docs/DECISIONS.md) (if the rule changes) + [`ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md) "i18n approach" / "Article and project i18n strategy".
- **Close a NEXT_STEPS item** → [`NEXT_STEPS.md`](../../../docs/NEXT_STEPS.md) (mark the step + update the "Current state" header if it changed).
- **Make a big decision** (architectural, scope, deadline, design) → [`DECISIONS.md`](../../../docs/DECISIONS.md) (new entry, or move a closing item from "Open" to the body).
- **Find a repeatable gotcha** (Astro hydration edge case, Tailwind config quirk, Vercel build failure that recurs, MDX rendering surprise) → relevant skill, or open a new skill if none fits.
- **Change a workflow** (how we build, how we deploy, how we author content) → [`ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md) and/or the operational skill.
- **Add or remove an MDX component** → [`ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md) "MDX components" + [`content-authoring`](../content-authoring/SKILL.md).

## When NOT to put something in docs

- **No speculation in authoritative docs.** If "I think it works this way" but it isn't validated, it goes to `my-notes.md` flagged as a hypothesis. When validated, it migrates to its proper home. Unverified facts in authoritative docs are traps for future sessions.
- **No historical narrative.** "This used to be X, we migrated to Y" doesn't help — only the current state matters. Exception: a `DECISIONS.md` entry captures the *why* of a decision, but not the archaeology of intermediate steps.
- **No duplication.** If `ARCHITECTURE.md` says it, don't repeat it in `CLAUDE.md` or in a skill — link.
- **Nothing in `CLAUDE.md` beyond router, user profile, collaboration style, and pure non-negotiable rules without versioned facts.** Any technical claim that creeps in there will drift.
- **No project facts in memory.** Memory in this project is restricted to `user` and `feedback` types per [`DECISIONS.md → "Memory policy"`](../../../docs/DECISIONS.md). Project facts go to versioned docs, always.

## Pre-commit checklist

Before closing a commit that changes behavior:

1. Did I touch a script, rule, schema, workflow, or decision? → Is the authoritative doc/skill updated in this same commit?
2. Did I add a new technical fact? → Does it live in exactly ONE place?
3. Did the commit rename or delete something referenced elsewhere? → `grep` the old name across `docs/` and `.claude/`.
4. Did I close a NEXT_STEPS item? → Mark it as completed and update the "Current state" header if the state changed.
5. Did personal memory change along the way? → If a memory entry is project-shaped (`project` or `reference` type), migrate the content into the right doc and remove the memory entry. Memory in this project keeps only `user` and `feedback`.

## Periodic audit

When the user asks for a docs review ("re-read every line"), or when a session has been long with multiple pivots:

1. **`grep` for broken references**: paths to deleted files, links to docs/sections that no longer exist, references to old names.
2. **Re-read docs as a cold clone**: can someone who pulls the repo today bootstrap and run? Do they know what's versioned and what isn't, and how to recover what's been deleted? → If not, fix [`ARCHITECTURE.md → "Cold-clone bootstrap"`](../../../docs/ARCHITECTURE.md) and "Recovery table".
3. **Verify internal consistency**: NEXT_STEPS header vs. the actual state of its substeps, contradictions between DECISIONS and skills, examples in docs vs. reality of the code (especially folder structure and content collection schemas).
4. **Delete what no longer applies**: docs of finished tasks, sections covering a gotcha that's already solved upstream, "open" decision entries that have quietly become closed.
