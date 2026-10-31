// What the main button does next, in words, shared by the control bar and the Crónica banner.
// It always matches what the engine will do when the button is pressed.
import type { World } from '../types';
import { SEASON, currentStage, isStageComplete, pendingFixtures } from '../engine';
import { ES } from '../i18n/es';

export type MainAction = { label: string; sub: string; enabled: boolean };

/** What the main button does next, in words. It always matches what the engine will do. */
export function mainAction(w: World): MainAction {
  const stage = currentStage(w);
  const done = isStageComplete(w);
  if (stage.kind === 'showcase') {
    if (!done) return { label: ES.bar.pending(pendingFixtures(w).length), sub: ES.bar.pendingSub, enabled: false };
    const next: Record<number, string> = { [SEASON.NATIONAL_FINAL]: ES.bar.toWorldCup, [SEASON.WORLD_GROUPS]: ES.bar.toSemis, [SEASON.WORLD_SEMI]: ES.bar.toFinal, [SEASON.WORLD_FINAL]: ES.bar.toGala };
    return { label: next[w.week] ?? ES.stage.continue, sub: ES.bar.continueSub, enabled: true };
  }
  if (stage.kind === 'awards') {
    if (!done) return { label: ES.bar.awardsPending(stage.total - stage.revealed), sub: ES.bar.awardsPendingSub, enabled: false };
    return { label: ES.bar.toMarket, sub: ES.bar.continueSub, enabled: true };
  }
  if (stage.kind === 'market') return { label: ES.bar.openMarket, sub: ES.bar.openMarketSub, enabled: true };
  if (stage.kind === 'preseason') return { label: ES.bar.startSeason(w.season + 1), sub: ES.bar.continueSub, enabled: true };
  if (w.week === SEASON.NATIONAL_SEMI) return { label: ES.bar.toNationalFinals, sub: ES.bar.toNationalFinalsSub, enabled: true };
  return { label: ES.bar.playWeek(w.week), sub: ES.bar.playWeekSub(pendingFixtures(w).length), enabled: true };
}

/** Where the season stands, as an index into ES.progress. */
export function progressIndex(w: World): number {
  if (w.week <= SEASON.NATIONAL_SEMI) return 0;
  if (w.week === SEASON.NATIONAL_FINAL) return 1;
  if (w.week === SEASON.WORLD_GROUPS) return 2;
  if (w.week === SEASON.WORLD_SEMI) return 3;
  if (w.week === SEASON.WORLD_FINAL) return 4;
  if (w.week === SEASON.AWARDS) return 5;
  if (w.week === SEASON.MARKET) return 6;
  return 7;
}

/** The next stop for "simulate to the next event". Simulation stops on every non-league week. */
export function nextEventName(w: World): string {
  const at = progressIndex(w);
  return at === 0 || at === 7 ? ES.progress[1] : ES.progress[Math.min(7, at + 1)];
}

