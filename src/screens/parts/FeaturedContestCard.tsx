import type { Match } from '../../types';
import { REGIONS } from '../../types';
import { getTeam } from '../../engine';
import { PHASE_NAME, useGame } from '../../game/context';
import { Shield } from '../../art/Heraldry';
import { roman } from '../../art/hash';

export function FeaturedContestCard({ m }: { m: Match }) {
  const { world: w, go } = useGame();
  const home = getTeam(w, m.home);
  const away = getTeam(w, m.away);
  const done = m.homeScore !== null;
  return (
    <figure className="featured-contest">
      <figcaption>{m.phase === 'grand-final' ? 'The contest the whole world is watching' : done ? 'The contest of the week' : 'The contest to come'}</figcaption>
      <div className="arch">
        <div className="arch-side">
          <Shield team={home} size={92} title />
          <strong>{home.nickname}</strong>
          <small>{REGIONS[home.region].toLowerCase()}</small>
        </div>
        <div className="arch-mid">
          <span className="arch-phase">{PHASE_NAME[m.phase]}</span>
          <span className="arch-score">{done ? <>{m.homeScore}<i>–</i>{m.awayScore}</> : 'versus'}</span>
          <span className="arch-when">Year {roman(m.season)}, week {m.week}</span>
        </div>
        <div className="arch-side">
          <Shield team={away} size={92} title />
          <strong>{away.nickname}</strong>
          <small>{REGIONS[away.region].toLowerCase()}</small>
        </div>
      </div>
      <button type="button" className="gilt-button" onClick={() => go({ kind: 'contest', id: m.id })}>
        {done ? 'Watch the contest' : 'Read the challenge'}
      </button>
    </figure>
  );
}
