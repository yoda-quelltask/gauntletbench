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

export const collections = { rounds };
