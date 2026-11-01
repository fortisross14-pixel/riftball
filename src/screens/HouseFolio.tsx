import { lineup, playProfile, teamRoster } from '../engine';
import { played, record, useGame } from '../game/context';
import { RoleGlyph } from '../art/Ornament';
import { AthleteName, Blank, FormPips, HouseName, Miniature } from '../ui/bits';
import { ChallengeRow, realmName } from './Tourneys';
import { ES, awardName, filosofia, raza, rol } from '../i18n/es';
import { MASCOT_LINES, mascotOf, pickLine } from '../i18n/es-cronica';
import { CLUB_TRAIT_ES, ESTILO_ICONO } from '../i18n/es-clubes';
import { ClubBadge, clubColours } from '../ui/ClubBadge';
import { roman } from '../art/hash';

const T = ES.club;

export function HouseFolio({ id }: { id: string }) {
  const { world: w, team, player, go } = useGame();
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
  const meetings = rival ? contests.filter((m) => m.homeScore !== null && (m.home === rival.id || m.away === rival.id)).sort((a, b) => order(b) - order(a)).slice(0, 5) : [];
  const shelf = w.awards.filter((a) => a.teamId === t.id).slice().reverse().slice(0, 12);
  const games = played(t);
  const C = ES.clubPage;
  const id_ = t.identity;
  // Club legends: everyone, active or retired, who wore this shirt in a recorded season or wears it now.
  const legends = w.players.concat(w.retired).filter((p) => p.teamId === t.id || p.history?.some((h) => h.teamId === t.id)).sort((a, b) => b.fame - a.fame).slice(0, 5);
  const timeline = (w.seasonArchive ?? []).map((a) => {
    const table = a.standings.filter((x) => x.region === t.region).sort((x, y) => y.pts - x.pts || (y.pf - y.pa) - (x.pf - x.pa));
    return { season: a.season, pos: table.findIndex((x) => x.teamId === t.id) + 1 };
  }).filter((x) => x.pos > 0).slice(-20);
  const values = [t.power, t.fanbase, t.academy, t.budget];

  return (
    <div className="spread house-folio">
      <section className="page verso">
        <button type="button" className="back-link" onClick={() => history.length > 1 ? history.back() : go({ kind: 'section', section: 'armorial' })}>{ES.common.back}</button>
        <header className="club-header" style={clubColours(t)}>
          <ClubBadge team={t} size={176} title />
          <div className="club-header-text">
            <h1 className="folio-title">{t.name}</h1>
            <p className="house-realm">{T.of(realmName(t.region))}</p>
            <p className="blazon"><span>{T.motto}</span> «{style.lema}»</p>
            {id_ && <p className="club-founded">{C.founded(id_.founded)}</p>}
          </div>
        </header>
        {id_ && (
          <dl className="club-identity">
            <div><dt>{C.stadium}</dt><dd>{id_.stadium.name} · «{id_.stadium.nickname}»</dd></div>
            <div><dt>{C.mascot}</dt><dd>{C.mascotLine(id_.mascot.name, id_.mascot.species, id_.mascot.personality)}</dd></div>
            <div><dt>{C.chant}</dt><dd><q>{id_.chant}</q></dd></div>
            <div className="club-chip"><dt>{C.trait}</dt><dd><span className="chip-icon" aria-hidden="true">{CLUB_TRAIT_ES[id_.trait].icono}</span><b>{CLUB_TRAIT_ES[id_.trait].nombre}</b> — {CLUB_TRAIT_ES[id_.trait].efecto}{id_.trait === 'cursed' && t.finalsLost ? ` (${C.finalsLost(t.finalsLost)})` : ''}</dd></div>
            <div className="club-chip"><dt>{C.style}</dt><dd><span className="chip-icon" aria-hidden="true">{ESTILO_ICONO[t.philosophy.toUpperCase()] ?? '⧗'}</span><b>{style.nombre}</b></dd></div>
            <div className="club-legend"><dd>{id_.legend}</dd></div>
          </dl>
        )}

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

        <h2 className="page-head small spaced">{C.trophies}</h2>
        <p className="honour-line">{T.honourLine(t.worldTitles, t.historyTitles)}</p>
        {honours.length ? (
          <ul className="trophy-shelf" style={clubColours(t)}>
            {honours.slice(0, 16).map((h, i) => {
              const world = h.competition === 'GRAND RIFT CHAMPIONSHIP';
              return <li key={`${h.season}-${i}`} className={world ? 'is-world' : 'is-national'} title={world ? C.worldCup : C.nationalCup(realmName(t.region))}><span className="cup" aria-hidden="true" /><small>{ES.common.season(h.season)}</small><span className="sr-only">{world ? C.worldCup : C.nationalCup(realmName(t.region))}</span></li>;
            })}
          </ul>
        ) : <Blank>{T.emptyCabinet}</Blank>}

        <h2 className="page-head small spaced">{ES.shelf.title}</h2>
        {shelf.length ? (
          <ul className="honours award-shelf">
            {shelf.map((a, i) => <li key={`${a.season}-${a.award}-${i}`}><span className="yr">{ES.common.season(a.season)}</span>{awardName(a.award)} · <AthleteName player={player(a.playerId)} /></li>)}
          </ul>
        ) : <Blank>{ES.shelf.none}</Blank>}

        {rival && (
          <div className="feud">
            <h2 className="page-head small">{T.feud}</h2>
            <p>{T.sworn}<HouseName team={rival} size={26} full />. {T.feudLine(t.nickname, t.rivalHeat, t.rivalRecord.w, t.rivalRecord.d, t.rivalRecord.l)}</p>
          </div>
        )}
        {rival && (
          <>
            <h3 className="h2h-title">{ES.h2h.title}</h3>
            {meetings.length ? meetings.map((m) => <ChallengeRow key={m.id} m={m} showPhase />) : <Blank>{ES.h2h.none}</Blank>}
          </>
        )}
        <p className="mascot-line"><b>{ES.h2h.mascot}:</b> {pickLine(MASCOT_LINES, `${t.id}:${w.season}:${w.week}`)(mascotOf(t.id, t.nickname))}</p>
        <h2 className="page-head small spaced">{C.legends}</h2>
        <p className="aside-note">{C.legendsNote}</p>
        {legends.length ? (
          <ol className="club-legends">
            {legends.map((p, i) => <li key={p.id}><span className="legend-rank">{roman(i + 1)}</span><Miniature player={p} size={44} /><span><AthleteName player={p} /><small>{rol(p.role)} {raza(p.race).toLowerCase()}{p.retired ? `, ${ES.common.retired}` : ''}</small></span><strong>{C.legacy(p.fame)}</strong></li>)}
          </ol>
        ) : <Blank>{C.noLegends}</Blank>}
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

        <h2 className="page-head small spaced">{C.seasons}</h2>
        <p className="aside-note">{C.seasonsNote}</p>
        {timeline.length ? (
          <ol className="club-seasons" style={clubColours(t)}>
            {timeline.map(({ season, pos }) => <li key={season} title={ES.common.season(season)}><i style={{ height: `${Math.max(8, (13 - pos) / 12 * 100)}%` }} className={pos === 1 ? 'is-first' : pos <= 4 ? 'is-top' : ''} /><small>{C.position(pos)}</small><span>{season}</span></li>)}
          </ol>
        ) : <Blank>{C.noSeasons}</Blank>}

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
