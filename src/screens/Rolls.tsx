import { useMemo, useState } from 'react';
import type { Role, SeasonStats, Team } from '../types';
import { REGIONS, ROLES } from '../types';
import { nfmt, useGame } from '../game/context';
import { roman } from '../art/hash';
import { Shield } from '../art/Heraldry';
import { AthleteName, Blank, Choice, HouseName, Miniature, Pick } from '../ui/bits';
import { METRICS } from './AthleteFolio';
import { realmName } from './Tourneys';

type TeamSort = 'diff' | 'pf' | 'pa' | 'win' | 'titles';

export function Rolls() {
  const { world: w, team, player, go } = useGame();
  const [scope, setScope] = useState<'season' | 'career'>('season');
  const [metric, setMetric] = useState<keyof SeasonStats>('breaches');
  const [region, setRegion] = useState(-1);
  const [role, setRole] = useState<Role | 'All'>('All');
  const [retired, setRetired] = useState(false);
  const [teamSort, setTeamSort] = useState<TeamSort>('diff');
  const [archiveSeason, setArchiveSeason] = useState(-1);
  const key = scope === 'season' ? 'stats' : 'career';
  const label = METRICS.find((m) => m.key === metric)!;

  const leaders = useMemo(() => {
    const pool = retired || scope === 'career' ? w.players.concat(w.retired) : w.players;
    return pool
      .filter((p) => (region < 0 || team(p.teamId)?.region === region) && (role === 'All' || p.role === role))
      .sort((a, b) => (b[key][metric] ?? 0) - (a[key][metric] ?? 0) || b.rating - a.rating)
      .slice(0, 30);
  }, [w, retired, scope, region, role, metric, key, team]);

  const houses = useMemo(() => {
    const value = (t: Team) => {
      const r = t.record;
      return teamSort === 'pf' ? r.pf : teamSort === 'pa' ? -r.pa : teamSort === 'diff' ? r.pf - r.pa : teamSort === 'titles' ? t.worldTitles * 1000 + t.historyTitles : r.w / (r.w + r.d + r.l || 1);
    };
    return w.teams.filter((t) => region < 0 || t.region === region).sort((a, b) => value(b) - value(a)).slice(0, 24);
  }, [w, region, teamSort]);

  const awards = w.awards.filter((a) => scope === 'career' || a.season === w.season || a.season === w.season - 1).slice().reverse().slice(0, 24);
  const archive = (w.seasonArchive ?? []).find((a) => a.season === archiveSeason);
  const archives = [...(w.seasonArchive ?? [])].reverse();

  return (
    <div className="spread rolls">
      <section className="across">
        <h1 className="folio-title">The Rolls of the Realm</h1>
        <p className="folio-sub">Every number here was earned on the field. Unlike the referees, the numbers never lie.</p>
        <div className="roll-controls">
          <Choice label="Reckoning" value={scope} onChange={setScope} options={[{ value: 'season', label: 'This season' }, { value: 'career', label: 'Whole careers' }]} />
          <Pick label="Deed" value={metric} onChange={setMetric} options={METRICS.map((m) => ({ value: m.key, label: m.label }))} />
          <Pick label="Realm" value={region} onChange={setRegion} options={[{ value: -1, label: 'All realms' }, ...REGIONS.map((_, i) => ({ value: i, label: realmName(i) }))]} />
          <Pick label="Position" value={role} onChange={setRole} options={[{ value: 'All', label: 'Every position' }, ...ROLES.map((r) => ({ value: r, label: r }))]} />
          {scope === 'season' && (
            <label className="check">
              <input type="checkbox" checked={retired} onChange={(e) => setRetired(e.target.checked)} />
              <span>Include the retired</span>
            </label>
          )}
        </div>
      </section>

      <section className="page verso">
        <h2 className="page-head">Athletes by {label.label.toLowerCase()}</h2>
        <div className="table-scroll">
          <table className="ledger leaders">
            <thead><tr><th>#</th><th>Athlete</th><th>House</th><th className="num">GP</th><th className="num">{label.short}</th><th className="num">Per game</th></tr></thead>
            <tbody>
              {leaders.map((p, i) => (
                <tr key={p.id} className="is-link" onClick={() => go({ kind: 'athlete', id: p.id })}>
                  <td className="rank">{i + 1}</td>
                  <td><span className="ledger-person"><Miniature player={p} size={34} /><span><AthleteName player={p} /><small>{p.race} {p.role.toLowerCase()}{p.retired ? ', retired' : ''}</small></span></span></td>
                  <td>{team(p.teamId)?.nickname ?? '—'}</td>
                  <td className="num">{p[key].games}</td>
                  <td className="num strong">{nfmt(p[key][metric] ?? 0)}</td>
                  <td className="num">{p[key].games ? ((p[key][metric] ?? 0) / p[key].games).toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!leaders.length && <Blank>No athlete fits these filters.</Blank>}
      </section>

      <section className="page recto">
        <h2 className="page-head">The Houses Ranked</h2>
        <Choice label="Rank by" compact value={teamSort} onChange={setTeamSort} options={[{ value: 'diff', label: 'Margin' }, { value: 'pf', label: 'Attack' }, { value: 'pa', label: 'Defence' }, { value: 'win', label: 'Win rate' }, { value: 'titles', label: 'Crowns' }]} />
        <div className="table-scroll">
          <table className="ledger">
            <thead><tr><th>#</th><th>House</th><th className="num">W–D–L</th><th className="num">For</th><th className="num">Agst</th><th className="num">±</th><th className="num">Crowns</th></tr></thead>
            <tbody>
              {houses.map((t, i) => (
                <tr key={t.id} className="is-link" onClick={() => go({ kind: 'house', id: t.id })}>
                  <td className="rank">{i + 1}</td>
                  <td><span className="ledger-person"><Shield team={t} size={24} /><strong>{t.nickname}</strong></span></td>
                  <td className="num">{t.record.w}–{t.record.d}–{t.record.l}</td>
                  <td className="num">{t.record.pf}</td>
                  <td className="num">{t.record.pa}</td>
                  <td className="num strong">{t.record.pf - t.record.pa > 0 ? '+' : ''}{t.record.pf - t.record.pa}</td>
                  <td className="num">{t.worldTitles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page verso">
        <h2 className="page-head">Honours of the Feast</h2>
        <p className="aside-note">{scope === 'career' ? 'Every award ever given.' : 'Awards from this year and the last.'} Given in week 24 of each year.</p>
        <ul className="award-list">
          {awards.map((a, i) => {
            const p = player(a.playerId);
            return (
              <li key={`${a.season}-${a.award}-${i}`}>
                <span className="yr">Year {roman(a.season)}</span>
                <span className="award-name">{a.award}</span>
                <AthleteName player={p} />
              </li>
            );
          })}
          {!awards.length && <li><Blank>No honours yet. The feast is held in week 24.</Blank></li>}
        </ul>
      </section>

      <section className="page recto">
        <h2 className="page-head">The Era Archive</h2>
        <p className="aside-note">Up to forty finished years are kept: their finest scorers and Premier houses.</p>
        <Pick label="Year" value={archiveSeason} onChange={setArchiveSeason} options={[{ value: -1, label: archives.length ? 'Choose a finished year' : 'No finished years yet' }, ...archives.map((a) => ({ value: a.season, label: `Year ${roman(a.season)} (${a.season})` }))]} />
        {archive ? (
          <div className="archive-pair">
            <div>
              <h3>Breach scorers</h3>
              <ol>
                {archive.leaders.slice(0, 10).map((l) => <li key={l.playerId}><AthleteName player={player(l.playerId)} /><b>{l.breaches}</b></li>)}
              </ol>
            </div>
            <div>
              <h3>Premier houses</h3>
              <ol>
                {archive.standings.filter((s) => s.division === 0).sort((a, b) => b.pts - a.pts || (b.pf - b.pa) - (a.pf - a.pa)).slice(0, 10).map((s) => <li key={s.teamId}><HouseName team={team(s.teamId)} size={20} /><b>{s.pts}</b></li>)}
              </ol>
            </div>
          </div>
        ) : <Blank>Choose a finished year to compare its greatest athletes and houses.</Blank>}
        <p className="footnote">Passes count completed throws; metres count successful carries; most valuable honours are annual. Older contests keep only the highlights they were first written with.</p>
      </section>
    </div>
  );
}
