import { useMemo, useState } from 'react';
import type { Match } from '../types';
import { REGIONS } from '../types';
import { upcoming } from '../engine';
import { PHASE_NAME, useGame } from '../game/context';
import { roman } from '../art/hash';
import { Blank, Choice, Pick } from '../ui/bits';
import { ChallengeRow, realmName } from './Tourneys';
import { FeaturedContestCard } from './parts/FeaturedContestCard';

const PHASES = Object.keys(PHASE_NAME) as Match['phase'][];

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
        <h1 className="folio-title">The Lists</h1>
        <p className="folio-sub">Where every contest is fought, sealed and replayed. The carnage is real; the referees are insured.</p>
        {featured && <FeaturedContestCard m={featured} />}

        <h2 className="page-head spaced">Challenges of Week {w.week}</h2>
        <p className="aside-note">Year {roman(w.season)}. These contests are played when you turn the page.</p>
        {byPhase.length ? byPhase.map(({ p, list }) => (
          <div key={p} className="phase-group">
            <h3 className="phase-title">{PHASE_NAME[p]} <small>{list.length} {list.length === 1 ? 'contest' : 'contests'}</small></h3>
            {list.slice(0, p === 'league' ? 12 : 8).map((m) => <ChallengeRow key={m.id} m={m} />)}
            {p === 'league' && list.length > 12 && <p className="aside-note">…and {list.length - 12} more league contests across the realms.</p>}
          </div>
        )) : <Blank>No contests are scheduled this week. The athletes are recovering, or pretending to.</Blank>}
        {next.length > 0 && <button type="button" className="gilt-button spaced-button" disabled={busy || locked} onClick={() => advance(1)}>Play this week's contests</button>}
      </section>

      <section className="page recto">
        <h2 className="page-head">The Archive of Contests</h2>
        <div className="archive-filters">
          <Choice label="Years" compact value={scope} onChange={(v) => { setScope(v); setShown(30); }} options={[{ value: 'season', label: 'This year' }, { value: 'all', label: 'All kept years' }]} />
          <Pick label="Competition" value={phase} onChange={(v) => { setPhase(v); setShown(30); }} options={[{ value: 'all', label: 'Every competition' }, ...PHASES.map((p) => ({ value: p, label: PHASE_NAME[p] }))]} />
          <Pick label="Realm" value={region} onChange={(v) => { setRegion(v); setShown(30); }} options={[{ value: -1, label: 'All realms' }, ...REGIONS.map((_, i) => ({ value: i, label: realmName(i) }))]} />
        </div>
        <p className="found-count">{completed.length} {completed.length === 1 ? 'contest' : 'contests'} recorded</p>
        <div className="archive-list">
          {completed.slice(0, shown).map((m) => <ChallengeRow key={m.id} m={m} showPhase />)}
          {!completed.length && <Blank>No recorded contests match. Older years keep only their title contests in full.</Blank>}
        </div>
        {completed.length > shown && <div className="more-leaves"><button type="button" className="ink-button" onClick={() => setShown((n) => n + 30)}>Unroll {Math.min(30, completed.length - shown)} more</button></div>}
      </section>
    </div>
  );
}
