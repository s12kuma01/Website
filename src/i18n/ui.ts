// i18n entry point. Strings live one JSON file per language in ./locales/*.
//
// Fallback model: the default locale (ja) is the guaranteed-complete backstop
// (typed `satisfies Dict`, so a missing key there is a build error). en and th
// may omit keys — at runtime each locale resolves a key as
//   requested → English → Japanese
// via a deep merge, so an untranslated string shows English (then Japanese)
// instead of breaking. A key that exists nowhere is impossible because ja is
// complete.
import jaJson from './locales/ja.json';
import enJson from './locales/en.json';
import thJson from './locales/th.json';

export const locales = ['ja', 'en', 'th'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ja';

export interface Dict {
  nav: {
    primary: string;
    settings: string;
  };
  settings: {
    mode: string;
    modeLight: string;
    modeAuto: string;
    modeDark: string;
    palette: string;
    hue: string;
    reroll: string;
    language: string;
  };
  footer: {
    hosted: string;
    github: string;
    discord: string;
  };
  home: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    ctaProjects: string;
    ctaAbout: string;
  };
  projects: {
    metaTitle: string;
    metaDescription: string;
    heading: string;
    intro: string;
    viewRepo: string;
    viewSite: string;
  };
  about: {
    metaTitle: string;
    metaDescription: string;
    heading: string;
    profileHeading: string;
    profileBody: readonly string[];
    skillsHeading: string;
    skillGroups: readonly { label: string; items: readonly string[] }[];
    interestsHeading: string;
    interestsBody: string;
  };
  notFound: {
    metaTitle: string;
    heading: string;
    body: string;
    backHome: string;
  };
}

// Arrays are treated as leaves (a translation supplies a whole array or omits
// the key) so they replace rather than element-merge.
type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

// ja must be complete (backstop); en/th may be partial.
const ja = jaJson satisfies Dict;
const en = enJson satisfies DeepPartial<Dict>;
const th = thJson satisfies DeepPartial<Dict>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Deep-merge `over` onto `base`; present keys in `over` win, arrays replace.
 * NoInfer keeps T tied to `base` (the complete side) so the result type stays
 * complete even when `over` omits keys — that's what lets en/th be partial. */
function merge<T>(base: T, over: DeepPartial<NoInfer<T>> | undefined): T {
  if (over === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(over)) return over as T;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(over)) {
    const b = (base as Record<string, unknown>)[key];
    const o = (over as Record<string, unknown>)[key];
    out[key] = isPlainObject(b) && isPlainObject(o) ? merge(b, o as DeepPartial<typeof b>) : o;
  }
  return out as T;
}

const enResolved = merge(ja, en); // en → ja
const dicts: Record<Locale, Dict> = {
  ja,
  en: enResolved,
  th: merge(enResolved, th), // th → en → ja
};

export function useDict(locale: Locale): Dict {
  return dicts[locale];
}
