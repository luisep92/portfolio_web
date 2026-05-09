---
name: content-authoring
description: Use whenever you create or edit content in `src/content/articles/` or `src/content/projects/`, change a content collection schema, add or modify an MDX component used in content, decide whether to promote a project from `other` to `featured`, or produce a missing-language version of an existing entry.
---

# Content authoring

Operational guide for writing articles and projects in this repo. The *why* behind these conventions is captured in [`DECISIONS.md`](../../../docs/DECISIONS.md); the schemas are enforced in `src/content.config.ts` and documented in [`ARCHITECTURE.md → "Content collections"`](../../../docs/ARCHITECTURE.md).

If you change anything in this skill, also check whether it conflicts with the schema or the architecture doc and update them in the same commit (per [`docs-governance`](../docs-governance/SKILL.md)).

---

## Slugs

- **kebab-case**: `claude-code-guide`, `aline-boss-fight`, `fmodel-mcp`. No spaces, no underscores, no capitals.
- **Stable across the lifetime of the entry.** If you publish `/articles/foo` and later realize the slug is wrong, the cost of changing it is broken inbound links — only do it for a real reason and add a `Vercel` redirect from the old to the new.
- **Shared across locales** when both versions exist: `articles/en/claude-code-guide.mdx` and `articles/es/claude-code-guide.mdx`. The slug is the join key the i18n fallback uses.
- **Unique within a collection.** A project slug and an article slug may collide (different collections), but two articles cannot.

## Frontmatter

Schemas live in `src/content.config.ts` and are mirrored in [`ARCHITECTURE.md → "Content collections"`](../../../docs/ARCHITECTURE.md). This section is the authoring guide; if a field exists in one and not the other, the schema wins and the docs need a fix.

### Article example

```mdx
---
title: A Guide to Claude Code
description: A practical walkthrough of how I use Claude Code day-to-day, with the small habits that compound.
publishedAt: 2026-05-09
tags: [ai, tooling, workflow]
coverImage: /media/articles/claude-code-guide/cover.jpg
---

Body in MDX. Components from `src/components/mdx/` are available without import.
```

- `title`: short and substantive. Avoid clickbait.
- `description`: ~140 characters. Used as the index card and as the `<meta name="description">`. Don't repeat the title.
- `publishedAt`: ISO date. Set it once on first publish.
- `updatedAt` (optional): set when the article is materially edited after publish. Shown to the reader.
- `tags` (optional): keep them short and consistent — reuse existing tags before inventing new ones.
- `coverImage` (optional): live under `public/media/articles/<slug>/`. Sized appropriately; we don't auto-resize.
- `draft` (optional, defaults `false`): drafts are excluded from production builds. Use a draft when the piece is clearly unfinished, not as a "save half-formed thoughts" mechanism — those go to [`my-notes.md`](../../../docs/my-notes.md).

### Project example

```mdx
---
title: Aline Boss Fight
summary: A Beat Saber + Vivify boss fight against Aline (Curatress) from Expedition 33. Custom Unity 2019.4 pipeline, animations, shaders.
tier: featured
order: 10
year: 2026
role: Solo author
links:
  repo: https://github.com/luisep92/...
  video: https://...
coverImage: /media/projects/aline/cover.jpg
---

Narrative body. Featured projects render this. Other projects ignore it.
```

- `tier: 'featured' | 'other'` is the only field that changes the render path. Choose it deliberately.
- `order`: lower numbers come first within the tier. Leave gaps (10, 20, 30) so reordering doesn't require renumbering everything.
- `year`: the year the project was active or shipped. For ongoing work, the year of the most recent significant change.
- `role`: free text. Keep it short.
- `links`: any subset of `repo`, `demo`, `video`, `article`. URLs only.
- For "other" projects: the body is **not rendered**. You can write notes in there for your own reference, but they won't be served. Keep the frontmatter complete; that's what the index card uses.

## Partial bilingual policy

Articles and projects can exist in EN only, ES only, or both. The rule and rationale are in [`DECISIONS.md → "Articles and projects: partial bilingual allowed"`](../../../docs/DECISIONS.md). Operationally:

- **Author in whichever language flows.** Don't gate publishing on a translation.
- **Use the same slug** as the eventual translation. If you're sure the piece will be EN-only forever (e.g. it's a deeply Spanish-context piece that wouldn't translate), the slug is still kebab-case English-friendly.
- **The missing-language case is handled automatically** by the resolver in `src/lib/content.ts`. The user lands on `/es/articles/<slug>` for an article that only exists in EN; they see the "not yet available in this language" notice with a link to `/articles/<slug>`. You don't need to write anything special.
- **Migrating EN → ES** (or vice versa) when you're ready to translate:
  1. Create the missing file: `cp src/content/articles/en/<slug>.mdx src/content/articles/es/<slug>.mdx`.
  2. Translate the body. Keep the slug. The frontmatter dates (`publishedAt`) match the original — translation date is not a re-publish.
  3. If the translation introduces a meaningful update, set `updatedAt` on the *translated* file.
  4. Verify the toggle at `/articles/<slug>` ↔ `/es/articles/<slug>` works in both directions.

## Featured vs other — what changes

| Aspect | Featured | Other |
|---|---|---|
| Listed on `/projects` | Yes, at the top, with rich card | Yes, below, as a compact one-liner |
| Has its own page (`/projects/<slug>`) | Yes | **No** |
| Body is rendered | Yes (via `ProjectLayout`) | No (ignored at render) |
| Authoring effort needed | Frontmatter + narrative + media | Frontmatter only |
| Audience | Reader who clicks in for depth | Reader who's scanning |

## When to promote a project from "other" to "featured"

Treat promotion as a real decision. The featured tier is the headline reel; padding it dilutes the others.

Promote when **at least two** of the following are true:
- The project has shipped meaningful, demonstrable artifacts (a public repo with non-trivial commits, a live demo, a paper, a video).
- The project shows technical range that isn't already covered by an existing featured project (avoid five featured Beat Saber projects).
- The project has external traction worth pointing at (users, downloads, stars, citations) that a recruiter or peer would recognize.
- The narrative is genuinely interesting — there's a *story* worth reading, not just a list of features.

Don't promote because the project is recent. Don't promote because it took a long time. Don't promote to fill space.

When promoting:

1. Flip `tier: 'other'` → `tier: 'featured'`.
2. Pick an `order` consistent with the existing featured list.
3. Write the narrative body. If you don't have time for the full writeup yet, a "writeup pending" banner is acceptable per [`PRODUCT.md → "Scope (v1)"`](../../../docs/PRODUCT.md), but it's a debt — log it in [`NEXT_STEPS.md`](../../../docs/NEXT_STEPS.md).
4. Add a `coverImage` if the project warrants one.

## MDX components in content

Components available inside MDX without import. Source in `src/components/mdx/`, registered through `src/components/mdx/index.ts`. Authoritative list in [`ARCHITECTURE.md → "MDX components"`](../../../docs/ARCHITECTURE.md).

```mdx
<VideoEmbed src="/media/projects/aline/teaser.mp4" poster="/media/projects/aline/poster.jpg" />

<Callout kind="note">
A small contextual aside that doesn't belong in the main flow.
</Callout>

<Figure src="/media/articles/foo/diagram.svg" caption="Pipeline diagram, simplified." />

<CommitFlowDiagram />
```

Conventions:

- `<VideoEmbed />` accepts either a self-hosted `src` (under `/public/media/...`) or a YouTube/Vimeo URL. For self-hosted videos always set `poster` so the page doesn't pop on load — the underlying `<video>` uses `preload="none"` so the file only fetches when the reader plays it. Reduced-motion users see the poster until they explicitly play; no autoplay or loop.
- `<Callout kind>` accepts `note` (default — solid slate card with full border, use it when a paragraph genuinely needs to break flow) or `aside` (quieter left-rule, transparent bg, for tangential thoughts that shouldn't compete with the body). Coloured variants (`warn`/`success`/`important`) are intentionally deferred until the accent colour in DECISIONS.md is closed; until then, hierarchy comes from weight, padding, and border, not hue.
- `<Figure>` requires `src` and `alt`; `caption` is optional. `alt` describes what's in the image (a11y); `caption` is shown to readers below.
- `<CommitFlowDiagram />` is article-scoped (used in *practical workflow for Claude Code*). No props. Single-accent SVG; categorical labels live in text under each box, not in colour. If you need a different inline diagram, build a sibling component rather than parameterising this one — generic chart components tend to over-fit the first article and under-fit the second.

To add a new MDX component:

1. Add the `.astro` file under `src/components/mdx/`.
2. Register it in `src/components/mdx/index.ts`.
3. Update the table in [`ARCHITECTURE.md → "MDX components"`](../../../docs/ARCHITECTURE.md) **and** the conventions list above, in the same commit.
4. Use the component in real content before considering it "done" — it's not a component until something renders it.

## Pre-publish checklist

Before merging a new piece of content:

1. Frontmatter validates against the schema (`astro sync` runs clean).
2. The slug is kebab-case and unique within the collection.
3. Internal links resolve in the locale you're writing for.
4. Images and videos load (`/public/media/...` paths exist on disk).
5. The "other-locale" case is acceptable — either the translation also exists, or you're OK with the missing-language notice rendering until it does.
6. If this is the first time publishing in a previously empty subfolder (`articles/es/...`), check that the index page lists it correctly.
7. If the piece introduces a new tag, MDX component, or pattern, the corresponding doc/skill section is updated in the same commit (per [`docs-governance`](../docs-governance/SKILL.md)).
