import type { Match, Story, World } from '../types';
import { recent, topPlayers, upcoming } from '../engine';
import { nfmt, record, stageOf, useGame } from '../game/context';
import { Drollery, Initial } from '../art/Ornament';
import { roman } from '../art/hash';
import { Shield } from '../art/Heraldry';
import { FeaturedContestCard } from './parts/FeaturedContestCard';
import { ChallengeRow } from './Tourneys';
import { AthleteName, Blank, HouseName, Miniature } from '../ui/bits';
import { ES, raza, rol, titleCase } from '../i18n/es';
import { SEASON, currentStage, isStageComplete } from '../engine';
import { mainAction, nextEventName, progressIndex } from '../game/nextStep';
import { Hourglass } from '../art/Ornament';

export { titleCase };

function pickFeatured(w: World): Match | undefined {
  return [...w.matches].reverse().find((m) => m.season === w.season && m.week === w.week && m.phase === 'grand-final')
    || upcoming(w).find((m) => m.phase === 'grand-final')
    || recent(w).find((m) => m.phase === 'grand-final' && m.season === w.season)
    || upcoming(w).find((m) => m.phase !== 'league')
    || upcoming(w).find((m) => m.phase === 'league')
    || recent(w)[0];
}

const TONES = ['lapis', 'vermilion', 'verdigris', 'murex'] as const;
const T = ES.chronicle;

export function Chronicle() {
  const { world: w, go } = useGame();
  const fresh = w.news.slice(0, 14);
  const lead = [...fresh].sort((a, b) => b.importance - a.importance)[0];
  const rest = fresh.filter((s) => s !== lead).slice(0, 8);
  const featured = pickFeatured(w);
  const precedence = w.teams.filter((t) => t.division === 0).sort((a, b) => b.record.pts - a.record.pts || (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)).slice(0, 6);
  const scoring = w.week > 1;
  const stars = topPlayers(w, scoring ? 'breaches' : 'rating', 4);
  const open = (s: Story) => {
    if (s.matchId) go({ kind: 'contest', id: s.matchId });
    else if (s.playerId) go({ kind: 'athlete', id: s.playerId });
    else if (s.teamId) go({ kind: 'house', id: s.teamId });
  };
  const lastPlayed = recent(w).find((m) => m.season === w.season);
  const lastWeek = lastPlayed ? recent(w).filter((m) => m.season === w.season && m.week === lastPlayed.week).sort((a, b) => (b.phase !== 'league' ? 1 : 0) - (a.phase !== 'league' ? 1 : 0) || Math.abs((b.homeScore ?? 0) - (b.awayScore ?? 0)) - Math.abs((a.homeScore ?? 0) - (a.awayScore ?? 0))) : [];
  const champions = w.trophies.filter((t) => t.competition === 'GRAND RIFT CHAMPIONSHIP').length;
  const games = w.totalGames ?? w.matches.filter((m) => m.homeScore !== null).length;
  const tag = (s: Story) => `${T.kind[s.kind] ?? s.kind}${s.badge ? ` · ${T.badge[s.badge] ?? s.badge}` : ''}`;

  return (
    <div className="spread chronicle">
      <NowBanner />
      <section className="page verso">
        <h1 className="folio-title">{T.title}</h1>
        <p className="folio-sub">{T.sub(w.season, w.week <= 22 ? ES.headband.round(w.week) : stageOf(w.week))}</p>

        {lead ? (
          <article className="lead-story">
            <div className="lead-initial"><Initial letter={lead.title.replace(/[^\p{L}]/gu, '').charAt(0) || 'R'} size={128} tone={TONES[lead.season % 4]} /></div>
            <h2><button type="button" className="story-link" onClick={() => open(lead)} disabled={!lead.matchId && !lead.playerId && !lead.teamId}>{titleCase(lead.title)}</button></h2>
            <p className="lead-body">{lead.body}</p>
            {lead.matchId && <LeadMiniature id={lead.matchId} />}
            <p className="dateline">{lead.badge ? `${T.badge[lead.badge] ?? lead.badge} · ` : ''}{T.dateline(lead.season, lead.week)}</p>
          </article>
        ) : <Blank>{T.blank}</Blank>}

        {featured && <FeaturedContestCard m={featured} />}

        <h2 className="page-head small spaced">{T.lastWeek}</h2>
        <p className="aside-note">{lastWeek.length ? T.lastWeekNote(lastWeek[0].week) : T.noGames}</p>
        <div className="challenges">{lastWeek.slice(0, 10).map((m) => <ChallengeRow key={m.id} m={m} showPhase={m.phase !== 'league'} />)}</div>
      </section>

      <section className="page recto">
        <h2 className="page-head">{T.news}</h2>
        <ol className="tidings">
          {rest.map((s) => (
            <li key={s.id} className={`tiding kind-${s.kind}`}>
              <div>
                <h3><button type="button" className="story-link" onClick={() => open(s)} disabled={!s.matchId && !s.playerId && !s.teamId}>{titleCase(s.title)}</button></h3>
                <p>{s.body}</p>
              </div>
              <span className="tiding-gloss"><Drollery kind={s.kind} seed={s.id} size={46} /><small>{tag(s)}<br />{ES.common.week(s.week)}</small></span>
            </li>
          ))}
          {!rest.length && <li><Blank>{T.noNews}</Blank></li>}
        </ol>

        <div className="recto-pair">
          <div>
            <h2 className="page-head small">{T.top}</h2>
            <p className="aside-note">{T.topNote}</p>
            <ol className="precedence">
              {precedence.map((t, i) => (
                <li key={t.id}>
                  <span className="rank">{roman(i + 1)}</span>
                  <HouseName team={t} size={24} />
                  <span className="rec">{record(t)}</span>
                  <strong>{t.record.pts}</strong>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="page-head small">{T.stars}</h2>
            <p className="aside-note">{scoring ? T.starsScorers : T.starsRated}</p>
            <ul className="watch">
              {stars.map((p) => (
                <li key={p.id}>
                  <Miniature player={p} size={52} />
                  <span><AthleteName player={p} /><small>{rol(p.role)} {raza(p.race).toLowerCase()}</small></span>
                  <strong>{scoring ? p.stats.breaches : p.rating}<small>{scoring ? T.breaches : T.rating}</small></strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="explicit">{T.footer(w.teams.length, nfmt(w.players.length), nfmt(games), champions)}</p>
      </section>
    </div>
  );
}

function LeadMiniature({ id }: { id: string }) {
  const { world: w, team, go } = useGame();
  const m = w.matches.find((x) => x.id === id);
  const h = m && team(m.home);
  const a = m && team(m.away);
  if (!m || !h || !a) return null;
  return (
    <button type="button" className="lead-miniature" onClick={() => go({ kind: 'contest', id })} aria-label={T.openMatch(h.name, a.name)}>
      <Shield team={h} size={54} />
      <span>{m.homeScore === null ? ES.common.vs : `${m.homeScore}–${m.awayScore}`}</span>
      <Shield team={a} size={54} />
    </button>
  );
}

const EVENT_WEEK = [SEASON.NATIONAL_FINAL, SEASON.WORLD_GROUPS, SEASON.WORLD_SEMI, SEASON.WORLD_FINAL, SEASON.AWARDS, SEASON.MARKET, SEASON.NEW_SEASON];

/** Where the season stands, what comes next, and the same main button as the bar. */
function NowBanner() {
  const { world: w, advance, go, busy, locked } = useGame();
  const action = mainAction(w);
  const stage = currentStage(w);
  const at = progressIndex(w);
  const next = nextEventName(w);
  const nextWeek = at === 0 || at === 7 ? SEASON.NATIONAL_FINAL : EVENT_WEEK[Math.min(EVENT_WEEK.length - 1, at)];
  const waiting = stage.kind !== 'league' && !isStageComplete(w);
  return (
    <section className="across now-banner" aria-label={ES.now.label}>
      <div className="now-col">
        <span className="now-kicker">{ES.now.now}</span>
        <strong>{ES.now.week(ES.progress[at], w.week)}</strong>
      </div>
      <div className="now-col">
        <span className="now-kicker">{ES.now.next}</span>
        <strong>{at === 0 || at === 7 ? ES.now.nextAt(next, nextWeek) : ES.now.nextNow(ES.progress[at])}</strong>
      </div>
      {waiting
        ? <button type="button" className="gilt-button now-go" onClick={() => go({ kind: 'section', section: 'evento' })}>{ES.bar.toEvent}<small>{ES.now.pending}</small></button>
        : <button type="button" className="turn-page now-go" disabled={busy || locked || !action.enabled} onClick={() => advance(1)}><Hourglass size={22} /><span><strong>{action.label}</strong><small>{action.sub}</small></span></button>}
    </section>
  );
}
