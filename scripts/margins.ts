// Match balance report: share of close games and blowouts, scoring and events per match.
// Usage: npx tsx scripts/margins.ts [seasons] [seeds…]
import { advanceWeekAuto, createWorld } from '../src/engine';

const seasons = Number(process.argv[2] ?? 1);
const seeds = process.argv.slice(3).map(Number);
const list = seeds.length ? seeds : [11, 22, 33];
let games = 0, close = 0, blow = 0, total = 0, events = 0, home = 0;
const kinds: Record<string, number> = {};
for (const seed of list) {
  const w = createWorld(seed);
  while (w.season <= seasons) advanceWeekAuto(w);
  for (const m of w.matches) {
    if (m.homeScore === null || m.season > seasons) continue;
    const margin = Math.abs(m.homeScore - m.awayScore!);
    games++; total += m.homeScore + m.awayScore!; events += m.events.length;
    if (margin <= 6) close++;
    if (margin >= 20) blow++;
    if (m.homeScore > m.awayScore! && m.phase === 'league') home++;
    for (const e of m.events) kinds[e.kind] = (kinds[e.kind] ?? 0) + 1;
  }
}
const pct = (n: number) => `${((n / games) * 100).toFixed(1)}%`;
console.log(`games ${games} · one score or less (≤6) ${pct(close)} · 20+ ${pct(blow)} · avg points ${(total / games).toFixed(1)} · events/match ${(events / games).toFixed(1)}`);
console.log('events per match by kind:', Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, +(v / games).toFixed(2)])));
