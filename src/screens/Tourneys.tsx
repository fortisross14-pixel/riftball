import { memo, useState } from 'react';
import type { Match, Team } from '../types';
import { REGIONS } from '../types';
import { sortedStandings } from '../engine';
import { PHASE_NAME, played, useGame } from '../game/context';
import { Shield } from '../art/Heraldry';
import { RealmVignette, RiftCrown } from '../art/Ornament';
import { Blank, FormPips, HouseName } from '../ui/bits';
import { ES, PAIS_LEMA, countryName } from '../i18n/es';

/** A country's name, for any screen that lists them. */
export const realmName = (i: number) => countryName(i);
const T = ES.tourneys;

export function Tourneys() {
  const { world: w, go } = useGame();
  const [region, setRegion] = useState(0);
  const standings = sortedStandings(w, region, 0);
  const fixtures = w.matches.filter((m) => m.season === w.season && m.week === w.week && m.region === region && m.phase === 'league');
  const playoffs = w.matches.filter((m) => m.season === w.season && m.region === region && (m.phase === 'regional-semi' || m.phase === 'regional-final'));
  const honours = w.trophies.filter((t) => t.competition === `${REGIONS[region]} CHAMPIONS`).slice().reverse();
  const zone = (i: number) => (i < 4 ? 'is-playoff' : '');
  const name = realmName(region);

  return (
    <div className="spread tourneys">
      <section className="across">
        <h1 className="folio-title">{T.title}</h1>
        <p className="folio-sub">{T.sub}</p>
        <GrandRift />
      </section>

      <section className="page verso">
        <h2 className="page-head">{T.leagues}</h2>
        <div className="realm-tabs" role="tablist" aria-label={T.countryTabs}>
          {REGIONS.map((r, i) => (
            <button key={r} role="tab" type="button" aria-selected={region === i} className={`realm-tab ${region === i ? 'is-on' : ''}`} onClick={() => setRegion(i)}>
              <RealmVignette realm={i} />
              <span><strong>{realmName(i)}</strong><small>{PAIS_LEMA[i]}</small></span>
            </button>
          ))}
        </div>
        <p className="aside-note">{T.leagueNote(w.season)}</p>
        <div className="table-scroll">
          <table className="ledger standings">
            <thead><tr><th>{T.th.rank}</th><th>{T.th.club}</th><th className="num">{T.th.p}</th><th className="num">{T.th.w}</th><th className="num">{T.th.d}</th><th className="num">{T.th.l}</th><th className="num">{T.th.pf}</th><th className="num">{T.th.pa}</th><th className="num">{T.th.diff}</th><th className="num">{T.th.pts}</th><th>{T.th.form}</th></tr></thead>
            <tbody>
              {standings.map((t, i) => (
                <tr key={t.id} className={zone(i)}>
                  <td className="rank"><span className="zone-mark" />{i + 1}</td>
                  <td><HouseName team={t} size={26} /></td>
                  <td className="num">{played(t)}</td>
                  <td className="num">{t.record.w}</td>
                  <td className="num">{t.record.d}</td>
                  <td className="num">{t.record.l}</td>
                  <td className="num">{t.record.pf}</td>
                  <td className="num">{t.record.pa}</td>
                  <td className="num">{t.record.pf - t.record.pa > 0 ? '+' : ''}{t.record.pf - t.record.pa}</td>
                  <td className="num strong">{t.record.pts}</td>
                  <td><FormPips team={t} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="table-key">
          <li><i className="zone-mark is-playoff" /> {T.keyPlayoff}</li>
        </ul>
      </section>

      <section className="page recto">
        <h2 className="page-head">{T.weekGames}</h2>
        <p className="aside-note">{T.weekGamesNote(name, w.week)}</p>
        <div className="challenges">
          {fixtures.length ? fixtures.map((m) => <ChallengeRow key={m.id} m={m} />) : <Blank>{T.noLeagueGames(name, w.week > 22)}</Blank>}
        </div>
        <button type="button" className="ink-button spaced-button" onClick={() => go({ kind: 'section', section: 'lists' })}>{T.allMatches}</button>

        <h2 className="page-head small spaced">{T.playoffs}</h2>
        <p className="aside-note">{T.playoffsNote(name)}</p>
        <div className="challenges">
          {playoffs.length ? playoffs.map((m) => <ChallengeRow key={m.id} m={m} showPhase />) : <Blank>{T.noPlayoffs}</Blank>}
        </div>

        <h2 className="page-head small spaced">{T.champions(name)}</h2>
        <ol className="honour-roll">
          {honours.slice(0, 8).map((h) => {
            const t = w.teams.find((x) => x.id === h.teamId);
            return <li key={h.season}><span className="yr">{ES.common.season(h.season)}</span><HouseName team={t} size={24} full /></li>;
          })}
          {!honours.length && <li><Blank>{T.noChampions}</Blank></li>}
        </ol>
      </section>
    </div>
  );
}

export const ChallengeRow = memo(function ChallengeRow({ m, showPhase = false }: { m: Match; showPhase?: boolean }) {
  const { team, go, world, resolveFixture, busy, locked } = useGame();
  const h = team(m.home);
  const a = team(m.away);
  if (!h || !a) return null;
  const done = m.homeScore !== null;
  return (
    <div className={`challenge ${done ? 'is-done' : ''}`}>
      <button type="button" className="challenge-main" onClick={() => go({ kind: 'contest', id: m.id })}>
      <span className={`challenge-side ${m.winner === h.id ? 'is-winner' : ''}`}><Shield team={h} size={30} /><span>{h.nickname}</span></span>
      <span className="challenge-score">{done ? `${m.homeScore} – ${m.awayScore}` : ES.common.vs}</span>
      <span className={`challenge-side is-away ${m.winner === a.id ? 'is-winner' : ''}`}><span>{a.nickname}</span><Shield team={a} size={30} /></span>
      {showPhase && <span className="challenge-phase">{PHASE_NAME[m.phase]} · {ES.common.week(m.week)}</span>}
      </button>
      {!done && m.season === world.season && m.week === world.week && <span className="challenge-actions"><button type="button" className="gilt-button" disabled={busy || locked} onClick={() => go({ kind: 'contest', id: m.id })}>{T.watch}</button><button type="button" className="ink-button" disabled={busy || locked} onClick={() => void resolveFixture(m.id)}>{T.quick}</button></span>}
    </div>
  );
});

/* ------------------------------------------------------------ The World Cup, laid across both pages */

function GrandRift() {
  const { world: w, team, go } = useGame();
  const stage = (p: Match['phase']) => w.matches.filter((m) => m.season === w.season && m.phase === p);
  const qf = stage('world-group');
  const sf = stage('world-semi');
  const final = stage('grand-final')[0];
  const reign = w.trophies.filter((t) => t.competition === 'GRAND RIFT CHAMPIONSHIP').at(-1);
  const reigning = reign ? team(reign.teamId) : undefined;
  const finals = stage('regional-final');
  const contenders = w.teams.filter((t) => t.division === 0).sort((a, b) => b.record.pts - a.record.pts || (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa));

  // Before qualification, pencil in the field the engine would draw today: country leaders plus the best other club of each country.
  const byPts = (a: Team, b: Team) => b.record.pts - a.record.pts || b.record.pf - a.record.pf;
  const leaders = REGIONS.map((_, i) => finals.find((m) => m.region === i)?.winner).map((id, i) => (id ? team(id) : contenders.find((t) => t.region === i))).filter((t): t is Team => !!t);
  const extras: Team[] = [];
  for (const t of contenders.filter((c) => !leaders.some((l) => l.id === c.id)).sort(byPts)) { if (extras.some((e) => e.region === t.region)) continue; extras.push(t); if (extras.length === 4) break; }
  const field = [...leaders, ...extras].sort(byPts);
  const projected = (i: number) => field.length === 8 ? <ProjectedMatch a={field[i]} b={field[7 - i]} /> : <div className="bracket-match is-empty"><span>{T.awaitingHeralds}</span></div>;
  const qfSlot = (i: number) => qf[i] ? <BracketMatch m={qf[i]} /> : projected(i);
  const slot = (m: Match | undefined, label: string) => m ? <BracketMatch m={m} /> : <div className="bracket-match is-empty"><span>{label}</span></div>;

  return (
    <div className="grand-rift">
      <div className="rift-head">
        <h2>{T.worldCup}</h2>
        <p>{T.worldCupNote}</p>
        {!qf.length && <p className="rift-projected-note">{T.projectedNote}</p>}
      </div>
      <div className="bracket">
        <div className="bracket-col">
          <span className="bracket-round">{T.groupsRound}</span>
          {qfSlot(0)}
          {qfSlot(3)}
        </div>
        <div className="bracket-col is-semi">
          <span className="bracket-round">{T.semiRound}</span>
          {slot(sf[0], T.awaitingGroups)}
        </div>
        <div className="bracket-heart">
          <RiftCrown size={168} />
          <span className="bracket-round is-final">{T.finalRound}</span>
          {slot(final, T.awaitingSemis)}
          <div className="reigning">
            {reigning ? <>
              <span>{T.reigning}</span>
              <button type="button" onClick={() => go({ kind: 'house', id: reigning.id })}><Shield team={reigning} size={34} /><strong>{reigning.name}</strong></button>
              <small>{T.crowned(reign!.season)}</small>
            </> : <span>{T.noReigning}</span>}
          </div>
        </div>
        <div className="bracket-col is-semi">
          <span className="bracket-round">{T.semiRound}</span>
          {slot(sf[1], T.awaitingGroups)}
        </div>
        <div className="bracket-col">
          <span className="bracket-round">{T.groupsRound}</span>
          {qfSlot(1)}
          {qfSlot(2)}
        </div>
      </div>
      <div className="rift-realms">
        {REGIONS.map((r, i) => {
          const champion = finals.find((m) => m.region === i)?.winner;
          const leader = contenders.find((t) => t.region === i);
          const t: Team | undefined = champion ? team(champion) : leader;
          return (
            <div key={r} className="rift-realm">
              <RealmVignette realm={i} />
              <div>
                <strong>{realmName(i)}</strong>
                {t ? <HouseName team={t} size={22} /> : <span className="is-gone">{T.noClub}</span>}
                <small>{champion ? T.qualified : T.leading}</small>
              </div>
            </div>
          );
        })}
      </div>
      <WorldCupGroups matches={qf} />
    </div>
  );
}

function WorldCupGroups({ matches }: { matches: Match[] }) {
  const { team, go } = useGame();
  if (!matches.length) return null;
  const standings = (group: number) => {
    const rows = new Map<string, { id: string; p: number; d: number }>();
    matches.filter((m) => m.group === group).forEach((m) => {
      [m.home, m.away].forEach((id) => { if (!rows.has(id)) rows.set(id, { id, p: 0, d: 0 }); });
      if (m.homeScore === null) return;
      const h = rows.get(m.home)!, a = rows.get(m.away)!, hs = m.homeScore, as = m.awayScore ?? 0; h.d += hs - as; a.d += as - hs;
      if (m.homeScore > m.awayScore!) h.p += 3; else if (m.homeScore < m.awayScore!) a.p += 3; else { h.p++; a.p++; }
    });
    return [...rows.values()].sort((a, b) => b.p - a.p || b.d - a.d);
  };
  return (
    <section className="world-groups">
      <h3>{T.groupStandings}</h3>
      <div>{[0, 1].map((group) => (
        <article key={group}>
          <strong>{T.group(group)}</strong>
          <ol>{standings(group).map((r, i) => { const t = team(r.id); return <li key={r.id} className={i < 2 ? 'is-through' : ''}><button type="button" onClick={() => go({ kind: 'house', id: r.id })}>{t?.nickname}</button><span>{r.p} {ES.common.pts} · {r.d >= 0 ? '+' : ''}{r.d}</span></li>; })}</ol>
        </article>
      ))}</div>
      <p className="aside-note">{T.groupNote}</p>
    </section>
  );
}

function ProjectedMatch({ a, b }: { a: Team; b: Team }) {
  return (
    <div className="bracket-match is-projected" aria-label={T.projectedLabel(a.name, b.name)}>
      {[a, b].map((t) => (
        <span key={t.id} className="bracket-side">
          <Shield team={t} size={26} />
          <span className="bracket-name">{t.nickname}</span>
          <strong>{t.record.pts}</strong>
        </span>
      ))}
      <em className="projected-word">{T.projected}</em>
    </div>
  );
}

function BracketMatch({ m }: { m: Match }) {
  const { team, go } = useGame();
  const sides = [m.home, m.away].map((id) => team(id));
  const scores = [m.homeScore, m.awayScore];
  return (
    <button type="button" className={`bracket-match ${m.homeScore !== null ? 'is-done' : ''}`} onClick={() => go({ kind: 'contest', id: m.id })}>
      {sides.map((t, i) => t && (
        <span key={t.id} className={`bracket-side ${m.winner === t.id ? 'is-winner' : m.winner ? 'is-loser' : ''}`}>
          <Shield team={t} size={26} />
          <span className="bracket-name">{t.nickname}</span>
          <strong>{scores[i] ?? '–'}</strong>
        </span>
      ))}
    </button>
  );
}
