import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useWorld } from '../game/useWorld';
import { routeKey, useRoute, type Route, type Section } from '../game/route';
import { GameContext, stageOf, type Game } from '../game/context';
import { ArtDefs, Hourglass, Quill } from '../art/Ornament';
import { roman } from '../art/hash';
import type { World } from '../types';
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

const RIBBONS: { section: Section; name: string; gloss: string; silk: string }[] = [
  { section: 'chronicle', name: 'Chronicle', gloss: 'news', silk: 'var(--vermilion)' },
  { section: 'tourneys', name: 'Tourneys', gloss: 'competitions', silk: 'var(--lapis)' },
  { section: 'bestiary', name: 'Bestiary', gloss: 'athletes', silk: 'var(--verdigris)' },
  { section: 'armorial', name: 'Armorial', gloss: 'clubs', silk: 'var(--gold-deep)' },
  { section: 'lists', name: 'The Lists', gloss: 'matches', silk: 'var(--murex)' },
  { section: 'rolls', name: 'Rolls', gloss: 'statistics', silk: 'var(--oxblood)' },
  { section: 'annals', name: 'Annals', gloss: 'history', silk: 'var(--sable)' },
];

const SECTION_OF: Record<Route['kind'], Section | null> = { section: null, athlete: 'bestiary', house: 'armorial', contest: 'lists' };

export default function App() {
  const game = useWorld();
  const { route, go } = useRoute();
  const key = routeKey(route);
  const [turning, setTurning] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setTurning((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [key]);

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
      busy: !!game.busy,
      locked: game.conflict,
      importFile: game.importFile,
      newUniverse: game.newUniverse,
    };
  }, [game.world, game.busy, game.conflict, go, game.advance, game.importFile, game.newUniverse]);

  if (!ctx) return <ClosedBook />;
  const w = ctx.world;
  const active = route.kind === 'section' ? route.section : SECTION_OF[route.kind];

  return (
    <GameContext.Provider value={ctx}>
      <ArtDefs />
      <div className="desk">
        <a className="skip" href="#folio">Skip to the page</a>
        <nav className="ribbons" aria-label="Sections of the chronicle">
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
              <span className="ribbon-gloss">{r.gloss}</span>
            </a>
          ))}
        </nav>
        <div className="codex">
          <span className="boss boss-tl" aria-hidden="true" /><span className="boss boss-tr" aria-hidden="true" />
          <span className="boss boss-bl" aria-hidden="true" /><span className="boss boss-br" aria-hidden="true" />
          <div className="book">
            <Headband world={w} save={game.save} onColophon={() => go({ kind: 'section', section: 'colophon' })} />
            <main id="folio" className="folio-stage" key={key}>
              <Page route={route} />
            </main>
            {turning > 0 && <div className="leaf" key={turning} aria-hidden="true"><div className="leaf-front" /><div className="leaf-back" /></div>}
            <div className="gutter-shade" aria-hidden="true" />
          </div>
        </div>
        <TurnCorner world={w} busy={!!game.busy} locked={game.conflict} onAdvance={(n) => void game.advance(n)} />
      </div>
      {game.notice && (
        <aside className="marginal-note" role="status">
          <span className="nb">Nota bene</span>
          <p>{game.notice}</p>
          <button type="button" onClick={() => game.setNotice('')} aria-label="Dismiss note">Dismiss</button>
        </aside>
      )}
      {game.conflict && (
        <div className="conflict-slip" role="alert">
          <p><strong>Another tab has written in this book.</strong> The quill is stayed so nothing is overwritten.</p>
          <button type="button" onClick={() => void game.refreshLatest()}>Read the newest copy</button>
        </div>
      )}
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
    default: return <Chronicle />;
  }
}

const SAVE_TEXT: Record<string, string> = {
  loading: 'Opening the archive', saving: 'The ink is drying', saved: 'Kept safe in the archive', new: 'A fresh chronicle',
  unavailable: 'The archive is unavailable', conflict: 'Stayed by another tab',
};

function Headband({ world, save, onColophon }: { world: World; save: string; onColophon: () => void }) {
  return (
    <header className="headband">
      <div className="headband-title">
        <span className="wordmark">Riftball</span>
        <span className="wordmark-sub">the World Chronicle</span>
      </div>
      <Calendar world={world} />
      <div className="headband-meta">
        <span className="running-head">Year {roman(world.season)} · {world.week <= 18 ? `Round ${world.week}` : stageOf(world.week)}</span>
        <button type="button" className="colophon-link" onClick={onColophon}>
          <i className={`save-mark save-${save}`} aria-hidden="true" />{SAVE_TEXT[save] ?? save}
          <span className="colophon-word">· Colophon</span>
        </button>
      </div>
    </header>
  );
}

/** A Book of Hours calendar: 26 weeks, playoffs written as red-letter days. */
function Calendar({ world }: { world: World }) {
  return (
    <div className="calendar" aria-label={`Week ${world.week} of 26, ${stageOf(world.week)}`}>
      <ol>
        {Array.from({ length: 26 }, (_, i) => {
          const wk = i + 1;
          const cls = wk < world.week ? 'is-past' : wk === world.week ? 'is-now' : '';
          const kind = wk <= 18 ? 'league' : wk <= 23 ? 'red-letter' : 'winter';
          return <li key={wk} className={`${cls} ${kind}`} title={`Week ${wk}`}><span>{wk === world.week ? roman(wk) : ''}</span></li>;
        })}
      </ol>
      <div className="calendar-key"><span>League</span><span className="red">Red-letter weeks: the playoffs and the Grand Rift</span><span>Winter</span></div>
    </div>
  );
}

function TurnCorner({ world, busy, locked, onAdvance }: { world: World; busy: boolean; locked: boolean; onAdvance: (n: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', off);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
  }, [open]);
  const options = [
    { n: 4, label: 'Four weeks', note: 'a month of contests' },
    { n: 27 - world.week, label: "To the season's end", note: 'crown this year’s champion' },
    { n: 26, label: 'A full year', note: 'one turn of the calendar' },
    { n: 260, label: 'A decade', note: 'a new generation of legends' },
  ];
  const disabled = busy || locked;
  return (
    <div className={`turn-corner ${open ? 'is-open' : ''}`} ref={ref}>
      {open && (
        <div className="turn-menu" role="menu">
          <p className="turn-menu-head">Write further ahead</p>
          {options.map((o) => (
            <button key={o.label} role="menuitem" type="button" disabled={disabled} onClick={() => { setOpen(false); onAdvance(o.n); }}>
              <strong>{o.label}</strong><span>{o.note} · {o.n} {o.n === 1 ? 'week' : 'weeks'}</span>
            </button>
          ))}
        </div>
      )}
      <div className="turn-actions">
        <button type="button" className="turn-more" aria-expanded={open} aria-haspopup="menu" disabled={disabled} onClick={() => setOpen(!open)}>
          Further
        </button>
        <button type="button" className="turn-page" disabled={disabled} onClick={() => onAdvance(1)}>
          <Hourglass size={26} />
          <span><strong>Turn the page</strong><small>{world.week >= 26 ? 'begin a new year' : `play week ${world.week}`}</small></span>
        </button>
      </div>
    </div>
  );
}

function Scriptorium({ current, total }: { current: number; total: number }) {
  return (
    <div className="scriptorium" role="alertdialog" aria-modal="true" aria-label="The scribes are writing">
      <div className="scriptorium-slip">
        <Quill size={72} />
        <h2>The scribes are writing</h2>
        <p>Triumphs, tragedies and spectacularly questionable fouls are being set down in ink.</p>
        <div className="scriptorium-rule"><span style={{ width: `${(current / Math.max(1, total)) * 100}%` }} /></div>
        <p className="scriptorium-count">Week {current} of {total}</p>
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
          <span className="wordmark">Riftball</span>
          <span className="wordmark-sub">the World Chronicle</span>
        </div>
        <p className="cover-note">Unbuckling the clasps…</p>
      </div>
    </div>
  );
}
