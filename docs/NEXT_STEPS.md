# NEXT_STEPS

The living checklist. Header below summarizes the current state; steps are ordered with explicit validation criteria so we know when each is *done* (not "kind of done"). Close items in the same commit they're completed; add new items as they become real.

---

## Current state

**Phase: live on Vercel, content next.** **Steps 1–10 complete**: full static + dynamic page pipeline, project listing, detail pages, MDX component library, slate base palette, security headers (`vercel.json`) and an e2e test layer (Playwright + Chromium, 11 specs, all green in ~4 s), **and the site deployed at <https://portfolio-web-psi-swart.vercel.app>** with CSP + hygiene headers verified live. Aline writeup deferred until that project ships (moved to deferred / nice-to-haves). Next: **Step 11** — first AI article. Then projects pass, then visual decisions against the real URL.

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

Production URL: <https://portfolio-web-psi-swart.vercel.app>. GitHub repo wired, Astro auto-detected, `vercel.json` consumed at the edge. `astro.config.mjs` `site` updated from the `https://example.com` placeholder to the live `*.vercel.app` URL so sitemap absolute links resolve correctly. Custom domain remains a deferred decision.

Verification (live):

- `curl -I https://portfolio-web-psi-swart.vercel.app/` returns `200` with `content-security-policy`, `permissions-policy`, `referrer-policy`, `x-content-type-options: nosniff`, and Vercel's own `strict-transport-security`. CSP `frame-src` allowlist limited to youtube-nocookie.com + player.vimeo.com as authored.
- All 11 routes covered by the e2e suite (home EN/ES, projects index EN/ES, articles EN/ES, now, contact, project detail EN/ES, partial-bilingual fallback) plus `/sitemap-index.xml` return `200` against the live URL.

### 11. First real content: AI / Claude Code article (EN) — pending

**Goal:** `/articles/<slug>` is live with one of the two AI articles already drafted by Luis (the Claude Code workflow guide *or* the "secured environment for Claude Code" piece — pick whichever is more refined). The second article follows in a separate iteration.

- Adapt the chosen draft into MDX. Use `<Callout />` where it earns its space; don't sprinkle it.
- Index card on `/articles` with description and date.
- Add an e2e spec exercising the article route + missing-translation fallback on the ES side until that translation lands.
- **Validation:** article reads end-to-end; all anchors and links resolve; `pnpm test:e2e` includes the new spec and stays green.

### 12. Other projects + remaining featured stubs — pending

**Goal:** Compact cards for "other" projects (Hollow Knight mods, Bisbot, NEAT, EasyAvahi, rankedle), and stubs for any featured we haven't filled yet (María / Opositia per the public-repo decision; optionally this site itself with the meta angle). Author does a GitHub-pass first to decide which projects get in and at what tier.

- One MDX per project, frontmatter only for "other" cards (body ignored at render time per Step 6 / Step 7).
- For featured stubs: minimal narrative + "writeup pending" banner is acceptable, per [PRODUCT.md](PRODUCT.md) → "Scope (v1)".
- **Validation:** index lists all entries in the right tier and order; new e2e spec asserts the Other section renders when populated.

### 13. Close open visual decisions — pending

**Goal:** Accent color, typography, and the "one moment of character" picked. Each closed entry moves from [DECISIONS.md → Open](DECISIONS.md) into the body of the doc. Closing the accent unblocks the deferred `<Callout kind="warn">` variant from Step 8.

- Prototype each candidate against a real page (likely against the deployed production URL post-Step 10); don't decide on swatches alone.
- Closing the moment of character means it's implemented, not just chosen.
- **Validation:** DECISIONS.md no longer lists these as open; the site visually reflects the choice; e2e spec for any new interactive moment added.

### 14. Lighthouse + accessibility pass — pending

**Goal:** Lighthouse performance ≥ 90 on the home page (with any embedded video) and on a representative article. A11y issues from a manual pass and from `axe` are addressed or deferred with a written note.

- Cover image and video poster sized correctly; lazy-load verified.
- Contrast checked against the chosen accent.
- Keyboard navigation works for header, locale toggle, project cards, article links.
- `prefers-reduced-motion` respected.
- **Validation:** numbers from a clean Lighthouse run committed in `docs/my-notes.md` or as a launch-retrospective section here.

---

## Side projects / nice-to-haves (deferred)

- **Aline featured project writeup** — blocked on Luis's project shipping plus video assembly. When unblocked: add full narrative + `<VideoEmbed />` to `src/content/projects/{en,es}/aline-boss-fight.mdx`, set `tier: 'featured'`, drop the entry into `/projects` listing, add an e2e spec exercising the video poster + lazy load.
- Second AI article (the "secured environment for Claude Code" piece — limit git, mock secrets, kernel limitations) once Step 11 lands the first one.
- Full ES translations of all featured project narratives and the launch articles.
- Additional articles.
- RSS feed for `/articles`.
- Custom domain (separate from Step 10's free `*.vercel.app`).
- Analytics (decision still open in [DECISIONS.md](DECISIONS.md)).
- Open Graph image generation per article/project (vs. one shared OG image).
- [`@playwright/mcp`](https://github.com/microsoft/playwright-mcp) at user level for Claude's visual verification across projects (the project-level Playwright install for e2e tests landed in Step 9; the MCP layer is the separate "Claude can see the rendered page during dev" capability).

---

## Open design decisions blocking specific steps

These are tracked in [DECISIONS.md → Open](DECISIONS.md). Listed here so the dependency on Step 13 is visible:

- Accent color — blocks Step 13 closing and the deferred `<Callout kind="warn">` from Step 8.
- Typography — blocks Step 13.
- Moment of character on home — blocks Step 13.
- Font hosting — depends on the typography pick; blocks Step 13.
- Analytics — defaults to none for v1; can be revisited post-launch without blocking Step 10.

---

## Lessons captured along the way

(Empty for now — populate as we hit and resolve real gotchas. Per [`docs-governance`](../.claude/skills/docs-governance/SKILL.md), repeatable gotchas migrate from here into the relevant skill once they're confirmed reproducible.)
