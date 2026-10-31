import { useMemo, useState } from 'react';
import type { Role, SeasonStats, Team } from '../types';
import { REGIONS, ROLES } from '../types';
import { nfmt, useGame } from '../game/context';
import { Shield } from '../art/Heraldry';
import { AthleteName, Blank, Choice, HouseName, Miniature, Pick } from '../ui/bits';
import { METRICS } from './AthleteFolio';
import { realmName } from './Tourneys';
import { ES, awardName, raza, rol } from '../i18n/es';

type TeamSort = 'diff' | 'pf' | 'pa' | 'win' | 'titles';
const T = ES.stats;

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
        <h1 className="folio-title">{T.title}</h1>
        <p className="folio-sub">{T.sub}</p>
        <div className="roll-controls">
          <Choice label={T.scope} value={scope} onChange={setScope} options={[{ value: 'season', label: T.thisSeason }, { value: 'career', label: T.careers }]} />
          <Pick label={T.metric} value={metric} onChange={setMetric} options={METRICS.map((m) => ({ value: m.key, label: m.label }))} />
          <Pick label={ES.common.country} value={region} onChange={setRegion} options={[{ value: -1, label: ES.common.allCountries }, ...REGIONS.map((_, i) => ({ value: i, label: realmName(i) }))]} />
          <Pick label={ES.common.position} value={role} onChange={setRole} options={[{ value: 'All', label: ES.common.allRoles }, ...ROLES.map((r) => ({ value: r, label: rol(r) }))]} />
          {scope === 'season' && (
            <label className="check">
              <input type="checkbox" checked={retired} onChange={(e) => setRetired(e.target.checked)} />
              <span>{T.withRetired}</span>
            </label>
          )}
        </div>
      </section>

      <section className="page verso">
        <h2 className="page-head">{T.athletesBy(label.label)}</h2>
        <div className="table-scroll">
          <table className="ledger leaders">
            <thead><tr><th>{T.th.rank}</th><th>{T.th.athlete}</th><th>{T.th.club}</th><th className="num">{T.th.gp}</th><th className="num">{label.short}</th><th className="num">{T.th.perGame}</th></tr></thead>
            <tbody>
              {leaders.map((p, i) => (
                <tr key={p.id} className="is-link" onClick={() => go({ kind: 'athlete', id: p.id })}>
                  <td className="rank">{i + 1}</td>
                  <td><span className="ledger-person"><Miniature player={p} size={34} /><span><AthleteName player={p} /><small>{rol(p.role)} {raza(p.race).toLowerCase()}{p.retired ? `, ${ES.common.retired}` : ''}</small></span></span></td>
                  <td>{team(p.teamId)?.nickname ?? '—'}</td>
                  <td className="num">{p[key].games}</td>
                  <td className="num strong">{nfmt(p[key][metric] ?? 0)}</td>
                  <td className="num">{p[key].games ? ((p[key][metric] ?? 0) / p[key].games).toFixed(2).replace('.', ',') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!leaders.length && <Blank>{T.none}</Blank>}
      </section>

      <section className="page recto">
        <h2 className="page-head">{T.clubsRanked}</h2>
        <Choice label={T.rankBy} compact value={teamSort} onChange={setTeamSort} options={[{ value: 'diff', label: T.teamSort.diff }, { value: 'pf', label: T.teamSort.pf }, { value: 'pa', label: T.teamSort.pa }, { value: 'win', label: T.teamSort.win }, { value: 'titles', label: T.teamSort.titles }]} />
        <div className="table-scroll">
          <table className="ledger">
            <thead><tr><th>{T.th.rank}</th><th>{T.th.club}</th><th className="num">{T.th.wdl}</th><th className="num">{T.th.pf}</th><th className="num">{T.th.pa}</th><th className="num">{T.th.diff}</th><th className="num">{T.th.crowns}</th></tr></thead>
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
        <h2 className="page-head">{T.awards}</h2>
        <p className="aside-note">{scope === 'career' ? T.awardsAll : T.awardsRecent} {T.awardsWhen}</p>
        <ul className="award-list">
          {awards.map((a, i) => (
            <li key={`${a.season}-${a.award}-${i}`}>
              <span className="yr">{ES.common.season(a.season)}</span>
              <span className="award-name">{awardName(a.award)}</span>
              <AthleteName player={player(a.playerId)} />
            </li>
          ))}
          {!awards.length && <li><Blank>{T.noAwards}</Blank></li>}
        </ul>
      </section>

      <section className="page recto">
        <h2 className="page-head">{T.eras}</h2>
        <p className="aside-note">{T.erasNote}</p>
        <Pick label={T.year} value={archiveSeason} onChange={setArchiveSeason} options={[{ value: -1, label: archives.length ? T.chooseYear : T.noYears }, ...archives.map((a) => ({ value: a.season, label: T.yearOption(a.season) }))]} />
        {archive ? (
          <div className="archive-pair">
            <div>
              <h3>{T.scorers}</h3>
              <ol>
                {archive.leaders.slice(0, 10).map((l) => <li key={l.playerId}><AthleteName player={player(l.playerId)} /><b>{l.breaches}</b></li>)}
              </ol>
            </div>
            <div>
              <h3>{T.topClubs}</h3>
              <ol>
                {archive.standings.filter((s) => s.division === 0).sort((a, b) => b.pts - a.pts || (b.pf - b.pa) - (a.pf - a.pa)).slice(0, 10).map((s) => <li key={s.teamId}><HouseName team={team(s.teamId)} size={20} /><b>{s.pts}</b></li>)}
              </ol>
            </div>
          </div>
        ) : <Blank>{T.chooseHint}</Blank>}
        <p className="footnote">{T.footnote}</p>
      </section>
    </div>
  );
}
