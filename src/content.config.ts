import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const rounds = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/rounds' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.coerce.date(),
    summary: z.string(),
    models: z.array(z.string()).default([]),
    suite: z.string().optional(),
  }),
});

const education = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/education' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    cluster: z.enum(['concepts', 'methodology']),
    order: z.number(),
    summary: z.string(),
    updated: z.coerce.date(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.coerce.date(),
    summary: z.string(),
    // draft:true keeps an outline in the repo and off the site, so a piece can
    // be reviewed in a diff before it is prose.
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { rounds, education, articles };
