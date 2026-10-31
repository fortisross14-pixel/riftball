// Prints storyline/badge counts and sample stories from a simulated run. Usage: npx tsx scripts/stories.ts [seasons] [seed]
import { advanceWeekAuto, createWorld } from '../src/engine';
import type { Story } from '../src/types';
const seasons = Number(process.argv[2] ?? 10), w = createWorld(Number(process.argv[3] ?? 2026));
const all: Story[] = [], seen = new Set<string>();
while (w.season <= seasons) { advanceWeekAuto(w); for (const s of w.news) if (!seen.has(s.id)) { seen.add(s.id); all.push(s); } }
const badges: Record<string, number> = {}; for (const s of all) if (s.badge) badges[s.badge] = (badges[s.badge] ?? 0) + 1;
const kinds: Record<string, number> = {}; for (const l of w.storylines) kinds[l.kind] = (kinds[l.kind] ?? 0) + 1;
console.log('stories', all.length, 'unique bodies', (new Set(all.map(s => s.body)).size / all.length).toFixed(2));
console.log('badges', badges); console.log('storylines', kinds, 'records', w.records.length);
for (const b of Object.keys(badges)) { const s = all.filter(x => x.badge === b).pop()!; console.log(`[${b}] ${s.title} :: ${s.body}`); }
console.log('--- callbacks'); console.log(all.filter(s => / after (the|[A-Z])/.test(s.body)).slice(-4).map(s => s.body).join('\n'));
