import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, normalizeWorld } from './engine';
import type { World } from './types';
import { assertArtResolves } from './testing/art';

test('Every club in a new world resolves a raster crest and every athlete a raster portrait', () => {
  for (const seed of [1, 2026, 99]) assertArtResolves(createWorld(seed), `seed ${seed}`);
});

test('Art keys do not depend on display names', () => {
  const w = createWorld(7);
  const keys = w.teams.map((t) => t.artKey);
  for (const t of w.teams) { t.name = `Club ${t.id}`; t.city = 'Renamed'; t.nickname = 'Renamed'; }
  for (const p of w.players) p.name = 'Renamed';
  assertArtResolves(w, 'renamed');
  assert.deepEqual(w.teams.map((t) => t.artKey), keys);
});

test('Saves without art keys get keys that resolve', () => {
  const w = JSON.parse(JSON.stringify(createWorld(8))) as World;
  w.version = 3;
  for (const t of w.teams) delete (t as Partial<typeof t>).artKey;
  for (const p of w.players) { delete (p as Partial<typeof p>).portraitKey; p.portrait = 999; }
  assertArtResolves(normalizeWorld(w), 'migrated');
});

test('Every raster crest and portrait has a baked WebP and a 96px thumbnail', async () => {
  const { readdirSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const names = (dir: string) => new Set(readdirSync(fileURLToPath(new URL(`./art/raster/${dir}/`, import.meta.url))).map((f) => f.replace(/\.(png|webp|jpg)$/i, '')));
  for (const kind of ['crests', 'portraits']) {
    const src = names(kind);
    for (const baked of [`web/${kind}`, `web/${kind}-96`]) assert.deepEqual([...names(baked)].sort(), [...src].sort(), baked);
  }
});
