import { useState } from 'react';
import type { SeasonStats } from '../types';
import { RECORD_LABEL } from '../chronicle';
import { nfmt, useGame } from '../game/context';
import { Shield } from '../art/Heraldry';
import { roman } from '../art/hash';
import { AthleteName, Blank, HouseName, Miniature } from '../ui/bits';
import { ES, raza, rol } from '../i18n/es';

const T = ES.history;

export function Annals() {
  const { world: w, team, player } = useGame();
  const crowns = w.trophies.filter((t) => t.competition === 'GRAND RIFT CHAMPIONSHIP').slice().reverse();
  const [legendScope, setLegendScope] = useState<'career' | 'season'>('career');
  const greats = w.players.concat(w.retired).sort((a, b) => b.fame - a.fame || b.career.breaches - a.career.breaches).slice(0, 10);
  const careerRecords = w.records.filter((r) => r.scope === 'career');
  const seasonRecords = w.records.filter((r) => r.scope === 'season');
  const sagas = w.storylines.filter((s) => s.status === 'active').sort((a, b) => b.lastSeason - a.lastSeason).slice(0, 8);
  const subjectLink = (s: string) => {
    if (s.startsWith('region:')) return null;
    const t = team(s);
    if (t) return <HouseName key={s} team={t} size={22} />;
    const p = player(s);
    return p ? <AthleteName key={s} player={p} /> : null;
  };

  return (
    <div className="spread annals">
      <section className="page verso">
        <h1 className="folio-title">{T.title}</h1>
        <p className="folio-sub">{T.sub}</p>
        <h2 className="page-head spaced">{T.champions}</h2>
        <ol className="annal-list">
          {crowns.map((c) => {
            const t = team(c.teamId);
            const ru = c.runnerUpId ? team(c.runnerUpId) : undefined;
            return (
              <li key={c.season}>
                <span className="annal-shield">{t && <Shield team={t} size={56} title />}</span>
                <div>
                  <p><span className="annal-year">{ES.common.season(c.season)}.</span> <HouseName team={t} size={0} full /> {T.championLine}{ru ? <> {T.beating} <HouseName team={ru} size={0} full /></> : ''}.</p>
                </div>
              </li>
            );
          })}
          {!crowns.length && <li><Blank>{T.noChampions}</Blank></li>}
        </ol>

        <h2 className="page-head small spaced">{T.records}</h2>
        {careerRecords.length || seasonRecords.length ? (
          <table className="ledger record-ledger">
            <thead><tr><th>{T.th.record}</th><th>{T.th.holder}</th><th className="num">{T.th.figure}</th></tr></thead>
            <tbody>
              {[['career', careerRecords], ['season', seasonRecords]].map(([scope, list]) => (list as typeof careerRecords).length > 0 && [
                <tr key={`h-${scope}`} className="record-group"><td colSpan={3}>{scope === 'career' ? T.careerGroup : T.seasonGroup}</td></tr>,
                ...(list as typeof careerRecords).map((r) => (
                  <tr key={`${r.scope}-${r.stat}`}>
                    <td>{RECORD_LABEL[r.stat] ?? r.stat}</td>
                    <td><AthleteName player={player(r.playerId)}>{r.playerName}</AthleteName>{r.scope === 'season' ? <small> · {ES.common.season(r.season)}</small> : null}</td>
                    <td className="num strong">{nfmt(r.value)}</td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        ) : <Blank>{T.noRecords}</Blank>}
      </section>

      <section className="page recto">
        <h2 className="page-head">{T.legends}</h2>
        <p className="aside-note">{T.legendsNote}</p>
        <div className="roll-controls compact"><button type="button" className={legendScope === 'career' ? 'gilt-button' : 'ink-button'} onClick={() => setLegendScope('career')}>{T.allTime}</button><button type="button" className={legendScope === 'season' ? 'gilt-button' : 'ink-button'} onClick={() => setLegendScope('season')}>{T.seasonRecords}</button></div>
        <ol className="legends">
          {greats.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'is-first' : ''}>
              <span className="legend-rank">{roman(i + 1)}</span>
              <Miniature player={p} size={i === 0 ? 76 : 48} />
              <span><AthleteName player={p} /><small>{rol(p.role)} {raza(p.race).toLowerCase()}{p.retired ? `, ${ES.common.retired}` : ''}</small></span>
              <strong>{nfmt(p.fame)}<small>{T.legacy}</small></strong>
            </li>
          ))}
        </ol>

        <LegendBoards scope={legendScope} />

        <h2 className="page-head small spaced">{T.sagas}</h2>
        {sagas.length ? (
          <ul className="sagas">
            {sagas.map((s) => (
              <li key={s.id}>
                <p><strong className="saga-kind">{T.sagaKind[s.kind]}:</strong> {s.memory || T.sagaUnnamed}, <span className="saga-since">{T.since(s.startSeason)}</span>.</p>
                <span className="saga-subjects">{s.subjects.map(subjectLink)}</span>
              </li>
            ))}
          </ul>
        ) : <Blank>{T.noSagas}</Blank>}
      </section>
    </div>
  );
}

const BOARDS: (keyof SeasonStats)[] = ['breaches', 'gates', 'passingYards', 'rushingYards', 'assists', 'blocks', 'tackles', 'interceptions', 'knockouts', 'mvp'];

function LegendBoards({ scope }: { scope: 'career' | 'season' }) {
  const { world: w, team, go } = useGame();
  const key = scope === 'career' ? 'career' : 'stats';
  const pool = scope === 'career' ? w.players.concat(w.retired) : w.players;
  return <div className="legend-grid" aria-label={T.boardsLabel}>
    {BOARDS.map((stat) => {
      const leaders = pool.slice().sort((a, z) => z[key][stat] - a[key][stat] || z.fame - a.fame).slice(0, 3);
      return <section key={stat}><h3>{T.boards[stat]}</h3><ol>{leaders.map((p) => <li key={p.id}><button type="button" onClick={() => go({ kind: 'athlete', id: p.id })}><span>{p.name}</span><b>{nfmt(p[key][stat])}</b></button><small>{team(p.teamId)?.nickname ?? T.retiredClub}</small></li>)}</ol></section>;
    })}
  </div>;
}
