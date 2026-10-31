import { createContext, useContext } from 'react';
import type { Match, Player, Team, World } from '../types';
import type { Route } from './route';
import { ES } from '../i18n/es';

export type Game = {
  world: World;
  go: (r: Route) => void;
  team: (id: string) => Team | undefined;
  player: (id: string) => Player | undefined;
  advance: (weeks: number) => void;
  resolveFixture: (id: string) => Promise<boolean>;
  resolveFixtures: (ids: string[]) => boolean;
  dismissIntro: () => void;
  revealAward: () => void;
  simulateToNextEvent: () => void;
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

/** Competition names, in Spanish. */
export const PHASE_NAME: Record<Match['phase'], string> = ES.phase as Record<Match['phase'], string>;

/** The name of the part of the season a week belongs to. */
export const stageOf = (week: number): string => ES.stageName(week);

export const nfmt = (v: number) => new Intl.NumberFormat('es-ES').format(v);
export const record = (t: Team) => `${t.record.w}–${t.record.d}–${t.record.l}`;
export const played = (t: Team) => t.record.w + t.record.d + t.record.l;
export const isPlayed = (m: Match) => m.homeScore !== null;
