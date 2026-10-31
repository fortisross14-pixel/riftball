import { useMemo, useState } from 'react';
import type { Match } from '../types';
import { REGIONS } from '../types';
import { currentStage, upcoming } from '../engine';
import { PHASE_NAME, useGame } from '../game/context';
import { Blank, Choice, Pick } from '../ui/bits';
import { ChallengeRow, realmName } from './Tourneys';
import { FeaturedContestCard } from './parts/FeaturedContestCard';
import { ES } from '../i18n/es';

const PHASES = Object.keys(PHASE_NAME) as Match['phase'][];
const T = ES.matches;

export function Lists() {
  const { world: w, team, advance, busy, locked } = useGame();
  const [scope, setScope] = useState<'season' | 'all'>('season');
  const [phase, setPhase] = useState<Match['phase'] | 'all'>('all');
  const [region, setRegion] = useState(-1);
  const [shown, setShown] = useState(30);
  const next = upcoming(w);
  const completed = useMemo(() => w.matches.filter((m) => m.homeScore !== null
    && (scope === 'all' || m.season === w.season)
    && (phase === 'all' || m.phase === phase)
    && (region < 0 || m.region === region || team(m.home)?.region === region || team(m.away)?.region === region)).reverse(), [w, scope, phase, region, team]);
  const featured = completed.find((m) => m.phase === 'grand-final') ?? next.find((m) => m.phase === 'grand-final') ?? next.find((m) => m.phase !== 'league') ?? completed[0] ?? next[0];
  const byPhase = PHASES.map((p) => ({ p, list: next.filter((m) => m.phase === p) })).filter((g) => g.list.length);

  return (
    <div className="spread lists">
      <section className="page verso">
        <h1 className="folio-title">{T.title}</h1>
        <p className="folio-sub">{T.sub}</p>
        {featured && <FeaturedContestCard m={featured} />}

        <h2 className="page-head spaced">{T.thisWeek(w.week)}</h2>
        <p className="aside-note">{T.thisWeekNote(w.season)}</p>
        {byPhase.length ? byPhase.map(({ p, list }) => (
          <div key={p} className="phase-group">
            <h3 className="phase-title">{PHASE_NAME[p]} <small>{T.count(list.length)}</small></h3>
            {list.slice(0, p === 'league' ? 12 : 8).map((m) => <ChallengeRow key={m.id} m={m} />)}
            {p === 'league' && list.length > 12 && <p className="aside-note">{T.moreLeague(list.length - 12)}</p>}
          </div>
        )) : <Blank>{T.none}</Blank>}
        {next.length > 0 && currentStage(w).kind === 'league' && <button type="button" className="gilt-button spaced-button" disabled={busy || locked} onClick={() => advance(1)}>{T.play}</button>}
      </section>

      <section className="page recto">
        <h2 className="page-head">{T.archive}</h2>
        <div className="archive-filters">
          <Choice label={T.years} compact value={scope} onChange={(v) => { setScope(v); setShown(30); }} options={[{ value: 'season', label: T.thisYear }, { value: 'all', label: T.allYears }]} />
          <Pick label={T.competition} value={phase} onChange={(v) => { setPhase(v); setShown(30); }} options={[{ value: 'all', label: T.allCompetitions }, ...PHASES.map((p) => ({ value: p, label: PHASE_NAME[p] }))]} />
          <Pick label={ES.common.country} value={region} onChange={(v) => { setRegion(v); setShown(30); }} options={[{ value: -1, label: ES.common.allCountries }, ...REGIONS.map((_, i) => ({ value: i, label: realmName(i) }))]} />
        </div>
        <p className="found-count">{T.recorded(completed.length)}</p>
        <div className="archive-list">
          {completed.slice(0, shown).map((m) => <ChallengeRow key={m.id} m={m} showPhase />)}
          {!completed.length && <Blank>{T.noneFound}</Blank>}
        </div>
        {completed.length > shown && <div className="more-leaves"><button type="button" className="ink-button" onClick={() => setShown((n) => n + 30)}>{ES.common.more(Math.min(30, completed.length - shown))}</button></div>}
      </section>
    </div>
  );
}
