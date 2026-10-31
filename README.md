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
- See **match scores, generated event logs, spoiler-safe match replays** and a schematic 2D pitch with ball movement.
- Explore a Chronicle feed, club rosters, league standings, player rankings, champions, and historical career records.
- **Persistent IndexedDB saves** and JSON export/import; an open tab detects competing saves and offers to reload the newest version.
- Fully offline after first install (web font may fall back to system fonts).

## Recommended first five minutes

1. Look at the Chronicle and open a club or star athlete.
2. Click **ADVANCE WEEK** or its chevron to simulate **4 weeks**.
3. Open Match Center and choose a completed fixture. Press **PLAY REPLAY** to see recorded event highlights without final-score spoilers.
4. Open Competitions to compare regional tables, then simulate **to season end** to crown the inaugural world champion.
5. Advance **10 years** and open History. Try searching for the all-time leading scorer.

## Prototype boundaries

This is a working systems POC, **not the full v0.1–v0.5 design document implemented**:

- Match presentation is a schematic 2D replay of recorded highlights; there is no physics-driven animation or direct athlete control.
- The match engine uses seeded procedural possession simulation, simplified tactics, player skill matchups, limited signature moments, injuries, turnovers, scores, and stats; rules are a prototype model, not a final officiating-level playbook.
- Arcane charges, coaching, finances, academy quality, and traits exist as design concepts or data, but not all meaningfully influence the POC match engine yet.
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
- `src/App.tsx` — all game views, controls, replay and state management.
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
