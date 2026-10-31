import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useWorld } from '../game/useWorld';
import { routeKey, useRoute, type Route, type Section } from '../game/route';
import { GameContext, stageOf, type Game } from '../game/context';
import { ArtDefs, Hourglass, Quill } from '../art/Ornament';
import type { World } from '../types';
import { SEASON, currentStage, isStageComplete, pendingFixtures } from '../engine';
import { ES } from '../i18n/es';
import { Chronicle } from '../screens/Chronicle';
import { Tourneys } from '../screens/Tourneys';
import { Bestiary } from '../screens/Bestiary';
import { AthleteFolio } from '../screens/AthleteFolio';
import { Armorial } from '../screens/Armorial';
import { HouseFolio } from '../screens/HouseFolio';
import { Lists } from '../screens/Lists';
import { ContestFolio } from '../screens/ContestFolio';
import { Rolls } from '../screens/Rolls';
import { Annals } from '../screens/Annals';
import { Colophon } from '../screens/Colophon';
import { StageScreen } from '../screens/Stage';

// Six main sections; Ajustes sits behind the gear in the header.
const RIBBONS: { section: Section; name: string; silk: string }[] = [
  { section: 'chronicle', name: ES.nav.chronicle, silk: 'var(--vermilion)' },
  { section: 'tourneys', name: ES.nav.tourneys, silk: 'var(--lapis)' },
  { section: 'bestiary', name: ES.nav.athletes, silk: 'var(--verdigris)' },
  { section: 'armorial', name: ES.nav.clubs, silk: 'var(--gold-deep)' },
  { section: 'rolls', name: ES.nav.stats, silk: 'var(--oxblood)' },
  { section: 'annals', name: ES.nav.history, silk: 'var(--sable)' },
];

const SECTION_OF: Record<Route['kind'], Section | null> = { section: null, athlete: 'bestiary', house: 'armorial', contest: 'tourneys' };

export default function App() {
  const game = useWorld();
  const { route, go } = useRoute();
  const key = routeKey(route);
  const [turning, setTurning] = useState(0);
  const [newSeason, setNewSeason] = useState<number | null>(null);
  const first = useRef(true);
  const lastWeek = useRef<string | null>(null);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setTurning((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [key]);

  // When the calendar enters an event (a showcase, the gala, the market), open the event page.
  // A new season gets its own card. Loading a save never jumps anywhere.
  const w0 = game.world;
  const weekKey = w0 ? `${w0.season}:${w0.week}` : null;
  useEffect(() => {
    if (!w0 || !weekKey) return;
    const before = lastWeek.current;
    lastWeek.current = weekKey;
    if (before === null || before === weekKey) return;
    const stage = currentStage(w0);
    if (stage.kind !== 'league') go({ kind: 'section', section: 'evento' });
    else if (Number(before.split(':')[0]) < w0.season) { setNewSeason(w0.season); go({ kind: 'section', section: 'chronicle' }); }
  }, [weekKey, w0, go]);

  const ctx = useMemo<Game | null>(() => {
    const w = game.world;
    if (!w) return null;
    const teams = new Map(w.teams.map((t) => [t.id, t] as const));
    const players = new Map(w.players.concat(w.retired).map((p) => [p.id, p] as const));
    return {
      world: w,
      go,
      team: (id) => teams.get(id),
      player: (id) => players.get(id),
      advance: (n) => { void game.advance(n); },
      resolveFixture: game.resolveFixture,
      resolveFixtures: game.resolveFixtures,
      dismissIntro: game.dismissIntro,
      revealAward: game.revealAward,
      simulateToNextEvent: () => { void game.simulateToNextEvent(); },
      busy: !!game.busy,
      locked: game.conflict,
      importFile: game.importFile,
      newUniverse: game.newUniverse,
    };
  }, [game.world, game.busy, game.conflict, go, game.advance, game.resolveFixture, game.resolveFixtures, game.dismissIntro, game.revealAward, game.simulateToNextEvent, game.importFile, game.newUniverse]);

  if (game.legacy) return <LegacyBook onExport={game.exportLegacy} onFresh={() => { if (window.confirm(ES.confirm.legacyFresh)) void game.startFresh(); }} />;
  if (!ctx) return <ClosedBook />;
  const w = ctx.world;
  const active = route.kind === 'section' ? (route.section === 'lists' ? 'tourneys' : route.section) : SECTION_OF[route.kind];

  return (
    <GameContext.Provider value={ctx}>
      <ArtDefs />
      <div className="desk">
        <a className="skip" href="#folio">{ES.common.skip}</a>
        <div className="masthead">
        <nav className="ribbons" aria-label={ES.nav.label}>
          {RIBBONS.map((r) => (
            <a
              key={r.section}
              href={`#/${r.section}`}
              className={`ribbon ${active === r.section ? 'is-open' : ''}`}
              style={{ '--silk': r.silk } as CSSProperties}
              aria-current={active === r.section ? 'page' : undefined}
              onClick={(e) => { e.preventDefault(); go({ kind: 'section', section: r.section }); }}
            >
              <span className="ribbon-name">{r.name}</span>
                          </a>
          ))}
        </nav>
        </div>
        <div className="codex">
          <span className="boss boss-tl" aria-hidden="true" /><span className="boss boss-tr" aria-hidden="true" />
          <span className="boss boss-bl" aria-hidden="true" /><span className="boss boss-br" aria-hidden="true" />
          <div className="book">
            <Headband world={w} save={game.save} onColophon={() => go({ kind: 'section', section: 'colophon' })} />
            <ControlBar world={w} busy={!!game.busy} locked={game.conflict}
              onEvent={active === 'evento' ? undefined : () => go({ kind: 'section', section: 'evento' })}
              onAdvance={() => void game.advance(1)} onSimulate={() => void game.simulateToNextEvent()} />
            <main id="folio" className="folio-stage" key={key}>
              <Page route={route} />
            </main>
            {turning > 0 && <div className="leaf" key={turning} aria-hidden="true"><div className="leaf-front" /><div className="leaf-back" /></div>}
            <div className="gutter-shade" aria-hidden="true" />
          </div>
        </div>
      </div>
      {game.notice && (
        <aside className="marginal-note" role="status">
          <span className="nb">{ES.common.noticeLabel}</span>
          <p>{game.notice}</p>
          <button type="button" onClick={() => game.setNotice('')} aria-label={ES.common.closeNotice}>{ES.common.close}</button>
        </aside>
      )}
      {game.conflict && (
        <div className="conflict-slip" role="alert">
          <p><strong>{ES.conflict.body}</strong> {ES.conflict.detail}</p>
          <button type="button" onClick={() => void game.refreshLatest()}>{ES.conflict.refresh}</button>
        </div>
      )}
      {newSeason !== null && <NewSeasonCard season={newSeason} onClose={() => setNewSeason(null)} />}
      {game.busy && <Scriptorium current={game.busy.current} total={game.busy.total} />}
    </GameContext.Provider>
  );
}

function Page({ route }: { route: Route }) {
  if (route.kind === 'athlete') return <AthleteFolio id={route.id} />;
  if (route.kind === 'house') return <HouseFolio id={route.id} />;
  if (route.kind === 'contest') return <ContestFolio id={route.id} />;
  switch (route.section) {
    case 'tourneys': return <Tourneys />;
    case 'bestiary': return <Bestiary />;
    case 'armorial': return <Armorial />;
    case 'lists': return <Lists />;
    case 'rolls': return <Rolls />;
    case 'annals': return <Annals />;
    case 'colophon': return <Colophon />;
    case 'evento': return <StageScreen />;
    default: return <Chronicle />;
  }
}

type MainAction = { label: string; sub: string; enabled: boolean };

/** What the main button does next, in words. It always matches what the engine will do. */
function mainAction(w: World): MainAction {
  const stage = currentStage(w);
  const done = isStageComplete(w);
  if (stage.kind === 'showcase') {
    if (!done) return { label: ES.bar.pending(pendingFixtures(w).length), sub: ES.bar.pendingSub, enabled: false };
    const next: Record<number, string> = { [SEASON.NATIONAL_FINAL]: ES.bar.toWorldCup, [SEASON.WORLD_GROUPS]: ES.bar.toSemis, [SEASON.WORLD_SEMI]: ES.bar.toFinal, [SEASON.WORLD_FINAL]: ES.bar.toGala };
    return { label: next[w.week] ?? ES.stage.continue, sub: ES.bar.continueSub, enabled: true };
  }
  if (stage.kind === 'awards') {
    if (!done) return { label: ES.bar.awardsPending(stage.total - stage.revealed), sub: ES.bar.awardsPendingSub, enabled: false };
    return { label: ES.bar.toMarket, sub: ES.bar.continueSub, enabled: true };
  }
  if (stage.kind === 'market') return { label: ES.bar.openMarket, sub: ES.bar.openMarketSub, enabled: true };
  if (stage.kind === 'preseason') return { label: ES.bar.startSeason(w.season + 1), sub: ES.bar.continueSub, enabled: true };
  if (w.week === SEASON.NATIONAL_SEMI) return { label: ES.bar.toNationalFinals, sub: ES.bar.toNationalFinalsSub, enabled: true };
  return { label: ES.bar.playWeek(w.week), sub: ES.bar.playWeekSub(pendingFixtures(w).length), enabled: true };
}

/** Where the season stands, as an index into ES.progress. */
function progressIndex(w: World): number {
  if (w.week <= SEASON.NATIONAL_SEMI) return 0;
  if (w.week === SEASON.NATIONAL_FINAL) return 1;
  if (w.week === SEASON.WORLD_GROUPS) return 2;
  if (w.week === SEASON.WORLD_SEMI) return 3;
  if (w.week === SEASON.WORLD_FINAL) return 4;
  if (w.week === SEASON.AWARDS) return 5;
  if (w.week === SEASON.MARKET) return 6;
  return 7;
}

/** The next stop for "simulate to the next event". Simulation stops on every non-league week. */
function nextEventName(w: World): string {
  const at = progressIndex(w);
  return at === 0 || at === 7 ? ES.progress[1] : ES.progress[Math.min(7, at + 1)];
}

/** The one control bar: a main button that says exactly what happens next, and one shortcut. */
function ControlBar({ world, busy, locked, onAdvance, onSimulate, onEvent }: { world: World; busy: boolean; locked: boolean; onAdvance: () => void; onSimulate: () => void; onEvent?: () => void }) {
  const action = mainAction(world);
  const stage = currentStage(world);
  const off = busy || locked;
  const blocked = !isStageComplete(world);
  const at = progressIndex(world);
  const target = nextEventName(world);
  return (
    <div className="control-bar" role="group" aria-label={ES.bar.label}>
      <ol className="season-progress">
        {ES.progress.map((label, i) => <li key={label} className={i < at ? 'is-done' : i === at ? 'is-now' : ''} aria-current={i === at ? 'step' : undefined}>{label}</li>)}
      </ol>
      <div className="control-actions">
        {onEvent && stage.kind !== 'league' && <button type="button" className="ink-button" onClick={onEvent}>{ES.bar.toEvent}</button>}
        <button type="button" className="ink-button control-simulate" disabled={off || blocked} onClick={onSimulate}>
          <strong>{ES.bar.simulate}</strong><small>{ES.bar.simulateSub(target)}</small>
        </button>
        <button type="button" className="turn-page control-main" disabled={off || !action.enabled} onClick={onAdvance}>
          <Hourglass size={26} />
          <span><strong>{action.label}</strong><small>{action.sub}</small></span>
        </button>
      </div>
    </div>
  );
}

function Headband({ world, save, onColophon }: { world: World; save: string; onColophon: () => void }) {
  return (
    <header className="headband">
      <div className="headband-title">
        <span className="wordmark">{ES.appName}</span>
        <span className="wordmark-sub">{ES.appSub}</span>
      </div>
      <Calendar world={world} />
      <div className="headband-meta">
        <span className="running-head">{ES.headband.when(world.season, world.week <= 22 ? ES.headband.round(world.week) : stageOf(world.week))}</span>
        <button type="button" className="colophon-link" onClick={onColophon} aria-label={ES.settings.open}>
          <i className={`save-mark save-${save}`} aria-hidden="true" />{ES.save[save] ?? save}
          <span className="colophon-word"><Gear /> {ES.nav.settings}</span>
        </button>
      </div>
    </header>
  );
}

function Gear() {
  return (
    <svg className="gear" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6ZM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" transform="translate(-1 0)" />
    </svg>
  );
}

/** A Book of Hours calendar: 30 weeks, finals written as red-letter days. */
function Calendar({ world }: { world: World }) {
  return (
    <div className="calendar" aria-label={ES.headband.calendar(world.week, stageOf(world.week))}>
      <ol>
        {Array.from({ length: 30 }, (_, i) => {
          const wk = i + 1;
          const cls = wk < world.week ? 'is-past' : wk === world.week ? 'is-now' : '';
          const kind = wk <= 22 ? 'league' : wk <= 27 ? 'red-letter' : 'winter';
          return <li key={wk} className={`${cls} ${kind}`} title={ES.headband.weekTitle(wk)}><span>{wk === world.week ? wk : ''}</span></li>;
        })}
      </ol>
      <div className="calendar-key"><span>{ES.headband.keyLeague}</span><span className="red">{ES.headband.keyFinals}</span><span>{ES.headband.keyWinter}</span></div>
    </div>
  );
}

function Scriptorium({ current, total }: { current: number; total: number }) {
  return (
    <div className="scriptorium" role="alertdialog" aria-modal="true" aria-label={ES.bar.busyTitle}>
      <div className="scriptorium-slip">
        <Quill size={72} />
        <h2>{ES.bar.busyTitle}</h2>
        <p>{ES.bar.busyBody}</p>
        <div className="scriptorium-rule"><span style={{ width: `${(current / Math.max(1, total)) * 100}%` }} /></div>
        <p className="scriptorium-count">{ES.bar.busyCount(current, total)}</p>
      </div>
    </div>
  );
}

function LegacyBook({ onExport, onFresh }: { onExport: () => void; onFresh: () => void }) {
  return (
    <div className="closed-book">
      <div className="cover legacy-cover" role="alertdialog" aria-labelledby="legacy-title">
        <span className="boss boss-tl" /><span className="boss boss-tr" /><span className="boss boss-bl" /><span className="boss boss-br" />
        <div className="cover-plate">
          <span className="wordmark">{ES.appName}</span>
          <span className="wordmark-sub">{ES.appSub}</span>
        </div>
        <div className="legacy-slip">
          <h1 id="legacy-title">{ES.legacy.title}</h1>
          <p>{ES.legacy.body}</p>
          <p>{ES.legacy.hint}</p>
          <div className="legacy-actions">
            <button type="button" className="ink-button" onClick={onExport}>{ES.legacy.export}</button>
            <button type="button" className="gilt-button" onClick={onFresh}>{ES.legacy.fresh}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewSeasonCard({ season, onClose }: { season: number; onClose: () => void }) {
  return (
    <div className="scriptorium" role="dialog" aria-modal="true" aria-labelledby="new-season-title">
      <div className="scriptorium-slip new-season">
        <h2 id="new-season-title">{ES.newSeason.title}</h2>
        <p>{ES.newSeason.body(season)}</p>
        <button type="button" className="gilt-button" autoFocus onClick={onClose}>{ES.newSeason.go}</button>
      </div>
    </div>
  );
}

function ClosedBook() {
  return (
    <div className="closed-book">
      <div className="cover">
        <span className="boss boss-tl" /><span className="boss boss-tr" /><span className="boss boss-bl" /><span className="boss boss-br" />
        <div className="cover-plate">
          <span className="wordmark">{ES.appName}</span>
          <span className="wordmark-sub">{ES.appSub}</span>
        </div>
        <p className="cover-note">{ES.loading}</p>
      </div>
    </div>
  );
}
