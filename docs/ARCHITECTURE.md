# ARCHITECTURE

How the portfolio is built, organized, deployed, and recovered. Operational reference. Decisions that shape this architecture (and their *why*) live in [DECISIONS.md](DECISIONS.md); this document describes the *current state* of the implementation.

---

## Stack

| Layer | Choice | Why (one line; full rationale in [DECISIONS.md](DECISIONS.md) → "Stack") |
|---|---|---|
| Framework | Astro 6.x | Static-first, MDX as a first-class citizen, light interactivity where needed. |
| Styling | Tailwind v4 (via `@tailwindcss/vite`) | Utilities map directly to the visual restrictions in DECISIONS, no design drift. v4 config is CSS-based — no separate `tailwind.config.*` file; tokens live under `@theme` in `src/styles/global.css`. |
| Long-form content | MDX (`@astrojs/mdx`) | Articles and featured-project narratives can embed components like `<VideoEmbed />`. |
| Application code | TypeScript (strict) | Default; no benefit to opting out at this size. `tsconfig.json` extends `astro/tsconfigs/strict`. |
| Hosting | Vercel | Lowest-friction Astro deploy; PR previews without configuration. |
| Package manager | pnpm 11.x | Fast, content-addressable store; `pnpm-lock.yaml` is the source of truth for dep versions. Build scripts that need to run install hooks (`esbuild`, `sharp`) are allowlisted in `pnpm-workspace.yaml` under `allowBuilds` — pnpm 11 reads this file even outside a monorepo. |
| Node runtime | Node 22 LTS | Pinned via `package.json` `engines` and `.nvmrc`. Required by Astro 6 and pnpm 11. |

Versioned facts (Astro version, Tailwind version, exact Node line) live in `package.json` and `pnpm-lock.yaml` — those files are the source of truth, not this document.

---

## Folder structure

```
portfolio_web/
├── CLAUDE.md                           # router for Claude Code; vive at root
├── README.md                           # public-facing intro
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml                 # pnpm 11 settings (allowBuilds for esbuild/sharp); not a monorepo
├── astro.config.mjs
├── tsconfig.json
├── .nvmrc                              # pins Node version
├── .gitignore
├── .env.example                        # placeholders only; real .env never committed
├── docs/                               # source of truth for project knowledge
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md                 # this file
│   ├── DECISIONS.md
│   ├── NEXT_STEPS.md
│   └── my-notes.md                     # scratchpad; promotes to authoritative docs when mature
├── .claude/
│   ├── settings.json
│   └── skills/
│       ├── docs-governance/SKILL.md
│       └── content-authoring/SKILL.md
├── public/                             # static assets served as-is from /
│   ├── favicon.ico
│   ├── og-image.png
│   ├── fonts/                          # self-hosted WOFF2 if we go that route
│   └── media/
│       └── projects/                   # videos, posters, screenshots referenced from MDX
├── src/
│   ├── content/
│   │   ├── config.ts                   # Zod schemas for collections
│   │   ├── articles/
│   │   │   ├── en/
│   │   │   │   └── <slug>.mdx
│   │   │   └── es/
│   │   │       └── <slug>.mdx
│   │   └── projects/
│   │       ├── en/
│   │       │   └── <slug>.mdx
│   │       └── es/
│   │           └── <slug>.mdx
│   ├── components/
│   │   ├── layout/                     # Header, Footer, LocaleToggle, Container
│   │   ├── ui/                         # primitives (Link, Heading, Card)
│   │   └── mdx/                        # components used inside MDX (VideoEmbed, Callout, Figure)
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ArticleLayout.astro
│   │   └── ProjectLayout.astro
│   ├── pages/
│   │   ├── index.astro                 # /
│   │   ├── projects/
│   │   │   ├── index.astro             # /projects
│   │   │   └── [slug].astro            # /projects/<slug> (featured only)
│   │   ├── articles/
│   │   │   ├── index.astro             # /articles
│   │   │   └── [slug].astro            # /articles/<slug>
│   │   ├── now.astro                   # /now
│   │   ├── contact.astro               # /contact
│   │   └── es/                         # mirror of the above under /es/
│   │       ├── index.astro
│   │       ├── projects/
│   │       ├── articles/
│   │       ├── now.astro
│   │       └── contact.astro
│   ├── i18n/
│   │   ├── ui.ts                       # shared UI strings keyed by locale
│   │   └── utils.ts                    # locale helpers (getLocaleFromUrl, localizedPath, etc.)
│   ├── lib/                            # general utilities (date formatting, etc.)
│   └── styles/
│       └── global.css                  # Tailwind base + handful of custom rules
└── examples/                           # reference docs from the previous project; will be deleted once the harness here is approved
```

`node_modules/`, `dist/`, `.astro/`, and any local `.env` are gitignored.

---

## i18n approach

Astro's native i18n config drives routing. Spec:

- `defaultLocale: 'en'`, `locales: ['en', 'es']`.
- `routing: { prefixDefaultLocale: false }` — English is at `/`, Spanish is at `/es/`.
- Locale toggle is a small component in the `Header` that, given the current pathname, computes the equivalent path in the other locale and renders a link. Helper in `src/i18n/utils.ts`.
- All UI strings (header labels, page titles for static pages, "not yet available in this language" notice copy, etc.) live in `src/i18n/ui.ts` as a typed `Record<Locale, ...>`. Components consume them via a `t(locale, key)` helper.
- `<html lang>` is set per locale by `BaseLayout`.
- Dynamic content (articles, projects) is co-located by locale under `src/content/<type>/<locale>/`. Static pages are duplicated under `src/pages/` and `src/pages/es/` because Astro's file-based routing requires it. Strings in the duplicated pages come from `src/i18n/ui.ts` — the page files themselves should be near-identical between locales, with text pulled from the shared dictionary.

---

## Content collections

Two collections, defined in `src/content/config.ts` with Zod schemas.

### `articles`

```
src/content/articles/
├── en/
│   └── <slug>.mdx
└── es/
    └── <slug>.mdx
```

Frontmatter schema:

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes |  |
| `description` | string | yes | Used for `<meta>` and the index card. ~140 chars target. |
| `publishedAt` | date | yes | ISO date. |
| `updatedAt` | date | no | Show on the article when present. |
| `tags` | string[] | no |  |
| `coverImage` | string | no | Path under `/public/media/...` or external URL. |
| `draft` | boolean | no | Defaults false. Drafts are excluded from prod builds. |

### `projects`

```
src/content/projects/
├── en/
│   └── <slug>.mdx
└── es/
    └── <slug>.mdx
```

Frontmatter schema:

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes |  |
| `summary` | string | yes | One-liner used in the index card. |
| `tier` | `'featured' \| 'other'` | yes | Drives whether a full page is rendered. |
| `order` | number | yes | Sort order within the tier on the index. Lower = earlier. |
| `year` | number | no |  |
| `role` | string | no | Free-text, e.g. "Solo author", "Backend lead". |
| `links` | object | no | `{ repo?, demo?, video?, article? }`, each a URL string. |
| `coverImage` | string | no |  |
| `draft` | boolean | no | Defaults false. |

Schema additions are decisions — propose in chat, capture in DECISIONS.md, then update the schema and this table in the same commit.

---

## Featured vs Other

Both project tiers live in the same collection. They diverge in **rendering**, not in **shape**.

- **Featured** (`tier: 'featured'`): rendered as a full page at `/projects/<slug>` (and `/es/projects/<slug>`) using `ProjectLayout`. Listed at the top of the projects index with rich card (cover image, summary, links). The MDX body is the narrative.
- **Other** (`tier: 'other'`): listed only on the projects index, as a compact one-liner — title, year, role, summary, link out. **No individual page is generated.** The MDX body, if any, is ignored at render time but kept in the file for when a project gets promoted.

Promoting an "other" project to featured is a frontmatter flip plus a writeup. Criteria for when to promote live in [`content-authoring`](../.claude/skills/content-authoring/SKILL.md).

---

## Article and project i18n strategy

A given article or project may exist in EN only, ES only, or both. Slug is shared across locales when both versions exist.

Pages that resolve a content item by slug (articles `[slug].astro`, projects `[slug].astro`, and their `/es/` mirrors) follow this resolution:

1. Look up `<type>/<requestedLocale>/<slug>.mdx`.
2. If present → render it normally with `ArticleLayout` / `ProjectLayout`.
3. If absent → look up `<type>/<otherLocale>/<slug>.mdx`.
4. If the other-locale version exists → render the **"not yet available in this language"** layout with a link to the available version. **Do not** silently render the other-locale content inside the requested-locale shell.
5. If neither exists → 404.

Helper for the lookup lives in `src/lib/content.ts` (`getEntryByLocale(collection, slug, locale)`). The "not yet available" layout is a small component that takes the available entry as a prop and renders title + summary + the localized notice + the link.

---

## Routing map

| Path | Generated by | Source |
|---|---|---|
| `/` | `src/pages/index.astro` | Static |
| `/es/` | `src/pages/es/index.astro` | Static |
| `/projects` | `src/pages/projects/index.astro` | Lists all `projects/en/*` |
| `/es/projects` | `src/pages/es/projects/index.astro` | Lists all `projects/es/*` |
| `/projects/<slug>` | `src/pages/projects/[slug].astro` | One page per `projects/en/*.mdx` with `tier: 'featured'` |
| `/es/projects/<slug>` | `src/pages/es/projects/[slug].astro` | One page per `projects/es/*.mdx` with `tier: 'featured'`, **plus** fallback pages for featured slugs that exist in EN only |
| `/articles` | `src/pages/articles/index.astro` | Lists all `articles/en/*` |
| `/es/articles` | `src/pages/es/articles/index.astro` | Lists all `articles/es/*` |
| `/articles/<slug>` | `src/pages/articles/[slug].astro` | One page per `articles/en/*.mdx` |
| `/es/articles/<slug>` | `src/pages/es/articles/[slug].astro` | One page per `articles/es/*.mdx`, **plus** fallback pages for slugs that exist in EN only |
| `/now`, `/es/now` | Static pages | UI strings from `src/i18n/ui.ts` |
| `/contact`, `/es/contact` | Static pages | Same |

The `[slug].astro` pages return their `getStaticPaths()` from a helper that, for each tier-eligible slug across both locales, emits the correct paths and the right "missing translation" fallback. Centralizing this in one helper avoids the routing logic drifting across the four `[slug].astro` files.

---

## MDX components

Components available inside MDX bodies are exposed through Astro's MDX integration. Initial set:

| Component | File | Purpose |
|---|---|---|
| `<VideoEmbed />` | `src/components/mdx/VideoEmbed.astro` | Self-hosted or YouTube/Vimeo video with poster image, lazy load, and reduced-motion respect. |
| `<Callout />` | `src/components/mdx/Callout.astro` | Inline highlighted block: `note`, `warn`, `aside`. |
| `<Figure />` | `src/components/mdx/Figure.astro` | Image with caption, sourced from `/public/media/...`. |

To add a new MDX component:

1. Create the `.astro` file under `src/components/mdx/`.
2. Add it to the `components` map exported from `src/components/mdx/index.ts`.
3. Pass that map into `<Content components={mdxComponents} />` in the layouts that render MDX (`ArticleLayout`, `ProjectLayout`).
4. Document the new component in this section and in [`content-authoring`](../.claude/skills/content-authoring/SKILL.md).

---

## Build and deploy

- **Local dev**: `pnpm dev` → Astro dev server, hot reload.
- **Build**: `pnpm build` → static output in `dist/`.
- **Preview a build**: `pnpm preview` → serve `dist/` locally (sanity check before pushing).
- **Deploy**: GitHub → Vercel, automatic on push to `main`. Pull requests get preview URLs automatically.
- **Environment variables**: `.env.example` documents the keys. Real values live in Vercel project settings, never in the repo. There are no required env vars at v1; this slot is reserved for future use (analytics tokens, etc.).

---

## Cold-clone bootstrap

Steps for someone (or future-Luis) cloning the repo and running it locally for the first time. Keep this list current — if a step changes, update it in the same commit.

1. `git clone <repo>` and `cd portfolio_web`.
2. Read [CLAUDE.md](../CLAUDE.md) and [docs/NEXT_STEPS.md](NEXT_STEPS.md) — orientation before touching code.
3. Install Node at the version pinned in `.nvmrc` (`nvm use` if you're on nvm).
4. `corepack enable && corepack prepare pnpm@<latest> --activate` if pnpm isn't installed.
5. `pnpm install`.
6. `cp .env.example .env` and fill in any real values you need (none required at v1).
7. `pnpm dev` → open the URL it prints.
8. To produce a production build locally: `pnpm build && pnpm preview`.

If any of the above fails, the failure itself is the next NEXT_STEPS item. Don't paper over it.

---

## Recovery table

What's versioned, what's regenerable, what's gone if it disappears.

| Artifact | Location | Status | Recovery |
|---|---|---|---|
| All source code, docs, content | repo | **Versioned in git** | `git checkout` / `git restore` |
| `package.json`, `pnpm-lock.yaml` | repo | Versioned | Same |
| `.env` (real values) | local + Vercel | Not versioned by design | From a personal password manager / Vercel dashboard |
| `node_modules/` | local | **Regenerable** | `pnpm install` |
| `dist/` | local + Vercel build artifact | **Regenerable** | `pnpm build` (local) or redeploy (Vercel) |
| `.astro/` cache | local | **Regenerable** | Auto-rebuilt on next `pnpm dev` / `build` |
| Self-hosted fonts in `public/fonts/` | repo (if we go self-hosted) | Versioned | Same; under the foundry's license |
| Media files (videos, posters) | `public/media/` | Versioned | Same. Heavy binaries get LFS only if it becomes a problem; default is plain git. |
| Vercel project settings | Vercel dashboard | Not versioned | Manually re-create from a personal note if the project is deleted upstream. |

There are no junctions, no external mods, no out-of-repo build dependencies. The repo is fully self-contained except for `.env` and the Vercel project itself.

---

## Tools outside the repo

None at this time. If we add wrappers, scripts, or tooling that doesn't fit cleanly inside the repo (e.g. a personal CLI for content management), document them here and link to where they live.
