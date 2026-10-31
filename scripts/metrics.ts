// Long-run balance metrics. Usage: npx tsx scripts/metrics.ts [seasons] [seed,seed,...]
import { advanceOneWeek, createWorld, getTeam } from '../src/engine';
import { REGIONS } from '../src/types';
import type { World } from '../src/types';

const seasons = Number(process.argv[2] ?? 30);
const seeds = (process.argv[3] ?? '2026').split(',').map(Number);
const meanRating = (w: World) => w.players.reduce((s, p) => s + p.rating, 0) / w.players.length;
const titles = REGIONS.map(() => 0);
const mvpRoles: Record<string, number> = {};
for (const seed of seeds) {
  const w = createWorld(seed);
  const start = meanRating(w);
  const rivals = new Set(w.teams.map(t => t.rival)).size;
  const t0 = Date.now();
  let tenYear = 0;
  while (w.season <= seasons) {
    advanceOneWeek(w);
    if (w.week === 25) {
      const mvp = w.players.find(p => p.stats.mvp > 0);
      if (mvp) mvpRoles[mvp.role] = (mvpRoles[mvp.role] ?? 0) + 1;
    }
    if (w.season === 11 && w.week === 1 && !tenYear) tenYear = Date.now() - t0;
  }
  const local = REGIONS.map(() => 0);
  for (const t of w.trophies.filter(t => t.competition === 'GRAND RIFT CHAMPIONSHIP')) { const r = getTeam(w, t.teamId).region; local[r]++; titles[r]++; }
  const levels = w.players.filter(p => p.level >= 15).length / w.players.length;
  console.log(`seed ${seed}: rating ${start.toFixed(1)} -> ${meanRating(w).toFixed(1)} | titles ${local.join('/')} | rivals ${rivals} | maxLevel ${(levels * 100).toFixed(1)}% | save ${(JSON.stringify(w).length / 1e6).toFixed(1)}MB | 10y ${(tenYear / 1000).toFixed(1)}s`);
}
console.log('titles by region:', REGIONS.map((r, i) => `${r} ${titles[i]}`).join(', '));
console.log('MVP roles:', JSON.stringify(mvpRoles));
