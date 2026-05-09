import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { locales, type Locale } from '../i18n/ui';

type CollectionName = 'articles' | 'projects';

/**
 * Drafts are visible in dev (so authoring is friction-free) and excluded
 * from production builds. The schema gives `draft: false` by default, so
 * omitting the field opts the entry into prod by default.
 */
export const isVisible = (entry: { data: { draft: boolean } }) =>
  import.meta.env.PROD ? !entry.data.draft : true;

/**
 * Entries are stored under `<locale>/<slug>` in their collection folder, so
 * the entry id splits cleanly into locale and slug. Locale validation lives
 * in the caller — this just splits.
 */
export function entryIdToParts(id: string): { locale: string; slug: string } {
  const [first, ...rest] = id.split('/');
  return { locale: first, slug: rest.join('/') };
}

/**
 * Look up a content entry by its locale-stripped slug. Returns `undefined`
 * if the entry doesn't exist OR is a draft in production. The caller then
 * decides whether to render the missing-translation fallback or 404.
 */
export async function getEntryByLocale<T extends CollectionName>(
  collection: T,
  slug: string,
  locale: Locale,
): Promise<CollectionEntry<T> | undefined> {
  const entry = await getEntry(collection, `${locale}/${slug}`);
  if (!entry) return undefined;
  if (!isVisible(entry)) return undefined;
  return entry as CollectionEntry<T>;
}

/**
 * For a content collection, build the union of slugs across all locales
 * (optionally pre-filtered, e.g. `tier === 'featured'`). Drafts are
 * excluded in production. Returns slug → set of locales the entry exists
 * in.
 *
 * Used by `[slug].astro` `getStaticPaths` so both `/<col>/<slug>` and
 * `/es/<col>/<slug>` are valid routes for any slug published in either
 * locale; the page handler then picks render-vs-fallback per request.
 */
export async function getSlugsByLocaleUnion<T extends CollectionName>(
  collection: T,
  filter?: (entry: CollectionEntry<T>) => boolean,
): Promise<Map<string, Set<Locale>>> {
  const all = await getCollection(collection, (entry) =>
    isVisible(entry) && (filter ? filter(entry as CollectionEntry<T>) : true),
  );
  const map = new Map<string, Set<Locale>>();
  for (const entry of all) {
    const { locale, slug } = entryIdToParts(entry.id);
    if (!(locales as readonly string[]).includes(locale)) continue;
    if (!map.has(slug)) map.set(slug, new Set());
    map.get(slug)!.add(locale as Locale);
  }
  return map;
}
