import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import type { AstroIntegration } from 'astro';

// Component gallery served only in dev — never emitted to dist/.
const devLab: AstroIntegration = {
  name: 'dev-lab',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') {
        injectRoute({ pattern: '/lab', entrypoint: './dev/lab.astro' });
      }
    },
  },
};

export default defineConfig({
  site: 'https://s12kuma01.com',
  i18n: {
    locales: ['ja', 'en', 'th'],
    defaultLocale: 'ja',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({ i18n: { defaultLocale: 'ja', locales: { ja: 'ja-JP', en: 'en-US', th: 'th-TH' } } }),
    devLab,
  ],
  fonts: [
    {
      // Latin display face. fallbacks: [] so composed stacks (fonts.css) can
      // continue into the JP/Thai faces instead of dead-ending at a generic.
      provider: fontProviders.google(),
      name: 'Google Sans Flex',
      cssVariable: '--font-display',
      subsets: ['latin'],
      fallbacks: [],
    },
    // Noto Sans JP is deliberately NOT served through the Fonts API: its 121
    // unicode-range slices would be inlined as ~96 KB of <style> into every
    // page (the <Font /> component inlines @font-face). It comes from
    // @fontsource-variable/noto-sans-jp instead — bundled into the external,
    // cacheable stylesheet (imported in Base.astro).
    {
      // Variable weight range requested explicitly — the google provider can
      // otherwise fetch per-weight static files (withastro/astro#14819).
      provider: fontProviders.google(),
      name: 'Noto Sans Thai',
      cssVariable: '--font-thai',
      weights: ['100 900'],
    },
  ],
});
