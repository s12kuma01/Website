import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const entry = z.object({
  title: z.string(),
  description: z.string(),
});

// Reject anything but http(s): z's .url() accepts javascript:/data: URLs, which
// would be rendered straight into an href in ProjectCard. Content is author-only
// today, but this keeps a hostile scheme out of the markup regardless of source.
const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), { message: 'must be an http(s) URL' });

const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      repo: httpUrl.optional(),
      modrinth: httpUrl.optional(),
      curseforge: httpUrl.optional(),
      link: httpUrl.optional(),
      cover: image().optional(),
      tags: z.array(z.string()),
      // ALL THREE locales are required — a project missing a translation
      // fails the build instead of silently shipping untranslated.
      i18n: z.object({ ja: entry, en: entry, th: entry }),
    }),
});

export const collections = { projects };
