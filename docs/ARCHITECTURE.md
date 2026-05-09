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
│   ├── favicon.svg                     # monogram "LE" on slate-950, served as image/svg+xml
│   ├── og-default.png                  # 1200×630 social card; default for any page without per-entry coverImage
│   ├── fonts/                          # self-hosted WOFF2 if we go that route
│   └── media/
│       └── projects/                   # videos, posters, screenshots referenced from MDX
├── src/
│   ├── content.config.ts               # Zod schemas for collections (Astro 6: lives at src/, not src/content/)
│   ├── content/
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
│   │   ├── layout/                     # Header, Footer, LocaleToggle (chrome that wraps content)
│   │   ├── ui/                         # primitives (Container, future: Link, Heading, Card)
│   │   ├── mdx/                        # components used inside MDX (VideoEmbed, Callout, Figure)
│   │   ├── ArticleShareLinks.astro     # share intents (Twitter/LinkedIn/HN) + copy-link, rendered by ArticleLayout above and below the body
│   │   └── MissingTranslationNotice.astro  # rendered by [slug].astro when only the other-locale version exists
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
│   ├── lib/
│   │   └── content.ts                  # getEntryByLocale, getSlugsByLocaleUnion, isVisible (drafts-in-prod)
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

Two collections, defined in `src/content.config.ts` (Astro 6 location — note: file lives at `src/content.config.ts`, not under `src/content/`) with Zod schemas using the `glob` loader from `astro/loaders`. `zod` is imported directly (`import { z } from 'zod'`) — re-exporting `z` from `astro:content` is deprecated in Astro 6.

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

## SEO and social meta

All `<head>` metadata is centralized in `src/layouts/BaseLayout.astro`. Pages don't inject meta tags directly — they pass props to `BaseLayout` and the layout owns the rendering. Keeping it in one place is what lets us guarantee that every page ships canonical, hreflang, OG, and Twitter tags consistently.

`BaseLayout` props:

| Prop | Type | Default | Used for |
| --- | --- | --- | --- |
| `title` | string | `t(locale, 'site.title')` | `<title>`, `og:title`, `twitter:title` |
| `description` | string | `t(locale, 'site.description')` | `<meta description>`, `og:description`, `twitter:description` |
| `ogImage` | string (path or URL) | `/og-default.png` | `og:image`, `twitter:image` (resolved against `Astro.site` to absolute URL) |
| `ogType` | `'website' \| 'article'` | `'website'` | `og:type` |
| `publishedAt` | `Date` | — | `article:published_time` (only when `ogType="article"`) |

Always rendered (no opt-out):

- `<link rel="canonical">` — built from `Astro.site` + `Astro.url.pathname`. Single canonical per URL is what de-duplicates the `/` ↔ `/es/` pair for search engines.
- `<link rel="alternate" hreflang>` — three entries: current locale, other locale (computed via `localizedPath`), and `x-default` pointing at the `defaultLocale` version.
- `<link rel="icon" href="/favicon.svg">` — single SVG favicon, no PNG fallback (modern browsers support SVG favicons; we accept the small tail of older browsers seeing no icon as the cost of not maintaining multiple sizes).
- Open Graph: `og:title`, `og:description`, `og:url`, `og:type`, `og:image` + `width`/`height`, `og:site_name`, `og:locale`, `og:locale:alternate`.
- Twitter: `summary_large_image` card with `twitter:title`/`description`/`image`. **No `twitter:site`/`twitter:creator`** by intentional decision — keeping the portfolio identity separate from the personal Twitter (see [DECISIONS.md → "Open decisions"](DECISIONS.md) entry deferring author attribution).

`ArticleLayout` and `ProjectLayout` pass per-entry data:

- `ArticleLayout` → `ogType="article"`, `publishedAt={entry.data.publishedAt}`, `ogImage={entry.data.coverImage}`.
- `ProjectLayout` → `ogImage={entry.data.coverImage}`. Stays `ogType="website"` (no `publishedAt` on projects).

If an entry has no `coverImage`, the page falls through to `/og-default.png`. That image is the **same handcrafted card for every page without a cover**; per-entry image generation (e.g. `@vercel/og` rendering an OG card per article on demand) is intentionally deferred — see [DECISIONS.md → "Open decisions"](DECISIONS.md).

### Regenerating `og-default.png`

The default OG card is a static PNG screenshotted from a hand-written HTML source. When the accent colour or wordmark changes (Step 14 of [NEXT_STEPS.md](NEXT_STEPS.md)), regenerate it:

1. Edit the HTML source (kept under `scripts/og-default.html` if/when we promote it; currently inlined in the commit that introduced the file).
2. Run a one-off Playwright screenshot at `1200×630` viewport, no `deviceScaleFactor`, output to `public/og-default.png`.
3. Commit the new PNG. Don't worry about historical image versions — the live URL serves the current commit's asset.

Regeneration is rare (single-digit times in the project's life). Worth scripting only if it becomes routine.

---

## MDX components

Components available inside MDX bodies are exposed via the `components` prop on `<Content />`, populated from `src/components/mdx/index.ts`. They render with no explicit import in MDX. Current set:

| Component | File | Purpose |
|---|---|---|
| `<VideoEmbed />` | `src/components/mdx/VideoEmbed.astro` | Self-hosted (`<video preload="none">` + `poster`) or YouTube/Vimeo (lazy iframe to the privacy-friendly embed origin). `prefers-reduced-motion` respected by default — no autoplay, no loop. |
| `<Callout />` | `src/components/mdx/Callout.astro` | Inline highlighted block. `kind`: `note` (default, **solid slate-900 card with full border** — carries weight, use when a paragraph genuinely needs to break flow) or `aside` (quieter left-rule, transparent bg — for tangential thoughts). Coloured variants (`warn`/`success`/`important`) are intentionally deferred until the accent colour in DECISIONS.md is closed — single-accent rule. |
| `<Figure />` | `src/components/mdx/Figure.astro` | Image with required `alt` and optional `caption`, lazy-loaded. |
| `<CommitFlowDiagram />` | `src/components/mdx/CommitFlowDiagram.astro` | Inline SVG flow used in the *practical workflow for Claude Code* article (code generated → review → atomic commit → push → code review). Single-accent, slate palette; the diagram is data-viz inside content, not chrome, so the categorical labels under each box carry meaning instead of colour. |
| `<IterationCycle />` + `<Step who="…" title="…">` | `src/components/mdx/IterationCycle.astro` + `Step.astro` | Vertical numbered timeline for step-by-step processes. `Step.who` accepts `you` (default), `claude`, `together` — pill style differentiation, no hue. Numbering is automatic via CSS counter. |
| `<Takeaway label="…">` | `src/components/mdx/Takeaway.astro` | Pull-quote-style block for the article's strongest single takeaways (TL;DR up top, mid-piece highlights). Heavier than `<Callout note>`; thicker left rule, larger body type. Use sparingly — flattens visually if every section gets one. |
| `<AppliedHere label="…">` | `src/components/mdx/AppliedHere.astro` | Reference card linking an abstract claim to a concrete artefact in this (or another) repo — file path, commit, PR. Lighter than `<Callout>`; mono label kicker; ↘-bulleted link list. |

The map is wired into both `src/layouts/ProjectLayout.astro` and `src/layouts/ArticleLayout.astro` via `<Content components={mdxComponents} />`.

To add a new MDX component:

1. Create the `.astro` file under `src/components/mdx/`.
2. Add it to the `mdxComponents` object exported from `src/components/mdx/index.ts`.
3. Document it in this section and in [`content-authoring`](../.claude/skills/content-authoring/SKILL.md) → "MDX components in content" — same commit per docs-governance.

---

## Build and deploy

- **Local dev**: `pnpm dev` → Astro dev server, hot reload.
- **Build**: `pnpm build` → static output in `dist/`.
- **Preview a build**: `pnpm preview` → serve `dist/` locally (sanity check before pushing).
- **Deploy**: GitHub → Vercel, automatic on push to `main`. Pull requests get preview URLs automatically.
- **Environment variables**: `.env.example` documents the keys. Real values live in Vercel project settings, never in the repo. There are no required env vars at v1; this slot is reserved for future use.
- **Analytics**: [`@vercel/analytics`](https://www.npmjs.com/package/@vercel/analytics) (the `/astro` entrypoint) is mounted once in `BaseLayout` with `mode={import.meta.env.PROD ? 'production' : 'development'}` — local dev doesn't pollute the dashboard. Default pageview tracking only; no custom events. Privacy-clean by default (no cookies, no PII). Rationale in [DECISIONS.md → "Analytics"](DECISIONS.md). Speed Insights (real-user web vitals) is intentionally not added here — performance work is scoped to Step 15 of [NEXT_STEPS.md](NEXT_STEPS.md).

---

## Testing

End-to-end tests live under `tests/e2e/<area>.spec.ts` and cover the user-visible surface: nav, locale toggle, project listing, partial-bilingual fallback, contact handles, MDX rendering. Stack is [Playwright](https://playwright.dev) (`@playwright/test`), Chromium-only by default. Config in [`playwright.config.ts`](../playwright.config.ts).

```sh
pnpm test:e2e        # headless run
pnpm test:e2e:ui     # interactive UI mode for debugging
```

The `webServer` config does `pnpm build && pnpm preview` automatically, so a single `pnpm test:e2e` works from a clean clone — no need to start the server manually.

First-time setup on a new machine: `pnpm exec playwright install chromium` to download the browser binary (~150MB to `~/.cache/ms-playwright/`, not committed).

**Conventions**:

- One spec per area of behaviour. Cover both EN and ES paths when they differ.
- Regression tests for fixed bugs reference the fixing commit in a code comment (see `tests/e2e/nav.spec.ts` → "greedy active-state" test pointing at commit `1a5dd5f`).
- Use `getByRole` / `getByLabel` / `getByText` over CSS selectors when possible; the test reads like the user's mental model.
- For pages that exist in both locales, pin the test on locale-specific copy or `<html lang>` so a regression in routing is caught.

Test artifacts (`test-results/`, `playwright-report/`, `playwright/.cache/`, `blob-report/`) are gitignored. The HTML report is generated on failure; in CI it's uploaded as a workflow artifact.

---

## Security posture

Static site on Vercel — minimal attack surface. What's configured:

- **Response headers** in [`vercel.json`](../vercel.json):
  - `Content-Security-Policy`: `'self'` for scripts / styles / images / fonts / `connect`; `frame-src` only the YouTube and Vimeo embed origins used by `<VideoEmbed />`; `'unsafe-inline'` for styles only (Astro emits some inline `<style>`); `frame-ancestors 'none'` prevents the site from being iframed; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`.
  - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying `camera`, `microphone`, `geolocation`, `payment` (we never use them).
- HTTPS, HSTS, DDoS at the edge: Vercel defaults — no extra config.
- No secrets in repo (see [DECISIONS.md → "Public repo from day one"](DECISIONS.md)); real env values in Vercel project settings.
- `mailto:` link in `/contact` is a known scraper vector — accepted. JS obfuscation would violate the plain-text contact rule. Filter at the inbox if spam volume becomes real.
- CSP `img-src` is `'self' data:` — no external image origins. If a project entry ever needs a remote `coverImage`, either self-host it under `/public/media/...` (preferred) or extend `img-src` in `vercel.json` to the specific origin.

Verify headers post-deploy with `curl -I https://<url>` and look for `Content-Security-Policy` + the others. Updates to `vercel.json` require a redeploy to take effect.

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
