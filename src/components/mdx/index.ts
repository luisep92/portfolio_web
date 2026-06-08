import VideoEmbed from './VideoEmbed.astro';
import Callout from './Callout.astro';
import Figure from './Figure.astro';
import CommitFlowDiagram from './CommitFlowDiagram.astro';
import TwoLayersDiagram from './TwoLayersDiagram.astro';
import TestPyramidDiagram from './TestPyramidDiagram.astro';
import HybridFlowDiagram from './HybridFlowDiagram.astro';
import IterationCycle from './IterationCycle.astro';
import Step from './Step.astro';
import Takeaway from './Takeaway.astro';
import AppliedHere from './AppliedHere.astro';

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
  CommitFlowDiagram,
  TwoLayersDiagram,
  TestPyramidDiagram,
  HybridFlowDiagram,
  IterationCycle,
  Step,
  Takeaway,
  AppliedHere,
};
