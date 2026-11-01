// Ultimate report: how often Definitivas fire and decide close games. Usage: npx tsx scripts/ultimates.ts [seasons] [seeds…]
import { advanceWeekAuto, createWorld } from '../src/engine';
import { ultimateStats } from '../src/testing/ultimates';
const seasons = Number(process.argv[2] ?? 3);
const seeds = process.argv.slice(3).map(Number);
const acc = { games: 0, close: 0, closeDecided: 0, withUltimate: 0, holders: 0, players: 0 };
for (const seed of seeds.length ? seeds : [11, 22, 33]) { const w = createWorld(seed); while (w.season <= seasons) advanceWeekAuto(w); ultimateStats(w, acc); }
console.log(`matches ${acc.games} · with an ultimate ${((acc.withUltimate / acc.games) * 100).toFixed(1)}% · close games (≤6) decided by an ultimate ${((acc.closeDecided / acc.close) * 100).toFixed(1)}% of ${acc.close} · holders ${acc.holders}/${acc.players}`);
