# PRODUCT — Luis Escolano portfolio

## Concept

Personal portfolio for Luis Escolano. A small, focused site with five pages — Home, Projects, Articles, Now, Contact — that conveys what he builds, how he thinks, and the technical depth behind the work. Bilingual EN/ES. Public repo as part of the demonstration: the engineering quality of the site itself is part of the message.

Not a SaaS landing page. Not a flat Linux-greybeard blog. The middle ground: confidence without hype, a serious engineer who also takes care of visual detail.

## Positioning

> Engineer who builds product, operates with technical discipline, and applies AI-augmented development workflows seriously (not as hype).

Three things this is *not*:

- A resume in HTML form.
- A list of "10x developer" buzzwords.
- A polished marketing surface for a personal brand.

What it *is*: evidence. Featured projects show range and depth; articles show how he thinks; Now and Contact show he's a person, not a brand.

## Audiences

**Primary**
- **Senior engineers** evaluating peer competence. They will skim Projects and read one article in full.
- **Recruiters at technical scale-ups**. They have ~2 minutes. They need a clear signal of what Luis does and at what level, plus enough substance under the surface that a hiring manager finds value when they dig.
- **Technical readers** who follow links to articles. They are unforgiving about substance — bad takes will lose them faster than no article would.

**Secondary**
- The community around past projects (Beat Saber/Vivify, Hollow Knight modding, AI tooling). Some traffic will come from project repos linking back.
- Luis's future self. The site is also a knowledge artifact — the articles, in particular, should outlast the job hunt that triggered them.

## Page structure

### Home (`/` and `/es/`)
- Brief identity: who Luis is, in two or three lines. Sober tone.
- **Featured project block** for the **Aline boss fight** with an embedded short video. This is the headline piece — it's visual, recent, and unusual enough to anchor the first impression.
- Links to the other sections (Projects, Articles, Now, Contact).
- One moment of character on home — *exactly one*, decided later. Candidates: a subtle reactive cursor, a one-off animated detail, a refined entry transition. The point is intentional restraint: a single signal that this site was made by hand.

### Projects (`/projects` and `/es/projects`)
Two sections, clearly separated.

**Featured**
- **Aline boss fight** (Beat Saber + Vivify map, Expedition 33 boss fight, full Unity + animation + custom shader pipeline).
- **fmodel-mcp** (canonical wrapper for inspecting/exporting UE assets via FModel + CUE4Parse, exposed as MCP tools).
- **unity-mcp port** (minimal fork of the Unity MCP backported to Unity 2019.4 for Beat Saber compatibility).
- **Brief mention of private SaaS** (María, Opositia) — no links, no client details. Just enough to signal "also ships production product work for paying users."

**Other technical work**
- Hollow Knight mods (10k+ users — call out the traction).
- Bisbot.
- NEAT.
- EasyAvahi.
- rankedle.

Featured projects render with full narrative pages and media. "Other" projects render as compact cards inline on the index — title, one-line description, link out. They don't get individual pages unless promoted.

### Articles (`/articles` and `/es/articles`)
Technical posts in MDX. **Launch with one**: an adaptation of Luis's existing Claude Code guide. Articles may exist in EN only, ES only, or both — the missing-language case is handled with an explicit notice and a link to the available version.

### Now (`/now` and `/es/now`)
Brief page in the spirit of [nownownow.com](https://nownownow.com). What Luis is doing right now: focus areas, what he's reading or building, optional location. Short. Updated occasionally.

### Contact (`/contact` and `/es/contact`)
Plain text: email + LinkedIn + GitHub. No form, no captcha, no marketing copy.

## Visual tone

Sober with personality. Generous spacing but medium density (rauno.me-ish, not austere). Expressive serif headings (candidates: Tiempos Headline, GT Sectra, Newsreader) contrasting with a neutral sans for body. Careful hover states on project cards. A single accent color, well applied — concrete pick deferred (see [DECISIONS.md → open decisions](DECISIONS.md)).

**Aesthetic references** (take the spirit, don't copy):
- [brittanychiang.com](https://brittanychiang.com) — the "serious engineer with personality" feeling, project card treatment, typographic hierarchy. Don't copy the fixed sidebar or the neon green palette.
- [rauno.me](https://rauno.me) — generous spacing, subtle hover micro-interactions, premium feel without gradients.
- [leerob.io](https://leerob.io) — bilingual structure, balance between featured and secondary technical projects, homepage simplicity.

**What we are explicitly avoiding**: visual restrictions are formal decisions, not preferences. The canonical list and rationale live in [DECISIONS.md → "Visual restrictions"](DECISIONS.md) and [DECISIONS.md → "Dark mode by design, not by toggle"](DECISIONS.md). Treat those entries as the source of truth — if a new "ism of the moment" needs to be banned, add it there, not here.

## Success criteria

- **30-second test**: a senior engineer landing on home immediately reads "technically credible, writes carefully." Not "trying hard."
- **2-minute test**: a recruiter can skim Featured + one article excerpt + Now and walk away with a clear, accurate sense of what Luis does and at what level.
- **Substance test**: each article holds up to a technical reader who isn't hype-driven. If a section reads like content marketing, it gets cut.
- **Intentionality test**: every visible choice (typography, spacing, color, motion) feels decided, not defaulted. No "Astro template smell."
- **Performance**: fast load on home despite the embedded video — lazy load, poster image, deferred hydration. Lighthouse performance ≥ 90 on a clean run.
- **Accessibility**: contrast ratios OK against the chosen accent, keyboard-navigable, `prefers-reduced-motion` respected, semantic landmarks.
- **Bilingual integrity**: locale toggle visible and obvious; missing translations handled gracefully with the partial-content notice; no broken links across locales.

## Scope (v1)

**In scope for launch**
- All five pages live in EN.
- ES versions of static pages (Home, Projects index, Now, Contact). Articles and project narratives may launch EN-only with the partial-content notice on the ES side.
- Featured projects: at minimum Aline + one other with full narrative; remaining featured can be skeleton pages with a "writeup pending" banner.
- One full article (Claude Code guide adaptation), at least in EN.
- Working language toggle.
- Deployed to Vercel from the public GitHub repo.

**Deferred (post-launch, see [NEXT_STEPS.md](NEXT_STEPS.md))**
- Full ES translations of all featured projects and the launch article.
- Additional articles.
- RSS feed.
- Any analytics (decision still open — see [DECISIONS.md](DECISIONS.md)).

**Out of scope, explicitly**
- Comments, newsletter signup, contact form.
- Light mode.
- Any kind of CMS — content is files in the repo.
