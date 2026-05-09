# NEXT_STEPS

The living checklist. Header below summarizes the current state; steps are ordered with explicit validation criteria so we know when each is *done* (not "kind of done"). Close items in the same commit they're completed; add new items as they become real.

---

## Current state

**Phase: first article live + structurally polished, discoverability next.** **Steps 1–11 complete**: full static + dynamic page pipeline, project listing, detail pages, MDX component library, slate base palette, security headers (`vercel.json`), e2e test layer (Playwright + Chromium, all green), site deployed at <https://www.luisep.dev>, **and the first AI article live at `/articles/practical-workflow-claude-code`** — initially shipped as a faithful migration, then structurally reworked after the live preview reading: typography prose class, solid Callout cards, IterationCycle timeline replacing the eleven-paragraph block, Takeaway pull-quotes (TL;DR + 2 mid-piece), AppliedHere reference cards linking abstract claims to artefacts in this very repo, h3 promotion in sections 6 + 8, real Step-11 commits replacing the fake example, a new "Things I don't use (and why)" section taking position on multi-agent setups / roleplay / cross-repo automation. The article-rework PR (`dev` branch, 8 commits at last count) is **pending merge by the user**. Aline writeup deferred until that project ships. Next: **Step 12** — discoverability (share buttons + OG metadata audit + Vercel Analytics), then **Step 13** other projects, then visual decisions, then a11y + Lighthouse.

---

## Steps

### 1. Scaffold the Astro project — done

Manual scaffold (no Astro starter — every file decided): `package.json`, `pnpm-lock.yaml`, `astro.config.mjs` (with `i18n: { defaultLocale: 'en', locales: ['en','es'], routing.prefixDefaultLocale: false }`), `tsconfig.json` (extends `astro/tsconfigs/strict`), `src/styles/global.css` (`@import "tailwindcss"`), `src/pages/index.astro` placeholder. `.nvmrc` pinning Node 22, `.gitignore`, `.env.example` already in place.

Notes from execution:

- pnpm 11 ignores install scripts by default. `pnpm approve-builds --all` writes `esbuild` and `sharp` into `pnpm-workspace.yaml` under `allowBuilds:` — that's the canonical location in pnpm 11, even outside a monorepo. The `pnpm.onlyBuiltDependencies` field in `package.json` is a leftover from pnpm 10 docs and is ignored; do not use it.
- Tailwind v4 changes the integration: no `tailwind.config.*` file; theme tokens go under `@theme` in CSS. The `@astrojs/tailwind` integration is deprecated — using `@tailwindcss/vite` plugin instead. ARCHITECTURE.md updated to reflect this.
- `site:` in `astro.config.mjs` is the `https://example.com` placeholder until the domain is decided ([DECISIONS.md → Open](DECISIONS.md)).

### 2. Define content collection schemas — done

`src/content.config.ts` defines `articles` and `projects` collections via the `glob` loader (Astro 6 Content Layer API), with Zod schemas matching the tables in [ARCHITECTURE.md](ARCHITECTURE.md) → "Content collections". Four placeholder `.mdx` files (one per locale per collection) live under `src/content/<type>/{en,es}/` so the collections resolve and types are generated. Each placeholder has `draft: true` and is to be deleted as soon as real content lands.

Notes from execution:

- Astro 6 moved the content config from `src/content/config.ts` to **`src/content.config.ts`** (parallel to `src/content/`, not inside it). Doc references updated.
- `astro:content` re-exports `z` from zod, but it's deprecated in Astro 6 — use `import { z } from 'zod'` directly. `zod` added as a direct devDependency.
- Zod 4 deprecates `z.string().url()` in favor of the standalone `z.url()`. Schema uses the new form.
- `pnpm astro sync` and `pnpm astro check` both clean (0 errors / 0 warnings / 0 hints).

### 3. i18n plumbing — done

`src/i18n/ui.ts` holds the typed strings dictionary for both locales (nav labels, locale-toggle aria/label, missing-translation notice, home placeholder copy). `src/i18n/utils.ts` provides `getLocaleFromUrl`, `localizedPath`, `otherLocale`, and a typed `t(locale, key)`. `src/components/layout/LocaleToggle.astro` derives current locale from `Astro.url`, computes the mirror path, and renders a sober underlined link.

The placeholder home pages (`src/pages/index.astro` for `/` and `src/pages/es/index.astro` for `/es/`) now use the helpers and host the toggle. They'll be replaced by `BaseLayout` + real copy in Steps 4–5.

Verification (no test runner installed yet):

- Built HTML for `/` shows `lang="en"` + toggle `href="/es"` + EN body copy; built HTML for `/es/` shows `lang="es"` + toggle `href="/"` + ES body copy.
- Helper smoke run via `pnpm dlx tsx -e ...` covered 10 path cases (root, prefixed, deeply nested in either locale, and a defensive `/something/es` that must resolve to default `en`). All pass.
- When a real test runner lands (deferred), this manual run gets replaced by a Vitest spec.

### 4. Base layout, Header, Footer — done

`src/layouts/BaseLayout.astro` wraps every page (html/head/body, locale-derived `lang`, optional `title` + `description` props, sticky-footer flex). `src/components/layout/Header.astro` renders the site title (linking home), the four secondary nav items (Projects, Articles, Now, Contact, all derived from `nav.*` keys in `src/i18n/ui.ts`) with active-state styling, and the `<LocaleToggle />`. `src/components/layout/Footer.astro` is minimal (©, year, name). `src/components/ui/Container.astro` is the shared max-width / horizontal-padding primitive.

`src/styles/global.css` adds a small base layer: html background pinned to the dark token (avoids white flash), text rendering tuned, sober `:focus-visible` outline. Typography stays at Tailwind defaults until the typography decision closes.

The four placeholder pages (`/`, `/es/`, `/projects`, `/es/projects`) all use `BaseLayout` now — boilerplate from Step 3 collapsed into the layout, no duplication left.

Verification:

- `pnpm astro check` and `pnpm build` clean (0/0/0; 4 pages built).
- Built HTML spot-check: `/` is `lang="en"` with EN nav, `/es/projects/` is `lang="es"` with ES nav, titles are `Projects — Luis Escolano` / `Proyectos — Luis Escolano`, locale toggle round-trips between mirror pages, and the active-state class flips on the link matching the current path.

### 5. Static pages — done

Home, Now, and Contact filled with real copy in both locales. Page-specific text lives directly in each `.astro` file (the i18n dictionary holds only short reusable labels — `nav.*`, `now.last_updated`, `placeholder.coming_soon`, etc.) so editing copy is one file, no string indirection.

- **Home (`/`, `/es/`)**: two-paragraph bio that opens with KEO-Connectivity + EEBUS, closes with the AI-augmented-on-my-own-terms line; one teaser link to `/projects` for now (the cards proper come in Step 7). The Aline featured-video block is deferred — Luis will record a better video once that project ships.
- **Now (`/now`, `/es/now`)**: two short paragraphs (day job + side project) plus a "Last updated: 2026-05-09" footer. Date hardcoded; bumping it manually as the page updates.
- **Contact (`/contact`, `/es/contact`)**: "Best by email." + a three-row link list (Email, GitHub, LinkedIn) using the `link.label — display` format. No form.
- **Articles index placeholder (`/articles`, `/es/articles`)**: bare `BaseLayout` + heading + `placeholder.coming_soon`, just so the nav link doesn't 404 until Step 7+ wires real content.

Verification:

- `pnpm astro check` and `pnpm build` clean (0/0/0 across 20 files; 10 pages built).
- Spot-check on the rendered HTML: `/` and `/es/` carry the right bio and locale-correct links, `/contact` exposes the three real handles, both `/now` pages show the right copy + "Last updated" / "Última actualización" footer with `2026-05-09`.

### 6. Dynamic project and article pages — done

`src/lib/content.ts` exposes `getEntryByLocale(collection, slug, locale)`, `getSlugsByLocaleUnion(collection, filter?)`, `entryIdToParts`, and `isVisible` (drafts hidden in PROD, visible in dev for friction-free authoring).

`src/pages/{,es/}{projects,articles}/[slug].astro` handle the four routes. Each `getStaticPaths` returns the union of slugs across both locales — the page handler then picks one of three branches: render the entry (`ProjectLayout` / `ArticleLayout`), render `<MissingTranslationNotice />` with a link to the available locale, or fall through to a 404 stub (unreachable given the union, but kept for safety).

`src/components/MissingTranslationNotice.astro` composes the localized strings from `src/i18n/ui.ts` (`missing.title` / `missing.body` / `missing.cta`) and uses `localizedPath` to build the cross-locale link.

`src/layouts/ProjectLayout.astro` renders title + meta (year · role) + summary + link list (repo / demo / video / article) + MDX body. `src/layouts/ArticleLayout.astro` renders title + locale-aware date + summary + body. Both pull `Content` from `astro:content`'s `render(entry)`.

Test entries seeded (real, public projects from the featured list):

- `projects/{en,es}/fmodel-mcp.mdx` (bilingual case).
- `projects/en/unity-mcp-port.mdx` (single-locale case; ES side renders the missing-translation notice).

Aline deliberately not seeded yet per author preference until the project ships.

Verification:

- `pnpm astro check` clean (28 files; 0/0/0).
- `pnpm build` produces 14 pages including all four `[slug]` cases.
- Spot-check on built HTML: `/projects/fmodel-mcp` and `/es/projects/fmodel-mcp` render the entry; `/projects/unity-mcp-port` renders the entry; `/es/projects/unity-mcp-port` renders the Spanish "Aún no disponible" notice with the correct title pulled from the EN entry and a link back to the EN page.

### 7. Project index + cards — done

`/projects` and `/es/projects` now render two sections: a Featured list (richer cards: title with hover-arrow, year, summary, role) and an Other list (compact one-liners with `title — year · role — summary` plus a `↗` external link). Section headings come from `projects.featured_heading` / `projects.other_heading` in `src/i18n/ui.ts`. Empty Other section is hidden entirely; empty Featured falls back to a `projects.empty` line.

The page filters by `entryIdToParts(entry.id).locale === locale` so each index only lists entries authored in that locale. Cross-locale discovery (showing EN-only entries on the ES page with a "(only English)" hint) is deferred — when it matters we'll revisit.

Cover images intentionally omitted — none of the seeded entries carry one yet, and the visual spec is "sober text-card with one moment of motion." The arrow that slides in on hover is that moment for these cards.

Verification:

- `pnpm astro check` clean (28 files; 0/0/0).
- `pnpm build` produces 14 pages.
- Spot-check on built HTML: `/projects` lists both `fmodel-mcp` and `unity-mcp port` under "Featured"; `/es/projects` lists only `fmodel-mcp` under "Destacados" (unity-mcp-port has no ES entry; users hitting `/es/projects/unity-mcp-port` directly still get the missing-translation notice from Step 6).

### 8. MDX components — done

`src/components/mdx/{VideoEmbed,Callout,Figure}.astro` exist and are exported as a `mdxComponents` map from `src/components/mdx/index.ts`. Both `ProjectLayout` and `ArticleLayout` pass that map to `<Content components={mdxComponents} />`, so MDX files can use the components without explicit imports.

- **VideoEmbed**: detects YouTube / Vimeo URLs and renders a lazy iframe pointing at the privacy-friendly embed origin (`youtube-nocookie.com`); for self-hosted sources, renders a `<video controls preload="none">` so the file only fetches on play. `prefers-reduced-motion` is respected by default (no autoplay, no loop).
- **Callout**: two kinds — `note` (default, slate-tinted) and `aside` (quieter, left-rule only). `warn` is **deliberately deferred** until the accent color in DECISIONS.md closes; adding amber/red here would step on the single-accent rule.
- **Figure**: lazy-loaded image with required `alt` and optional `caption`.

Validation: pnpm build clean (32 files in check, 14 pages). The `fmodel-mcp` project entry now wraps its closing meta-paragraph in `<Callout kind="aside">…</Callout>` (EN + ES) — the rendered HTML on `/projects/fmodel-mcp` and `/es/projects/fmodel-mcp` shows the slate-800 left-rule + slate-300 text styling, confirming the wiring end-to-end.

Docs in same commit: ARCHITECTURE.md → "MDX components" updated with the deferred-warn note and the new "wired into both layouts" line; content-authoring skill conventions match (warn dropped from the kind list).

### 9. Hardening — CSP + e2e tests — done

`vercel.json` ships a tight Content-Security-Policy plus the standard hygiene headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera / mic / geo / payment). `frame-src` allowlist is limited to the YouTube + Vimeo embed origins used by `<VideoEmbed />`; everything else defaults to `'self'`. Detail in [ARCHITECTURE.md → "Security posture"](ARCHITECTURE.md). CSP only applies on Vercel — verify post-deploy with `curl -I https://<url>`.

E2E test layer: Playwright + Chromium. Specs under `tests/e2e/` cover home (EN + ES), header nav + locale toggle (including a regression test for the greedy-active-state bug fixed in `1a5dd5f`), projects index + detail navigation, the partial-bilingual fallback notice on `/es/projects/unity-mcp-port`, contact handles, and the MDX `<Callout>` rendering inside `fmodel-mcp`. 11 tests, ~4 s on a clean run. `pnpm test:e2e` does build + preview + run from a clean clone. Setup notes in [ARCHITECTURE.md → "Testing"](ARCHITECTURE.md).

CI workflow at `.github/workflows/e2e.yml` runs the suite on every push and PR.

### 10. Deploy to Vercel — done

Production URL: <https://www.luisep.dev>. GitHub repo wired, Astro auto-detected, `vercel.json` consumed at the edge. Custom domain `luisep.dev` registered at Cloudflare; `www.luisep.dev` is the canonical hostname and the apex 307-redirects to it. `astro.config.mjs` `site` set to the canonical URL so sitemap absolute links resolve correctly. Detail in [DECISIONS.md → "Domain"](DECISIONS.md).

Verification (live):

- `curl -I https://www.luisep.dev/` returns `200` with `content-security-policy`, `permissions-policy`, `referrer-policy`, `x-content-type-options: nosniff`, and Vercel's own `strict-transport-security`. CSP `frame-src` allowlist limited to youtube-nocookie.com + player.vimeo.com as authored.
- All 11 routes covered by the e2e suite (home EN/ES, projects index EN/ES, articles EN/ES, now, contact, project detail EN/ES, partial-bilingual fallback) plus `/sitemap-index.xml` return `200` against the live URL.

### 11. First real content: AI / Claude Code article (EN) — done

The *practical workflow for Claude Code* draft (originally written for KEO, then re-pitched for the public audience) lives at `/articles/practical-workflow-claude-code` in EN. Editorial pass before migration: dropped Gerrit-specific framing; reordered review-tool list to put GitHub first; added a "who is this for" opening paragraph naming solo / team / in-between audiences; added an "even solo, treat your future self as the external reviewer" line in the iteration cycle; added a "these are examples, not the only valid options" line after the verification-tools list; gave Unity MCP and fmodel-mcp parity, both linking into the corresponding entry under [`/projects`](../src/pages/projects/index.astro).

The article index at `/articles` (and `/es/articles`) now lists real entries from the collection — sorted by `publishedAt` desc, with title + description + date — replacing the *coming soon* placeholder. Empty state ("More articles on the way." / "Más artículos en camino.") wired through `articles.empty` in `src/i18n/ui.ts`. The ES route for this article renders the standard missing-translation notice (Spanish version is a follow-up).

The section-5 commit-flow SVG was extracted into a new `<CommitFlowDiagram />` MDX component (registered in [`src/components/mdx/index.ts`](../src/components/mdx/index.ts)). Single-accent slate palette; categorical labels under each box do the work that colour did in the source draft. Same-commit doc updates in [ARCHITECTURE.md → "MDX components"](ARCHITECTURE.md) and [`content-authoring`](../.claude/skills/content-authoring/SKILL.md) → "MDX components in content".

E2E spec at `tests/e2e/articles.spec.ts` exercises: index → detail navigation, presence of the `<CommitFlowDiagram />` SVG via its `aria-label`, both project links (`/projects/unity-mcp-port`, `/projects/fmodel-mcp`) inside the article body, and the ES missing-translation fallback on `/es/articles/practical-workflow-claude-code`.

Both `articles/en/hello-world.mdx` and `articles/es/hello-world.mdx` placeholders deleted now that real content exists. The original draft (`a-practical-workflow-for-claude-code.html`) deleted from the repo root — it was scratch, never meant to ship.

### 12. Discoverability — share buttons + OG metadata + Vercel Analytics — pending

**Goal:** The article exists; now make it shareable to the right places and measurable. Three sub-tasks, each shippable as its own PR — keep them separate so a regression is easy to bisect:

1. **OG metadata audit on `BaseLayout.astro`.** Verify `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:site`, `twitter:creator`. Articles need per-entry `og:title` / `og:description`; OG image strategy stays "one shared site image" for v1 (per-entry image generation is deferred — see open decisions). Audit *before* shipping share buttons so the previews aren't broken when traffic clicks through.
2. **`<ShareLinks>` MDX component.** Twitter/X intent + LinkedIn intent + Hacker News submit + copy-link button (1 line of JS, no library). Rendered in `ArticleLayout` footer below the body. No tracking, no third-party widgets — plain `<a href>` to share intents. Optional follow-up: Mastodon + Bluesky if Luis decides they're worth it.
3. **Vercel Analytics + close `DECISIONS.md` → "Analytics".** Drop in `@vercel/analytics` package, mount in `BaseLayout`. Free tier (2.5k events/mo) is plenty for v1. Privacy-clean by default (no cookies, no PII). Same-commit doc: move "Analytics" entry from open to closed in `DECISIONS.md` with the rationale ("Vercel-native, zero-infra, privacy-clean; revisit if traffic outgrows the free tier").

- **Validation:** preview deployment shows the right OG card when the URL is pasted into Twitter/LinkedIn (use [https://cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator) or paste-and-preview in a draft); share buttons resolve to working share intents; Vercel Analytics dashboard records pageviews after merge.

### 13. Other projects + remaining featured stubs — pending

**Goal:** Compact cards for "other" projects (Hollow Knight mods, Bisbot, NEAT, EasyAvahi, rankedle), and stubs for any featured we haven't filled yet (María / Opositia per the public-repo decision; optionally this site itself with the meta angle). Author does a GitHub-pass first to decide which projects get in and at what tier.

- One MDX per project, frontmatter only for "other" cards (body ignored at render time per Step 6 / Step 7).
- For featured stubs: minimal narrative + "writeup pending" banner is acceptable, per [PRODUCT.md](PRODUCT.md) → "Scope (v1)".
- **Validation:** index lists all entries in the right tier and order; new e2e spec asserts the Other section renders when populated.

### 14. Close open visual decisions — pending

**Goal:** Accent color, typography, the "one moment of character" on home, and the **ambient background texture** all picked. Each closed entry moves from [DECISIONS.md → Open](DECISIONS.md) into the body of the doc. Closing the accent unblocks the deferred coloured `<Callout>` variants from Step 8.

The ambient bg texture is a new open sub-decision added during Step 11's polish loop: the original "no decorative gradients" rule was over-broad. It bans gradient heroes / SaaS color washes (correct), but a subtle site-wide ambient texture (grid / dots / noise) at low opacity, fixed (doesn't scroll), is a different category. Refining the rule and picking a concrete pattern are both done in this step. Order:

1. PR-doc: refine the "Visual restrictions" entry in `DECISIONS.md` to distinguish gradient heroes from ambient texture.
2. PR-code: prototype 2-3 patterns (linear-style glow, vercel-style grid, anthropic-style noise) on a preview branch; pick one with the user.
3. Same with accent + typography + moment of character.

- Prototype each candidate against a real page on the deployed production URL; don't decide on swatches alone.
- Closing the moment of character means it's implemented, not just chosen.
- **Validation:** `DECISIONS.md` no longer lists these as open; the site visually reflects the choice; e2e spec for any new interactive moment added.

### 15. Lighthouse + accessibility pass — pending

**Goal:** Lighthouse performance ≥ 90 on the home page (with any embedded video) and on a representative article. A11y issues from a manual pass and from `axe` are addressed or deferred with a written note.

- Cover image and video poster sized correctly; lazy-load verified.
- Contrast checked against the chosen accent.
- Keyboard navigation works for header, locale toggle, project cards, article links.
- `prefers-reduced-motion` respected.
- **Validation:** numbers from a clean Lighthouse run committed in `docs/my-notes.md` or as a launch-retrospective section here.

---

## Side projects / nice-to-haves (deferred)

- **Aline featured project writeup** — blocked on Luis's project shipping plus video assembly. When unblocked: add full narrative + `<VideoEmbed />` to `src/content/projects/{en,es}/aline-boss-fight.mdx`, set `tier: 'featured'`, drop the entry into `/projects` listing, add an e2e spec exercising the video poster + lazy load.
- Second AI article (the "secured environment for Claude Code" piece — limit git, mock secrets, kernel limitations).
- Spanish translation of `practical-workflow-claude-code` once tone is settled in EN.
- Full ES translations of all featured project narratives and the launch articles.
- Additional articles.
- RSS feed for `/articles`.
- Per-article / per-project Open Graph image generation (vs. the one shared OG image set up in Step 12). Deferred unless an article gets organic traction worth optimising the share preview for.
- [`@playwright/mcp`](https://github.com/microsoft/playwright-mcp) at user level for Claude's visual verification across projects (the project-level Playwright install for e2e tests landed in Step 9; the MCP layer is the separate "Claude can see the rendered page during dev" capability).

---

## Open design decisions blocking specific steps

These are tracked in [DECISIONS.md → Open](DECISIONS.md). Listed here so the dependency on Step 14 is visible:

- Accent color — blocks Step 14 closing and the deferred coloured `<Callout>` variants from Step 8.
- Typography — blocks Step 14.
- Moment of character on home — blocks Step 14.
- Font hosting — depends on the typography pick; blocks Step 14.
- **Ambient background texture pattern** — new open sub-decision out of the Step 11 polish loop. Requires reopening "Visual restrictions" in DECISIONS.md to distinguish gradient heroes (still banned) from subtle site-wide ambient texture (allowed at low opacity, fixed). Blocks Step 14.
- Analytics — was open; closes as part of Step 12 (Vercel Analytics).

---

## Lessons captured along the way

(Empty for now — populate as we hit and resolve real gotchas. Per [`docs-governance`](../.claude/skills/docs-governance/SKILL.md), repeatable gotchas migrate from here into the relevant skill once they're confirmed reproducible.)
