import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const rounds = (await getCollection('rounds')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  return rss({
    title: 'GAUNTLET Bench — Rounds',
    description:
      'Round-by-round writeups from the GAUNTLET local-model benchmark: what ran, what broke, and what the scores actually mean.',
    site: context.site,
    items: rounds.map((round) => ({
      title: round.data.title,
      description: round.data.summary,
      pubDate: round.data.date,
      link: `/rounds/${round.data.slug ?? round.id}/`,
    })),
  });
}
