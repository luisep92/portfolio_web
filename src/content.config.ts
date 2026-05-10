import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

// Both collections store entries under <locale>/<slug>.mdx, so each entry id
// is "en/aline" / "es/aline" etc. Locale resolution lives in src/lib/content.ts
// (added in Step 6); this file owns only schema and discovery.
//
// Schema additions are decisions: propose in chat, capture in DECISIONS.md,
// then update this schema *and* the table in docs/ARCHITECTURE.md →
// "Content collections" in the same commit (per docs-governance).

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  draft: z.boolean().default(false),
});

const projectSchema = z.object({
  title: z.string(),
  summary: z.string(),
  tier: z.enum(['featured', 'other']),
  order: z.number(),
  year: z.number().optional(),
  role: z.string().optional(),
  tags: z.array(z.string()).optional(),
  links: z
    .object({
      repo: z.url().optional(),
      demo: z.url().optional(),
      video: z.url().optional(),
      article: z.url().optional(),
    })
    .optional(),
  coverImage: z.string().optional(),
  draft: z.boolean().default(false),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/articles' }),
  schema: articleSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: projectSchema,
});

export const collections = { articles, projects };
