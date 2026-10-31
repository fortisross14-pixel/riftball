import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Match, MatchEvent, Player, Team } from '../types';
import { getPlayer, lineup, teamRating, playProfile } from '../engine';
import { nfmt, PHASE_NAME, useGame } from '../game/context';
import { houseColours, Shield } from '../art/Heraldry';
import { RoleGlyph, WaxSeal } from '../art/Ornament';
import { roman } from '../art/hash';
import { AthleteName, Blank, Choice, HouseName, Miniature } from '../ui/bits';
import { realmName } from './Tourneys';
import { ES, filosofia, raza, rol } from '../i18n/es';

const T = ES.contest;

/* ------------------------------------------------------------ event vocabulary */

/** The glossary: calm words for lists, loud ones for the arena. */
const KIND_WORD = ES.termPlain as Record<MatchEvent['kind'], string>;
const KIND_SHOUT = ES.term as Record<MatchEvent['kind'], string>;
const KIND_WEIGHT: Record<MatchEvent['kind'], number> = { breach: 8, gate: 4, aftershock: 2, interception: 5, knockout: 4, fumble: 3, bigplay: 3, injury: 2, whistle: 1, penalty: 2, spark: 2 };
const LOUD = new Set<MatchEvent['kind']>(['breach', 'gate', 'interception', 'knockout', 'fumble', 'spark']);

/** Which side was carrying the ball when this was written down. Event x is measured from the attackers' own end. */
function attackerOf(e: MatchEvent, m: Match): string {
  const other = e.teamId === m.home ? m.away : m.home;
  if (e.kind === 'interception' || e.kind === 'knockout') return other;
  if (e.kind === 'penalty' && /FALTA PERSONAL|swinging|Ten metres/i.test(e.text)) return other;
  return e.teamId;
}
/** Field position as a share of the pitch, home end at 0. Home attacks to the right. */
function fieldX(e: MatchEvent, m: Match) {
  const x = Math.max(2, Math.min(98, e.x));
  return attackerOf(e, m) === m.home ? x : 100 - x;
}

export function ContestFolio({ id }: { id: string }) {
  const { world: w, team, go, resolveFixture, busy, locked } = useGame();
  const [quick, setQuick] = useState(false);
  const m = w.matches.find((x) => x.id === id);
  if (!m) return <div className="spread"><section className="page verso"><h1 className="folio-title">{ES.common.tornPage}</h1><Blank>{T.missing}</Blank></section><section className="page recto" /></div>;
  const home = team(m.home);
  const away = team(m.away);
  if (!home || !away) return <Blank>{T.missingClub}</Blank>;
  if (m.homeScore === null) return <ChallengePreview m={m} home={home} away={away} canPlay={m.season === w.season && m.week === w.week} onWatch={() => void resolveFixture(m.id)} onQuick={() => { setQuick(true); void resolveFixture(m.id); }} disabled={busy || locked} />;
  return <Replay key={`${m.id}-${quick ? 'quick' : 'watch'}`} m={m} home={home} away={away} initiallyRevealed={quick} onHouse={(tid) => go({ kind: 'house', id: tid })} />;
}

/* ------------------------------------------------------------ the replay */

type Tab = 'contest' | 'ledger' | 'drives';

function Replay({ m, home, away, initiallyRevealed }: { m: Match; home: Team; away: Team; initiallyRevealed?: boolean; onHouse: (id: string) => void }) {
  const { world: w } = useGame();
  const events = m.events;
  const [index, setIndex] = useState(initiallyRevealed ? m.events.length : -1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState<Tab>('contest');
  const [focus, setFocus] = useState<string | null>(null);
  const revealed = index >= events.length;
  const current = index >= 0 && index < events.length ? events[index] : undefined;
  const shown = events.slice(0, Math.max(0, Math.min(events.length, index + 1)));
  const score = revealed ? [m.homeScore ?? 0, m.awayScore ?? 0] : current ? [current.homeScore, current.awayScore] : [0, 0];
  const state = revealed ? 'revealed' : index < 0 ? 'sealed' : 'unfolding';

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setIndex((n) => Math.min(events.length, n + 1)), Math.max(220, 1100 / speed));
    return () => clearInterval(t);
  }, [playing, speed, events.length]);
  useEffect(() => { if (revealed && playing) setPlaying(false); }, [revealed, playing]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === ' ') { e.preventDefault(); setPlaying((p) => (revealed ? false : !p)); }
      if (e.key === 'ArrowRight') { setPlaying(false); setIndex((i) => Math.min(events.length, i + 1)); }
      if (e.key === 'ArrowLeft') { setPlaying(false); setIndex((i) => Math.max(-1, i - 1)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [events.length, revealed]);

  const starters = (t: Team): Player[] => {
    const ids = m.report?.starters[t.id];
    return ids ? ids.map((pid) => getPlayer(w, pid)).filter((p): p is Player => !!p) : lineup(w, t);
  };
  const homeEight = useMemo(() => starters(home).slice(0, 8), [m.id]);
  const awayEight = useMemo(() => starters(away).slice(0, 8), [m.id]);

  const balance = useMemo(() => {
    let h = 0, a = 0;
    for (const e of shown) { if (e.teamId === m.home) h += KIND_WEIGHT[e.kind]; else a += KIND_WEIGHT[e.kind]; }
    return { h, a };
  }, [shown.length, m.id]);

  const reveal = () => { setPlaying(false); setIndex(events.length); };

  return (
    <div className="spread contest">
      <section className="across contest-top">
        <Scoreboard m={m} home={home} away={away} score={score} state={state} minute={current?.minute} />
        <Arena m={m} home={home} away={away} events={shown} current={current} homeEight={homeEight} awayEight={awayEight} focus={focus} revealed={revealed} />
        <div className="transport" role="group" aria-label={T.controls}>
          <div className="transport-buttons">
            <button type="button" className="ink-button" onClick={() => { setPlaying(false); setIndex(-1); }} disabled={index < 0}>{T.fromStart}</button>
            <button type="button" className="ink-button" onClick={() => { setPlaying(false); setIndex((i) => Math.max(-1, i - 1)); }} disabled={index < 0} aria-label={T.prev}>{T.back}</button>
            <button type="button" className="gilt-button play-button" onClick={() => { if (revealed) setIndex(-1); setPlaying(!playing); }}>
              {playing ? T.pause : revealed ? T.again : index < 0 ? T.begin : T.playOn}
            </button>
            <button type="button" className="ink-button" onClick={() => { setPlaying(false); setIndex((i) => Math.min(events.length, i + 1)); }} disabled={revealed} aria-label={T.nextLabel}>{T.next}</button>
            <Choice label={T.pace} compact value={speed} onChange={setSpeed} options={[{ value: 0.5, label: '½' }, { value: 1, label: '1×' }, { value: 2, label: '2×' }, { value: 4, label: '4×' }]} />
          </div>
          <Timeline m={m} index={index} onSeek={(i) => { setPlaying(false); setIndex(i); }} />
          <div className="balance" aria-label={T.balance}>
            <span>{home.nickname}</span>
            <div className="balance-beam">
              <i style={{ width: `${balance.h + balance.a ? (balance.h / (balance.h + balance.a)) * 100 : 50}%`, background: houseColours(home)[0] }} />
              <i style={{ background: houseColours(away)[0] }} />
            </div>
            <span>{away.nickname}</span>
          </div>
          <p className="keys-hint">{T.keys}</p>
        </div>
      </section>

      <nav className="contest-tabs across" aria-label={T.views}>
        {([['contest', T.tabs.contest], ['ledger', T.tabs.ledger], ['drives', T.tabs.drives]] as [Tab, string][]).map(([k, label]) => (
          <button key={k} type="button" className={tab === k ? 'is-on' : ''} aria-pressed={tab === k} onClick={() => { setTab(k); setPlaying(false); }}>{label}</button>
        ))}
      </nav>

      {tab === 'contest' && <>
        <section className="page verso">
          <h2 className="page-head">{T.logTitle}</h2>
          <p className="aside-note">{index < 0 ? T.logEmpty : T.logCount(shown.length, events.length, focus ? getPlayer(w, focus)?.name ?? T.oneAthlete : undefined)}</p>
          <ol className="contest-log">
            {shown.slice().reverse().map((e, i) => {
              const dim = focus && e.playerId !== focus;
              return (
                <li key={`${shown.length - i}-${e.minute}`} className={`moment kind-${e.kind} ${i === 0 ? 'is-new' : ''} ${dim ? 'is-dim' : ''} ${e.teamId === m.home ? 'is-home' : 'is-away'}`}>
                  <span className="moment-min">{e.minute}′</span>
                  <span className="moment-mark" style={{ '--side': houseColours(e.teamId === m.home ? home : away)[0] } as CSSProperties} />
                  <div><strong>{KIND_WORD[e.kind]}</strong><p>{e.text}</p></div>
                  <span className="moment-score">{e.homeScore}–{e.awayScore}</span>
                </li>
              );
            })}
          </ol>
          {revealed && <p className="contest-end">{m.winner ? T.endWin(m.winner === m.home ? home.name : away.name) : T.endDraw}</p>}
        </section>
        <section className="page recto">
          <Spotlight event={current} m={m} home={home} away={away} />
          <h2 className="page-head small spaced">{T.eights}</h2>
          <p className="aside-note">{T.eightsNote}</p>
          <div className="eights">
            {[[home, homeEight], [away, awayEight]].map(([t, list]) => (
              <div key={(t as Team).id}>
                <h3><HouseName team={t as Team} size={26} /></h3>
                <ul>
                  {(list as Player[]).map((p, i) => (
                    <li key={p.id}>
                      <button type="button" className={`thread ${focus === p.id ? 'is-on' : ''}`} aria-pressed={focus === p.id} onClick={() => setFocus(focus === p.id ? null : p.id)}>
                        <span className="thread-no">{i + 1}</span>
                        <Miniature player={p} size={40} />
                        <span><strong>{p.name}</strong><small><RoleGlyph role={p.role} size={14} />{rol(p.role)} · {p.rating}</small></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </>}

      {tab === 'ledger' && (revealed ? <Ledger m={m} home={home} away={away} /> : <Sealed onReveal={reveal} />)}
      {tab === 'drives' && (revealed ? <Drivebook m={m} home={home} away={away} /> : <Sealed onReveal={reveal} />)}
    </div>
  );
}

/* ------------------------------------------------------------ scoreboard banner */

function Scoreboard({ m, home, away, score, state, minute }: { m: Match; home: Team; away: Team; score: number[]; state: 'sealed' | 'unfolding' | 'revealed' | 'challenge'; minute?: number }) {
  const { team } = useGame();
  const winner = m.winner ? team(m.winner) : undefined;
  return (
    <header className={`scoreboard is-${state}`}>
      <div className="sb-side">
        <Shield team={home} size={92} title />
        <div><strong>{home.name}</strong><small>{realmName(home.region)} · {T.home}</small></div>
      </div>
      <div className="sb-centre">
        {state === 'sealed' ? (
          <div className="sb-seal"><WaxSeal size={86} /><span>{T.sealed}</span></div>
        ) : state === 'challenge' ? (
          <span className="sb-score is-versus">{T.versus}</span>
        ) : (
          <span className="sb-score" aria-live="polite"><b key={`h${score[0]}`}>{score[0]}</b><i>–</i><b key={`a${score[1]}`}>{score[1]}</b></span>
        )}
        <span className="sb-state">
          {state === 'revealed' ? (winner ? T.winner(winner.nickname) : T.draw) : state === 'unfolding' ? T.minute(minute ?? 0) : state === 'sealed' ? T.spoilerSafe : T.notYet}
        </span>
        <span className="sb-phase">{PHASE_NAME[m.phase]} · {ES.common.seasonWeek(m.season, m.week)}</span>
      </div>
      <div className="sb-side is-away">
        <div><strong>{away.name}</strong><small>{realmName(away.region)} · {T.away}</small></div>
        <Shield team={away} size={92} title />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------ the arena */

const FIELD = { x: 70, y: 52, w: 860, h: 336 };
const toX = (pct: number) => FIELD.x + 70 + (pct / 100) * (FIELD.w - 140);

function formation(ballPct: number, attack: boolean, side: 'home' | 'away') {
  const dir = side === 'home' ? 1 : -1;
  const rows = [0.16, 0.34, 0.5, 0.66, 0.84, 0.25, 0.75, 0.5];
  const depth = attack ? [-4, -5, -10, -5, -4, -15, -15, -22] : [5, 6, 8, 6, 5, 14, 14, 24];
  return rows.map((r, i) => ({ y0: attack ? r : Math.min(0.92, r + 0.07), x: Math.max(2, Math.min(98, ballPct + depth[i] * dir)), y: 0 })).map((s) => ({ x: s.x, y: FIELD.y + 24 + s.y0 * (FIELD.h - 48) }));
}

function Arena({ m, home, away, events, current, homeEight, awayEight, focus, revealed }: { m: Match; home: Team; away: Team; events: MatchEvent[]; current?: MatchEvent; homeEight: Player[]; awayEight: Player[]; focus: string | null; revealed: boolean }) {
  const [hc, hm] = houseColours(home);
  const [ac, am] = houseColours(away);
  const ball = current ? fieldX(current, m) : 50;
  const attacking = current ? attackerOf(current, m) : m.home;
  const homeSpots = formation(ball, attacking === m.home, 'home');
  const awaySpots = formation(ball, attacking === m.away, 'away');
  const trail = events.slice(-7).map((e) => `${toX(fieldX(e, m))},${FIELD.y + FIELD.h / 2 + ((e.minute * 37) % 120) - 60}`);
  const ballY = current ? FIELD.y + FIELD.h / 2 + ((current.minute * 37) % 120) - 60 : FIELD.y + FIELD.h / 2;
  const actor = current?.playerId;
  const crowd = useMemo(() => {
    const out: { x: number; y: number; c: string }[] = [];
    for (let i = 0; i < 150; i++) {
      const top = i % 2 === 0;
      const x = 30 + ((i * 53) % 940);
      const y = top ? 14 + ((i * 7) % 26) : 402 + ((i * 11) % 26);
      out.push({ x, y, c: x < 500 ? (i % 3 ? hc : hm) : (i % 3 ? ac : am) });
    }
    return out;
  }, [hc, hm, ac, am]);

  return (
    <div className="arena-frame">
      <svg viewBox="0 0 1000 440" className="arena" role="img" aria-label={current ? T.arenaAt(KIND_WORD[current.kind], current.minute, current.text) : T.arenaBefore}>
        <defs>
          <pattern id="mow" width="86" height="440" patternUnits="userSpaceOnUse"><rect width="43" height="440" fill="#5a8a3f" /><rect x="43" width="43" height="440" fill="#4f7d37" /></pattern>
          <radialGradient id="arena-light" cx="0.5" cy="0.45" r="0.65"><stop offset="0" stopColor="#fff6d0" stopOpacity="0.18" /><stop offset="1" stopColor="#000" stopOpacity="0.28" /></radialGradient>
        </defs>
        <rect width="1000" height="440" rx="18" fill="#3a2a1c" />
        <rect x="8" y="6" width="984" height="42" rx="8" fill="#2a1d14" />
        <rect x="8" y="392" width="984" height="42" rx="8" fill="#2a1d14" />
        {crowd.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={p.c} stroke="#1b120c" strokeWidth={1.2} />)}
        {[150, 300, 700, 850].map((x, i) => (
          <g key={x} className="pennant">
            <path d={`M${x} 0 L${x + 26} 0 L${x + 26} 40 L${x + 13} 32 L${x} 40 Z`} fill={i < 2 ? hc : ac} stroke="#1b120c" strokeWidth={1.5} />
            <path d={`M${x + 4} 6 L${x + 22} 6`} stroke={i < 2 ? hm : am} strokeWidth={3} />
          </g>
        ))}
        <rect x={FIELD.x} y={FIELD.y} width={FIELD.w} height={FIELD.h} fill="url(#mow)" stroke="#efe7d2" strokeWidth={3} />
        <rect x={FIELD.x} y={FIELD.y} width={70} height={FIELD.h} fill={hc} opacity={0.55} />
        <rect x={FIELD.x + FIELD.w - 70} y={FIELD.y} width={70} height={FIELD.h} fill={ac} opacity={0.55} />
        <path d={`M${FIELD.x + 70} ${FIELD.y} V${FIELD.y + FIELD.h} M${FIELD.x + FIELD.w - 70} ${FIELD.y} V${FIELD.y + FIELD.h}`} stroke="#efe7d2" strokeWidth={3} />
        {Array.from({ length: 9 }, (_, i) => {
          const x = toX((i + 1) * 10);
          return <g key={i}><path d={`M${x} ${FIELD.y} V${FIELD.y + FIELD.h}`} stroke="#efe7d2" strokeWidth={1.2} opacity={0.45} /><text x={x} y={FIELD.y + FIELD.h - 10} textAnchor="middle" fontFamily="var(--face-rubric)" fontSize={13} fill="#efe7d2" opacity={0.7}>{roman(i < 5 ? (i + 1) * 10 : (9 - i) * 10)}</text></g>;
        })}
        <path className="rift-line" d={`M500 ${FIELD.y} L494 ${FIELD.y + 60} L506 ${FIELD.y + 110} L492 ${FIELD.y + 170} L507 ${FIELD.y + 230} L495 ${FIELD.y + 290} L500 ${FIELD.y + FIELD.h}`} fill="none" stroke="#7af0ff" strokeWidth={3} />
        {[[FIELD.x + 22, hc, hm], [FIELD.x + FIELD.w - 22, ac, am]].map(([x, c, mtl]) => (
          <g key={String(x)}>
            <path d={`M${x} ${FIELD.y + FIELD.h / 2 - 46} V${FIELD.y + FIELD.h / 2 + 46}`} stroke="#2a231f" strokeWidth={8} strokeLinecap="round" />
            <path d={`M${Number(x) - 12} ${FIELD.y + FIELD.h / 2 - 46} H${Number(x) + 12} M${Number(x) - 12} ${FIELD.y + FIELD.h / 2 + 46} H${Number(x) + 12}`} stroke="#2a231f" strokeWidth={8} strokeLinecap="round" />
            <path d={`M${x} ${FIELD.y + FIELD.h / 2 - 46} V${FIELD.y + FIELD.h / 2 + 46}`} stroke={String(mtl)} strokeWidth={3} />
            <circle cx={Number(x)} cy={FIELD.y + 18} r={7} fill={String(c)} stroke="#1b120c" strokeWidth={1.5} />
          </g>
        ))}
        <text x={FIELD.x + 35} y={FIELD.y + FIELD.h / 2} textAnchor="middle" transform={`rotate(-90 ${FIELD.x + 35} ${FIELD.y + FIELD.h / 2})`} fontFamily="var(--face-display)" fontSize={22} fill="#fff6dc" opacity={0.9}>{home.nickname}</text>
        <text x={FIELD.x + FIELD.w - 35} y={FIELD.y + FIELD.h / 2} textAnchor="middle" transform={`rotate(90 ${FIELD.x + FIELD.w - 35} ${FIELD.y + FIELD.h / 2})`} fontFamily="var(--face-display)" fontSize={22} fill="#fff6dc" opacity={0.9}>{away.nickname}</text>

        {trail.length > 1 && <polyline points={trail.join(' ')} fill="none" stroke="#f0cf6a" strokeWidth={2.4} strokeDasharray="5 6" opacity={0.75} />}

        {[[homeSpots, homeEight, hc, hm], [awaySpots, awayEight, ac, am]].map(([spots, eight, c, mtl], side) => (
          (spots as { x: number; y: number }[]).map((s, i) => {
            const p = (eight as Player[])[i];
            const lit = p && (p.id === actor || p.id === focus);
            const faded = focus && p?.id !== focus;
            return (
              <g key={`${side}-${i}`} className={`token ${lit ? 'is-lit' : ''} ${faded ? 'is-faded' : ''}`} style={{ transform: `translate(${toX(s.x)}px, ${s.y}px)` }}>
                {lit && <circle r={21} fill="none" stroke="#f0cf6a" strokeWidth={3} className="token-halo" />}
                <circle r={14} fill={String(c)} stroke={String(mtl)} strokeWidth={3} />
                <circle r={14} fill="none" stroke="#1b120c" strokeWidth={1.2} />
                <text y={5} textAnchor="middle" fontFamily="var(--face-data)" fontWeight={700} fontSize={13} fill={String(mtl)}>{i + 1}</text>
              </g>
            );
          })
        ))}

        <g className="ball" style={{ transform: `translate(${toX(ball)}px, ${ballY}px)` }}>
          <circle r={16} fill="#f0cf6a" opacity={0.25} />
          <ellipse rx={9} ry={7} fill="#8a4a24" stroke="#1b120c" strokeWidth={1.6} />
          <path d="M-8 -1 Q0 -5 8 -1" fill="none" stroke="#d6a734" strokeWidth={1.6} />
        </g>
        {current && LOUD.has(current.kind) && (
          <g key={`${current.minute}-${current.text.length}-${events.length}`} className={`burst kind-${current.kind}`} transform={`translate(${toX(ball)} ${ballY})`}>
            <g className="burst-inner">
              <path d="M0 -46 L10 -16 L42 -22 L18 0 L42 22 L10 16 L0 46 L-10 16 L-42 22 L-18 0 L-42 -22 L-10 -16 Z" fill={current.kind === 'breach' ? '#f0cf6a' : current.kind === 'knockout' ? '#d4473a' : current.kind === 'spark' ? '#b07aff' : '#efe7d2'} stroke="#1b120c" strokeWidth={2} opacity={0.92} />
              <text y={-56} textAnchor="middle" fontFamily="var(--face-display)" fontWeight={900} fontSize={30} fill="#fff6dc" stroke="#1b120c" strokeWidth={4} paintOrder="stroke">{KIND_SHOUT[current.kind]}</text>
            </g>
          </g>
        )}
        <rect x={FIELD.x} y={FIELD.y} width={FIELD.w} height={FIELD.h} fill="url(#arena-light)" pointerEvents="none" />
        {revealed && <text x={500} y={FIELD.y + 40} textAnchor="middle" fontFamily="var(--face-display)" fontSize={30} fill="#fff6dc" stroke="#1b120c" strokeWidth={4} paintOrder="stroke">{T.fullTime}</text>}
      </svg>
      <p className="arena-note">{T.arenaNote}</p>
    </div>
  );
}

function Timeline({ m, index, onSeek }: { m: Match; index: number; onSeek: (i: number) => void }) {
  const n = m.events.length;
  const pos = n ? Math.max(0, Math.min(n, index + 1)) / n : 0;
  return (
    <div className="timeline">
      <input type="range" min={-1} max={n} value={index} onChange={(e) => onSeek(Number(e.target.value))} aria-label={T.scrub} aria-valuetext={index < 0 ? T.beforeKickoff : index >= n ? T.fullTime : T.momentOf(index + 1, n)} />
      <div className="timeline-track" aria-hidden="true">
        <span className="timeline-fill" style={{ width: `${pos * 100}%` }} />
        {m.events.map((e, i) => LOUD.has(e.kind) && i <= index && (
          <i key={i} className={`tick kind-${e.kind} ${e.teamId === m.home ? 'is-home' : 'is-away'}`} style={{ left: `${((i + 1) / n) * 100}%` }} />
        ))}
      </div>
    </div>
  );
}

function Spotlight({ event, m, home, away }: { event?: MatchEvent; m: Match; home: Team; away: Team }) {
  const { player } = useGame();
  const p = event?.playerId ? player(event.playerId) : undefined;
  if (!event) {
    return (
      <div className="spotlight is-idle">
        <h2 className="page-head">{T.spotlight}</h2>
        <p className="aside-note">{T.spotlightIdle}</p>
        <div className="spotlight-pair"><Shield team={home} size={70} /><span>{T.versus}</span><Shield team={away} size={70} /></div>
      </div>
    );
  }
  const side = event.teamId === m.home ? home : away;
  return (
    <div className={`spotlight kind-${event.kind}`} key={`${event.minute}-${event.text}`}>
      <h2 className="page-head">{T.spotlight}</h2>
      <div className="spotlight-card">
        {p ? <Miniature player={p} size={128} /> : <Shield team={side} size={108} />}
        <div>
          <h3>{p ? <AthleteName player={p} /> : side.name}</h3>
          <p className="spotlight-who"><span className="spotlight-kind">{T.spotlightWho(KIND_WORD[event.kind], event.minute)}</span>{p ? T.spotlightOf(rol(p.role), raza(p.race).toLowerCase(), side.nickname) : ''}</p>
          <p className="spotlight-text">{event.text}</p>
        </div>
      </div>
    </div>
  );
}

function Sealed({ onReveal }: { onReveal: () => void }) {
  const [breaking, setBreaking] = useState(false);
  return (
    <section className="across sealed">
      <WaxSeal size={150} broken={breaking} />
      <h2 className="page-head">{T.sealed}</h2>
      <p>{T.sealedBody}</p>
      <button type="button" className="gilt-button" onClick={() => { setBreaking(true); setTimeout(onReveal, 650); }}>{T.breakSeal}</button>
    </section>
  );
}

/* ------------------------------------------------------------ ledger */

function Ledger({ m, home, away }: { m: Match; home: Team; away: Team }) {
  const { player, go } = useGame();
  const r = m.report;
  if (!r) {
    const count = (tid: string, kind: MatchEvent['kind']) => m.events.filter((e) => e.teamId === tid && e.kind === kind).length;
    return (
      <section className="across ledger-legacy">
        <h2 className="page-head">{T.oldLedger}</h2>
        <p className="aside-note">{T.oldLedgerNote}</p>
        <DualRows rows={(['breach', 'gate', 'interception', 'knockout', 'fumble', 'penalty', 'spark'] as const).map((k) => [KIND_WORD[k], count(m.home, k), count(m.away, k)])} home={home} away={away} />
      </section>
    );
  }
  const h = r.teams[m.home];
  const a = r.teams[m.away];
  const R = T.rows;
  const rows: [string, number, number, string?, string?][] = [
    [R.points, m.homeScore ?? 0, m.awayScore ?? 0], [R.possessions, h.possessions, a.possessions], [R.plays, h.plays, a.plays], [R.firstDowns, h.firstDowns, a.firstDowns],
    [R.yards, h.yards, a.yards], [R.runs, h.runAttempts, a.runAttempts], [R.rushYards, h.rushingYards, a.rushingYards],
    [R.passesCompleted, h.passesCompleted, a.passesCompleted], [R.passAttempts, h.passAttempts, a.passAttempts], [R.passYards, h.passingYards, a.passingYards],
    [R.breaches, h.breaches, a.breaches], [R.gates, h.gates, a.gates, `${h.gates}/${h.gatesAttempted}`, `${a.gates}/${a.gatesAttempted}`], [R.aftershocks, h.aftershocks, a.aftershocks],
    [R.turnovers, h.turnovers, a.turnovers], [R.interceptions, h.interceptions, a.interceptions], [R.fumbles, h.fumblesLost, a.fumblesLost],
    [R.tackles, h.tackles, a.tackles], [R.blocks, h.blocks, a.blocks], [R.knockouts, h.knockouts, a.knockouts], [R.penalties, h.penalties, a.penalties],
    [R.sparks, h.sparks, a.sparks], [R.subs, h.substitutions, a.substitutions],
  ];
  const performers = Object.values(r.players).sort((x, y) => y.impact - x.impact).slice(0, 8);
  return (
    <>
      <section className="page verso">
        <h2 className="page-head">{T.officialLedger}</h2>
        <p className="aside-note">{T.officialNote}</p>
        <DualRows rows={rows} home={home} away={away} />
      </section>
      <section className="page recto">
        <h2 className="page-head">{T.shone}</h2>
        <ol className="performers">
          {performers.map((row) => {
            const p = player(row.playerId);
            if (!p) return null;
            return (
              <li key={row.playerId}>
                <button type="button" onClick={() => go({ kind: 'athlete', id: p.id })}>
                  <Miniature player={p} size={58} />
                  <span className="perf-name"><strong>{p.name}</strong><small>{T.roleOf(rol(p.role), row.teamId === m.home ? home.nickname : away.nickname)}</small></span>
                  <span className="perf-impact"><strong>{row.impact.toFixed(1)}</strong><small>{T.impact}</small></span>
                  <span className="perf-line">{T.perfLine(row.breaches, row.yards, row.tackles, row.interceptions)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}

function DualRows({ rows, home, away }: { rows: [string, number, number, string?, string?][]; home: Team; away: Team }) {
  const [hc] = houseColours(home);
  const [ac] = houseColours(away);
  return (
    <div className="dual">
      <div className="dual-head"><HouseName team={home} size={26} /><span /><HouseName team={away} size={26} /></div>
      {rows.map(([label, hv, av, hs, as]) => {
        const max = Math.max(hv, av, 1);
        return (
          <div key={label} className="dual-row">
            <b className={hv > av ? 'is-more' : ''}>{hs ?? nfmt(hv)}</b>
            <div className="dual-mid">
              <span>{label}</span>
              <div className="dual-bars"><i style={{ width: `${(hv / max) * 50}%`, background: hc }} /><i style={{ width: `${(av / max) * 50}%`, background: ac }} /></div>
            </div>
            <b className={av > hv ? 'is-more' : ''}>{as ?? nfmt(av)}</b>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ drivebook */

const DRIVE_WORD = T.drive;

function Drivebook({ m, home, away }: { m: Match; home: Team; away: Team }) {
  const r = m.report;
  if (!r) return <section className="across"><Blank>{T.noDrives}</Blank></section>;
  return (
    <section className="across drivebook">
      <h2 className="page-head">{T.drivebook}</h2>
      <p className="aside-note">{T.drivesNote(r.drives.length, home.nickname, away.nickname)}</p>
      <ol className="drives">
        {r.drives.map((d) => {
          const isHome = d.teamId === m.home;
          const t = isHome ? home : away;
          const pct = (x: number) => Math.min(100, Math.max(0, (x / 90) * 100));
          const s = isHome ? pct(d.startX) : 100 - pct(d.startX);
          const e = isHome ? pct(Math.min(90, d.endX)) : 100 - pct(Math.min(90, d.endX));
          const [c] = houseColours(t);
          return (
            <li key={d.index} className={`drive result-${d.result} ${d.points > 0 ? 'is-scoring' : ''}`}>
              <span className="drive-no">{d.index}</span>
              <span className="drive-house"><Shield team={t} size={24} />{t.nickname}</span>
              <span className="drive-min">{d.startMinute}′–{d.endMinute}′</span>
              <span className="drive-field">
                <i className="drive-path" style={{ left: `${Math.min(s, e)}%`, width: `${Math.max(1.5, Math.abs(e - s))}%`, background: c }} />
                <i className="drive-start" style={{ left: `${s}%` }} />
              </span>
              <span className="drive-figs">{T.driveFigs(d.plays, d.yards, d.firstDowns)}</span>
              <strong className="drive-result">{DRIVE_WORD[d.result] ?? d.result}{d.points > 0 ? ` +${d.points}` : ''}</strong>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------ a contest not yet fought */

function ChallengePreview({ m, home, away, canPlay, onWatch, onQuick, disabled }: { m: Match; home: Team; away: Team; canPlay: boolean; onWatch: () => void; onQuick: () => void; disabled: boolean }) {
  const { world: w } = useGame();
  const sides: [Team, Player[]][] = [[home, lineup(w, home)], [away, lineup(w, away)]];
  return (
    <div className="spread contest is-challenge">
      <section className="across contest-top">
        <Scoreboard m={m} home={home} away={away} score={[0, 0]} state="challenge" />
        <div className="challenge-call">
          <p>{T.choose}</p>
          {canPlay ? <div className="season-actions"><button type="button" className="gilt-button" disabled={disabled} onClick={onWatch}>{T.watch}</button><button type="button" className="ink-button" disabled={disabled} onClick={onQuick}>{T.quick}</button></div> : <p className="aside-note">{T.setFor(m.week)}</p>}
        </div>
      </section>
      {sides.map(([t, list], i) => {
        const profile = playProfile(t.philosophy);
        return (
          <section key={t.id} className={`page ${i === 0 ? 'verso' : 'recto'}`}>
            <h2 className="page-head"><HouseName team={t} size={34} full /></h2>
            <dl className="season-figures">
              <div><dt>{T.figures.strength}</dt><dd>{Math.round(teamRating(w, t))}</dd></div>
              <div><dt>{T.figures.record}</dt><dd>{t.record.w}–{t.record.d}–{t.record.l}</dd></div>
              <div><dt>{T.figures.crowns}</dt><dd>{t.worldTitles}</dd></div>
            </dl>
            <p className="philosophy-line"><strong>{filosofia(t.philosophy).nombre}</strong>: {profile.summary}</p>
            <ul className="eight">
              {list.map((p) => (
                <li key={p.id}>
                  <Miniature player={p} size={56} />
                  <span><AthleteName player={p} /><small><RoleGlyph role={p.role} size={16} />{rol(p.role)} {raza(p.race).toLowerCase()}</small></span>
                  <strong>{p.rating}</strong>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
