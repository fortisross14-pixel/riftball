import { lineup, playProfile, teamRoster } from '../engine';
import { played, record, useGame } from '../game/context';
import { Achievement } from '../art/Heraldry';
import { RoleGlyph } from '../art/Ornament';
import { AthleteName, Blank, FormPips, HouseName, Miniature } from '../ui/bits';
import { ChallengeRow, realmName } from './Tourneys';
import { ES, filosofia, raza, rol } from '../i18n/es';

const T = ES.club;

export function HouseFolio({ id }: { id: string }) {
  const { world: w, team, go } = useGame();
  const t = team(id);
  if (!t) {
    return <div className="spread"><section className="page verso"><h1 className="folio-title">{ES.common.tornPage}</h1><Blank>{T.missing}</Blank></section><section className="page recto" /></div>;
  }
  const profile = playProfile(t.philosophy);
  const style = filosofia(t.philosophy);
  const starters = lineup(w, t);
  const roster = teamRoster(w, t).sort((a, b) => b.rating - a.rating);
  const rival = t.rival ? team(t.rival) : undefined;
  const contests = w.matches.filter((m) => m.home === t.id || m.away === t.id);
  const order = (m: { season: number; week: number }) => m.season * 100 + m.week;
  const recentPlayed = contests.filter((m) => m.homeScore !== null).sort((a, b) => order(b) - order(a)).slice(0, 6);
  const next = contests.filter((m) => m.homeScore === null && m.season === w.season).sort((a, b) => a.week - b.week)[0];
  const honours = w.trophies.filter((x) => x.teamId === t.id).slice().reverse();
  const games = played(t);
  const values = [t.power, t.fanbase, t.academy, t.budget];

  return (
    <div className="spread house-folio">
      <section className="page verso">
        <button type="button" className="back-link" onClick={() => history.length > 1 ? history.back() : go({ kind: 'section', section: 'armorial' })}>{ES.common.back}</button>
        <div className="house-hero">
          <Achievement team={t} size={250} />
          <div>
            <h1 className="folio-title">{t.name}</h1>
            <p className="house-realm">{T.of(realmName(t.region))}</p>
            <p className="blazon"><span>{T.motto}</span> «{style.lema}»</p>
          </div>
        </div>

        <div className="philosophy">
          <h3>{T.style} <strong>{style.nombre}</strong></h3>
          <p>{profile.summary}</p>
          <dl>
            <div><dt>{T.bars.pass}</dt><dd><i style={{ width: `${profile.pass * 100}%` }} /></dd></div>
            <div><dt>{T.bars.aggression}</dt><dd><i style={{ width: `${profile.aggression * 100}%` }} /></dd></div>
            <div><dt>{T.bars.tempo}</dt><dd><i style={{ width: `${profile.tempo * 100}%` }} /></dd></div>
            <div><dt>{T.bars.gate}</dt><dd><i style={{ width: `${profile.gate * 100}%` }} /></dd></div>
          </dl>
        </div>

        <dl className="facts house-virtues">
          {T.virtues.map(([name, note], i) => (
            <div key={name}><dt>{name} <small>{note}</small></dt><dd>{values[i]}</dd></div>
          ))}
        </dl>

        <h2 className="page-head small spaced">{T.honours}</h2>
        <p className="honour-line">{T.honourLine(t.worldTitles, t.historyTitles)}</p>
        <ul className="honours">
          {honours.slice(0, 8).map((h, i) => <li key={`${h.season}-${i}`}><span className="yr">{ES.common.season(h.season)}</span>{h.competition === 'GRAND RIFT CHAMPIONSHIP' ? T.worldChamps : T.nationalChamps(realmName(t.region))}</li>)}
          {!honours.length && <li><Blank>{T.emptyCabinet}</Blank></li>}
        </ul>

        {rival && (
          <div className="feud">
            <h2 className="page-head small">{T.feud}</h2>
            <p>{T.sworn}<HouseName team={rival} size={26} full />. {T.feudLine(t.nickname, t.rivalHeat, t.rivalRecord.w, t.rivalRecord.d, t.rivalRecord.l)}</p>
          </div>
        )}
        {next && <><h2 className="page-head small spaced">{T.next}</h2><ChallengeRow m={next} showPhase /></>}
        <h2 className="page-head small spaced">{T.recent}</h2>
        {recentPlayed.length ? recentPlayed.map((m) => <ChallengeRow key={m.id} m={m} showPhase />) : <Blank>{T.noGames}</Blank>}
      </section>

      <section className="page recto">
        <h2 className="page-head">{T.eight}</h2>
        <p className="aside-note">{T.eightNote(w.season)}</p>
        <ul className="eight">
          {starters.map((p) => (
            <li key={p.id}>
              <Miniature player={p} size={64} />
              <span><AthleteName player={p} /><small><RoleGlyph role={p.role} size={16} />{rol(p.role)} {raza(p.race).toLowerCase()}</small></span>
              <strong>{p.rating}</strong>
            </li>
          ))}
        </ul>

        <h2 className="page-head small spaced">{T.thisSeason}</h2>
        <dl className="season-figures">
          <div><dt>{T.figures.record}</dt><dd>{record(t)}</dd></div>
          <div><dt>{T.figures.pts}</dt><dd>{t.record.pts}</dd></div>
          <div><dt>{T.figures.pf}</dt><dd>{t.record.pf}</dd></div>
          <div><dt>{T.figures.pa}</dt><dd>{t.record.pa}</dd></div>
          <div><dt>{T.figures.won}</dt><dd>{games ? Math.round((t.record.w / games) * 100) : 0}%</dd></div>
          <div><dt>{T.figures.form}</dt><dd><FormPips team={t} /></dd></div>
        </dl>

        <h2 className="page-head small spaced">{T.roster}</h2>
        <div className="table-scroll">
          <table className="ledger">
            <thead><tr><th>{T.th.athlete}</th><th>{T.th.people}</th><th>{T.th.role}</th><th className="num">{T.th.age}</th><th className="num">{T.th.rating}</th><th>{T.th.state}</th></tr></thead>
            <tbody>
              {roster.map((p) => (
                <tr key={p.id} className="is-link" onClick={() => go({ kind: 'athlete', id: p.id })}>
                  <td><AthleteName player={p} /></td><td>{raza(p.race)}</td><td>{rol(p.role)}</td><td className="num">{p.age}</td><td className="num strong">{p.rating}</td>
                  <td>{p.injury > 0 ? <span className="injured">{ES.common.injuredWeeks(p.injury)}</span> : <span className="fit">{ES.common.fit}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="aside-note">{T.rosterNote(realmName(t.region), roster.length)}</p>
      </section>
    </div>
  );
}
