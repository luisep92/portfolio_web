import VideoEmbed from './VideoEmbed.astro';
import Callout from './Callout.astro';
import Figure from './Figure.astro';

/**
 * Components consumable from inside MDX without explicit imports.
 * Pass to `<Content components={mdxComponents} />` in any layout that
 * renders an entry's MDX body.
 *
 * To add a new component: drop a `.astro` file under `src/components/mdx/`,
 * register it in this map, and update both
 * `docs/ARCHITECTURE.md → "MDX components"` and
 * `.claude/skills/content-authoring/SKILL.md → "MDX components in content"`
 * in the same commit (per docs-governance).
 */
export const mdxComponents = {
  VideoEmbed,
  Callout,
  Figure,
};
