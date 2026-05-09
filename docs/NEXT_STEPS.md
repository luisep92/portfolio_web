# NEXT_STEPS

The living checklist. Header below summarizes the current state; steps are ordered with explicit validation criteria so we know when each is *done* (not "kind of done"). Close items in the same commit they're completed; add new items as they become real.

---

## Current state

**Phase: scaffolding.** Docs harness in place. **Steps 1–5 complete**: Astro 6.3 + Tailwind 4 + MDX + sitemap on Node 22; `pnpm build` clean. Content collections defined for `articles` and `projects`. i18n plumbing + `<LocaleToggle />` wired through `BaseLayout` + `Header` + `Footer` + `Container`. **Static pages done in both locales**: Home (bio), Now, Contact (real handles), plus index placeholders for Projects and Articles so the nav resolves. 10 pages currently built. Next: **Step 6** — dynamic `[slug]` pages for projects (featured tier) and articles, including the partial-bilingual fallback layout.

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

### 6. Dynamic project and article pages — pending
**Goal:** `/projects/<slug>`, `/articles/<slug>`, and `/es/...` mirrors are generated correctly with the partial-bilingual fallback behavior described in [ARCHITECTURE.md](ARCHITECTURE.md) → "Article and project i18n strategy".

- `src/lib/content.ts` with `getEntryByLocale(collection, slug, locale)` and a helper that produces the union of paths across locales for `getStaticPaths`.
- `[slug].astro` for projects (featured tier only) and articles, in both `src/pages/` and `src/pages/es/`.
- `<MissingTranslationNotice />` component used when only the other-locale version exists.
- **Validation:** Test all four cases manually with stubbed content: (a) entry exists in both locales, (b) only EN, (c) only ES, (d) neither. The "neither" case is a real 404 (not the notice).

### 7. Project index + cards — pending
**Goal:** `/projects` lists Featured projects with rich cards and Other projects as compact one-liners. Same structure under `/es/projects`.

- Featured card: cover image, title, year, summary, link to detail page.
- Other one-liner: title — year — role — summary — link out (to repo or external article).
- **Validation:** Index renders correctly with at least one Featured stub and one Other stub. Hover states are intentional (no defaults).

### 8. MDX components — pending
**Goal:** `<VideoEmbed />`, `<Callout />`, `<Figure />` exist and are wired into the MDX rendering pipeline.

- Lazy-load + poster image for `VideoEmbed`. `prefers-reduced-motion` respected (no autoplay loop when set).
- Components mapped through `src/components/mdx/index.ts`.
- **Validation:** A stub article and a stub featured-project page render the components correctly. Document each new component in [ARCHITECTURE.md](ARCHITECTURE.md) → "MDX components" and in [`content-authoring`](../.claude/skills/content-authoring/SKILL.md).

### 9. First real content: Aline featured project (EN) — pending
**Goal:** `/projects/aline` is live with the embedded video, the narrative, and links to the repo + article (if applicable).

- Source video and poster from the existing project; place under `/public/media/projects/aline/`.
- Narrative drafted in `src/content/projects/en/aline.mdx`.
- **Validation:** Page reads cleanly end-to-end; video plays; links resolve. ES side renders the "not yet available in this language" notice with a link to the EN page (until the ES version is written).

### 10. First real content: Claude Code guide article (EN) — pending
**Goal:** `/articles/<slug>` is live with the adapted version of Luis's Claude Code guide.

- Adapt the existing draft into MDX, with code blocks and a few `<Callout />` insertions where they help.
- Index card on `/articles` with description and date.
- **Validation:** Article reads end-to-end; all anchors and links resolve; ES side shows the partial-content notice.

### 11. Other projects — pending
**Goal:** Compact cards for the remaining "other" projects (Hollow Knight mods, Bisbot, NEAT, EasyAvahi, rankedle), and stubs for the remaining featured (`fmodel-mcp`, `unity-mcp port`, brief mention of María/Opositia per the public-repo decision).

- One MDX per project, frontmatter only for "other" cards (no body needed at v1).
- For featured stubs: minimal narrative + a "writeup pending" banner is acceptable, per [PRODUCT.md](PRODUCT.md) → "Scope (v1)".
- **Validation:** Index lists all entries in the right tier and order. Links resolve.

### 12. Close open visual decisions — pending
**Goal:** Accent color, typography, and the "one moment of character" picked. Each closed entry moves from [DECISIONS.md → Open](DECISIONS.md) into the body of the doc.

- Prototype each candidate against a real page; don't decide on swatches alone.
- Closing the moment of character means it's implemented, not just chosen.
- **Validation:** DECISIONS.md no longer lists these as open; the site visually reflects the choice.

### 13. Lighthouse + accessibility pass — pending
**Goal:** Lighthouse performance ≥ 90 on the home page (with the video) and on a representative article. A11y issues from a manual pass and from `axe` are addressed or deferred with a written note.

- Cover image and video poster sized correctly; lazy-load verified.
- Contrast checked against the chosen accent.
- Keyboard navigation works for header, locale toggle, project cards, article links.
- `prefers-reduced-motion` respected.
- **Validation:** Numbers from a clean Lighthouse run committed in `docs/my-notes.md` or as a section in NEXT_STEPS for the launch retrospective.

### 14. Deploy to Vercel — pending
**Goal:** `main` is wired to Vercel; PRs produce preview URLs; production URL is the canonical link.

- Vercel project created; build command and output dir confirmed.
- Domain configuration: at minimum the default `*.vercel.app`; custom domain is a separate decision.
- **Validation:** A trivial PR produces a preview URL; merging it updates the production URL.

---

## Side projects / nice-to-haves (deferred)

- Full ES translations of all featured project narratives and the launch article.
- Additional articles.
- RSS feed for `/articles`.
- Custom domain.
- Analytics (decision still open in [DECISIONS.md](DECISIONS.md)).
- Open Graph image generation per article/project (vs. one shared OG image).
- Playwright tooling — likely [`@playwright/mcp`](https://github.com/microsoft/playwright-mcp) at user level for Claude's visual verification + a project-level Playwright install for actual e2e tests. Pulls in around Step 11–13 (visual pass / Lighthouse / a11y) when there's something worth looking at.

---

## Open design decisions blocking specific steps

These are tracked in [DECISIONS.md → Open](DECISIONS.md). Listed here so the dependency on Step 12 is visible:

- Accent color — blocks Step 12 closing.
- Typography — blocks Step 4 visual finalization and Step 12.
- Moment of character on home — blocks Step 5 home finalization and Step 12.
- Font hosting — depends on the typography pick; blocks Step 4 final.
- Analytics — defaults to none for v1; can be revisited post-launch without blocking Step 14.

---

## Lessons captured along the way

(Empty for now — populate as we hit and resolve real gotchas. Per [`docs-governance`](../.claude/skills/docs-governance/SKILL.md), repeatable gotchas migrate from here into the relevant skill once they're confirmed reproducible.)
