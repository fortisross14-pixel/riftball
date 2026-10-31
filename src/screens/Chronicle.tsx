import type { Match, Story, World } from '../types';
import { recent, topPlayers, upcoming } from '../engine';
import { nfmt, record, stageOf, useGame } from '../game/context';
import { Drollery, Initial } from '../art/Ornament';
import { roman } from '../art/hash';
import { FeaturedContestCard } from './parts/FeaturedContestCard';
import { ChallengeRow } from './Tourneys';
import { AthleteName, Blank, HouseName, Miniature } from '../ui/bits';

function pickFeatured(w: World): Match | undefined {
  return [...w.matches].reverse().find((m) => m.season === w.season && m.week === w.week && m.phase === 'grand-final')
    || upcoming(w).find((m) => m.phase === 'grand-final')
    || recent(w).find((m) => m.phase === 'grand-final' && m.season === w.season)
    || upcoming(w).find((m) => m.phase !== 'league')
    || upcoming(w).find((m) => m.phase === 'league')
    || recent(w)[0];
}

const TONES = ['lapis', 'vermilion', 'verdigris', 'murex'] as const;

export function Chronicle() {
  const { world: w, go } = useGame();
  const fresh = w.news.slice(0, 14);
  const lead = [...fresh].sort((a, b) => b.importance - a.importance)[0];
  const rest = fresh.filter((s) => s !== lead).slice(0, 8);
  const featured = pickFeatured(w);
  const precedence = w.teams.filter((t) => t.division === 0).sort((a, b) => b.record.pts - a.record.pts || (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)).slice(0, 6);
  const stars = topPlayers(w, w.week > 1 ? 'breaches' : 'rating', 4);
  const open = (s: Story) => {
    if (s.matchId) go({ kind: 'contest', id: s.matchId });
    else if (s.playerId) go({ kind: 'athlete', id: s.playerId });
    else if (s.teamId) go({ kind: 'house', id: s.teamId });
  };
  const lastPlayed = recent(w).find((m) => m.season === w.season);
  const lastWeek = lastPlayed ? recent(w).filter((m) => m.season === w.season && m.week === lastPlayed.week).sort((a, b) => (b.phase !== 'league' ? 1 : 0) - (a.phase !== 'league' ? 1 : 0) || Math.abs((b.homeScore ?? 0) - (b.awayScore ?? 0)) - Math.abs((a.homeScore ?? 0) - (a.awayScore ?? 0))) : [];
  const champions = w.trophies.filter((t) => t.competition === 'GRAND RIFT CHAMPIONSHIP').length;
  const games = w.totalGames ?? w.matches.filter((m) => m.homeScore !== null).length;

  return (
    <div className="spread chronicle">
      <section className="page verso">
        <h1 className="folio-title">The Chronicle</h1>
        <p className="folio-sub">of the {ordinal(w.season)} year, {w.week <= 18 ? `the ${ordinal(w.week)} round of the league` : stageOf(w.week).toLowerCase()}. Heroes rise, empires fall, someone gets punched.</p>

        {lead ? (
          <article className="lead-story">
            <div className="lead-initial"><Initial letter={lead.title.replace(/[^A-Za-z]/, '').charAt(0) || 'R'} size={128} tone={TONES[lead.season % 4]} /></div>
            {lead.badge && <span className="banderole">{lead.badge.toLowerCase()}</span>}
            <h2><button type="button" className="story-link" onClick={() => open(lead)} disabled={!lead.matchId && !lead.playerId && !lead.teamId}>{titleCase(lead.title)}</button></h2>
            <p className="lead-body">{lead.body}</p>
            <p className="dateline">Set down in Year {roman(lead.season)}, week {lead.week}</p>
          </article>
        ) : <Blank>The first page is blank. Turn the page to write the opening week.</Blank>}

        {featured && <FeaturedContestCard m={featured} />}

        <h2 className="page-head small spaced">Last Week on the Field</h2>
        <p className="aside-note">{lastWeek.length ? `The most telling results of week ${lastWeek[0].week}.` : 'No contests have been fought yet this year.'}</p>
        <div className="challenges">{lastWeek.slice(0, 8).map((m) => <ChallengeRow key={m.id} m={m} showPhase={m.phase !== 'league'} />)}</div>
      </section>

      <section className="page recto">
        <h2 className="page-head">Tidings of the Realm</h2>
        <ol className="tidings">
          {rest.map((s) => (
            <li key={s.id} className={`tiding kind-${s.kind}`}>
              <span className="tiding-drollery"><Drollery kind={s.kind} size={40} /></span>
              <div>
                <p className="tiding-meta">{s.kind === 'roundup' ? 'Proclamation' : s.kind}{s.badge ? ` · ${s.badge.toLowerCase()}` : ''} · week {s.week}</p>
                <h3><button type="button" className="story-link" onClick={() => open(s)} disabled={!s.matchId && !s.playerId && !s.teamId}>{titleCase(s.title)}</button></h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
          {!rest.length && <li><Blank>No further tidings. The heralds are resting their voices.</Blank></li>}
        </ol>

        <div className="recto-pair">
          <div>
            <h2 className="page-head small">The Order of Precedence</h2>
            <p className="aside-note">The six finest Premier houses across all four realms.</p>
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
            <h2 className="page-head small">Champions to Watch</h2>
            <p className="aside-note">{w.week > 1 ? 'Leading breach scorers this season.' : 'The highest-rated athletes alive.'}</p>
            <ul className="watch">
              {stars.map((p) => (
                <li key={p.id}>
                  <Miniature player={p} size={52} />
                  <span><AthleteName player={p} /><small>{p.race} {p.role.toLowerCase()}</small></span>
                  <strong>{w.week > 1 ? p.stats.breaches : p.rating}<small>{w.week > 1 ? 'breaches' : 'rating'}</small></strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="explicit">
          Here ends the week's chronicle. Within these pages: {w.teams.length} houses, {nfmt(w.players.length)} living athletes,
          {' '}{nfmt(games)} contests fought, and {champions === 0 ? 'no champion of the Grand Rift yet crowned' : `${champions} ${champions === 1 ? 'champion' : 'champions'} of the Grand Rift`}.
        </p>
      </section>
    </div>
  );
}

export function ordinal(n: number) {
  const words = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'];
  if (n < words.length) return words[n];
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Headlines arrive in capitals from the simulation; set them as a scribe would. */
export function titleCase(s: string) {
  if (s !== s.toUpperCase()) return s;
  const small = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'and', 'or', 'for', 'as', 'by', 'vs', 'with']);
  return s.toLowerCase().split(' ').map((word, i) => (i > 0 && small.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))).join(' ');
}
