import type { SeasonStats, StatKey } from '../types';
import { abilityTier, xpGoal } from '../engine';
import { nfmt, useGame } from '../game/context';
import { houseColours } from '../art/Heraldry';
import { Portrait } from '../art/Portrait';
import { RoleGlyph } from '../art/Ornament';
import { Blank, HouseName } from '../ui/bits';
import { Term } from '../ui/Term';
import { Shield } from '../art/Heraldry';
import { ATRIBUTO_ES, ES, HABILIDAD_ES, NIVEL_ES, RASGO_ES, RECORD_STAT_ES as RECORD_LABEL, awardName, raza, rareza, rol, titleCase } from '../i18n/es';

const METRIC_KEYS: (keyof SeasonStats)[] = ['games', 'breaches', 'assists', 'distance', 'passes', 'gates', 'tackles', 'blocks', 'interceptions', 'knockouts', 'injuries', 'mvp', 'ultimates', 'decisive'];
export const METRICS: { key: keyof SeasonStats; label: string; short: string }[] = METRIC_KEYS.map((key) => ({ key, label: ES.metric[key][0], short: ES.metric[key][1] }));

const T = ES.athlete;
const VIRTUES: { name: string; keys: StatKey[] }[] = [
  { name: T.groups.body, keys: ['strength', 'speed', 'agility', 'endurance'] },
  { name: T.groups.craft, keys: ['handling', 'passing', 'tackling', 'blocking'] },
  { name: T.groups.mind, keys: ['positioning', 'awareness', 'composure', 'arcana'] },
];

export function AthleteFolio({ id }: { id: string }) {
  const { world: w, player, team, go } = useGame();
  const p = player(id);
  if (!p) {
    return (
      <div className="spread"><section className="page verso"><h1 className="folio-title">{ES.common.tornPage}</h1><Blank>{T.missing}</Blank><button type="button" className="ink-button" onClick={() => go({ kind: 'section', section: 'bestiary' })}>{T.toList}</button></section><section className="page recto" /></div>
    );
  }
  const t = team(p.teamId);
  const goal = xpGoal(p.level);
  const tidings = w.news.filter((s) => s.playerId === p.id).slice(0, 6);
  const honours = w.awards.filter((a) => a.playerId === p.id).slice().reverse();
  const records = w.records.filter((r) => r.playerId === p.id);
  const trait = RASGO_ES[p.trait];
  const ability = HABILIDAD_ES[p.ability];

  return (
    <div className="spread athlete-folio">
      <section className="page verso">
        <button type="button" className="back-link" onClick={() => history.length > 1 ? history.back() : go({ kind: 'section', section: 'bestiary' })}>{ES.common.back}</button>
        <div className="athlete-hero">
          <div className={`great-miniature rarity-${p.rarity.toLowerCase()}`}>
            <Portrait player={p} house={t ? houseColours(t) : undefined} size={300} title={T.portrait(p.name)} />
            <span className="great-rating"><strong>{p.rating}</strong><small><Term k="rating">{T.rating}</Term></small></span>
          </div>
          <div className="athlete-heading">
            <h1 className="folio-title">{p.name}</h1>
            {p.nickname && <p className="athlete-nickname">«{p.nickname}»</p>}
            <p className="athlete-line"><RoleGlyph role={p.role} size={24} /><span><b className={`rarity-word rarity-${p.rarity.toLowerCase()}`}><Term k="rarity">{rareza(p.rarity)}</Term></b> · {T.roleRaceAge(rol(p.role), raza(p.race).toLowerCase(), p.age)}</span>{p.retired ? T.nowRetired : ''}</p>
            <p className="athlete-house">{p.retired ? T.played : T.plays}<HouseName team={t} size={28} full /></p>
            {p.injury > 0 && <p className="athlete-injury">{T.injured(p.injury)}</p>}
          </div>
        </div>

        <div className="level-track">
          <div><strong><Term k="level">{T.level(p.level)}</Term></strong><span>{T.xp(p.xp, goal, p.level + 1)}</span></div>
          <div className="level-rule"><span style={{ width: `${Math.min(100, (p.xp / goal) * 100)}%` }} /></div>
        </div>

        <div className="gifts">
          <article className="gift">
            <h3>{trait?.nombre ?? p.trait}</h3>
            <p><em>{T.trait}</em> {trait?.efecto ?? T.unknownEffect}</p>
          </article>
          <article className={`gift is-spark tier-${abilityTier(p.ability)}`}>
            <h3>{ability?.nombre ?? p.ability}</h3>
            <p><em>{T.tier(NIVEL_ES[abilityTier(p.ability)])}</em> {ability?.efecto ?? T.unknownEffect}</p>
            {abilityTier(p.ability) === 'ultimate' && <p className="gift-stats">{T.ultimateStats(p.career.ultimates ?? 0, p.career.decisive ?? 0)}</p>}
          </article>
        </div>

        <dl className="facts">
          <div><dt>{T.facts.seasons}</dt><dd>{p.seasons}</dd></div>
          <div><dt>{T.facts.crowns}</dt><dd>{p.championships}</dd></div>
          <div><dt>{T.facts.titles}</dt><dd>{p.titles}</dd></div>
          <div><dt><Term k="potential">{T.facts.potential}</Term></dt><dd>{p.potential}</dd></div>
        </dl>

        {(honours.length > 0 || records.length > 0) && (
          <>
            <h2 className="page-head small spaced">{T.honours}</h2>
            <ul className="honours">
              {honours.map((a, i) => <li key={`${a.season}-${a.award}-${i}`}><span className="yr">{ES.common.season(a.season)}</span>{awardName(a.award)}</li>)}
              {records.map((r) => <li key={`${r.stat}-${r.scope}`}><span className="yr">{T.record}</span>{T.recordScope(r.scope, r.season)} · {RECORD_LABEL[r.stat]}: {nfmt(r.value)}</li>)}
            </ul>
          </>
        )}
        <Timeline id={p.id} />
        <h2 className="page-head small spaced">{T.mentions}</h2>
        {tidings.length ? (
          <ul className="mentions">
            {tidings.map((s) => (
              <li key={s.id}>
                <button type="button" className="story-link" onClick={() => s.matchId ? go({ kind: 'contest', id: s.matchId }) : undefined} disabled={!s.matchId}>{titleCase(s.title)}</button>
                <small>{ES.common.seasonWeek(s.season, s.week)}</small>
              </li>
            ))}
          </ul>
        ) : <Blank>{T.noMentions(p.name.split(' ')[0])}</Blank>}
      </section>

      <section className="page recto">
        <h2 className="page-head">{T.virtues}</h2>
        <div className="virtues">
          {VIRTUES.map((v) => (
            <div key={v.name} className="virtue-group">
              <h3>{v.name}</h3>
              {v.keys.map((k) => (
                <div key={k} className="virtue">
                  <span>{ATRIBUTO_ES[k]}</span>
                  <span className="virtue-rule"><i style={{ width: `${Math.min(100, p.attrs[k])}%` }} className={p.attrs[k] >= 80 ? 'is-high' : p.attrs[k] < 45 ? 'is-low' : ''} /></span>
                  <strong>{p.attrs[k]}</strong>
                </div>
              ))}
            </div>
          ))}
        </div>

        <h2 className="page-head spaced">{T.ledger}</h2>
        <div className="table-scroll">
          <table className="ledger athlete-ledger">
            <thead><tr><th>{T.th.stat}</th><th className="num">{T.th.season}</th><th className="num">{T.th.career}</th></tr></thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.key}><td>{m.label}</td><td className="num">{nfmt(p.stats[m.key] ?? 0)}</td><td className="num strong">{nfmt(p.career[m.key] ?? 0)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/** One line per finished season (and the current one): club, games and the main numbers. */
function Timeline({ id }: { id: string }) {
  const { world: w, player, team } = useGame();
  const p = player(id)!;
  const rows = [...(p.history ?? [])];
  if (!p.retired && p.stats.games) rows.push({ season: w.season, teamId: p.teamId, games: p.stats.games, breaches: p.stats.breaches, tackles: p.stats.tackles, interceptions: p.stats.interceptions, rating: p.rating });
  const TL = ES.timeline;
  return (
    <>
      <h2 className="page-head small spaced">{TL.title}</h2>
      {rows.length ? (
        <ol className="timeline-list">
          {rows.slice().reverse().map((r) => {
            const t = team(r.teamId);
            const honours = w.awards.filter((a) => a.playerId === p.id && a.season === r.season);
            return (
              <li key={r.season}>
                <span className="yr">{ES.common.season(r.season)}{r.season === w.season && !p.retired ? ` · ${TL.current}` : ''}</span>
                <span className="tl-club">{t && <Shield team={t} size={20} />}{t?.nickname ?? '—'}</span>
                <span className="tl-line">{TL.line(r.games, r.breaches, r.tackles, r.interceptions)} · {TL.rating(r.rating)}</span>
                {honours.length > 0 && <span className="tl-awards">{honours.map((a) => awardName(a.award)).join(' · ')}</span>}
              </li>
            );
          })}
        </ol>
      ) : <Blank>{TL.empty}</Blank>}
    </>
  );
}
