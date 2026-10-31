import type { Match, Team } from '../../types';
import { currentStage, predictionReward } from '../../engine';
import { useGame } from '../../game/context';
import { homeChancePct, keyDuel, streakOf, tablePosition } from '../../game/matchday';
import { Portrait } from '../../art/Portrait';
import { houseColours } from '../../art/Heraldry';
import { ES, raza, rol } from '../../i18n/es';

const T = ES.prematch;

/** What's at stake, the key duel and a prediction. Used before kickoff, in the preview and over the live pitch. */
export function PreMatchCard({ m, home, away, compact = false }: { m: Match; home: Team; away: Team; compact?: boolean }) {
  const { world: w } = useGame();
  const stakes: string[] = [];
  if (m.phase === 'league') stakes.push(T.table(home.nickname, tablePosition(w, home), home.record.pts), T.table(away.nickname, tablePosition(w, away), away.record.pts));
  else stakes.push(m.phase === 'grand-final' || m.phase === 'regional-final' ? T.final : T.knockout);
  if (home.rival === away.id) stakes.push(T.rivalry(home.rivalHeat));
  for (const t of [home, away]) { const s = streakOf(t); if (s) stakes.push(T.streak(t.nickname, s.n, s.kind)); }
  const duel = keyDuel(w, home, away);
  const pct = homeChancePct(w, m);
  const verdict = pct >= 55 ? T.favourite(home.nickname, pct) : pct <= 45 ? T.favourite(away.nickname, 100 - pct) : T.tossUp(pct);
  return (
    <section className={`prematch ${compact ? 'is-compact' : ''}`} aria-label={T.title}>
      <div className="prematch-stakes">
        <h3>{T.title}</h3>
        <ul>{stakes.map((s) => <li key={s}>{s}</li>)}</ul>
      </div>
      {duel && (
        <div className="prematch-duel">
          <h3>{T.duel}</h3>
          <div className="duel-pair">
            {duel.map((p, i) => (
              <div key={p.id} className="duel-side">
                <Portrait player={p} house={houseColours(i === 0 ? home : away)} size={compact ? 64 : 84} />
                <strong>{p.nickname ? `«${p.nickname}»` : p.name}</strong>
                <small>{p.nickname ? `${p.name} · ` : ''}{rol(p.role)} {raza(p.race).toLowerCase()} · {p.rating}</small>
              </div>
            )).flatMap((el, i) => (i === 0 ? [el, <span key="vs" className="duel-vs">{T.duelVs}</span>] : [el]))}
          </div>
        </div>
      )}
      <div className="prematch-odds">
        <h3>{T.prediction}</h3>
        <div className="odds-bar" aria-hidden="true"><i style={{ width: `${pct}%`, background: houseColours(home)[0] }} /><i style={{ background: houseColours(away)[0] }} /></div>
        <p>{verdict}</p>
      </div>
    </section>
  );
}

/** The showcase prediction game: pick a winner before kickoff and earn coins of the Rift. */
export function PredictionPicker({ m, home, away }: { m: Match; home: Team; away: Team }) {
  const { world: w, predict, busy, locked } = useGame();
  const P = ES.predict;
  const pick = w.predictions?.[m.id];
  if (currentStage(w).kind !== 'showcase' && !pick) return null;
  if (m.homeScore !== null) {
    if (!pick) return null;
    return <p className={`predict-result ${pick.settled === 'won' ? 'is-won' : 'is-lost'}`}>{pick.settled === 'won' ? P.won(pick.coins ?? 0) : P.lost}</p>;
  }
  const pct = homeChancePct(w, m) / 100;
  return (
    <div className="predict" role="group" aria-label={P.title}>
      {[[home, pct], [away, 1 - pct]].map(([t, chance]) => {
        const team = t as Team;
        const on = pick?.teamId === team.id;
        return (
          <button key={team.id} type="button" className={`predict-pick ${on ? 'is-on' : ''}`} aria-pressed={on} disabled={busy || locked} onClick={() => predict(m.id, team.id)}>
            <strong>{on ? P.picked(team.nickname) : P.pick(team.nickname)}</strong>
            <small>{P.reward(predictionReward(chance as number))}</small>
          </button>
        );
      })}
    </div>
  );
}
