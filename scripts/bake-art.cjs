// Bakes the game's art for fast rendering. Run with: node scripts/bake-art.cjs
// - SVG-noise textures (CSS custom properties) become small tiling WebP images in src/styles/tex/.
// - Crest and portrait PNGs become WebP (full size) plus 96px WebP thumbnails in src/art/raster/web/.
// Needs Chrome or Edge and playwright-core (not a project dependency):
//   PLAYWRIGHT_CORE=<path to playwright-core> CHROME=<path to chrome.exe> node scripts/bake-art.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const root = path.join(__dirname, '..');
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const TEXTURES = [
  ['src/styles/codex.css', '--tex-vellum', 'vellum'],
  ['src/styles/codex.css', '--tex-fibre', 'fibre'],
  ['src/styles/codex.css', '--tex-wood', 'wood'],
  ['src/styles/codex.css', '--tex-leather', 'leather'],
  ['src/styles/materials.css', '--leaf', 'leaf'],
];

(async () => {
  const browser = await chromium.launch({ executablePath: chrome });
  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');
  const toWebp = (src, w, h, quality) => page.evaluate(async ({ src, w, h, quality }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = w || img.naturalWidth; c.height = h || img.naturalHeight;
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', quality).split(',')[1];
  }, { src, w, h, quality });

  // textures
  const texDir = path.join(root, 'src/styles/tex');
  fs.mkdirSync(texDir, { recursive: true });
  for (const [file, prop, name] of TEXTURES) {
    const css = fs.readFileSync(path.join(root, file), 'utf8');
    const m = css.match(new RegExp(`${prop}:\\s*url\\("(data:image/svg\\+xml,[^"]+)"\\)`));
    if (!m) { console.log('skip (already baked?)', prop); continue; }
    const b64 = await toWebp(m[1], 0, 0, 0.8);
    fs.writeFileSync(path.join(texDir, `${name}.webp`), Buffer.from(b64, 'base64'));
    console.log('texture', name, Math.round(Buffer.byteLength(b64, 'base64') / 1024), 'KB');
  }

  // crests and portraits
  for (const kind of ['crests', 'portraits']) {
    const src = path.join(root, 'src/art/raster', kind);
    const full = path.join(root, 'src/art/raster/web', kind);
    const thumb = path.join(root, 'src/art/raster/web', `${kind}-96`);
    fs.mkdirSync(full, { recursive: true }); fs.mkdirSync(thumb, { recursive: true });
    let before = 0, after = 0, n = 0;
    for (const f of fs.readdirSync(src).filter((x) => /\.(png|jpg|webp)$/i.test(x))) {
      const bytes = fs.readFileSync(path.join(src, f));
      before += bytes.length;
      const dataUrl = `data:image/${f.endsWith('.jpg') ? 'jpeg' : f.split('.').pop()};base64,${bytes.toString('base64')}`;
      const base = f.replace(/\.(png|jpg|webp)$/i, '');
      const dims = await page.evaluate(async (s) => { const i = new Image(); i.src = s; await i.decode(); return [i.naturalWidth, i.naturalHeight]; }, dataUrl);
      const big = Buffer.from(await toWebp(dataUrl, 0, 0, 0.85), 'base64');
      const small = Buffer.from(await toWebp(dataUrl, 96, Math.round((96 * dims[1]) / dims[0]), 0.82), 'base64');
      fs.writeFileSync(path.join(full, `${base}.webp`), big);
      fs.writeFileSync(path.join(thumb, `${base}.webp`), small);
      after += big.length; n++;
    }
    console.log(kind, n, 'files:', Math.round(before / 1024), 'KB PNG ->', Math.round(after / 1024), 'KB WebP');
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
