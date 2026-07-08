import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const entry = z.object({
  title: z.string(),
  description: z.string(),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      repo: z.string().url().optional(),
      modrinth: z.string().url().optional(),
      curseforge: z.string().url().optional(),
      link: z.string().url().optional(),
      cover: image().optional(),
      tags: z.array(z.string()),
      // ALL THREE locales are required — a project missing a translation
      // fails the build instead of silently shipping untranslated.
      i18n: z.object({ ja: entry, en: entry, th: entry }),
    }),
});

export const collections = { projects };
