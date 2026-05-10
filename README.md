# Luis Escolano — portfolio

Software engineer. Site at [www.luisep.dev](https://www.luisep.dev).

## What this is

A small bilingual (EN/ES) portfolio: home, projects, articles, now, contact. Astro + MDX, deployed on Vercel.

## Why the repo is public

The site is content — projects I've built, articles I've written — and at the same time a working example of how I build at a personal scale. Everything in production comes out of files versioned here, alongside docs that explain *why* the pieces are shaped the way they are:

- The big design and engineering decisions are written with their rationale in [`docs/DECISIONS.md`](docs/DECISIONS.md).
- Stack, folder layout, i18n, content schemas, deploy and recovery live in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- The operational workflows for the AI coding agent that helps maintain this site are versioned as Claude Code skills under [`.claude/skills/`](.claude/skills/).
- The git history is the editorial log: small, narrated commits.

Articles follow the same idea: each one documents a technique I actually use in real projects.

## How it's organized

| Pointer | What's in there |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Router for Claude Code — profile, collaboration style, repo rules, links to the docs below |
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | What the site is, who it's for, what counts as "done" |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, folder structure, i18n, content collections, build, deploy, recovery |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Design and engineering decisions with their *why* |
| [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md) | Current state and the next ordered steps |
| [`.claude/skills/`](.claude/skills/) | Operational workflows (docs governance, content authoring) |

For a quick skim of *what* I build and *how I think*, [`docs/PRODUCT.md`](docs/PRODUCT.md) and [`docs/DECISIONS.md`](docs/DECISIONS.md) are the highest-signal reads.

## Stack

Astro 6 + Tailwind v4 + MDX, TypeScript strict, deployed on Vercel. Bilingual EN/ES via Astro's native i18n. Dark only by design (see [`docs/DECISIONS.md`](docs/DECISIONS.md)).

## Local development

```bash
pnpm install     # Node 22 (.nvmrc), pnpm 11 via corepack
pnpm dev         # http://localhost:4321
pnpm build       # static output to ./dist
pnpm test:e2e    # Playwright suite
```

Full cold-clone steps: [`docs/ARCHITECTURE.md` → "Cold-clone bootstrap"](docs/ARCHITECTURE.md).

## Adding content

Articles and projects are MDX files under `src/content/`. Conventions (slugs, frontmatter, partial-bilingual policy, when to promote a project from `other` to `featured`) are documented in the [`content-authoring`](.claude/skills/content-authoring/SKILL.md) skill.
