// Match-day facts for the pre-match card and the post-match page. Pure functions; nothing here touches the dice.
import type { Match, MatchEvent, Player, Team, World } from '../types';
import { lineup, sortedStandings, winChance } from '../engine';

/** The current run of identical results (newest first in team.form), if it is 3 or longer. */
export function streakOf(t: Team): { kind: 'W' | 'L' | 'D'; n: number } | undefined {
  const first = t.form[0] as 'W' | 'L' | 'D' | undefined;
  if (!first) return undefined;
  let n = 0;
  while (n < t.form.length && t.form[n] === first) n++;
  return n >= 3 ? { kind: first, n } : undefined;
}

export const tablePosition = (w: World, t: Team) => sortedStandings(w, t.region, 0).findIndex((x) => x.id === t.id) + 1;

/** Each side's best-rated starter: the duel the crowd came to see. */
export function keyDuel(w: World, home: Team, away: Team): [Player, Player] | undefined {
  const best = (t: Team) => [...lineup(w, t)].sort((a, b) => b.rating - a.rating)[0];
  const h = best(home), a = best(away);
  return h && a ? [h, a] : undefined;
}

/** The home side's pre-match chance, as a whole percentage. */
export const homeChancePct = (w: World, m: Match) => Math.round(winChance(w, m) * 100);

const logit = (p: number) => Math.log(p / (1 - p));
/**
 * The home side's chance of winning after each moment, from the score, the time left and the pre-match odds.
 * The first point is kickoff; the last is the result.
 */
export function winCurve(m: Match, prior: number): number[] {
  const p0 = Math.min(0.97, Math.max(0.03, prior));
  const at = (diff: number, minute: number) => {
    const left = Math.max(0, 1 - minute / 32);
    return 1 / (1 + Math.exp(-(logit(p0) * left + (diff * 0.32) / (Math.sqrt(left) + 0.15))));
  };
  const out = [p0];
  for (const e of m.events) out.push(at(e.homeScore - e.awayScore, e.minute));
  out.push(m.winner === m.home ? 1 : m.winner === m.away ? 0 : 0.5);
  return out;
}

const PLAY_WEIGHT: Partial<Record<MatchEvent['kind'], number>> = { breach: 8, interception: 6, knockout: 5, spark: 5, gate: 4, bigplay: 4, fumble: 3 };
/** The single most important moment: big plays score higher when they change the lead or come late. */
export function playOfTheMatch(m: Match): MatchEvent | undefined {
  let best: MatchEvent | undefined, bestScore = -1, before = [0, 0];
  for (const e of m.events) {
    const base = PLAY_WEIGHT[e.kind] ?? 0;
    const leadBefore = Math.sign(before[0] - before[1]), leadAfter = Math.sign(e.homeScore - e.awayScore);
    const score = base + (base && leadBefore !== leadAfter ? 4 : 0) + (base && e.minute >= 26 ? 3 : 0);
    if (score >= bestScore && base) { best = e; bestScore = score; }
    before = [e.homeScore, e.awayScore];
  }
  return best;
}
