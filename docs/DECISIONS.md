# DECISIONS

Strong project rules, one entry per decision. Just the *what* and a short *why*. For history or alternatives that were rejected, look at `git log` and chat threads.

Open decisions are listed at the bottom under [Open](#open-decisions). When one closes, it moves up into the body.

---

### Stack: Astro + Tailwind + MDX + TypeScript + Vercel

**Rule:** The site is built on Astro with Tailwind for styling, MDX for long-form content (articles and project narratives), TypeScript for application code, and deployed on Vercel from the public GitHub repo.

**Why:** Astro fits the shape of the site (mostly static, content-heavy, light interactivity) and renders MDX as a first-class citizen. Tailwind makes the visual restraint enforceable in code (utility classes match the DECISIONS list directly: no gradients, no glass, etc.). Vercel is the lowest-friction deploy for Astro and gives PR preview URLs without configuration. TypeScript is the default; there is no benefit to opting out for a project this size.

---

### Language: English everywhere (docs, skills, code, comments, commits)

**Rule:** Every artifact in this repo is in English. Project docs (`CLAUDE.md`, `docs/*.md`), skills (`.claude/skills/*/SKILL.md`), code, comments, and git commit messages.

**Why:** The repo is public and the audience is international (senior engineers, recruiters at scale-ups). Mixing languages would force translation friction every time a doc is read by a non-Spanish reader. The site itself is bilingual (EN/ES) for end users — that's a separate axis from the language of the engineering artifacts.

---

### Site is bilingual: EN at `/`, ES at `/es/`

**Rule:** The site serves English at root paths (`/`, `/projects`, `/articles/...`) and Spanish under `/es/` (`/es/projects`, `/es/articles/...`). Default locale is English (no prefix). Astro's native i18n config drives routing. A locale toggle is visible in the header on every page.

**Why:** English is the wider audience for technical work. Putting it at root reduces friction for the primary visit; Spanish is one click away for the secondary audience without polluting the URL of the default. Native Astro i18n handles the routing without custom middleware.

---

### Articles and projects: partial bilingual allowed, with explicit notice

**Rule:** A given article or project may exist in EN only, ES only, or both. When a user requests the missing-language version (e.g. `/es/articles/foo` and only the EN version exists), render a dedicated "not yet available in this language" page with a clear link to the available version. **Do not** silently fall back to the other language inside the requested locale's shell.

**Why:** Mirror-required is a publication blocker — it forces a translation pass for every piece of content, which kills publishing cadence on a one-person project. Silent fallback is confusing (the user sees Spanish UI shell with English body, no clear signal of why). Partial-with-notice is honest about the state and gives the reader agency. Operational details on how to author bilingual or single-language content live in the [`content-authoring`](../.claude/skills/content-authoring/SKILL.md) skill.

---

### Projects modeled as an MDX content collection with `tier`

**Rule:** All projects (featured and other) live in a single `projects` content collection at `src/content/projects/<locale>/<slug>.mdx`, with frontmatter that includes `tier: 'featured' | 'other'` and `order: number`. Featured projects render full narrative pages with media; other projects render only as compact cards on the projects index, with no individual page. Both share the same schema and authoring shape. Schema and conventions in [`content-authoring`](../.claude/skills/content-authoring/SKILL.md).

**Why:** Single shape keeps authoring uniform — promoting a project from "other" to "featured" is a frontmatter flip plus a writeup, not a refactor. MDX (vs. a TypeScript array) is consistent with how articles are authored, lets project narratives include components like `<VideoEmbed />`, and keeps content out of the application code where it doesn't belong.

---

### Dark mode by design, not by toggle

**Rule:** The site is dark. There is no light mode and no theme toggle. The accent color and typography are tuned against a dark background and not expected to work on a light one.

**Why:** A toggle is a tax — it doubles the surface area to test (every component, every contrast pair) and adds a control that the audience didn't ask for. For a portfolio with strong visual intent, the design *is* the choice. Users with a strong preference for light reading have the OS-level reader-mode escape hatches.

---

### Visual restrictions: no decorative gradients, no glass / neumorphism, no generic icons per section, no scroll-triggered animations as a default

**Rule:** The visual vocabulary is intentionally narrow. **Banned**: decorative gradients, glassmorphism, neumorphism and similar "ism of the moment" treatments, generic Lucide-style icons used as section dressing, AI-generated illustrations, decorative emojis, scroll-triggered animations as a global pattern (every block animating in as it enters the viewport). **Allowed and encouraged**: careful hover states on project cards, expressive serif headings paired with a neutral sans, generous whitespace, exactly *one* moment of character on home (concrete pick deferred — see Open).

**Why:** These restrictions aren't aesthetic preferences in isolation — they're how we enforce the positioning. A gradient hero or a parade of feature icons signals "SaaS landing page." Scroll-triggered animations on every block signal "trying hard." The negative space is the design.

---

### Single accent color, applied sparingly

**Rule:** There is exactly one accent color in the palette, used for selection states, focus rings, link underlines, and the occasional emphasis. Everything else is greyscale on the dark base. The specific accent is open (see Open). When a candidate is picked, a small visual audit fixes contrast against body text and against the dark base.

**Why:** Two accent colors compete and force per-element decisions. One accent is a single rule that components just inherit. It also keeps the palette legible to a reader who is colorblind to one axis — the page must read on greyscale alone, accent is layered on top.

---

### Base palette: Tailwind's `slate-*` scale (deep blue)

**Rule:** The dark palette uses Tailwind's `slate-*` scale across the board — `slate-950` for the body background, `slate-900` for subtle borders, climbing up to `slate-100` for primary text. No `neutral-*` or other gray scales in `src/`. If a stronger blue saturation is ever wanted, override the relevant token in `@theme` inside `src/styles/global.css` (e.g. `--color-slate-950`); don't introduce a parallel scale.

**Why:** Pure black (`neutral-950`) read flat under the typography we're using; slate's subtle blue tilt gives the page enough weight to feel like a deliberate surface without slipping into "SaaS-landing colorful" territory. The two Tailwind scales are tonally parallel — the swap was visually noticeable only at the 800–950 range, with text-contrast essentially unchanged. Confirmed on author hands-on review. If the still-open accent color closes on a deep-blue family too, we either pick a complementary hue or move the surface bg to a custom `--color-bg` token so accent and base don't smash together.

---

### Public repo from day one — no secrets, no unconsented client info

**Rule:** The repo is public from initial push. Practical implications:
- No environment variables in committed files. `.env.example` with placeholders only.
- No API keys, auth tokens, internal URLs, or any third-party credential.
- Past or current client work (María, Opositia, future engagements) is referenced only at the level the client has agreed to. The portfolio mentions them by name and category; no screenshots, no code snippets, no architecture details unless explicitly cleared.

**Why:** The repo *is* part of the demonstration — engineering hygiene visible in the commits and structure is a signal to readers. That same visibility means anything sensitive is sensitive forever (git history is permanent). Cheap to be careful from commit one; expensive to scrub later.

---

### Memory policy: only `user` and `feedback` types

**Rule:** Claude Code's memory in this project is restricted to `user` (profile, preferences, knowledge) and `feedback` (corrections and validated approaches) types. The `project` and `reference` types stay unused. Any project fact — a decision, a path, current state, an external resource — goes to a versioned doc in `docs/` or a skill in `.claude/skills/`, not to memory.

**Why:** Project facts in memory drift silently against the docs in the repo, and the docs are the public artifact. Keeping memory restricted to person-level context (who Luis is, what he's asked for) keeps it useful across sessions without competing with the source-of-truth docs. The `docs-governance` skill enforces the same line.

---

### No CMS — content is files in the repo

**Rule:** All content (articles, project narratives, Now page, Contact info, page metadata) lives as files in the repo: MDX for narrative content, plain TypeScript or Astro for static page content, frontmatter for metadata. There is no headless CMS, no admin UI, no DB.

**Why:** The repo is the audit trail. `git log` becomes the editorial history of the site for free. Drafts work as branches. Authoring works in the editor Luis already lives in. A CMS would add an external service to the dependency surface and split the source of truth between the repo and a remote store.

---

### Domain: `luisep.dev`, canonical at `www.luisep.dev`

**Rule:** The site lives at `https://www.luisep.dev`. The apex `https://luisep.dev/` issues a 307 redirect to the `www` subdomain. The domain is registered at Cloudflare (registrar + DNS); DNS records are "DNS only" (proxy off) so Vercel handles CDN + TLS without a second proxy in front.

**Why:** `.dev` is in the browser HSTS preload list, so HTTPS is mandatory at the protocol level — a property worth having for free on a site that has no reason to ever serve over HTTP. The `www`-as-canonical choice is a reversal of the more common apex-canonical convention, but it makes the redirect direction match what most copy-pasters do (people type `www.` more often than they don't), and `www`-canonical avoids edge cases with apex CNAME flattening on registrars that don't support it. Cloudflare proxy stays off because doubling Cloudflare and Vercel in the request path causes TLS handshake conflicts and adds nothing that Vercel's edge doesn't already do.

---

### Git workflow: branch + PR for non-trivial changes; `main` is protected

**Rule:** `main` is the production branch — every push to it auto-deploys to `https://www.luisep.dev` via Vercel. Anything beyond a one-liner (typo, copy tweak, `Last updated` bump on `/now`) goes through a feature branch and a pull request. `main` is protected on GitHub: PRs are required, the e2e workflow must pass before merging, and direct pushes are blocked. PR previews from Vercel are the validation surface — open the preview URL, check the change in a real browser, then merge.

**Why:** Auto-deploy on push is fast feedback but only safe with guardrails. The build itself catches type errors and missing imports; the e2e suite catches behaviour regressions; the preview URL catches the things tests don't (visual regressions, copy issues, broken anchors). Stacking those three gates keeps `main` green by construction. Pushing directly to `main` for trivial edits is fine because the cost of a typo is a 30-second revert, but for anything structural the preview URL is the safety net that justifies skipping a real staging environment. Branch protection makes the rule enforceable instead of self-policing — a private repo plan would have required paying for it; the public repo gets it for free.

---

### No comments, no newsletter, no contact form

**Rule:** The Contact page is plain text: email + LinkedIn + GitHub. There is no contact form, no comments section under articles, no newsletter signup. The site does not collect any user input.

**Why:** Each of these is a dependency, a moderation surface, a spam vector, and a decision about UX that the audience didn't ask for. Email is a sufficient channel for the volume this site will get. Removing the form removes a captcha, an SMTP integration, and a pile of edge cases for a feature with marginal value.

---

## Open decisions

These are deliberately held open until there's enough information or visual context to close them well. Each lists what's needed to close it.

- **Accent color.** Candidates: deep blue, dark green, muted red. Closing this needs a visual mock against the chosen typography and dark base, plus a contrast pass. → Promote to a closed entry above when picked.
- **Typography.** Heading serif candidates: Tiempos Headline, GT Sectra, Newsreader (free). Body sans is also open but lower-stakes — likely Inter or a system stack. Closing needs a sample page comparing the candidates at real sizes.
- **One moment of character on home.** Exactly one of: subtle reactive cursor, a one-off animated detail, an elegant entry transition. Closing needs prototyping the candidate and seeing whether it feels intentional or "trying hard."
- **Font hosting strategy.** Self-host the WOFF2 files in `/public` vs. Google Fonts vs. a foundry CDN. Trade-off: privacy + control vs. caching + bandwidth. Closing happens together with the typography choice.
- **Analytics.** Three options: none, a privacy-respecting minimum (Plausible / Umami), or a self-hosted equivalent. Default for v1 is **none** unless we close otherwise.
