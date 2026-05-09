/**
 * Single source of truth for UI strings, keyed by locale.
 *
 * - Add new keys here, not in components. Components consume them via `t()`
 *   from `./utils.ts`, which gives you typed access (a typo in a key fails
 *   at type-check, not at runtime).
 * - Keep both locales in sync: every key present in `en` must also exist in
 *   `es` (the `satisfies` clause below enforces this).
 */

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const ui = {
  en: {
    'site.title': 'Luis Escolano',
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'nav.articles': 'Articles',
    'nav.now': 'Now',
    'nav.contact': 'Contact',
    'locale.toggle.aria': 'Switch to Spanish',
    'locale.toggle.label': 'ES',
    'missing.title': 'Not yet available in this language',
    'missing.body':
      'This piece is currently only available in the other language. You can read it there.',
    'missing.cta': 'Read the available version',
    'home.placeholder.body': 'Site under construction.',
    'placeholder.coming_soon': 'Coming soon.',
    'now.last_updated': 'Last updated',
    'projects.featured_heading': 'Featured',
    'projects.other_heading': 'Other technical work',
    'projects.empty': 'More featured projects on the way.',
  },
  es: {
    'site.title': 'Luis Escolano',
    'nav.home': 'Inicio',
    'nav.projects': 'Proyectos',
    'nav.articles': 'Artículos',
    'nav.now': 'Ahora',
    'nav.contact': 'Contacto',
    'locale.toggle.aria': 'Cambiar a inglés',
    'locale.toggle.label': 'EN',
    'missing.title': 'Aún no disponible en este idioma',
    'missing.body':
      'Esta entrada solo está disponible en el otro idioma por ahora. Puedes leerla allí.',
    'missing.cta': 'Leer la versión disponible',
    'home.placeholder.body': 'Sitio en construcción.',
    'placeholder.coming_soon': 'Próximamente.',
    'now.last_updated': 'Última actualización',
    'projects.featured_heading': 'Destacados',
    'projects.other_heading': 'Otros trabajos técnicos',
    'projects.empty': 'Más proyectos destacados en camino.',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)[typeof defaultLocale];
