import type { World } from '../types';
import { abilityTier } from '../engine';

/** Counts matches with an ultimate, and close games (6 points or less) decided by one. */
export function ultimateStats(w: World, acc: { games: number; close: number; closeDecided: number; withUltimate: number; holders: number; players: number }) {
  for (const m of w.matches) {
    if (m.homeScore === null) continue;
    acc.games++;
    if (m.events.some((e) => e.kind === 'ultimate')) acc.withUltimate++;
    if (Math.abs(m.homeScore - m.awayScore!) <= 6) { acc.close++; if (m.decidedBy) acc.closeDecided++; }
  }
  acc.holders += w.players.filter((p) => abilityTier(p.ability) === 'ultimate').length;
  acc.players += w.players.length;
  return acc;
}
