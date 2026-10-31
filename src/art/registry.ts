// Painted artwork drop-in point.
//
// The game draws every portrait and coat of arms as vector art in code. To replace any of it
// with painted raster art, drop files into src/art/raster/ using these names and rebuild:
//
//   portraits/player-<playerId>.png      one specific athlete
//   portraits/<race>-<NN>.png            a race + portrait variant (e.g. orc-03.png), stored as player.portraitKey
//   crests/club-<teamId>.png             one club's arms
//   crests/<artKey>.png                  by the club's stable art key (kitehaven-ospreys.png)
//
// PNG, WebP and JPG are accepted. Square art (at least 360x360) suits portraits; crests should be
// transparent PNGs of the shield only. The most specific match wins; anything missing falls back
// to the vector art, so files can be added one at a time.

// The game serves baked WebP art (scripts/bake-art.cjs): full size for big displays and 96px thumbnails
// for lists. The PNG sources in raster/crests and raster/portraits are not bundled.
const glob = (files: Record<string, string>) => files;
const portraitFiles = glob(import.meta.glob('./raster/web/portraits/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>);
const portraitThumbs = glob(import.meta.glob('./raster/web/portraits-96/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>);
const crestFiles = glob(import.meta.glob('./raster/web/crests/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>);
const crestThumbs = glob(import.meta.glob('./raster/web/crests-96/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>);

function index(files: Record<string, string>) {
  const out = new Map<string, string>();
  for (const [path, url] of Object.entries(files)) {
    const name = path.split('/').pop()!.replace(/\.(png|webp|jpg)$/i, '').toLowerCase();
    out.set(name, url);
  }
  return out;
}

const portraits = index(portraitFiles);
const portraits96 = index(portraitThumbs);
const crests = index(crestFiles);
const crests96 = index(crestThumbs);
/** Displays up to this many CSS pixels use the 96px thumbnail (sharp up to about 2x density for small marks). */
const THUMB_MAX = 64;

// Lookups use the stable keys stored on each club (artKey) and athlete (portraitKey), never a display
// name, so translating or renaming clubs never breaks their art.
export function paintedPortrait(playerId: string, portraitKey: string | undefined, size = 180): string | undefined {
  if (!portraits.size) return undefined;
  const set = size <= THUMB_MAX ? portraits96 : portraits;
  return set.get(`player-${playerId.toLowerCase()}`) ?? (portraitKey ? set.get(portraitKey) : undefined);
}

export function paintedCrest(teamId: string, artKey: string | undefined, size = 96): string | undefined {
  if (!crests.size) return undefined;
  const set = size <= THUMB_MAX ? crests96 : crests;
  return set.get(`club-${teamId.toLowerCase()}`) ?? (artKey ? set.get(artKey) : undefined);
}
