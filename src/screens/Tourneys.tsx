import { useState } from 'react';
import type { Match, Team } from '../types';
import { REGIONS, REGION_CAPTIONS } from '../types';
import { sortedStandings } from '../engine';
import { PHASE_NAME, played, useGame } from '../game/context';
import { Shield } from '../art/Heraldry';
import { RealmVignette, RiftCrown } from '../art/Ornament';
import { roman } from '../art/hash';
import { Blank, Choice, FormPips, HouseName } from '../ui/bits';

export const realmName = (i: number) => REGIONS[i].toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export function Tourneys() {
  const { world: w } = useGame();
  const [region, setRegion] = useState(0);
  const [division, setDivision] = useState<0 | 1>(0);
  const standings = sortedStandings(w, region, division);
  const fixtures = w.matches.filter((m) => m.season === w.season && m.week === w.week && m.region === region && m.phase === 'league' && w.teams.find((t) => t.id === m.home)?.division === division);
  const playoffs = w.matches.filter((m) => m.season === w.season && m.region === region && (m.phase === 'regional-semi' || m.phase === 'regional-final'));
  const honours = w.trophies.filter((t) => t.competition === `${REGIONS[region]} CHAMPIONS`).slice().reverse();
  const zone = (i: number) => division === 0 ? (i < 4 ? 'is-playoff' : i === 8 ? 'is-danger' : i === 9 ? 'is-doomed' : '') : (i === 0 ? 'is-rising' : i === 1 ? 'is-playoff-up' : '');

  return (
    <div className="spread tourneys">
      <section className="across">
        <h1 className="folio-title">The Book of Tourneys</h1>
        <p className="folio-sub">Four elemental countries. Forty-eight clubs. One unforgiving road to the World Cup, paved with the teeth of the unsuccessful.</p>
        <GrandRift />
      </section>

      <section className="page verso">
        <h2 className="page-head">The Realm Leagues</h2>
        <div className="realm-tabs" role="tablist" aria-label="Realm">
          {REGIONS.map((r, i) => (
            <button key={r} role="tab" type="button" aria-selected={region === i} className={`realm-tab ${region === i ? 'is-on' : ''}`} onClick={() => setRegion(i)}>
              <RealmVignette realm={i} />
              <span><strong>{realmName(i)}</strong><small>{REGION_CAPTIONS[i]}</small></span>
            </button>
          ))}
        </div>
        <div className="table-controls">
          <Choice label="National league" value={division} onChange={setDivision} options={[{ value: 0, label: 'Twelve clubs' }]} />
          <p className="aside-note">Year {roman(w.season)} · twenty-two rounds, home and away</p>
        </div>
        <div className="table-scroll">
          <table className="ledger standings">
            <thead><tr><th>#</th><th>House</th><th className="num">P</th><th className="num">W</th><th className="num">D</th><th className="num">L</th><th className="num">For</th><th className="num">Agst</th><th className="num">±</th><th className="num">Pts</th><th>Form</th></tr></thead>
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
          {division === 0 ? <>
            <li><i className="zone-mark is-playoff" /> Top four ride to the regional playoffs</li>
            <li><i className="zone-mark is-danger" /> Ninth must defend its place in a playoff</li>
            <li><i className="zone-mark is-doomed" /> Tenth is cast down to the Challenger league</li>
          </> : <>
            <li><i className="zone-mark is-rising" /> First rises to the Premier league</li>
            <li><i className="zone-mark is-playoff-up" /> Second challenges for promotion</li>
          </>}
        </ul>
      </section>

      <section className="page recto">
        <h2 className="page-head">Challenges of the Week</h2>
        <p className="aside-note">{realmName(region)}, {division === 0 ? 'Premier' : 'Challenger'} league, week {w.week}</p>
        <div className="challenges">
          {fixtures.length ? fixtures.map((m) => <ChallengeRow key={m.id} m={m} />) : <Blank>No league contests this week in {realmName(region)}. {w.week > 18 ? 'The playoffs have the stage.' : ''}</Blank>}
        </div>

        <h2 className="page-head small spaced">The Regional Playoffs</h2>
        <p className="aside-note">Weeks 23 and 24 decide the national champion of {realmName(region)}.</p>
        <div className="challenges">
          {playoffs.length ? playoffs.map((m) => <ChallengeRow key={m.id} m={m} showPhase />) : <Blank>The playoff draw is made when the eighteenth round is done.</Blank>}
        </div>

        <h2 className="page-head small spaced">Champions of {realmName(region)}</h2>
        <ol className="honour-roll">
          {honours.slice(0, 8).map((h) => {
            const t = w.teams.find((x) => x.id === h.teamId);
            return <li key={h.season}><span className="yr">Year {roman(h.season)}</span><HouseName team={t} size={24} full /></li>;
          })}
          {!honours.length && <li><Blank>The first champion of this realm has yet to be crowned.</Blank></li>}
        </ol>
      </section>
    </div>
  );
}

export function ChallengeRow({ m, showPhase = false }: { m: Match; showPhase?: boolean }) {
  const { team, go, world, resolveFixture, busy, locked } = useGame();
  const h = team(m.home);
  const a = team(m.away);
  if (!h || !a) return null;
  const done = m.homeScore !== null;
  return (
    <div className={`challenge ${done ? 'is-done' : ''}`}>
      <button type="button" className="challenge-main" onClick={() => go({ kind: 'contest', id: m.id })}>
      <span className={`challenge-side ${m.winner === h.id ? 'is-winner' : ''}`}><Shield team={h} size={30} /><span>{h.nickname}</span></span>
      <span className="challenge-score">{done ? `${m.homeScore} – ${m.awayScore}` : 'v.'}</span>
      <span className={`challenge-side is-away ${m.winner === a.id ? 'is-winner' : ''}`}><span>{a.nickname}</span><Shield team={a} size={30} /></span>
      {showPhase && <span className="challenge-phase">{PHASE_NAME[m.phase]} · week {m.week}</span>}
      </button>
      {!done && m.season === world.season && m.week === world.week && <span className="challenge-actions"><button type="button" className="gilt-button" disabled={busy || locked} onClick={() => go({ kind: 'contest', id: m.id })}>Watch</button><button type="button" className="ink-button" disabled={busy || locked} onClick={() => void resolveFixture(m.id)}>Quick result</button></span>}
    </div>
  );
}

/* ------------------------------------------------------------ The Grand Rift, laid across both pages */

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

  // Before qualification, pencil in the field the engine would draw today: realm leaders plus the best other Premier house of each realm, 1v8, 2v7, 3v6, 4v5.
  const byPts = (a: Team, b: Team) => b.record.pts - a.record.pts || b.record.pf - a.record.pf;
  const leaders = REGIONS.map((_, i) => finals.find((m) => m.region === i)?.winner).map((id, i) => (id ? team(id) : contenders.find((t) => t.region === i))).filter((t): t is Team => !!t);
  const extras: Team[] = [];
  for (const t of contenders.filter((c) => !leaders.some((l) => l.id === c.id)).sort(byPts)) { if (extras.some((e) => e.region === t.region)) continue; extras.push(t); if (extras.length === 4) break; }
  const field = [...leaders, ...extras].sort(byPts);
  const projected = (i: number) => field.length === 8 ? <ProjectedMatch a={field[i]} b={field[7 - i]} /> : <div className="bracket-match is-empty"><span>Awaiting the heralds</span></div>;
  const qfSlot = (i: number) => qf[i] ? <BracketMatch m={qf[i]} /> : projected(i);
  const slot = (m: Match | undefined, label: string) => m ? <BracketMatch m={m} /> : <div className="bracket-match is-empty"><span>{label}</span></div>;

  return (
    <div className="grand-rift">
      <div className="rift-head">
        <h2>The World Cup</h2>
        <p>Four national champions and four wildcards meet in weeks 25 to 27. One house is crowned champion of the world; the rest are crowned with ice packs.</p>
        {!qf.length && <p className="rift-projected-note">Until the realms are settled, the heralds pencil in the field as it stands today.</p>}
      </div>
      <div className="bracket">
        <div className="bracket-col">
          <span className="bracket-round">World Cup groups · week 25</span>
          {qfSlot(0)}
          {qfSlot(3)}
        </div>
        <div className="bracket-col is-semi">
          <span className="bracket-round">Semifinal · week 26</span>
          {slot(sf[0], 'Awaiting the quarterfinals')}
        </div>
        <div className="bracket-heart">
          <RiftCrown size={168} />
          <span className="bracket-round is-final">World Final · week 27</span>
          {slot(final, 'Awaiting the semifinals')}
          <div className="reigning">
            {reigning ? <>
              <span>Reigning champions of the world</span>
              <button type="button" onClick={() => go({ kind: 'house', id: reigning.id })}><Shield team={reigning} size={34} /><strong>{reigning.name}</strong></button>
              <small>crowned in Year {roman(reign!.season)}</small>
            </> : <span>No house has yet worn the crown of the Grand Rift.</span>}
          </div>
        </div>
        <div className="bracket-col is-semi">
          <span className="bracket-round">Semifinal · week 26</span>
          {slot(sf[1], 'Awaiting the quarterfinals')}
        </div>
        <div className="bracket-col">
          <span className="bracket-round">World Cup groups · week 25</span>
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
                {t ? <HouseName team={t} size={22} /> : <span className="is-gone">no house yet</span>}
                <small>{champion ? 'Realm champion, qualified' : 'Leads the Premier league, not yet qualified'}</small>
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
    const rows = new Map<string, { id:string; p:number; d:number }>();
    matches.filter(m => m.group === group).forEach(m => {
      [m.home, m.away].forEach(id => { if (!rows.has(id)) rows.set(id, { id, p:0, d:0 }); });
      if (m.homeScore === null) return;
      const h=rows.get(m.home)!, a=rows.get(m.away)!, hs=m.homeScore, as=m.awayScore ?? 0; h.d+=hs-as; a.d+=as-hs;
      if(m.homeScore>m.awayScore!)h.p+=3; else if(m.homeScore<m.awayScore!)a.p+=3; else {h.p++;a.p++;}
    });
    return [...rows.values()].sort((a,b)=>b.p-a.p||b.d-a.d);
  };
  return <section className="world-groups"><h3>World Cup group standings</h3><div>{[0,1].map(group => <article key={group}><strong>Group {group === 0 ? 'A' : 'B'}</strong><ol>{standings(group).map((r,i) => {const t=team(r.id); return <li key={r.id} className={i < 2 ? 'is-through' : ''}><button type="button" onClick={()=>go({kind:'house',id:r.id})}>{t?.nickname}</button><span>{r.p} pts · {r.d >= 0 ? '+' : ''}{r.d}</span></li>;})}</ol></article>)}</div><p className="aside-note">Top two in each group advance to the World Cup semifinals. Open any fixture above to Watch/Simulate or take a Quick Result.</p></section>;
}

function ProjectedMatch({ a, b }: { a: Team; b: Team }) {
  return (
    <div className="bracket-match is-projected" aria-label={`Projected: ${a.name} against ${b.name}`}>
      {[a, b].map((t) => (
        <span key={t.id} className="bracket-side">
          <Shield team={t} size={26} />
          <span className="bracket-name">{t.nickname}</span>
          <strong>{t.record.pts}</strong>
        </span>
      ))}
      <em className="projected-word">projected · points so far</em>
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
