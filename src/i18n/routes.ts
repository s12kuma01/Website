import { defaultLocale, locales, type Locale } from './ui';

/** '/projects' + 'th' -> '/th/projects' ; default locale stays unprefixed. */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return clean === '/' ? '/' : clean;
  return clean === '/' ? `/${locale}/` : `/${locale}${clean}`;
}

/** Locale-agnostic path of the current URL ('/en/projects' -> '/projects'). */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  for (const l of locales) {
    if (l === defaultLocale) continue;
    if (pathname === `/${l}` || pathname === `/${l}/`) return { locale: l, path: '/' };
    if (pathname.startsWith(`/${l}/`)) return { locale: l, path: pathname.slice(l.length + 1) };
  }
  return { locale: defaultLocale, path: pathname };
}

/** hreflang alternates for a locale-agnostic path (x-default = ja). */
export function alternates(path: string): { hreflang: string; href: string }[] {
  return [
    ...locales.map((l) => ({ hreflang: l, href: localePath(l, path) })),
    { hreflang: 'x-default', href: localePath(defaultLocale, path) },
  ];
}
