import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SEASON, StageBlockedError, advanceOneWeek, advanceWeekAuto, createWorld, currentFixtures, currentStage, dismissIntro, galaItems, isEventStage, isStageComplete, pendingFixtures, predict, predictionReward, resolveMatch, revealAward, seasonCoins, winChance, abilityTier, tierForRarity, normalizeWorld } from './engine';
import type { World } from './types';
import { RETIRED_FIRST_NAMES } from './i18n/es-mundo';

// One world played up to the national semifinal week, shared (and cloned) by the tests below.
let base: World | undefined;
function atNationalSemis(): World {
  if (!base) { base = createWorld(5150); while (base.week < SEASON.NATIONAL_SEMI) advanceOneWeek(base); }
  return structuredClone(base);
}

test('Every week has an explicit stage; league weeks advance freely', () => {
  const w = createWorld(5151);
  assert.equal(currentStage(w).kind, 'league');
  assert.ok(isStageComplete(w));
  advanceOneWeek(w);
  assert.equal(w.week, 2);
  assert.equal(w.stage?.week, 2);
});

test('Simulating to the next event stops at the National Finals intro without playing it', () => {
  const w = createWorld(5152);
  let weeks = 0;
  do { advanceOneWeek(w); weeks++; } while (!isEventStage(w) && weeks < 40);
  assert.equal(w.week, SEASON.NATIONAL_FINAL);
  const stage = currentStage(w);
  assert.equal(stage.kind, 'showcase');
  assert.equal(stage.showcase, 'national-finals');
  assert.equal(stage.introSeen, false);
  assert.equal(currentFixtures(w).length, 4);
  assert.ok(currentFixtures(w).every((m) => m.homeScore === null));
});

test('Advancing cannot skip an unresolved showcase fixture', () => {
  const w = atNationalSemis();
  advanceOneWeek(w);
  assert.equal(w.week, SEASON.NATIONAL_FINAL);
  const before = JSON.stringify(w);
  assert.throws(() => advanceOneWeek(w), StageBlockedError);
  assert.equal(JSON.stringify(w), before, 'a refused advance leaves the world untouched');
  dismissIntro(w);
  assert.equal(currentStage(w).introSeen, true);
  const fixtures = currentFixtures(w);
  for (const m of fixtures.slice(0, -1)) resolveMatch(w, m.id);
  assert.equal(pendingFixtures(w).length, 1);
  assert.throws(() => advanceOneWeek(w), StageBlockedError);
  assert.equal(w.week, SEASON.NATIONAL_FINAL);
  resolveMatch(w, fixtures.at(-1)!.id);
  assert.ok(isStageComplete(w));
  advanceOneWeek(w);
  assert.equal(w.week, SEASON.WORLD_GROUPS);
  assert.equal(currentStage(w).showcase, 'world-groups');
  assert.equal(currentFixtures(w).length, 12);
  assert.throws(() => advanceOneWeek(w), StageBlockedError);
});

test('Only this week\'s fixtures can be resolved directly', () => {
  const w = atNationalSemis();
  const old = w.matches.find((m) => m.season === w.season && m.week === 3)!;
  assert.throws(() => resolveMatch(w, old.id));
});

test('The awards gala blocks the calendar until every award is revealed', () => {
  const w = atNationalSemis();
  while (w.week < SEASON.AWARDS) advanceWeekAuto(w);
  const stage = currentStage(w);
  assert.equal(stage.kind, 'awards');
  assert.ok(stage.total >= 7, `gala items: ${stage.total}`);
  assert.equal(stage.total, galaItems(w).length);
  assert.equal(galaItems(w).filter((g) => g.kind === 'award' && g.award === 'Golden Gargoyle').length, 1);
  assert.equal(stage.revealed, 0);
  assert.throws(() => advanceOneWeek(w), StageBlockedError);
  for (let i = 1; i < stage.total; i++) revealAward(w);
  assert.throws(() => advanceOneWeek(w), StageBlockedError);
  assert.equal(w.week, SEASON.AWARDS);
  revealAward(w);
  assert.ok(isStageComplete(w));
  advanceOneWeek(w);
  assert.equal(w.week, SEASON.MARKET);
  assert.equal(w.awards.filter((a) => a.season === w.season && a.award === 'Golden Gargoyle').length, 1, 'awards are given exactly once');
});

test('The market writes a summary the pre-season page can show', () => {
  const w = atNationalSemis();
  while (w.week < SEASON.NEW_SEASON) advanceWeekAuto(w);
  assert.equal(currentStage(w).kind, 'preseason');
  const log = w.offseasonLog!;
  assert.equal(log.season, w.season);
  assert.ok(log.transfers.length > 0);
  assert.ok(log.rookies.length > 0);
  assert.equal(log.rookies.length, log.retired.length);
  advanceOneWeek(w);
  assert.equal(w.week, 1);
  assert.equal(currentStage(w).kind, 'league');
});

test('Showcase predictions pay coins of the Rift for correct picks, more for underdogs', () => {
  const w = atNationalSemis();
  const league = currentFixtures(w)[0];
  assert.throws(() => predict(w, league.id, league.home), 'no predictions outside showcases');
  advanceOneWeek(w);
  const fixtures = currentFixtures(w);
  for (const m of fixtures) predict(w, m.id, m.away);
  const chances = fixtures.map((m) => 1 - winChance(w, m));
  for (const m of fixtures) resolveMatch(w, m.id);
  assert.throws(() => predict(w, fixtures[0].id, fixtures[0].home), 'no picks after kickoff');
  let expected = 0;
  fixtures.forEach((m, i) => {
    const pick = w.predictions![m.id];
    assert.equal(pick.settled, m.winner === m.away ? 'won' : 'lost');
    if (m.winner === m.away) expected += predictionReward(chances[i]);
  });
  assert.equal(seasonCoins(w), expected);
  assert.ok(predictionReward(0.2) > predictionReward(0.6));
});

test('Rare world events have real effects: storms postpone a round, dragons move a match, strikes are announced', () => {
  let storm: World | undefined, dragon: World | undefined;
  for (let seed = 1; seed < 80 && (!storm || !dragon); seed++) {
    const w = createWorld(seed);
    const events = w.worldEvents ?? [];
    assert.ok(events.length >= 1 && events.length <= 3, `seed ${seed}: ${events.length} events`);
    if (!storm && events.some((e) => e.kind === 'storm')) storm = w;
    if (!dragon && events.some((e) => e.kind === 'dragon')) dragon = w;
  }
  assert.ok(storm && dragon, 'found worlds with a storm and a dragon');
  const s = storm!.worldEvents!.find((e) => e.kind === 'storm')!;
  const league = storm!.matches.filter((m) => m.phase === 'league' && m.region === s.region);
  assert.equal(league.filter((m) => m.week === s.week).length, 0, 'the stormy round is empty');
  assert.equal(league.filter((m) => m.week === SEASON.LEAGUE_END).length, 12, 'and is played in week 22 with the last round');
  assert.equal(league.length, 132, 'no fixture is lost');
  const d = dragon!.worldEvents!.find((e) => e.kind === 'dragon')!;
  const moved = dragon!.matches.find((m) => m.id === d.matchId)!;
  assert.equal(moved.home, d.away, 'the dragon sends the match to the other ground');
  while (dragon!.week <= d.week) advanceWeekAuto(dragon!);
  assert.ok(dragon!.news.some((n) => n.title.startsWith('UN DRAGÓN')), 'the dragon makes the news');
});

test('Ability tiers follow rarity: Definitivas only on Legendary and Generational athletes, also after migration', () => {
  const w = createWorld(7171);
  for (const p of w.players) assert.equal(abilityTier(p.ability), tierForRarity(p.rarity), `${p.name} (${p.rarity}) has ${p.ability}`);
  assert.ok(w.players.some((p) => abilityTier(p.ability) === 'ultimate'), 'some stars carry a Definitiva');
  const old = JSON.parse(JSON.stringify(w)) as World;
  old.version = 5;
  for (const p of old.players) { p.ability = p.rarity === 'Ordinary' ? 'Rift Roar' : 'Sure Hands'; delete (p.stats as Partial<typeof p.stats>).ultimates; }
  normalizeWorld(old);
  for (const p of old.players) { assert.equal(abilityTier(p.ability), tierForRarity(p.rarity)); assert.equal(p.stats.ultimates, 0); }
});

test('Every athlete has a man\'s first name (all painted portraits are men), also after migrating an old save', () => {
  const w = createWorld(9191);
  for (const p of w.players) assert.ok(!RETIRED_FIRST_NAMES.has(p.name.split(' ')[0]), p.name);
  const old = JSON.parse(JSON.stringify(w)) as World;
  old.version = 5;
  old.players[0].name = 'Valeria Escudero';
  old.players[1].name = 'Hilda Barbapiedra';
  normalizeWorld(old);
  for (const p of old.players) assert.ok(!RETIRED_FIRST_NAMES.has(p.name.split(' ')[0]), p.name);
  assert.ok(old.players[0].name.endsWith(' Escudero') && old.players[1].name.endsWith(' Barbapiedra'), 'surnames are kept');
});
