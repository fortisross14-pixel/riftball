# RIFTBALL — World Chronicle (Proof of Concept)

A playable, spectator-first fantasy sports world simulator built with Vite, React 19 and TypeScript. **No backend or API keys needed.**

## Run locally

Requires Node.js 20.19+ or Node.js 22.12+.

```bash
npm install
npm run dev
```

Open the address printed by Vite (usually `http://localhost:5173`).

For deployment:

```bash
npm run test
npm run build
npm run preview
```

The production output is in `dist/`. `vite.config.ts` uses `base: './'` for GitHub Pages and other subpath hosts.

## What's playable

- Generate a seeded universe with **80 clubs / four fantasy regions / two divisions each / 1,200 active athletes / nine races**.
- Simulate **one week, four weeks, the rest of a season, one year or ten years**.
- Follow 18-week home-and-away schedules, **promotion and relegation**, regional playoffs, Grand Rift world championship, league tables and fixtures.
- Inspect player portraits, positional attributes, roles, rarity, abilities, progression, season/career statistics and injuries.
- See **match scores, generated event logs, spoiler-safe match replays, complete new-match box scores, possession journals** and a schematic 2D pitch with ball location tracking.
- Explore a Chronicle feed, club rosters, league standings, player rankings, champions, and historical career records.
- **Persistent IndexedDB saves** and JSON export/import; an open tab detects competing saves and offers to reload the newest version.
- Fully offline after first install (web font may fall back to system fonts).

## Recommended first five minutes

1. Look at the Chronicle and open a club or star athlete.
2. Click **ADVANCE WEEK** or its chevron to simulate **4 weeks**.
3. Open Match Center and choose a completed fixture. Press **PLAY** to watch the spoiler-safe replay, then inspect **BOX SCORE** and **DRIVEBOOK** after full time.
4. Open Competitions to compare regional tables, then simulate **to season end** to crown the inaugural world champion.
5. Advance **10 years** and open History. Try searching for the all-time leading scorer.

## Prototype boundaries

This is a working systems POC, **not the full v0.1–v0.5 design document implemented**:

- Match presentation is a schematic 2D replay of recorded highlights; there is no physics-driven animation or direct athlete control.
- The match engine uses seeded procedural possession simulation, simplified tactics, player skill matchups, limited signature moments, injuries, turnovers, scores, and stats; rules are a prototype model, not a final officiating-level playbook.
- Arcane charges, athlete traits and tactical philosophies affect matches; coaching and detailed contracts are still simplified or not independently simulated.
- Clubs trade athletes automatically during the offseason, but there is no contract negotiation or wage market.
- Athlete rarity is visible for ease of testing; the long-term design can hide intrinsic potential.
- Athlete cards use procedural vector portraits and generated club shields, not licensed artwork.
- News is generated from real season and match outcomes plus occasional flavor headlines.
- Full event logs are retained for recent seasons. Earlier years preserve compact results for title matches and career/historical totals, rather than every regular-season play.
- The Hall of History includes champions and career leaderboards; a full selective induction system is future scope.

## Data safety and reproducibility

The authoritative simulation is in `src/engine.ts`. Every world has a seed and stored RNG state; results are generated deterministically from the same seeded world snapshot.

Data persists in IndexedDB with optimistic revision checks to protect against cross-tab overwrites. **Export the universe regularly** if it matters to you: browser data deletion, private browsing, or site-origin changes can remove the local database. JSON exports can be imported from Settings.

The export includes full World state; do not upload personal data into narrative/team names (none are requested by this game).

## Key files

- `src/engine.ts` — world generator, match/season engine, progression, league rules.
- `src/types.ts` — world, club, player, match, event, news, award types.
- `src/App.tsx` — game navigation, controls and state management.
- `src/MatchCenterV3.tsx` — broadcast hub, spoiler-safe replay, roster view, player performance tables.
- `src/Statistics.tsx` — official box scores, possession journal, leaderboards, historical season archive.
- `src/components.tsx` — club shields, fantasy portraits, rarity chips and common components.
- `src/storage.ts` — IndexedDB storage, save conflicts, JSON import/export.
- `src/styles.css` — self-contained responsive premium dark UI.
- `src/engine.test.ts` — seeded simulation and long-run invariants.

## Next versions

1. Position-by-position action probabilities and balanced tactical playbooks.
2. Meaningful team Spark Charges, distinct abilities and counterplay.
3. Coaches, training, contracts, transfer market and financial AI.
4. Historical season archives, narrative rivalries and a true Hall of Fame election system.
5. Enhanced pitch animation and in-match broadcast UI.


## Passes 1 and 2 (prototype expansion)

- **Competitions → The Grand Rift**: global title pathway, regional qualification status, three-round world championship bracket, current/reigning champions.
- **Athlete and club visual identity**: consistent square race/role avatars, club mascot-symbol crests and enhanced roster cards. Art currently uses generated inline SVG and is not a finished hand-illustrated sprite sheet.
- **Statistics**: new navigation page with player seasonal and career leaderboards, region/position filters, per-game rates, team rankings, championship history and awards.
- **Dossiers**: player season and career statistic matrices; club points, win rate, offense and defense summaries.
- **Match Center**: recorded-event box score for completed matches. These are event-based highlight counts, not a complete attempt-level box score.

### Compatibility & known constraints
The existing IndexedDB world schema is unchanged. Existing saves are not deliberately reset. Historical individual **season-by-season** stats cannot be reconstructed from old saves: players currently retain their current season and cumulative career aggregates, not every prior season. Pass 3 adds detailed pass attempts, play-level team totals and full possession logs to newly simulated matches. Older matches cannot be retroactively reconstructed.

### Validation
Install with `npm ci`, run `npm test`, then `npm run build`. The container runs engine compilation and selected deterministic/10-year/integrity tests, but npm registry access is limited and the full Vite browser bundle must be verified by your GitHub Actions deployment.


## Pass 3 — Simulation & Storytelling (latest)

- **Match Engine v3:** tactical play selection takes opposing coverage and blocking into account. A player's position, role attributes, injuries, physical wear and selected strategy affect outcomes. Bench rotation substitutes fresh athletes and replaces injured starters. Signature Spark abilities are now limited to one activation per athlete per match (and two per team).
- **Authoritative match reports:** Every newly simulated fixture records possessions, offensive plays, first downs, rushed and passed metres, attempts, completions, turnovers, knockouts, penalties, magic usage, and substitutions. Detailed per-player contributions and an ordered drivebook are included. Box-score totals reconcile with scoring and player actions.
- **New Match Center:** Featured broadcast, upcoming slate, searchable result archive, 2D event tracker, transport controls/speed selection, spoiler-safe score reveal, official Box Score tab, player performances and Drivebook tab. The pitch is still schematic and does not recreate exact player paths.
- **The Chronicle:** New weekly narratives are grounded in the match report and highlight standout athletes, late comebacks, turnover-heavy clashes and significant injury reports alongside the existing dynasty, rivalry, and record narratives.
- **Historical season snapshots:** The Statistics screen now has an Era Archive with top scoring athletes and top Premier clubs for up to 40 finished seasons (generated starting with this version).
- **Save compatibility:** Existing v1/v2 IndexedDB and exported worlds continue to load without changes to the exported format. Pre-upgrade matches retain their old highlights and will display a legacy ledger rather than false full-match numbers. Saved universes create new reports and archival seasons from the time the new version is installed.
- **Automated regression checks:** New tests validate actual team scores vs recorded scoring, passes and yards reconciliation, substitutions, and archive continuity. Previous multi-year tests remain included.
