import type { Match } from '../../types';
import { getTeam } from '../../engine';
import { PHASE_NAME, useGame } from '../../game/context';
import { Shield } from '../../art/Heraldry';
import { ES, countryName } from '../../i18n/es';

const T = ES.featured;

export function FeaturedContestCard({ m }: { m: Match }) {
  const { world: w, go } = useGame();
  const home = getTeam(w, m.home);
  const away = getTeam(w, m.away);
  const done = m.homeScore !== null;
  return (
    <figure className="featured-contest">
      <figcaption>{m.phase === 'grand-final' ? T.world : done ? T.week : T.next}</figcaption>
      <div className="arch">
        <div className="arch-side">
          <Shield team={home} size={92} title />
          <strong>{home.nickname}</strong>
          <small>{countryName(home.region)}</small>
        </div>
        <div className="arch-mid">
          <span className="arch-phase">{PHASE_NAME[m.phase]}</span>
          <span className="arch-score">{done ? <>{m.homeScore}<i>–</i>{m.awayScore}</> : T.versus}</span>
          <span className="arch-when">{ES.common.seasonWeek(m.season, m.week)}</span>
        </div>
        <div className="arch-side">
          <Shield team={away} size={92} title />
          <strong>{away.nickname}</strong>
          <small>{countryName(away.region)}</small>
        </div>
      </div>
      <button type="button" className="gilt-button" onClick={() => go({ kind: 'contest', id: m.id })}>
        {done ? T.watch : T.preview}
      </button>
    </figure>
  );
}
