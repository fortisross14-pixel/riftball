import { createContext, useContext } from 'react';
import type { Match, Player, Team, World } from '../types';
import type { Route } from './route';

export type Game = {
  world: World;
  go: (r: Route) => void;
  team: (id: string) => Team | undefined;
  player: (id: string) => Player | undefined;
  advance: (weeks: number) => void;
  busy: boolean;
  locked: boolean;
  importFile: (f: File) => Promise<boolean>;
  newUniverse: () => Promise<boolean>;
};

export const GameContext = createContext<Game | null>(null);
export function useGame(): Game {
  const g = useContext(GameContext);
  if (!g) throw new Error('Game context missing');
  return g;
}

export const PHASE_NAME: Record<Match['phase'], string> = {
  league: 'League round',
  'regional-semi': 'Regional semifinal',
  'regional-final': 'Regional final',
  'world-quarter': 'Grand Rift quarterfinal',
  'world-semi': 'Grand Rift semifinal',
  'grand-final': 'The Grand Rift Final',
};

export function stageOf(week: number): string {
  if (week <= 18) return 'The League Rounds';
  if (week <= 20) return 'The Regional Playoffs';
  if (week <= 23) return 'The Grand Rift';
  if (week === 24) return 'The Feast of Honours';
  return 'The Long Winter';
}

export const nfmt = (v: number) => new Intl.NumberFormat('en-US').format(v);
export const record = (t: Team) => `${t.record.w}–${t.record.d}–${t.record.l}`;
export const played = (t: Team) => t.record.w + t.record.d + t.record.l;
export const isPlayed = (m: Match) => m.homeScore !== null;
