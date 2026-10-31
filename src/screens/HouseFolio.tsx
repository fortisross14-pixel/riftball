import { lineup, playProfile, teamRoster } from '../engine';
import { REGIONS } from '../types';
import { played, record, useGame } from '../game/context';
import { Achievement, armsOf } from '../art/Heraldry';
import { RoleGlyph } from '../art/Ornament';
import { roman } from '../art/hash';
import { AthleteName, Blank, FormPips, HouseName, Miniature } from '../ui/bits';
import { ChallengeRow, realmName } from './Tourneys';

export function HouseFolio({ id }: { id: string }) {
  const { world: w, team, go } = useGame();
  const t = team(id);
  if (!t) {
    return <div className="spread"><section className="page verso"><h1 className="folio-title">A torn page</h1><Blank>No house by this mark is recorded.</Blank></section><section className="page recto" /></div>;
  }
  const arms = armsOf(t);
  const profile = playProfile(t.philosophy);
  const starters = lineup(w, t);
  const roster = teamRoster(w, t).sort((a, b) => b.rating - a.rating);
  const rival = t.rival ? team(t.rival) : undefined;
  const contests = w.matches.filter((m) => m.home === t.id || m.away === t.id);
  const order = (m: { season: number; week: number }) => m.season * 100 + m.week;
  const recentPlayed = contests.filter((m) => m.homeScore !== null).sort((a, b) => order(b) - order(a)).slice(0, 6);
  const next = contests.filter((m) => m.homeScore === null && m.season === w.season).sort((a, b) => a.week - b.week)[0];
  const honours = w.trophies.filter((x) => x.teamId === t.id).slice().reverse();
  const games = played(t);
  const virtues: [string, number, string][] = [
    ['Might', t.power, 'club power on the field'],
    ['Following', t.fanbase, 'size of the faithful'],
    ['Academy', t.academy, 'quality of young prospects'],
    ['Coffers', t.budget, 'gold for signing athletes'],
  ];

  return (
    <div className="spread house-folio">
      <section className="page verso">
        <button type="button" className="back-link" onClick={() => history.length > 1 ? history.back() : go({ kind: 'section', section: 'armorial' })}>Return</button>
        <div className="house-hero">
          <Achievement team={t} size={250} />
          <div>
            <h1 className="folio-title">{t.name}</h1>
            <p className="house-realm">of {realmName(t.region)}, in the {t.division === 0 ? 'Premier' : 'Challenger'} league</p>
            <p className="blazon"><span>Blazon:</span> {arms.blazon}</p>
          </div>
        </div>

        <div className="philosophy">
          <h3>Plays the <strong>{t.philosophy.toLowerCase()}</strong> way</h3>
          <p>{profile.summary}</p>
          <dl>
            <div><dt>Passing</dt><dd><i style={{ width: `${profile.pass * 100}%` }} /></dd></div>
            <div><dt>Aggression</dt><dd><i style={{ width: `${profile.aggression * 100}%` }} /></dd></div>
            <div><dt>Tempo</dt><dd><i style={{ width: `${profile.tempo * 100}%` }} /></dd></div>
            <div><dt>Gate shots</dt><dd><i style={{ width: `${profile.gate * 100}%` }} /></dd></div>
          </dl>
        </div>

        <dl className="facts house-virtues">
          {virtues.map(([name, v, note]) => (
            <div key={name}><dt>{name} <small>{note}</small></dt><dd>{v}</dd></div>
          ))}
        </dl>

        <h2 className="page-head small spaced">Honours</h2>
        <p className="honour-line"><b>{t.worldTitles}</b> Grand Rift {t.worldTitles === 1 ? 'crown' : 'crowns'} · <b>{t.historyTitles}</b> realm {t.historyTitles === 1 ? 'title' : 'titles'}</p>
        <ul className="honours">
          {honours.slice(0, 8).map((h, i) => <li key={`${h.season}-${i}`}><span className="yr">Year {roman(h.season)}</span>{h.competition === 'GRAND RIFT CHAMPIONSHIP' ? 'Champions of the Grand Rift' : `Champions of ${realmName(t.region)}`}</li>)}
          {!honours.length && <li><Blank>The trophy cabinet echoes. It has excellent acoustics.</Blank></li>}
        </ul>

        {rival && (
          <div className="feud">
            <h2 className="page-head small">The Ancient Feud</h2>
            <p>Sworn rivals of <HouseName team={rival} size={26} full />. Heat {t.rivalHeat}; in their meetings {t.nickname} have won {t.rivalRecord.w}, drawn {t.rivalRecord.d} and lost {t.rivalRecord.l}.</p>
          </div>
        )}
        {next && <><h2 className="page-head small spaced">Next Contest</h2><ChallengeRow m={next} showPhase /></>}
        <h2 className="page-head small spaced">Recent Contests</h2>
        {recentPlayed.length ? recentPlayed.map((m) => <ChallengeRow key={m.id} m={m} showPhase />) : <Blank>No contests yet this age.</Blank>}

      </section>

      <section className="page recto">
        <h2 className="page-head">The Starting Eight</h2>
        <p className="aside-note">Chosen by fitness and position for Year {roman(w.season)}.</p>
        <ul className="eight">
          {starters.map((p) => (
            <li key={p.id}>
              <Miniature player={p} size={64} />
              <span><AthleteName player={p} /><small><RoleGlyph role={p.role} size={16} />{p.race} {p.role.toLowerCase()}</small></span>
              <strong>{p.rating}</strong>
            </li>
          ))}
        </ul>

        <h2 className="page-head small spaced">This Season</h2>
        <dl className="season-figures">
          <div><dt>Record</dt><dd>{record(t)}</dd></div>
          <div><dt>Points</dt><dd>{t.record.pts}</dd></div>
          <div><dt>Scored</dt><dd>{t.record.pf}</dd></div>
          <div><dt>Conceded</dt><dd>{t.record.pa}</dd></div>
          <div><dt>Won</dt><dd>{games ? Math.round((t.record.w / games) * 100) : 0}%</dd></div>
          <div><dt>Form</dt><dd><FormPips team={t} /></dd></div>
        </dl>

        <h2 className="page-head small spaced">The Full Roll</h2>
        <div className="table-scroll">
          <table className="ledger">
            <thead><tr><th>Athlete</th><th>People</th><th>Position</th><th className="num">Age</th><th className="num">Rating</th><th>State</th></tr></thead>
            <tbody>
              {roster.map((p) => (
                <tr key={p.id} className="is-link" onClick={() => go({ kind: 'athlete', id: p.id })}>
                  <td><AthleteName player={p} /></td><td>{p.race}</td><td>{p.role}</td><td className="num">{p.age}</td><td className="num strong">{p.rating}</td>
                  <td>{p.injury > 0 ? <span className="injured">abed {p.injury} wk</span> : <span className="fit">fit</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="aside-note">{REGIONS[t.region].toLowerCase()} · {roster.length} athletes on the roll</p>
      </section>
    </div>
  );
}
