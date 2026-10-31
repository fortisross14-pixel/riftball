// Shared by the worker and the in-page fallback: the messages, and the operations they perform.
import type { World } from '../types';
import { advanceOneWeek, dismissIntro, isEventStage, isStageComplete, predict, resolveMatch, revealAward } from '../engine';

/** The longest run "simulate to the next event" will ever play (a whole season and then some). */
export const MAX_RUN = 40;

export type SimOp =
  | { name: 'resolve'; matchId: string }
  | { name: 'dismissIntro' }
  | { name: 'revealAward' }
  | { name: 'predict'; matchId: string; teamId: string };

export type SimRequest =
  | { type: 'load'; world: World }
  | { type: 'op'; op: SimOp }
  | { type: 'run'; id: number; plan: number; mode: 'count' | 'event'; count: number }
  | { type: 'resolve'; id: number; ids: string[] }
  | { type: 'save'; id: number; revision: number };

export type SimResponse =
  | { type: 'progress'; id: number; current: number; total: number }
  | { type: 'world'; id: number; world: World }
  | { type: 'saved'; id: number; revision: number }
  | { type: 'conflict'; id: number }
  | { type: 'error'; id: number; message: string };

export function applyOp(w: World, op: SimOp) {
  if (op.name === 'resolve') resolveMatch(w, op.matchId);
  else if (op.name === 'dismissIntro') dismissIntro(w);
  else if (op.name === 'revealAward') revealAward(w);
  else if (op.name === 'predict') predict(w, op.matchId, op.teamId);
}

/**
 * Play weeks until the stop rule says so: `count` weeks, or up to the next event (a showcase intro,
 * the gala, the market). Never plays past an unfinished stage. Yields between weeks to report progress.
 */
export async function runWeeks(w: World, plan: number, mode: 'count' | 'event', count: number, progress: (current: number, total: number) => void) {
  let played = 0;
  do {
    advanceOneWeek(w);
    played++;
    progress(played, Math.max(plan, played));
    await new Promise((r) => setTimeout(r, 0));
  } while (!(mode === 'count' ? played >= count : isEventStage(w)) && isStageComplete(w) && played < MAX_RUN);
}
