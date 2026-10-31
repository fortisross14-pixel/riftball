import type { Storyline } from '../types';
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
  const greats = w.players.concat(w.retired).sort((a, b) => b.career.breaches - a.career.breaches || b.rating - a.rating).slice(0, 10);
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
                  <span className="annal-year">Year {roman(c.season)}</span>
                  <p>In this year <HouseName team={t} size={0} full /> took the crown of the Grand Rift{ru ? <>, overcoming <HouseName team={ru} size={0} full /> in the final</> : ''}.</p>
                </div>
              </li>
            );
          })}
          {!crowns.length && <li><Blank>The first page of the annals is blank. The Grand Rift is decided in week 23; turn to the season's end to crown the first champion.</Blank></li>}
        </ol>

        <h2 className="page-head small spaced">The Eternal Ledger</h2>
        {careerRecords.length || seasonRecords.length ? (
          <div className="records">
            {[...careerRecords, ...seasonRecords].map((r) => (
              <div key={`${r.scope}-${r.stat}`} className="record-plaque">
                <span className="record-label">{r.scope === 'career' ? 'Career' : 'Single season'} · {RECORD_LABEL[r.stat] ?? r.stat}</span>
                <strong>{nfmt(r.value)}</strong>
                <span className="record-holder"><AthleteName player={player(r.playerId)}>{r.playerName}</AthleteName>{r.scope === 'season' ? `, Year ${roman(r.season)}` : ''}</span>
              </div>
            ))}
          </div>
        ) : <Blank>No records have been set down yet. Play a season and the ledger begins.</Blank>}

      </section>

      <section className="page recto">
        <h2 className="page-head">The Hall of Legends</h2>
        <p className="aside-note">The greatest breach scorers who ever lived, the retired included.</p>
        <ol className="legends">
          {greats.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'is-first' : ''}>
              <span className="legend-rank">{roman(i + 1)}</span>
              <Miniature player={p} size={i === 0 ? 76 : 48} />
              <span><AthleteName player={p} /><small>{p.race} {p.role.toLowerCase()}{p.retired ? ', retired' : ''}</small></span>
              <strong>{nfmt(p.career.breaches)}<small>breaches</small></strong>
            </li>
          ))}
        </ol>

        <h2 className="page-head small spaced">Sagas Still Being Written</h2>
        {sagas.length ? (
          <ul className="sagas">
            {sagas.map((s) => (
              <li key={s.id}>
                <span className="saga-kind">{STORY_KIND[s.kind]} · since Year {roman(s.startSeason)}</span>
                <p>{s.memory}</p>
                <span className="saga-subjects">{s.subjects.map(subjectLink)}</span>
              </li>
            ))}
          </ul>
        ) : <Blank>No sagas are running yet. Feuds, droughts and dynasties take a season or two to ferment.</Blank>}
      </section>
    </div>
  );
}
