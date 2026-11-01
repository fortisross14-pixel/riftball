// Star impact report: do clubs with Legendary/Generational starters reach the national finals more,
// do upsets still happen, and does any club dominate its country?
import { advanceWeekAuto, createWorld, currentFixtures, lineup, SEASON, winChance } from '../engine';
import type { World } from '../types';

export type StarStats = { withStar: number; withStarFinals: number; noStar: number; noStarFinals: number; knockouts: number; favouriteLosses: number; maxNationalShare: number };

export function starStats(w: World, seasons: number, acc: StarStats) {
  const titles = new Map<string, number>();
  while (w.season <= seasons) {
    if (w.week === SEASON.NATIONAL_SEMI || (w.week >= SEASON.NATIONAL_FINAL && w.week <= SEASON.WORLD_FINAL)) {
      // Favourites by pre-match chance, recorded before the knockout fixtures are played.
      const picks = currentFixtures(w).filter((m) => m.phase !== 'league' && m.homeScore === null).map((m) => ({ m, fav: winChance(w, m) >= 0.5 ? m.home : m.away }));
      if (w.week === SEASON.NATIONAL_SEMI) {
        // Star status of every club as the national knockouts begin.
        const finalists = new Set<string>();
        advanceWeekAuto(w);
        for (const m of currentFixtures(w)) finalists.add(m.home).add(m.away);
        for (const t of w.teams) {
          const star = lineup(w, t).some((p) => p.rarity === 'Legendary' || p.rarity === 'Generational');
          if (star) { acc.withStar++; if (finalists.has(t.id)) acc.withStarFinals++; } else { acc.noStar++; if (finalists.has(t.id)) acc.noStarFinals++; }
        }
      } else advanceWeekAuto(w);
      for (const { m, fav } of picks) if (m.winner) { acc.knockouts++; if (m.winner !== fav) acc.favouriteLosses++; }
      continue;
    }
    advanceWeekAuto(w);
  }
  for (const t of w.trophies) if (t.competition.endsWith(' CHAMPIONS')) titles.set(t.teamId, (titles.get(t.teamId) ?? 0) + 1);
  acc.maxNationalShare = Math.max(acc.maxNationalShare, ...[...titles.values()].map((n) => n / seasons));
  return acc;
}

