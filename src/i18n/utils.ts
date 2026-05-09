import { defaultLocale, locales, ui, type Locale, type UIKey } from './ui';

const localePrefixRegex = new RegExp(`^/(${locales.join('|')})(?=/|$)`);

/**
 * Detect the locale from a URL or path. Returns `defaultLocale` if no locale
 * prefix is present (since the default locale is unprefixed per
 * `astro.config.mjs` → `routing.prefixDefaultLocale: false`).
 */
export function getLocaleFromUrl(url: URL | string): Locale {
  const pathname = typeof url === 'string' ? url : url.pathname;
  const match = pathname.match(localePrefixRegex);
  if (match) {
    return match[1] as Locale;
  }
  return defaultLocale;
}

/**
 * Map a path to its equivalent in another locale. Used by the locale toggle
 * to compute the "other side" link without hardcoding routes.
 *
 * Examples (defaultLocale = 'en'):
 *   ('/', 'es')             → '/es'
 *   ('/projects', 'es')     → '/es/projects'
 *   ('/es/projects', 'en')  → '/projects'
 *   ('/es', 'en')           → '/'
 */
export function localizedPath(currentPath: string, targetLocale: Locale): string {
  const stripped = currentPath.replace(localePrefixRegex, '') || '/';
  if (targetLocale === defaultLocale) {
    return stripped;
  }
  return stripped === '/' ? `/${targetLocale}` : `/${targetLocale}${stripped}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'es' : 'en';
}

/** Typed lookup into the UI strings dictionary. Unknown keys fail at type-check. */
export function t<K extends UIKey>(locale: Locale, key: K): string {
  return ui[locale][key];
}
