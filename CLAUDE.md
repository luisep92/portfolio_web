# Luis Escolano Portfolio — instructions for Claude Code

This file is a **router**: pointers to the source of truth for each topic, not technical content. Any technical claim added here will end up contradicting its authoritative doc when that doc changes. Each technical fact lives in EXACTLY one place (a doc or a skill); CLAUDE.md only links.

## Product

Personal portfolio for Luis Escolano. Astro + Tailwind + MDX, bilingual EN/ES, deployed on Vercel. Public repo. Audience: senior engineers, recruiters at technical scale-ups, and technical readers who care about quality of thought.

| Topic | Doc |
|---|---|
| Concept, audiences, page structure, success criteria | [docs/PRODUCT.md](docs/PRODUCT.md) |
| Folder structure, i18n approach, content collections, build & deploy | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Current state and next ordered steps | [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md) |
| Big decisions with their why | [docs/DECISIONS.md](docs/DECISIONS.md) |
| Live notes / scratchpad | [docs/my-notes.md](docs/my-notes.md) |

**Start every session by reading [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md).**

---

## User profile

Engineer who builds product. Comfortable across stacks (game mods, MCP tooling, web). Previous serious projects include the Aline boss fight Beat Saber/Vivify map, `fmodel-mcp` and a `unity-mcp` Unity 2019.4 port, Hollow Knight mods with 10k+ users, and a few private SaaS. Uses AI-augmented development workflows seriously.

Treat as a **senior colleague**, not a tutorial. Direct proposals, brief justification, wait for him to ask if something is unclear. Don't explain basics unless they are specific to the stack at hand. He validates outside the conversation (browser, Vercel preview, devtools) and reports back — trust his validation.

---

## Collaboration style

Behaviors he has asked for explicitly. Persist across sessions.

### Learn from small obstacles — don't sanitize debugging

He values walking through "small stones" (dead ends, intermittent failures, why something doesn't work and what that reveals about the stack) over a clean path that hides the journey. Uses it to build intrinsic knowledge. *Applies to* small stones; *does NOT apply to* real risk of work loss or yak-shaves of hours that probably won't pay off.

- When a tool/script fails: walk through the diagnosis explicitly. No silent retry, no sweeping under the rug.
- Framing: "Found: X fails because Y." Don't apologize for hitting an obstacle.
- For risky moves (deleting caches, force-resets, destructive git): declare blast radius up front and confirm — but don't avoid the diagnosis just because it might fail.

### Isolate validations — one new system at a time

When a prototype introduces N new systems (animation + state + i18n routing + new layout + ...), break it into discrete steps before combining. Phrases like "we'll validate X while doing Y" are the failure pattern — that compounds X and Y, and a failure can't be pinpointed. If a step exercises more than one new thing, propose explicit sub-steps.

### Bias toward building tooling — manual estimates are optimistic

His estimates of manual friction are systematically low. Past evidence: `unity-mcp`, `fmodel-mcp` — "5 minutes per query isn't worth automating" turned into 2 days of actual time lost before building the wrapper.

- If we're going to make >3 queries to an external tool we don't control in the near horizon, propose building the wrapper before the 4th query.
- Don't use the deadline as a universal argument against tooling — ask him; his time matters more than my friction estimate.

### Language

Conversation, project files (docs, code, comments), and git commits: **English**. Everything in this repo is in English so that the public audience can read it without translation friction. Detail in [docs/DECISIONS.md → "Language"](docs/DECISIONS.md).

---

## Non-negotiable repo rules

Pure rules only (no versioned facts that can drift). For technical facts with versions (build commands, framework specifics, deploy config), see the linked authoritative doc or skill.

1. **Public repo — no secrets, no unconsented client info.** Anything that touches client work (María, Opositia, future engagements) gets a separate permission gate before it's referenced. Environment variables go in `.env.example` with placeholders, never in committed files. No API keys, no auth tokens, no internal URLs.
2. **Any new technical claim in CLAUDE.md → rewrite as a pointer.** If a technical rule starts living here, the moment it changes there will be drift. Move the claim to its authoritative doc/skill and leave only the pointer.
3. **Living docs: every behavior change updates the authoritative doc/skill in the SAME commit.** If the commit changes code/scripts/schema/workflow and doesn't touch docs, something is missing. Concrete rules + checklist + "what goes where" map in the [`docs-governance`](.claude/skills/docs-governance/SKILL.md) skill.
4. **`main` is protected — work on branches, ship via PR.** Every push to `main` auto-deploys to production. Direct pushes are blocked on GitHub; non-trivial changes go through a feature branch + PR with the e2e check passing. Trivial edits (typos, copy, `Last updated`) can land on `main` directly. Detail in [docs/DECISIONS.md → "Git workflow"](docs/DECISIONS.md).
5. **Memory: only `user` and `feedback` types in this project.** Project facts (decisions, paths, current state) go to versioned docs, never to memory. The `project` and `reference` memory types stay unused here. Detail in [docs/DECISIONS.md → "Memory policy"](docs/DECISIONS.md).

---

## Available skills

Skills live in `.claude/skills/<name>/SKILL.md` and are the **authoritative source** for operational workflows. If a skill contradicts this list, the skill wins (this list is just an index).

- [`docs-governance`](.claude/skills/docs-governance/SKILL.md) — what fact goes to which doc, when to update what, what NOT to put in CLAUDE.md or memory, pre-commit checklist, periodic audit.
- [`content-authoring`](.claude/skills/content-authoring/SKILL.md) — conventions for authoring articles and projects (slug, frontmatter, partial-bilingual policy, MDX components, when to promote a project from `other` to `featured`).

## Tools outside the repo

None at this point. If we add wrappers or external tooling specific to this project, document them here and link to their location.
