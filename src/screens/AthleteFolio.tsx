import type { SeasonStats, StatKey } from '../types';
import { ABILITY_EFFECTS, TRAIT_EFFECTS, xpGoal } from '../engine';
import { nfmt, useGame } from '../game/context';
import { houseColours } from '../art/Heraldry';
import { Portrait } from '../art/Portrait';
import { RoleGlyph } from '../art/Ornament';
import { roman } from '../art/hash';
import { Blank, HouseName } from '../ui/bits';
import { titleCase } from './Chronicle';

export const METRICS: { key: keyof SeasonStats; label: string; short: string }[] = [
  { key: 'games', label: 'Appearances', short: 'GP' },
  { key: 'breaches', label: 'Breaches', short: 'BR' },
  { key: 'assists', label: 'Breach assists', short: 'AST' },
  { key: 'distance', label: 'Metres carried', short: 'MET' },
  { key: 'passes', label: 'Passes completed', short: 'PASS' },
  { key: 'gates', label: 'Gate shots made', short: 'GATE' },
  { key: 'tackles', label: 'Tackles', short: 'TKL' },
  { key: 'blocks', label: 'Blocks', short: 'BLK' },
  { key: 'interceptions', label: 'Interceptions', short: 'INT' },
  { key: 'knockouts', label: 'Knockouts', short: 'KO' },
  { key: 'injuries', label: 'Injuries suffered', short: 'INJ' },
  { key: 'mvp', label: 'Most valuable honours', short: 'MVP' },
];

const VIRTUES: { name: string; keys: StatKey[] }[] = [
  { name: 'Body', keys: ['strength', 'speed', 'agility', 'endurance'] },
  { name: 'Craft', keys: ['handling', 'passing', 'tackling', 'blocking'] },
  { name: 'Mind', keys: ['positioning', 'awareness', 'composure', 'arcana'] },
];

export function AthleteFolio({ id }: { id: string }) {
  const { world: w, player, team, go } = useGame();
  const p = player(id);
  if (!p) {
    return (
      <div className="spread"><section className="page verso"><h1 className="folio-title">A torn page</h1><Blank>No athlete by this mark is recorded in the chronicle.</Blank><button type="button" className="ink-button" onClick={() => go({ kind: 'section', section: 'bestiary' })}>Return to the Bestiary</button></section><section className="page recto" /></div>
    );
  }
  const t = team(p.teamId);
  const goal = xpGoal(p.level);
  const tidings = w.news.filter((s) => s.playerId === p.id).slice(0, 6);
  const honours = w.awards.filter((a) => a.playerId === p.id).slice().reverse();
  const records = w.records.filter((r) => r.playerId === p.id);

  return (
    <div className="spread athlete-folio">
      <section className="page verso">
        <button type="button" className="back-link" onClick={() => history.length > 1 ? history.back() : go({ kind: 'section', section: 'bestiary' })}>Return</button>
        <div className="athlete-hero">
          <div className={`great-miniature rarity-${p.rarity.toLowerCase()}`}>
            <Portrait player={p} house={t ? houseColours(t) : undefined} size={300} title={`Portrait of ${p.name}`} />
            <span className="great-rating"><strong>{p.rating}</strong><small>rating</small></span>
          </div>
          <div className="athlete-heading">
            <span className={`banderole rarity-band rarity-${p.rarity.toLowerCase()}`}>{p.rarity}</span>
            <h1 className="folio-title">{p.name}</h1>
            <p className="athlete-line"><RoleGlyph role={p.role} size={24} />{p.race} {p.role.toLowerCase()}, aged {p.age}{p.retired ? ', now retired' : ''}</p>
            <p className="athlete-house">{p.retired ? 'Last played for ' : 'Plays for '}<HouseName team={t} size={28} full /></p>
            {p.injury > 0 && <p className="athlete-injury">Abed with injury for {p.injury} more {p.injury === 1 ? 'week' : 'weeks'}.</p>}
          </div>
        </div>

        <div className="level-track">
          <div><strong>Level {p.level}</strong><span>{p.xp} of {goal} experience toward level {p.level + 1}</span></div>
          <div className="level-rule"><span style={{ width: `${Math.min(100, (p.xp / goal) * 100)}%` }} /></div>
        </div>

        <div className="gifts">
          <article className="gift">
            <h3><span>Trait</span>{p.trait}</h3>
            <p>{TRAIT_EFFECTS[p.trait] ?? 'Its effect is not yet recorded.'}</p>
          </article>
          <article className="gift is-spark">
            <h3><span>Spark ability</span>{p.ability}</h3>
            <p>{ABILITY_EFFECTS[p.ability] ?? 'Its effect is not yet recorded.'}</p>
          </article>
        </div>

        <dl className="facts">
          <div><dt>Seasons played</dt><dd>{p.seasons}</dd></div>
          <div><dt>Grand Rift crowns</dt><dd>{p.championships}</dd></div>
          <div><dt>Other titles</dt><dd>{p.titles}</dd></div>
          <div><dt>Promise</dt><dd>{p.potential}</dd></div>
        </dl>

        {(honours.length > 0 || records.length > 0) && (
          <>
            <h2 className="page-head small spaced">Honours</h2>
            <ul className="honours">
              {honours.map((a, i) => <li key={`${a.season}-${a.award}-${i}`}><span className="yr">Year {roman(a.season)}</span>{a.award}</li>)}
              {records.map((r) => <li key={`${r.stat}-${r.scope}`}><span className="yr">Record</span>{r.scope === 'career' ? 'Career' : `Year ${roman(r.season)}`} {r.stat}: {nfmt(r.value)}</li>)}
            </ul>
          </>
        )}
      </section>

      <section className="page recto">
        <h2 className="page-head">The Virtues</h2>
        <div className="virtues">
          {VIRTUES.map((v) => (
            <div key={v.name} className="virtue-group">
              <h3>{v.name}</h3>
              {v.keys.map((k) => (
                <div key={k} className="virtue">
                  <span>{k}</span>
                  <span className="virtue-rule"><i style={{ width: `${Math.min(100, p.attrs[k])}%` }} className={p.attrs[k] >= 80 ? 'is-high' : p.attrs[k] < 45 ? 'is-low' : ''} /></span>
                  <strong>{p.attrs[k]}</strong>
                </div>
              ))}
            </div>
          ))}
        </div>

        <h2 className="page-head spaced">The Ledger</h2>
        <div className="table-scroll">
          <table className="ledger athlete-ledger">
            <thead><tr><th>Deed</th><th className="num">This season</th><th className="num">Career</th></tr></thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.key}><td>{m.label}</td><td className="num">{nfmt(p.stats[m.key] ?? 0)}</td><td className="num strong">{nfmt(p.career[m.key] ?? 0)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="page-head small spaced">In the Chronicle</h2>
        {tidings.length ? (
          <ul className="mentions">
            {tidings.map((s) => (
              <li key={s.id}>
                <button type="button" className="story-link" onClick={() => s.matchId ? go({ kind: 'contest', id: s.matchId }) : undefined} disabled={!s.matchId}>{titleCase(s.title)}</button>
                <small>Year {roman(s.season)}, week {s.week}</small>
              </li>
            ))}
          </ul>
        ) : <Blank>The chroniclers have not yet written of {p.name.split(' ')[0]}. Give it time, or a spectacular foul.</Blank>}
      </section>
    </div>
  );
}
