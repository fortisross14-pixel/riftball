// Star impact report. Usage: npx tsx scripts/stars.ts [seasons] [seeds…]
import { createWorld } from '../src/engine';
import { starStats, type StarStats } from '../src/testing/stars';

{
  const seasons = Number(process.argv[2] ?? 10);
  const seeds = process.argv.slice(3).map(Number);
  const acc: StarStats = { withStar: 0, withStarFinals: 0, noStar: 0, noStarFinals: 0, knockouts: 0, favouriteLosses: 0, maxNationalShare: 0 };
  for (const seed of seeds.length ? seeds : [11, 22, 33]) starStats(createWorld(seed), seasons, acc);
  const a = acc.withStarFinals / acc.withStar, b = acc.noStarFinals / acc.noStar;
  console.log(`finals rate with star ${(a * 100).toFixed(1)}% (${acc.withStar} club-seasons) · without ${(b * 100).toFixed(1)}% (${acc.noStar}) · ratio ${(a / b).toFixed(2)}`);
  console.log(`favourites lose ${((acc.favouriteLosses / acc.knockouts) * 100).toFixed(1)}% of ${acc.knockouts} knockouts · max national title share ${(acc.maxNationalShare * 100).toFixed(0)}%`);
}
