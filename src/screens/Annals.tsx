import { useState } from 'react';
import type { SeasonStats, Storyline } from '../types';
import { RECORD_LABEL } from '../chronicle';
import { nfmt, useGame } from '../game/context';
import { Shield } from '../art/Heraldry';
import { roman } from '../art/hash';
import { AthleteName, Blank, HouseName, Miniature } from '../ui/bits';

const STORY_KIND: Record<Storyline['kind'], string> = {
  drought: 'A long drought', dynasty: 'A dynasty', record: 'A record chase', rivalry: 'A feud', 'last-dance': 'A last dance',
  prodigy: 'A prodigy', upset: 'A great upset', heartbreak: 'A heartbreak',
};

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
        <h1 className="folio-title">The Annals</h1>
        <p className="folio-sub">A century may pass; the records remain. So, regrettably, does the smell of the locker room.</p>
        <h2 className="page-head spaced">Champions of the Grand Rift</h2>
        <ol className="annal-list">
          {crowns.map((c) => {
            const t = team(c.teamId);
            const ru = c.runnerUpId ? team(c.runnerUpId) : undefined;
            return (
              <li key={c.season}>
                <span className="annal-shield">{t && <Shield team={t} size={56} title />}</span>
                <div>
                  <p><span className="annal-year">Year {roman(c.season)}.</span> In this year <HouseName team={t} size={0} full /> took the crown of the Grand Rift{ru ? <>, overcoming <HouseName team={ru} size={0} full /> in the final</> : ''}.</p>
                </div>
              </li>
            );
          })}
          {!crowns.length && <li><Blank>The first page of the annals is blank. The Grand Rift is decided in week 23; turn to the season's end to crown the first champion.</Blank></li>}
        </ol>

        <h2 className="page-head small spaced">The Eternal Ledger</h2>
        {careerRecords.length || seasonRecords.length ? (
          <table className="ledger record-ledger">
            <thead><tr><th>Record</th><th>Holder</th><th className="num">Figure</th></tr></thead>
            <tbody>
              {[['career', careerRecords], ['season', seasonRecords]].map(([scope, list]) => (list as typeof careerRecords).length > 0 && [
                <tr key={`h-${scope}`} className="record-group"><td colSpan={3}>{scope === 'career' ? 'Across whole careers' : 'In a single season'}</td></tr>,
                ...(list as typeof careerRecords).map((r) => (
                  <tr key={`${r.scope}-${r.stat}`}>
                    <td>{RECORD_LABEL[r.stat] ?? r.stat}</td>
                    <td><AthleteName player={player(r.playerId)}>{r.playerName}</AthleteName>{r.scope === 'season' ? <small> · Year {roman(r.season)}</small> : null}</td>
                    <td className="num strong">{nfmt(r.value)}</td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        ) : <Blank>No records have been set down yet. Play a season and the ledger begins.</Blank>}

      </section>

      <section className="page recto">
        <h2 className="page-head">The Hall of Legends</h2>
        <p className="aside-note">Legacy is separate from talent: crowns, great performances, awards and records all leave their mark.</p>
        <div className="roll-controls compact"><button type="button" className={legendScope === 'career' ? 'gilt-button' : 'ink-button'} onClick={() => setLegendScope('career')}>All-time leaders</button><button type="button" className={legendScope === 'season' ? 'gilt-button' : 'ink-button'} onClick={() => setLegendScope('season')}>This season’s records</button></div>
        <ol className="legends">
          {greats.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'is-first' : ''}>
              <span className="legend-rank">{roman(i + 1)}</span>
              <Miniature player={p} size={i === 0 ? 76 : 48} />
              <span><AthleteName player={p} /><small>{p.race} {p.role.toLowerCase()}{p.retired ? ', retired' : ''}</small></span>
              <strong>{nfmt(p.fame)}<small>legacy</small></strong>
            </li>
          ))}
        </ol>

        <LegendBoards scope={legendScope} />

        <h2 className="page-head small spaced">Sagas Still Being Written</h2>
        {sagas.length ? (
          <ul className="sagas">
            {sagas.map((s) => (
              <li key={s.id}>
                <p><strong className="saga-kind">{STORY_KIND[s.kind]}:</strong> {s.memory || 'the chroniclers are still deciding what to call it'}, <span className="saga-since">since Year {roman(s.startSeason)}</span>.</p>
                <span className="saga-subjects">{s.subjects.map(subjectLink)}</span>
              </li>
            ))}
          </ul>
        ) : <Blank>No sagas are running yet. Feuds, droughts and dynasties take a season or two to ferment.</Blank>}
      </section>
    </div>
  );
}

function LegendBoards({ scope }: { scope: 'career' | 'season' }) {
  const { world: w, player, team, go } = useGame();
  const key = scope === 'career' ? 'career' : 'stats';
  const boards: { label: string; stat: keyof SeasonStats }[] = [
    { label: 'Breaches', stat: 'breaches' }, { label: 'Points', stat: 'gates' }, { label: 'Passing yards', stat: 'passingYards' }, { label: 'Rushing yards', stat: 'rushingYards' },
    { label: 'Assists', stat: 'assists' }, { label: 'Blocks', stat: 'blocks' }, { label: 'Tackles', stat: 'tackles' }, { label: 'Interceptions', stat: 'interceptions' },
    { label: 'Knockouts', stat: 'knockouts' }, { label: 'Match MVPs', stat: 'mvp' },
  ];
  const pool = scope === 'career' ? w.players.concat(w.retired) : w.players;
  return <div className="legend-grid" aria-label={`${scope} Hall of Legends leaderboards`}>
    {boards.map((b) => {
      const leaders = pool.slice().sort((a, z) => z[key][b.stat] - a[key][b.stat] || z.fame - a.fame).slice(0, 3);
      return <section key={b.stat}><h3>{b.label}</h3><ol>{leaders.map((p) => <li key={p.id}><button type="button" onClick={() => go({ kind: 'athlete', id: p.id })}><span>{p.name}</span><b>{nfmt(p[key][b.stat])}</b></button><small>{team(p.teamId)?.nickname ?? 'Retired'}</small></li>)}</ol></section>;
    })}
  </div>;
}
