// Painted artwork drop-in point.
//
// The game draws every portrait and coat of arms as vector art in code. To replace any of it
// with painted raster art, drop files into src/art/raster/ using these names and rebuild:
//
//   portraits/player-<playerId>.png      one specific athlete
//   portraits/<race>-<1..6>.png          a race + portrait variant (e.g. orc-3.png)
//   portraits/<race>.png                 every athlete of a race
//   crests/club-<teamId>.png             one club's arms
//   crests/<city-nickname>.png           by club name, lower-case with dashes (coppergate-crushers.png)
//
// PNG, WebP and JPG are accepted. Square art (at least 360x360) suits portraits; crests should be
// transparent PNGs of the shield only. The most specific match wins; anything missing falls back
// to the vector art, so files can be added one at a time.

const portraitFiles = import.meta.glob('./raster/portraits/*.{png,webp,jpg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const crestFiles = import.meta.glob('./raster/crests/*.{png,webp,jpg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function index(files: Record<string, string>) {
  const out = new Map<string, string>();
  for (const [path, url] of Object.entries(files)) {
    const name = path.split('/').pop()!.replace(/\.(png|webp|jpg)$/i, '').toLowerCase();
    out.set(name, url);
  }
  return out;
}

const portraits = index(portraitFiles);
const crests = index(crestFiles);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function paintedPortrait(playerId: string, race: string, variant: number): string | undefined {
  if (!portraits.size) return undefined;
  const r = race.toLowerCase();
  return portraits.get(`player-${playerId.toLowerCase()}`) ?? portraits.get(`${r}-${variant}`) ?? portraits.get(r);
}

export function paintedCrest(teamId: string, name: string): string | undefined {
  if (!crests.size) return undefined;
  return crests.get(`club-${teamId.toLowerCase()}`) ?? crests.get(slug(name));
}
