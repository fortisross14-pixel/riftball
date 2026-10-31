import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { World } from '../types';

// The registry indexes raster files by name without extension; mirror that here.
const names = (dir: string) => new Set(readdirSync(fileURLToPath(new URL(`../art/raster/${dir}/`, import.meta.url))).map((f) => f.replace(/\.(png|webp|jpg)$/i, '').toLowerCase()));
export const CRESTS = names('crests');
export const PORTRAITS = names('portraits');

export function assertArtResolves(w: World, label: string) {
  for (const t of w.teams) assert.ok(CRESTS.has(t.artKey), `${label}: no crest for ${t.name} (artKey ${t.artKey})`);
  for (const p of [...w.players, ...w.retired]) assert.ok(PORTRAITS.has(p.portraitKey), `${label}: no portrait for ${p.name} (${p.portraitKey})`);
}

