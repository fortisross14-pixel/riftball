import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CURRENT_VERSION, advanceWeekAuto, createWorld, normalizeWorld } from './engine';
import { LegacySaveError, SAVE_FORMAT, isLegacySave, serializeWorld, validateImport } from './storage';
import type { World } from './types';

const roundTrip = (w: World) => validateImport(JSON.parse(serializeWorld(w)));

test('Export then import returns the same world', () => {
  const w = createWorld(4401);
  for (let i = 0; i < 3; i++) advanceWeekAuto(w);
  const text = serializeWorld(w);
  assert.equal(JSON.parse(text).format, SAVE_FORMAT);
  const back = roundTrip(w);
  assert.equal(back.teams.length, 48);
  assert.equal(back.version, CURRENT_VERSION);
  // Loading fills a few harmless defaults (e.g. hallOfLegends: false), so compare with the normalized world.
  assert.deepEqual(back, JSON.parse(JSON.stringify(normalizeWorld(structuredClone(w)))));
  // A second round trip changes nothing.
  assert.deepEqual(roundTrip(back), back);
  // And the imported world keeps playing exactly like the original.
  const a = structuredClone(w), b = back;
  for (let i = 0; i < 2; i++) { advanceWeekAuto(a); advanceWeekAuto(b); }
  const scores = (x: World) => x.matches.filter((m) => m.homeScore !== null).map((m) => [m.id, m.homeScore, m.awayScore]);
  assert.deepEqual(scores(b), scores(a));
});

test('Import accepts current worlds at every week of the calendar, including the off-season', () => {
  const w = createWorld(4402);
  while (w.week < 30) advanceWeekAuto(w);
  assert.equal(w.week, 30);
  assert.equal(roundTrip(w).week, 30);
});

test('Import accepts a previous-release (version 3) 48-club save and gives it stable art keys', () => {
  const w = createWorld(4403);
  const old = JSON.parse(JSON.stringify(w)) as World;
  old.version = 3;
  delete (old as Partial<World>).stage;
  for (const t of old.teams) delete (t as Partial<typeof t>).artKey;
  for (const p of old.players) delete (p as Partial<typeof p>).portraitKey;
  const back = validateImport({ format: 'riftball-world-v2', world: old });
  assert.equal(back.version, CURRENT_VERSION);
  assert.deepEqual(back.teams.map((t) => t.artKey), w.teams.map((t) => t.artKey));
  assert.deepEqual(back.players.map((p) => p.portraitKey), w.players.map((p) => p.portraitKey));
  assert.ok(back.stage);
});

test('Import rejects old 80-club saves with a clear legacy error, and rejects junk', () => {
  const w = createWorld(4404);
  const legacy = JSON.parse(JSON.stringify(w)) as World;
  legacy.version = 2;
  legacy.teams = [...legacy.teams, ...legacy.teams.slice(0, 32)];
  assert.ok(isLegacySave(legacy));
  assert.throws(() => validateImport({ format: 'riftball-world-v2', world: legacy }), LegacySaveError);
  assert.ok(!isLegacySave(w));
  assert.throws(() => validateImport({ format: 'something-else', world: w }));
  assert.throws(() => validateImport(null));
  const broken = JSON.parse(JSON.stringify(w)) as World;
  broken.week = 99;
  assert.throws(() => validateImport({ format: SAVE_FORMAT, world: broken }));
});
