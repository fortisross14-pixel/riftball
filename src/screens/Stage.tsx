import { useMemo } from 'react';
import { currentFixtures, currentStage, galaItems, getTeam, lineup, seasonCoins, teamRoster } from '../engine';
import { PredictionPicker } from './parts/PreMatchCard';
import { COMISIONADO, GRIMBALDO_LINES, pickLine } from '../i18n/es-cronica';
import { useGame } from '../game/context';
import { Shield, houseColours } from '../art/Heraldry';
import { Portrait } from '../art/Portrait';
import { AthleteName, Blank, FormPips, HouseName } from '../ui/bits';
import { ES, ROLE_ES, RECORD_STAT_ES, SHOWCASE_STAKE, SHOWCASE_TITLE, acceptanceQuote, awardName, championJoke, countryName, farewellLine, hypeLine } from '../i18n/es';
import type { GalaItem, Match, Player, ShowcaseId, Team, World } from '../types';

/** The event page: whatever the calendar's current stage needs the player to do. */
export function StageScreen() {
  const { world: w } = useGame();
  const stage = currentStage(w);
  if (stage.kind === 'showcase' && stage.showcase) return stage.introSeen ? <ShowcaseBoard id={stage.showcase} /> : <ShowcaseIntro id={stage.showcase} />;
  if (stage.kind === 'awards') return <Gala />;
  if (stage.kind === 'market') return <Market />;
  if (stage.kind === 'preseason') return <Preseason />;
  return (
    <div className="spread stage-page">
      <section className="page verso">
        <h1 className="folio-title">{ES.stage.navName}</h1>
        <Blank>{ES.stage.weekLabel(w.season, w.week)}. No hay ningún evento en curso: la liga sigue su camino.</Blank>
      </section>
      <section className="page recto" />
    </div>
  );
}

/* ------------------------------------------------------------ showcase intro */

const keyPlayer = (w: World, t: Team) => [...lineup(w, t)].sort((a, b) => b.rating - a.rating)[0];
const captainOf = (w: World, t: Team) => [...teamRoster(w, t)].sort((a, b) => b.fame - a.fame || b.rating - a.rating)[0];

function ShowcaseIntro({ id }: { id: ShowcaseId }) {
  const { world: w, dismissIntro, busy, locked } = useGame();
  const fixtures = currentFixtures(w);
  // The group stage has twelve games; the intro shows each club once instead.
  const pairs = id === 'world-groups' ? groupPairs(fixtures) : fixtures.map((m) => [m.home, m.away] as const);
  return (
    <div className="showcase-intro" role="region" aria-label={SHOWCASE_TITLE[id]}>
      <p className="showcase-kicker">{ES.stage.weekLabel(w.season, w.week)}</p>
      <h1 className="showcase-title">{SHOWCASE_TITLE[id]}</h1>
      <p className="showcase-stake">{SHOWCASE_STAKE[id]}</p>
      <div className={`showcase-matchups count-${pairs.length}`}>
        {pairs.map(([h, a], i) => <Matchup key={`${h}-${a}-${i}`} home={getTeam(w, h)} away={getTeam(w, a)} label={id === 'world-groups' ? ES.stage.group(i) : undefined} />)}
      </div>
      <p className="showcase-hype">{hypeLine(id, `${w.season}-${w.week}`)}</p>
      <p className="showcase-voice">{pickLine(GRIMBALDO_LINES, `${w.seed}-${w.season}-${w.week}`)}</p>
      <button type="button" className="gilt-button showcase-go" disabled={busy || locked} onClick={dismissIntro}>{ES.stage.introGo}</button>
    </div>
  );
}

/** World Cup groups: show the four clubs of each group as two pairs. */
function groupPairs(fixtures: Match[]) {
  const out: (readonly [string, string])[] = [];
  for (const g of [0, 1]) {
    const first = fixtures.filter((m) => m.group === g);
    const clubs = [...new Set(first.flatMap((m) => [m.home, m.away]))];
    for (let i = 0; i + 1 < clubs.length; i += 2) out.push([clubs[i], clubs[i + 1]] as const);
  }
  return out;
}

function Matchup({ home, away, label }: { home: Team; away: Team; label?: string }) {
  return (
    <article className="matchup">
      {label && <span className="matchup-label">{label}</span>}
      <MatchupSide team={home} />
      <span className="matchup-vs">{ES.stage.vs}</span>
      <MatchupSide team={away} />
    </article>
  );
}

function MatchupSide({ team }: { team: Team }) {
  const { world: w } = useGame();
  const star = keyPlayer(w, team);
  return (
    <div className="matchup-side">
      <Shield team={team} size={84} />
      <strong className="matchup-name">{team.nickname}</strong>
      <span className="matchup-city">{team.city} · {countryName(team.region)}</span>
      <span className="matchup-form"><small>{ES.stage.form}</small>{team.form.length ? <FormPips team={team} /> : <em>{ES.stage.noForm}</em>}</span>
      {star && (
        <span className="matchup-star">
          <Portrait player={star} house={houseColours(team)} size={44} />
          <span><small>{ES.stage.keyPlayer}</small><AthleteName player={star} /> <em>{ROLE_ES[star.role]} · {star.rating}</em></span>
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ showcase match list and results */

function ShowcaseBoard({ id }: { id: ShowcaseId }) {
  const { world: w, resolveFixture, resolveFixtures, go, busy, locked } = useGame();
  const fixtures = currentFixtures(w);
  const pending = fixtures.filter((m) => m.homeScore === null);
  const disabled = busy || locked;
  const quickAll = () => resolveFixtures(pending.map((m) => m.id));
  const groups = id === 'world-groups' ? [0, 1] : [null];
  return (
    <div className="spread stage-page">
      <section className="page verso">
        <h1 className="folio-title">{SHOWCASE_TITLE[id]}</h1>
        <p className="folio-sub">{SHOWCASE_STAKE[id]}</p>
        <p className={`stage-remaining ${pending.length ? '' : 'is-done'}`} role="status">{ES.stage.remaining(pending.length)}</p>
        <p className="stage-coins">{ES.predict.hint} <b>{ES.predict.tally(seasonCoins(w))}</b></p>
        {groups.map((g) => (
          <div key={String(g)} className="stage-group">
            {g !== null && <h2 className="page-head small">{ES.stage.group(g)}</h2>}
            <ul className="stage-fixtures">
              {fixtures.filter((m) => g === null || m.group === g).map((m) => (
                <FixtureRow key={m.id} m={m} disabled={disabled}
                  onWatch={async () => { if (await resolveFixture(m.id)) go({ kind: 'contest', id: m.id }); }}
                  onQuick={() => void resolveFixture(m.id)}
                  onReplay={() => go({ kind: 'contest', id: m.id })} />
              ))}
            </ul>
          </div>
        ))}
        {pending.length > 1 && <button type="button" className="ink-button spaced-button" disabled={disabled} onClick={quickAll}>{ES.stage.quickAll(pending.length)}</button>}
      </section>
      <section className="page recto">
        {pending.length === 0 ? <ShowcaseResults id={id} fixtures={fixtures} /> : <ShowcaseWaiting id={id} />}
      </section>
    </div>
  );
}

function FixtureRow({ m, disabled, onWatch, onQuick, onReplay }: { m: Match; disabled: boolean; onWatch: () => void; onQuick: () => void; onReplay: () => void }) {
  const { team } = useGame();
  const h = team(m.home)!;
  const a = team(m.away)!;
  const done = m.homeScore !== null;
  return (
    <li className={`stage-fixture ${done ? 'is-done' : ''}`}>
      <span className={`stage-side ${m.winner === h.id ? 'is-winner' : ''}`}><Shield team={h} size={40} /><span>{h.nickname}</span></span>
      <span className="stage-score">{done ? `${m.homeScore} – ${m.awayScore}` : ES.stage.vs}</span>
      <span className={`stage-side is-away ${m.winner === a.id ? 'is-winner' : ''}`}><span>{a.nickname}</span><Shield team={a} size={40} /></span>
      <span className="stage-actions">
        {done
          ? <button type="button" className="ink-button" onClick={onReplay}>{ES.stage.replay}</button>
          : <><button type="button" className="gilt-button" disabled={disabled} onClick={onWatch}>{ES.stage.watch}</button><button type="button" className="ink-button" disabled={disabled} onClick={onQuick}>{ES.stage.quick}</button></>}
      </span>
      <span className="stage-predict"><PredictionPicker m={m} home={h} away={a} /></span>
    </li>
  );
}

function ShowcaseWaiting({ id }: { id: ShowcaseId }) {
  const { world: w } = useGame();
  return (
    <div className="stage-waiting">
      <h2 className="page-head small">{ES.stage.resultsTitle}</h2>
      <Blank>{hypeLine(id, `${w.season}-${w.week}-wait`)}</Blank>
    </div>
  );
}

function ShowcaseResults({ id, fixtures }: { id: ShowcaseId; fixtures: Match[] }) {
  const { world: w, team } = useGame();
  if (id === 'world-groups') {
    return (
      <div className="stage-results">
        <h2 className="page-head small">{ES.stage.resultsTitle}</h2>
        {[0, 1].map((g) => {
          const rows = groupTable(fixtures.filter((m) => m.group === g));
          return (
            <div key={g} className="stage-group-table">
              <h3>{ES.stage.group(g)}</h3>
              <ol>{rows.map((r, i) => <li key={r.id} className={i < 2 ? 'is-through' : ''}><HouseName team={team(r.id)} size={24} /><span>{r.p} pts · {r.d >= 0 ? '+' : ''}{r.d}</span>{i < 2 && <em>{ES.stage.advance}</em>}</li>)}</ol>
            </div>
          );
        })}
        <p className="aside-note">{ES.stage.continueHint}</p>
      </div>
    );
  }
  if (id === 'world-semis') {
    const names = fixtures.map((m) => team(m.winner!)?.nickname).filter(Boolean).join(' y ');
    return (
      <div className="stage-results">
        <h2 className="page-head small">{ES.stage.resultsTitle}</h2>
        <div className="stage-winners">{fixtures.map((m) => { const t = team(m.winner!); return t ? <span key={m.id}><Shield team={t} size={96} /><strong>{t.nickname}</strong></span> : null; })}</div>
        <p className="stage-line">{ES.stage.toFinal(names)}</p>
        <p className="aside-note">{ES.stage.continueHint}</p>
      </div>
    );
  }
  // National finals and the Grand Final: a trophy lift per champion.
  return (
    <div className="stage-results">
      {id === 'grand-final' && <h2 className="showcase-title is-small">{ES.stage.worldChampion}</h2>}
      <div className={`trophy-lifts count-${fixtures.length}`}>
        {fixtures.map((m) => { const t = m.winner ? getTeam(w, m.winner) : undefined; return t ? <TrophyLift key={m.id} team={t} big={id === 'grand-final'} seed={m.id} /> : null; })}
      </div>
      <p className="aside-note">{ES.stage.continueHint}</p>
    </div>
  );
}

function groupTable(matches: Match[]) {
  const rows = new Map<string, { id: string; p: number; d: number }>();
  for (const m of matches) {
    for (const id of [m.home, m.away]) if (!rows.has(id)) rows.set(id, { id, p: 0, d: 0 });
    const h = rows.get(m.home)!, a = rows.get(m.away)!;
    const hs = m.homeScore ?? 0, as = m.awayScore ?? 0;
    h.d += hs - as; a.d += as - hs;
    if (hs > as) h.p += 3; else if (hs < as) a.p += 3; else { h.p++; a.p++; }
  }
  return [...rows.values()].sort((a, b) => b.p - a.p || b.d - a.d);
}

function TrophyLift({ team, big, seed }: { team: Team; big: boolean; seed: string }) {
  const { world: w } = useGame();
  const captain = captainOf(w, team);
  return (
    <article className={`trophy-lift ${big ? 'is-big' : ''}`}>
      <span className="trophy-lift-kicker">{big ? ES.stage.worldChampion : ES.stage.championOf(countryName(team.region))}</span>
      <div className="trophy-lift-art">
        <Shield team={team} size={big ? 150 : 96} />
        {captain && <Portrait player={captain} house={houseColours(team)} size={big ? 150 : 96} />}
      </div>
      <strong className="trophy-lift-name">{team.name}</strong>
      {captain && <span className="trophy-lift-captain">{ES.stage.captain}: <AthleteName player={captain} /></span>}
      <p className="trophy-lift-joke">{championJoke(seed)}</p>
    </article>
  );
}

/* ------------------------------------------------------------ the awards gala */

function Gala() {
  const { world: w, revealAward, busy, locked } = useGame();
  const stage = currentStage(w);
  const items = useMemo(() => galaItems(w).slice(0, stage.total), [w, stage.total]);
  const shown = items.slice(0, stage.revealed);
  const next = stage.revealed < stage.total;
  return (
    <div className="gala">
      <header className="gala-head">
        <h1 className="showcase-title">{ES.gala.title}</h1>
        <p className="showcase-stake">{ES.gala.sub(w.season)}</p>
        <p className="showcase-voice">{pickLine(COMISIONADO, `gala-${w.seed}-${w.season}`)}</p>
        {seasonCoins(w) > 0 && <p className="stage-coins"><b>{ES.predict.tally(seasonCoins(w))}</b></p>}
      </header>
      {!items.length && <Blank>{ES.gala.nothing}</Blank>}
      <ol className="gala-list">
        {[...shown].reverse().map((item, i) => <GalaCard key={`${item.kind}-${item.playerId}-${i}`} item={item} fresh={i === 0} />)}
      </ol>
      <div className="gala-actions">
        {next
          ? <button type="button" className="gilt-button showcase-go" disabled={busy || locked} onClick={revealAward}>{ES.gala.reveal(stage.revealed + 1, stage.total)}</button>
          : <p className="stage-line">{ES.gala.allRevealed}</p>}
      </div>
    </div>
  );
}

function statsLine(p: Player) {
  const s = p.stats;
  const parts: [number, string][] = [[s.breaches, 'breaches'], [s.tackles, 'tackles'], [s.interceptions, 'interceptions'], [s.knockouts, 'knockouts'], [s.passingYards, 'passingYards'], [s.rushingYards, 'rushingYards'], [s.blocks, 'blocks']];
  const top = parts.filter(([v]) => v > 0).sort((a, b) => b[0] - a[0]).slice(0, 3);
  return [ES.gala.games(s.games), ...top.map(([v, k]) => `${v} ${ES.gala.stat[k]}`)].join(' · ');
}

function GalaCard({ item, fresh }: { item: GalaItem; fresh: boolean }) {
  const { player, team, world: w } = useGame();
  const p = player(item.playerId);
  const t = team(item.teamId);
  if (!p || !t) return null;
  const title = item.kind === 'award' ? awardName(item.award) : ES.gala.record;
  const detail = item.kind === 'award' ? statsLine(p) : ES.gala.recordLine(RECORD_STAT_ES[item.stat], item.value, item.scope);
  return (
    <li className={`gala-card ${fresh ? 'is-fresh' : ''} ${item.kind === 'award' && item.award === 'Golden Gargoyle' ? 'is-top' : ''}`}>
      <Portrait player={p} house={houseColours(t)} size={120} />
      <div className="gala-card-body">
        <span className="gala-award">{title}</span>
        <strong className="gala-name"><AthleteName player={p} /></strong>
        <span className="gala-club"><Shield team={t} size={26} />{t.name} · {ROLE_ES[p.role]}</span>
        <span className="gala-stats">{detail}</span>
        <q className="gala-quote">{acceptanceQuote(p.trait, `${w.season}-${p.id}-${title}`).replace(/[«»]/g, '')}</q>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------ market and pre-season */

function Market() {
  return (
    <div className="spread stage-page">
      <section className="page verso">
        <h1 className="folio-title">{ES.market.title}</h1>
        <p className="folio-sub">{ES.market.body}</p>
      </section>
      <section className="page recto" />
    </div>
  );
}

function Preseason() {
  const { world: w, player, team } = useGame();
  const log = w.offseasonLog;
  const retired = (log?.retired ?? []).map((id) => player(id)).filter((p): p is Player => !!p).sort((a, b) => b.fame - a.fame).slice(0, 8);
  // A player traded twice in one market shows once: first club to final club.
  const moves = new Map<string, { playerId: string; from: string; to: string }>();
  for (const t of log?.transfers ?? []) { const seen = moves.get(t.playerId); moves.set(t.playerId, { playerId: t.playerId, from: seen?.from ?? t.from, to: t.to }); }
  const transfers = [...moves.values()].filter((t) => t.from !== t.to).map((t) => ({ ...t, p: player(t.playerId) })).filter((t) => t.p && !t.p.retired).sort((a, b) => b.p!.rating - a.p!.rating).slice(0, 8);
  const rookies = (log?.rookies ?? []).map((id) => player(id)).filter((p): p is Player => !!p && !p.retired).sort((a, b) => b.potential - a.potential).slice(0, 6);
  return (
    <div className="spread stage-page">
      <section className="page verso">
        <h1 className="folio-title">{ES.preseason.title}</h1>
        <p className="folio-sub">{ES.preseason.sub(w.season + 1)}</p>
        <h2 className="page-head small">{ES.preseason.retired}</h2>
        {retired.length ? (
          <ul className="preseason-list">
            {retired.map((p, i) => (
              <li key={p.id}>
                <AthleteName player={p} /> <small>{team(p.teamId)?.nickname} · {ES.preseason.career(p.seasons, p.career.breaches)}</small>
                <p>{farewellLine(w.season + i)}</p>
              </li>
            ))}
          </ul>
        ) : <Blank>{ES.preseason.noneRetired}</Blank>}
      </section>
      <section className="page recto">
        <h2 className="page-head small">{ES.preseason.transfers}</h2>
        <ul className="preseason-list">
          {transfers.map((t) => <li key={t.playerId}><AthleteName player={t.p} /> <small>{ROLE_ES[t.p!.role]} · {t.p!.rating} · {ES.preseason.moved(team(t.from)?.nickname ?? '?', team(t.to)?.nickname ?? '?')}</small></li>)}
        </ul>
        <h2 className="page-head small spaced">{ES.preseason.rookies}</h2>
        <ul className="preseason-list">
          {rookies.map((p) => <li key={p.id}><AthleteName player={p} /> <small>{team(p.teamId)?.nickname} · {ROLE_ES[p.role]} · {ES.preseason.potential(p.potential)}</small></li>)}
        </ul>
      </section>
    </div>
  );
}
