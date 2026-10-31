// Story variety report: share of unique story bodies, world events and a sample of headlines.
// Usage: npx tsx scripts/stories.ts [seasons] [seed]
import { advanceWeekAuto, createWorld } from '../src/engine';
import type { Story } from '../src/types';

const seasons = Number(process.argv[2] ?? 10);
const w = createWorld(Number(process.argv[3] ?? 2026));
const seen = new Set<string>();
const all: Story[] = [];
while (w.season <= seasons) { advanceWeekAuto(w); for (const s of w.news) if (!seen.has(s.id)) { seen.add(s.id); all.push(s); } }
const bodies = new Set(all.map((s) => s.body));
console.log(`stories ${all.length} · unique bodies ${bodies.size} (${((bodies.size / all.length) * 100).toFixed(1)}%)`);
const events = w.worldEvents ?? [];
const perSeason = new Map<number, number>();
for (const e of events) perSeason.set(e.season, (perSeason.get(e.season) ?? 0) + 1);
console.log('world events per season:', Object.fromEntries(perSeason), 'kinds:', events.map((e) => e.kind).join(','));
for (const s of all.filter((x) => x.kind === 'scandal').slice(0, 4)) console.log('-', s.title, '::', s.body);
