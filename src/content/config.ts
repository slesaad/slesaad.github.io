import { defineCollection, z } from 'astro:content';

const chapters = defineCollection({
  type: 'content',
  schema: z.object({
    mode: z.enum(['work', 'offclock']),
    num: z.number().int().min(0).max(99),
    key: z.string(),
    title: z.string(),
    lede: z.string().optional(),
  }),
});

export const collections = { chapters };
