import type { JSX } from 'react';

// Heraldic charges drawn in a 100x100 box. `c` is the charge tincture, `k` a contrasting detail tincture.
// Shapes are flat silhouettes with ink detail, the way a herald paints a roll of arms.

const INK = '#2a1a10';
const o = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const l = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, fill: 'none' };

type Draw = (c: string, k: string) => JSX.Element;

/** A stroke drawn as an inked band: ink underlay, tincture on top. */
const band = (d: string, c: string, w: number) => (
  <>
    <path d={d} fill="none" stroke={INK} strokeWidth={w + 4} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </>
);

const hammerHead = (c: string) => (
  <g>
    <rect x="46.5" y="26" width="7" height="68" rx="2" fill={c} {...o} />
    <path d="M28 14 L64 14 L72 22 L72 34 L28 34 Z" fill={c} {...o} />
    <path d="M72 22 L84 26 L72 30" fill={c} {...o} />
    <path d="M46 94 L54 94" {...l} strokeWidth={4} />
  </g>
);

const skull = (c: string, k: string) => (
  <g>
    <path d="M50 14 C71 14 83 29 83 47 C83 59 77 66 70 68 L70 80 L30 80 L30 68 C23 66 17 59 17 47 C17 29 29 14 50 14 Z" fill={c} {...o} />
    <ellipse cx="37" cy="47" rx="9" ry="10" fill={k} {...o} strokeWidth={1.6} />
    <ellipse cx="63" cy="47" rx="9" ry="10" fill={k} {...o} strokeWidth={1.6} />
    <path d="M50 56 L45 66 L55 66 Z" fill={k} {...o} strokeWidth={1.4} />
    <path d="M38 72 L38 80 M46 72 L46 80 M54 72 L54 80 M62 72 L62 80" {...l} />
  </g>
);

const crown = (c: string, k: string) => (
  <g>
    <path d="M14 68 L18 30 L34 50 L50 20 L66 50 L82 30 L86 68 Z" fill={c} {...o} />
    <rect x="13" y="68" width="74" height="13" rx="2" fill={c} {...o} />
    {[26, 50, 74].map((x) => <circle key={x} cx={x} cy={74.5} r="3.6" fill={k} {...o} strokeWidth={1.2} />)}
    {[18, 50, 82].map((x, i) => <circle key={x} cx={x} cy={i === 1 ? 18 : 28} r="3.4" fill={c} {...o} strokeWidth={1.4} />)}
  </g>
);

const horseHead = (c: string, k: string) => (
  <g>
    <path d="M72 12 C82 22 85 40 81 57 L79 90 L50 90 C52 76 50 68 44 62 C36 64 25 66 17 62 C11 58 11 50 15 44 C23 34 35 24 47 18 L51 7 L59 15 C63 13 68 11 72 12 Z" fill={c} {...o} />
    <path d="M60 15 C70 26 76 40 76 56 L78 88" fill="none" stroke={k} strokeWidth="6" strokeLinecap="round" />
    <circle cx="40" cy="34" r="2.6" fill={INK} />
    <ellipse cx="19" cy="52" rx="2.2" ry="1.6" fill={INK} />
    <path d="M24 60 Q30 62 36 60" {...l} />
  </g>
);

const ghost = (c: string, k: string) => (
  <g>
    <path d="M24 88 L24 44 C24 24 36 12 50 12 C64 12 76 24 76 44 L76 88 L68 80 L60 88 L50 80 L40 88 L32 80 Z" fill={c} {...o} />
    <ellipse cx="41" cy="42" rx="5" ry="7" fill={k} {...o} strokeWidth={1.2} />
    <ellipse cx="59" cy="42" rx="5" ry="7" fill={k} {...o} strokeWidth={1.2} />
    <ellipse cx="50" cy="60" rx="6" ry="8" fill={k} {...o} strokeWidth={1.2} />
  </g>
);

const eye = (c: string, k: string) => (
  <g>
    <path d="M8 50 C24 28 76 28 92 50 C76 72 24 72 8 50 Z" fill={c} {...o} />
    <circle cx="50" cy="50" r="15" fill={k} {...o} />
    <circle cx="50" cy="50" r="6" fill={INK} />
    <circle cx="45" cy="45" r="2.4" fill={c} />
    {[[50, 22, 50, 12], [30, 27, 24, 18], [70, 27, 76, 18], [50, 78, 50, 88]].map(([a, b, x, y]) => <path key={`${x}${y}`} d={`M${a} ${b} L${x} ${y}`} {...l} strokeWidth={2.4} />)}
  </g>
);

const hood = (c: string, k: string) => (
  <g>
    <path d="M14 92 C16 54 26 16 50 10 C74 16 84 54 86 92 C74 86 66 86 50 92 C34 86 26 86 14 92 Z" fill={c} {...o} />
    <path d="M34 66 C34 42 40 30 50 28 C60 30 66 42 66 66 C60 72 40 72 34 66 Z" fill={k} {...o} />
    <circle cx="44" cy="52" r="2.6" fill={c} /><circle cx="56" cy="52" r="2.6" fill={c} />
  </g>
);

export const CHARGES: Record<string, { name: string; draw: Draw }> = {
  gauntlet: { name: 'a gauntlet clenched', draw: (c) => (
    <g>
      <path d="M30 46 C30 38 36 34 42 36 L44 30 C46 24 54 24 56 30 L58 28 C60 22 68 22 70 30 L72 32 C76 28 82 32 80 40 L78 62 C76 74 66 80 54 80 L46 80 C36 80 30 72 30 62 Z" fill={c} {...o} />
      <path d="M44 36 L44 50 M57 30 L57 48 M70 32 L70 48" {...l} />
      <path d="M30 50 C22 50 20 60 28 64 L44 66" fill={c} {...o} />
      <path d="M38 80 L70 80 L72 95 L36 95 Z" fill={c} {...o} />
      <path d="M38 87 L71 87" {...l} />
    </g>
  ) },
  anvil: { name: 'an anvil', draw: (c, k) => (
    <g>
      <path d="M10 32 L80 32 C86 32 90 28 92 22 L93 40 C84 45 74 46 66 46 L64 58 L76 72 L76 82 L24 82 L24 72 L36 58 L34 46 L20 46 C13 46 9 40 10 32 Z" fill={c} {...o} />
      <path d="M20 38 L76 38" {...l} stroke={k} strokeWidth={2.4} />
    </g>
  ) },
  mace: { name: 'a flanged mace', draw: (c) => (
    <g>
      <rect x="46" y="44" width="8" height="50" rx="2" fill={c} {...o} />
      <path d="M50 6 L58 17 L67 15 L65 25 L74 32 L65 39 L67 49 L57 47 L50 56 L43 47 L33 49 L35 39 L26 32 L35 25 L33 15 L42 17 Z" fill={c} {...o} />
      <circle cx="50" cy="32" r="6" {...l} />
    </g>
  ) },
  hammers: { name: 'two war hammers in saltire', draw: (c) => (
    <g>
      <g transform="rotate(-38 50 54)">{hammerHead(c)}</g>
      <g transform="rotate(38 50 54)">{hammerHead(c)}</g>
    </g>
  ) },
  hammer: { name: 'a war hammer', draw: (c) => hammerHead(c) },
  helm: { name: 'a great helm', draw: (c, k) => (
    <g>
      <path d="M24 40 C24 20 36 8 50 8 C64 8 76 20 76 40 L76 82 C76 88 72 92 66 92 L34 92 C28 92 24 88 24 82 Z" fill={c} {...o} />
      <path d="M28 46 L72 46" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M50 10 L50 92" {...l} />
      {[58, 66, 74].map((y) => <g key={y}><circle cx="40" cy={y} r="1.8" fill={INK} /><circle cx="60" cy={y} r="1.8" fill={INK} /></g>)}
      <path d="M34 22 Q42 14 50 13" fill="none" stroke={k} strokeWidth="3" opacity="0.7" />
    </g>
  ) },
  tower: { name: 'a tower embattled', draw: (c, k) => (
    <g>
      <path d="M30 92 L30 36 L24 36 L24 16 L33 16 L33 25 L41 25 L41 16 L50 16 L50 25 L59 25 L59 16 L67 16 L67 25 L76 25 L76 16 L76 36 L70 36 L70 92 Z" fill={c} {...o} />
      <path d="M43 92 L43 74 C43 66 57 66 57 74 L57 92 Z" fill={k} {...o} strokeWidth={1.6} />
      <rect x="47" y="44" width="6" height="12" rx="3" fill={k} {...o} strokeWidth={1.4} />
      <path d="M30 60 L70 60 M30 78 L43 78 M57 78 L70 78" {...l} strokeWidth={1.1} />
    </g>
  ) },
  cog: { name: 'a cogwheel', draw: (c, k) => {
    const teeth = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const x = 50 + Math.cos(a) * 40;
      const y = 50 + Math.sin(a) * 40;
      return <rect key={i} x={x - 6} y={y - 6} width="12" height="12" rx="1.5" fill={c} {...o} transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`} />;
    });
    return <g>{teeth}<circle cx="50" cy="50" r="34" fill={c} {...o} /><circle cx="50" cy="50" r="12" fill={k} {...o} /><circle cx="50" cy="50" r="24" {...l} /></g>;
  } },
  brokenSword: { name: 'a sword broken', draw: (c, k) => (
    <g>
      <path d="M44 40 L56 40 L56 66 L44 66 Z" fill={c} {...o} />
      <path d="M44 40 L47 34 L50 39 L53 32 L56 40" fill={c} {...o} />
      <path d="M62 8 L72 6 L74 30 L68 36 L64 31 L60 34 Z" fill={c} {...o} transform="rotate(14 66 20)" />
      <rect x="28" y="66" width="44" height="7" rx="2" fill={k} {...o} />
      <rect x="46" y="73" width="8" height="15" fill={c} {...o} />
      <circle cx="50" cy="92" r="5" fill={k} {...o} />
    </g>
  ) },
  bear: { name: "a bear's head", draw: (c, k) => (
    <g>
      <circle cx="28" cy="24" r="10" fill={c} {...o} /><circle cx="72" cy="24" r="10" fill={c} {...o} />
      <path d="M50 18 C72 18 84 34 82 54 C80 74 66 86 50 86 C34 86 20 74 18 54 C16 34 28 18 50 18 Z" fill={c} {...o} />
      <ellipse cx="50" cy="64" rx="15" ry="11" fill={k} {...o} />
      <path d="M44 58 C46 54 54 54 56 58 C54 62 46 62 44 58 Z" fill={INK} />
      <path d="M50 62 L50 68 M44 70 Q50 74 56 70" {...l} />
      <circle cx="38" cy="44" r="3" fill={INK} /><circle cx="62" cy="44" r="3" fill={INK} />
    </g>
  ) },
  flame: { name: 'a flame', draw: (c, k) => (
    <g>
      <path d="M50 6 C54 24 74 30 74 55 C74 74 63 90 50 90 C37 90 26 74 26 57 C26 42 34 35 39 24 C41 35 45 40 50 42 C47 30 45 19 50 6 Z" fill={c} {...o} />
      <path d="M50 46 C54 58 62 62 62 72 C62 80 56 86 50 86 C44 86 38 80 38 72 C38 64 46 60 50 46 Z" fill={k} {...o} strokeWidth={1.6} />
    </g>
  ) },
  hound: { name: "a hound's head", draw: (c, k) => (
    <g>
      <path d="M70 18 C82 20 86 34 82 46 L80 72 C78 84 66 90 58 88 L54 72 L30 68 C19 66 12 60 14 51 C16 45 25 43 33 41 C42 30 54 16 70 18 Z" fill={c} {...o} />
      <path d="M61 25 C75 29 78 50 71 63 C64 57 57 42 61 25 Z" fill={k} {...o} strokeWidth={1.6} />
      <circle cx="44" cy="40" r="2.6" fill={INK} />
      <ellipse cx="15" cy="50" rx="3.4" ry="2.6" fill={INK} />
      <path d="M18 58 Q28 62 38 58" {...l} />
      <path d="M56 84 L80 76" stroke={k} strokeWidth="6" />
    </g>
  ) },
  boot: { name: 'a boot', draw: (c, k) => (
    <g>
      <path d="M34 8 L62 8 L62 54 C72 56 88 62 90 74 L90 86 L24 86 L24 74 L34 70 Z" fill={c} {...o} />
      <path d="M24 80 L90 80" {...l} strokeWidth={2.4} />
      <path d="M38 20 L58 20 M38 30 L58 30 M38 40 L58 40" {...l} stroke={k} strokeWidth={2.4} />
    </g>
  ) },
  ram: { name: "a ram's head", draw: (c, k) => (
    <g>
      {band('M40 32 C26 14 6 26 10 46 C14 62 32 62 32 48 C32 40 22 40 22 46', k, 8)}
      {band('M60 32 C74 14 94 26 90 46 C86 62 68 62 68 48 C68 40 78 40 78 46', k, 8)}
      <path d="M38 28 L62 28 C66 46 64 70 57 86 L43 86 C36 70 34 46 38 28 Z" fill={c} {...o} />
      <circle cx="44" cy="46" r="2.4" fill={INK} /><circle cx="56" cy="46" r="2.4" fill={INK} />
      <path d="M45 78 Q50 82 55 78" {...l} />
    </g>
  ) },
  bull: { name: "a bull's head", draw: (c, k) => (
    <g>
      <path d="M36 32 C24 30 14 20 12 6 C22 14 30 18 40 22 Z" fill={k} {...o} />
      <path d="M64 32 C76 30 86 20 88 6 C78 14 70 18 60 22 Z" fill={k} {...o} />
      <path d="M32 28 C32 22 68 22 68 28 C72 46 68 64 62 74 C60 86 40 86 38 74 C32 64 28 46 32 28 Z" fill={c} {...o} />
      <circle cx="40" cy="44" r="2.6" fill={INK} /><circle cx="60" cy="44" r="2.6" fill={INK} />
      <ellipse cx="44" cy="74" rx="2.2" ry="3" fill={INK} /><ellipse cx="56" cy="74" rx="2.2" ry="3" fill={INK} />
      <circle cx="50" cy="84" r="6" fill="none" stroke={k} strokeWidth="3" />
    </g>
  ) },
  mountain: { name: 'a triple mount', draw: (c, k) => (
    <g>
      <path d="M4 88 L32 38 L44 54 L58 20 L96 88 Z" fill={c} {...o} />
      <path d="M58 20 L67 38 L61 34 L55 41 L50 36 Z" fill={k} {...o} strokeWidth={1.4} />
      <path d="M32 38 L38 48 L34 46 L30 50 L27 47 Z" fill={k} {...o} strokeWidth={1.4} />
    </g>
  ) },
  boar: { name: "a boar's head couped", draw: (c, k) => (
    <g>
      <path d="M86 30 C78 20 62 22 50 28 C38 34 27 40 17 46 C11 50 11 58 17 61 L29 65 C37 75 51 81 65 79 C79 77 88 65 88 51 Z" fill={c} {...o} />
      <path d="M50 28 L54 18 L58 26 L63 16 L66 25 L72 16 L74 26 L80 20" fill={c} {...o} strokeWidth={1.6} />
      <path d="M62 32 L70 22 L72 36 Z" fill={k} {...o} strokeWidth={1.4} />
      <path d="M27 60 C22 52 26 44 34 44 C30 50 30 56 33 62 Z" fill={k} {...o} strokeWidth={1.4} />
      <ellipse cx="14" cy="53" rx="3" ry="5" fill={k} {...o} strokeWidth={1.2} />
      <circle cx="46" cy="42" r="2.6" fill={INK} />
    </g>
  ) },
  wheel: { name: 'a cartwheel', draw: (c, k) => (
    <g>
      <circle cx="50" cy="50" r="40" fill="none" stroke={INK} strokeWidth="14" />
      <circle cx="50" cy="50" r="40" fill="none" stroke={c} strokeWidth="10" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <g key={i}>{band(`M${50 + Math.cos(a) * 10} ${50 + Math.sin(a) * 10} L${50 + Math.cos(a) * 34} ${50 + Math.sin(a) * 34}`, c, 4)}</g>;
      })}
      <circle cx="50" cy="50" r="10" fill={k} {...o} />
    </g>
  ) },
  axe: { name: 'a bearded axe', draw: (c, k) => (
    <g>
      <rect x="45" y="10" width="8" height="84" rx="3" fill={k} {...o} />
      <path d="M53 18 C70 14 86 26 88 46 C86 64 72 70 62 64 C66 54 62 46 53 44 Z" fill={c} {...o} />
      <path d="M58 24 C70 24 80 34 82 46" {...l} />
    </g>
  ) },
  bolt: { name: 'a thunderbolt issuing from a cloud', draw: (c, k) => (
    <g>
      <path d="M18 36 C10 36 8 24 18 22 C20 12 34 10 38 18 C44 8 60 10 62 20 C72 16 84 22 80 32 C88 34 86 44 78 44 L22 44 C14 44 12 38 18 36 Z" fill={k} {...o} />
      <path d="M56 44 L36 70 L50 70 L38 96 L70 60 L56 60 L66 44 Z" fill={c} {...o} />
    </g>
  ) },
  arrows: { name: 'a sheaf of three arrows', draw: (c, k) => (
    <g>
      {[-24, 0, 24].map((r) => (
        <g key={r} transform={`rotate(${r} 50 60)`}>
          {band('M50 22 L50 92', c, 3)}
          <path d="M50 6 L58 24 L42 24 Z" fill={c} {...o} />
          <path d="M50 78 L42 92 L42 82 Z M50 78 L58 92 L58 82 Z" fill={k} {...o} strokeWidth={1.4} />
        </g>
      ))}
      <rect x="36" y="56" width="28" height="7" rx="2" fill={k} {...o} />
    </g>
  ) },
  stag: { name: "a stag's head caboshed", draw: (c, k) => (
    <g>
      {band('M42 40 C36 28 28 20 18 8 M33 26 L20 28 M28 18 L32 6 M38 32 L26 40', k, 5)}
      {band('M58 40 C64 28 72 20 82 8 M67 26 L80 28 M72 18 L68 6 M62 32 L74 40', k, 5)}
      <path d="M32 44 L22 40 L30 50 Z M68 44 L78 40 L70 50 Z" fill={c} {...o} />
      <path d="M40 38 C38 54 40 74 50 90 C60 74 62 54 60 38 C56 32 44 32 40 38 Z" fill={c} {...o} />
      <circle cx="44" cy="52" r="2.4" fill={INK} /><circle cx="56" cy="52" r="2.4" fill={INK} />
      <ellipse cx="50" cy="84" rx="4" ry="3" fill={INK} />
    </g>
  ) },
  spear: { name: 'a spear with a pennon', draw: (c, k) => (
    <g>
      <rect x="47" y="24" width="6" height="72" rx="2" fill={c} {...o} />
      <path d="M50 4 C58 14 58 24 50 32 C42 24 42 14 50 4 Z" fill={c} {...o} />
      <path d="M53 36 L86 42 L72 48 L86 56 L53 58 Z" fill={k} {...o} />
    </g>
  ) },
  comet: { name: 'a comet', draw: (c, k) => (
    <g>
      {band('M62 40 C46 52 30 66 10 92', k, 5)}
      {band('M58 34 C40 40 24 48 6 64', k, 3)}
      {band('M68 46 C62 62 54 76 40 94', k, 3)}
      <path d="M68 14 L73 29 L89 29 L76 38 L81 54 L68 44 L55 54 L60 38 L47 29 L63 29 Z" fill={c} {...o} />
    </g>
  ) },
  phoenix: { name: 'a phoenix rising from flames', draw: (c, k) => (
    <g>
      <path d="M50 64 C38 74 40 84 30 94 L70 94 C60 84 62 74 50 64 Z" fill={k} {...o} />
      <path d="M46 46 C32 42 20 30 12 8 C24 18 28 16 32 22 C36 16 41 22 43 28 C44 22 48 26 48 34 Z" fill={c} {...o} />
      <path d="M54 46 C68 42 80 30 88 8 C76 18 72 16 68 22 C64 16 59 22 57 28 C56 22 52 26 52 34 Z" fill={c} {...o} />
      <path d="M50 28 C45 28 43 33 43 38 C43 48 46 56 50 68 C54 56 57 48 57 38 C57 33 55 28 50 28 Z" fill={c} {...o} />
      <path d="M50 28 C48 20 52 14 56 12 C54 18 54 22 52 28" fill={c} {...o} strokeWidth={1.4} />
      <circle cx="51" cy="34" r="1.6" fill={INK} />
    </g>
  ) },
  spire: { name: 'a spire', draw: (c, k) => (
    <g>
      <path d="M50 2 L64 42 L64 94 L36 94 L36 42 Z" fill={c} {...o} />
      <path d="M36 42 L64 42 M36 60 L64 60" {...l} />
      <path d="M45 94 L45 80 C45 74 55 74 55 80 L55 94 Z" fill={k} {...o} strokeWidth={1.4} />
      <circle cx="50" cy="50" r="4" fill={k} {...o} strokeWidth={1.2} />
    </g>
  ) },
  owl: { name: 'an owl', draw: (c, k) => (
    <g>
      <path d="M28 26 L38 36 C44 32 56 32 62 36 L72 26 L72 50 C76 72 64 90 50 90 C36 90 24 72 28 50 Z" fill={c} {...o} />
      <circle cx="40" cy="48" r="9" fill={k} {...o} /><circle cx="60" cy="48" r="9" fill={k} {...o} />
      <circle cx="40" cy="48" r="3.4" fill={INK} /><circle cx="60" cy="48" r="3.4" fill={INK} />
      <path d="M46 56 L50 64 L54 56 Z" fill={INK} />
      <path d="M36 70 Q50 78 64 70 M40 78 Q50 84 60 78" {...l} />
    </g>
  ) },
  crown: { name: 'a crown', draw: crown },
  sword: { name: 'a sword erect', draw: (c, k) => (
    <g>
      <path d="M45 66 L45 16 L50 4 L55 16 L55 66 Z" fill={c} {...o} />
      <path d="M50 12 L50 64" {...l} />
      <rect x="28" y="64" width="44" height="7" rx="2.5" fill={k} {...o} />
      <rect x="46" y="71" width="8" height="16" fill={c} {...o} />
      <circle cx="50" cy="91" r="5" fill={k} {...o} />
    </g>
  ) },
  eaglehead: { name: "an eagle's head erased", draw: (c, k) => (
    <g>
      <path d="M80 88 C72 72 74 54 70 42 C66 30 54 24 42 26 C30 28 20 36 16 46 C24 46 30 48 34 52 C30 56 26 62 28 68 C34 62 42 60 48 62 C52 72 50 82 46 92 L56 86 L62 94 L66 86 L74 94 Z" fill={c} {...o} />
      <path d="M16 46 C14 54 18 60 24 58 C26 54 30 50 34 52 C28 48 22 46 16 46 Z" fill={k} {...o} />
      <circle cx="44" cy="40" r="3" fill={INK} />
      <path d="M38 34 Q46 32 52 36" {...l} />
    </g>
  ) },
  mullet: { name: 'a mullet', draw: (c) => (
    <path d="M50 8 L61 38 L93 38 L67 57 L77 88 L50 69 L23 88 L33 57 L7 38 L39 38 Z" fill={c} {...o} />
  ) },
  scallop: { name: 'an escallop', draw: (c) => (
    <g>
      <path d="M50 86 C30 80 12 60 14 38 C16 22 32 12 50 12 C68 12 84 22 86 38 C88 60 70 80 50 86 Z" fill={c} {...o} />
      {[-36, -22, -8, 8, 22, 36].map((dx) => <path key={dx} d={`M50 84 L${50 + dx} 16`} {...l} />)}
      <path d="M38 80 L30 92 L50 88 L70 92 L62 80" fill={c} {...o} />
    </g>
  ) },
  bow: { name: 'a bow strung and arrow', draw: (c, k) => (
    <g>
      {band('M30 8 C70 26 70 74 30 92', c, 6)}
      <path d="M30 8 L30 92" {...l} strokeWidth={1.4} />
      {band('M14 50 L86 50', k, 3)}
      <path d="M92 50 L80 44 L80 56 Z" fill={k} {...o} />
    </g>
  ) },
  key: { name: 'a key in pale', draw: (c) => (
    <g>
      <circle cx="50" cy="22" r="14" fill={c} {...o} />
      <circle cx="50" cy="22" r="6" {...l} strokeWidth={2.2} />
      <rect x="46" y="34" width="8" height="54" fill={c} {...o} />
      <path d="M54 70 L68 70 L68 78 L62 78 L62 84 L54 84 Z" fill={c} {...o} />
    </g>
  ) },
  sun: { name: 'a sun in splendour', draw: (c, k) => (
    <g>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x1 = 50 + Math.cos(a) * 24, y1 = 50 + Math.sin(a) * 24;
        const x2 = 50 + Math.cos(a) * 44, y2 = 50 + Math.sin(a) * 44;
        if (i % 2 === 0) {
          const s = 0.18;
          return <path key={i} d={`M${50 + Math.cos(a - s) * 24} ${50 + Math.sin(a - s) * 24} L${x2} ${y2} L${50 + Math.cos(a + s) * 24} ${50 + Math.sin(a + s) * 24} Z`} fill={c} {...o} strokeWidth={1.6} />;
        }
        const mx = 50 + Math.cos(a + 0.12) * 34, my = 50 + Math.sin(a + 0.12) * 34;
        return <g key={i}>{band(`M${x1} ${y1} Q${mx} ${my} ${50 + Math.cos(a) * 40} ${50 + Math.sin(a) * 40}`, c, 3)}</g>;
      })}
      <circle cx="50" cy="50" r="22" fill={c} {...o} />
      <circle cx="43" cy="46" r="2.2" fill={INK} /><circle cx="57" cy="46" r="2.2" fill={INK} />
      <path d="M43 56 Q50 61 57 56" {...l} />
      <path d="M50 48 L48 53 L51 53" {...l} strokeWidth={1.2} stroke={k} />
    </g>
  ) },
  wing: { name: 'a wing', draw: (c) => (
    <g>
      <path d="M20 86 C16 56 30 24 74 10 C70 22 74 26 84 26 C74 34 76 40 86 44 C74 50 76 56 84 62 C70 66 70 72 76 80 C58 80 40 82 20 86 Z" fill={c} {...o} />
      <path d="M30 76 C40 56 54 38 72 22 M34 80 C48 66 62 54 80 46 M44 82 C56 76 66 70 78 66" {...l} />
    </g>
  ) },
  crystal: { name: 'a cluster of crystals', draw: (c, k) => (
    <g>
      <path d="M50 6 L64 28 L58 90 L42 90 L36 28 Z" fill={c} {...o} />
      <path d="M50 6 L50 90" {...l} />
      <path d="M30 40 L40 52 L38 90 L24 90 L20 54 Z" fill={k} {...o} />
      <path d="M70 40 L80 54 L76 90 L62 90 L60 52 Z" fill={k} {...o} />
    </g>
  ) },
  fox: { name: "a fox's mask", draw: (c, k) => (
    <g>
      <path d="M50 88 L28 60 C22 50 20 34 22 18 L36 32 C44 30 56 30 64 32 L78 18 C80 34 78 50 72 60 Z" fill={c} {...o} />
      <path d="M50 88 L36 66 C40 62 46 62 50 66 C54 62 60 62 64 66 Z" fill={k} {...o} strokeWidth={1.6} />
      <path d="M30 28 L36 40 L28 40 Z M70 28 L64 40 L72 40 Z" fill={k} {...o} strokeWidth={1.2} />
      <path d="M36 50 L44 52 M64 50 L56 52" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="84" r="3" fill={INK} />
    </g>
  ) },
  swan: { name: 'a swan', draw: (c, k) => (
    <g>
      <path d="M18 70 C28 84 70 86 88 70 C84 58 70 54 58 56 C52 48 50 38 52 28 C54 18 46 12 40 16 C36 20 38 26 44 26 C44 38 44 50 48 60 C36 58 26 60 18 70 Z" fill={c} {...o} />
      <path d="M40 16 L30 20 L38 22 Z" fill={k} {...o} strokeWidth={1.4} />
      <circle cx="43" cy="19" r="1.6" fill={INK} />
      <path d="M58 64 C66 62 76 64 82 68" {...l} />
      <path d="M8 90 Q20 84 32 90 Q44 96 56 90 Q68 84 80 90 Q88 94 94 90" {...l} strokeWidth={2} />
    </g>
  ) },
  horse: { name: "a horse's head", draw: horseHead },
  fish: { name: 'a fish naiant', draw: (c, k) => (
    <g>
      <path d="M8 50 C22 28 54 24 74 44 L92 28 L88 50 L92 72 L74 56 C54 76 22 72 8 50 Z" fill={c} {...o} />
      <path d="M44 34 L52 22 L58 36 Z M44 66 L50 76 L56 64 Z" fill={k} {...o} strokeWidth={1.4} />
      <circle cx="24" cy="46" r="3" fill={INK} />
      <path d="M34 40 Q38 50 34 60" {...l} />
      {[46, 56, 64].map((x) => <path key={x} d={`M${x} 44 Q${x + 4} 50 ${x} 56`} {...l} strokeWidth={1} />)}
    </g>
  ) },
  dagger: { name: 'a dagger', draw: (c, k) => (
    <g>
      <path d="M50 4 L57 22 L57 62 L43 62 L43 22 Z" fill={c} {...o} />
      <path d="M50 10 L50 60" {...l} />
      <path d="M30 62 L70 62 L66 70 L34 70 Z" fill={k} {...o} />
      <rect x="45" y="70" width="10" height="18" fill={k} {...o} />
      <circle cx="50" cy="92" r="5" fill={c} {...o} />
    </g>
  ) },
  ship: { name: 'a cog under sail', draw: (c, k) => (
    <g>
      <path d="M8 62 L92 62 L80 82 L20 82 Z" fill={c} {...o} />
      <path d="M20 70 L80 70" {...l} />
      <rect x="48" y="8" width="4" height="56" fill={INK} />
      <path d="M28 16 L72 16 C76 30 76 44 72 56 L28 56 C24 44 24 30 28 16 Z" fill={k} {...o} />
      <path d="M52 8 L66 12 L52 16 Z" fill={c} {...o} strokeWidth={1.2} />
      <path d="M6 92 Q16 86 26 92 Q36 98 46 92 Q56 86 66 92 Q76 98 86 92 Q90 90 94 92" {...l} strokeWidth={2} />
    </g>
  ) },
  jestercap: { name: "a fool's cap belled", draw: (c, k) => (
    <g>
      <path d="M20 78 C20 62 30 50 36 48 C30 36 18 32 8 36 C18 24 34 24 44 38 C44 24 50 14 50 6 C50 14 56 24 56 38 C66 24 82 24 92 36 C82 32 70 36 64 48 C70 50 80 62 80 78 Z" fill={c} {...o} />
      <rect x="18" y="76" width="64" height="12" rx="3" fill={k} {...o} />
      {[[8, 36], [50, 6], [92, 36]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5.5" fill={k} {...o} />)}
      <path d="M50 38 L50 76" {...l} />
    </g>
  ) },
  mask: { name: 'a mask', draw: (c, k) => (
    <g>
      <path d="M8 40 C20 28 40 30 50 40 C60 30 80 28 92 40 C94 56 84 68 70 66 C62 64 56 58 50 58 C44 58 38 64 30 66 C16 68 6 56 8 40 Z" fill={c} {...o} />
      <path d="M22 46 C26 40 36 40 40 46 C36 52 26 52 22 46 Z M60 46 C64 40 74 40 78 46 C74 52 64 52 60 46 Z" fill={k} {...o} />
      {band('M8 40 C4 34 2 30 4 24', c, 3)}
      {band('M92 40 C96 34 98 30 96 24', c, 3)}
    </g>
  ) },
  pirateskull: { name: 'a skull in a kerchief, eye-patched', draw: (c, k) => (
    <g>
      {skull(c, INK)}
      <path d="M17 44 C18 22 34 12 50 12 C68 12 82 22 83 40 C74 30 26 30 17 44 Z" fill={k} {...o} />
      <path d="M83 34 L94 30 L90 44 Z" fill={k} {...o} />
      <path d="M26 36 L72 58" stroke={INK} strokeWidth="3.4" />
      <ellipse cx="63" cy="47" rx="10" ry="11" fill={k} {...o} />
    </g>
  ) },
  dice: { name: 'two dice', draw: (c, k) => (
    <g>
      <rect x="10" y="34" width="38" height="38" rx="6" fill={c} {...o} transform="rotate(-12 29 53)" />
      <rect x="50" y="26" width="38" height="38" rx="6" fill={c} {...o} transform="rotate(14 69 45)" />
      {[[22, 46], [29, 53], [36, 60]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.2" fill={k} {...o} strokeWidth={1} transform="rotate(-12 29 53)" />)}
      {[[61, 37], [77, 37], [61, 53], [77, 53]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.2" fill={k} {...o} strokeWidth={1} transform="rotate(14 69 45)" />)}
    </g>
  ) },
  coin: { name: 'three bezants', draw: (c, k) => (
    <g>
      {[[30, 34], [70, 34], [50, 70]].map(([x, y]) => (
        <g key={x + y}>
          <circle cx={x} cy={y} r="18" fill={c} {...o} />
          <circle cx={x} cy={y} r="12" {...l} />
          <path d={`M${x - 6} ${y + 2} L${x - 6} ${y - 5} L${x - 2} ${y - 1} L${x} ${y - 7} L${x + 2} ${y - 1} L${x + 6} ${y - 5} L${x + 6} ${y + 2} Z`} fill={k} {...o} strokeWidth={1} />
        </g>
      ))}
    </g>
  ) },
  rat: { name: 'a rat crowned', draw: (c, k) => (
    <g>
      {band('M82 70 C94 66 96 82 84 86 C72 90 60 84 50 86', c, 3)}
      <path d="M14 64 C18 52 30 44 46 44 C66 44 82 54 82 70 C82 80 72 84 60 84 L30 84 C22 84 18 80 20 74 L10 70 Z" fill={c} {...o} />
      <circle cx="34" cy="48" r="8" fill={c} {...o} />
      <circle cx="22" cy="60" r="2.4" fill={INK} />
      <circle cx="10" cy="70" r="2" fill={INK} />
      <path d="M14 70 L2 66 M14 72 L2 74" {...l} strokeWidth={1} />
      <path d="M20 40 L22 26 L28 34 L32 22 L36 34 L42 26 L42 40 Z" fill={k} {...o} strokeWidth={1.4} />
    </g>
  ) },
  chest: { name: 'a coffer', draw: (c, k) => (
    <g>
      <path d="M12 46 C12 26 88 26 88 46 Z" fill={c} {...o} />
      <rect x="12" y="46" width="76" height="40" fill={c} {...o} />
      <path d="M28 30 L28 86 M72 30 L72 86" stroke={k} strokeWidth="6" />
      <rect x="42" y="46" width="16" height="18" rx="2" fill={k} {...o} />
      <circle cx="50" cy="54" r="2.4" fill={INK} />
    </g>
  ) },
  parrot: { name: 'a popinjay', draw: (c, k) => (
    <g>
      <path d="M44 20 C60 16 72 28 70 46 C68 62 62 76 66 94 L52 90 C44 74 36 60 36 44 C36 32 38 24 44 20 Z" fill={c} {...o} />
      <path d="M44 20 C34 20 28 28 30 38 C34 36 38 36 40 40 Z" fill={k} {...o} />
      <path d="M48 48 C58 52 64 64 62 80 C54 70 48 60 48 48 Z" fill={k} {...o} strokeWidth={1.6} />
      <circle cx="50" cy="30" r="2.6" fill={INK} />
      <path d="M20 94 L84 94" {...l} strokeWidth={4} />
    </g>
  ) },
  kraken: { name: 'a kraken issuant', draw: (c, k) => (
    <g>
      {band('M30 92 C26 70 12 64 16 46 C18 36 28 36 28 44', c, 9)}
      {band('M70 92 C74 70 88 64 84 46 C82 36 72 36 72 44', c, 9)}
      {band('M50 92 C50 64 40 50 46 30 C50 18 62 20 60 30', c, 10)}
      {[[18, 56], [82, 56], [48, 46], [44, 60]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.2" fill={k} />)}
    </g>
  ) },
  barrel: { name: 'a tun', draw: (c, k) => (
    <g>
      <path d="M26 14 C18 34 18 66 26 86 L74 86 C82 66 82 34 74 14 Z" fill={c} {...o} />
      {[24, 50, 76].map((y) => <path key={y} d={`M${y === 50 ? 20 : 23} ${y} L${y === 50 ? 80 : 77} ${y}`} stroke={k} strokeWidth="6" />)}
      <path d="M40 14 C36 38 36 62 40 86 M60 14 C64 38 64 62 60 86" {...l} />
    </g>
  ) },
  cat: { name: "a cat's face", draw: (c, k) => (
    <g>
      <path d="M50 86 C30 86 16 74 16 56 C16 42 20 32 24 12 L40 28 C46 26 54 26 60 28 L76 12 C80 32 84 42 84 56 C84 74 70 86 50 86 Z" fill={c} {...o} />
      <path d="M32 50 C36 46 42 46 44 52 C40 56 34 56 32 50 Z M68 50 C64 46 58 46 56 52 C60 56 66 56 68 50 Z" fill={k} {...o} strokeWidth={1.4} />
      <path d="M46 62 L54 62 L50 68 Z" fill={INK} />
      <path d="M50 68 Q44 74 40 70 M50 68 Q56 74 60 70 M28 64 L10 60 M28 68 L10 70 M72 64 L90 60 M72 68 L90 70" {...l} />
    </g>
  ) },
  anchor: { name: 'an anchor', draw: (c) => (
    <g>
      <circle cx="50" cy="14" r="8" fill="none" stroke={INK} strokeWidth="8" />
      <circle cx="50" cy="14" r="8" fill="none" stroke={c} strokeWidth="4" />
      {band('M50 22 L50 88', c, 7)}
      {band('M30 34 L70 34', c, 6)}
      {band('M14 62 C16 80 34 90 50 88 C66 90 84 80 86 62', c, 7)}
      <path d="M8 66 L16 54 L22 68 Z M92 66 L84 54 L78 68 Z" fill={c} {...o} />
    </g>
  ) },
  bomb: { name: 'a grenade fired', draw: (c, k) => (
    <g>
      <circle cx="46" cy="58" r="32" fill={c} {...o} />
      <rect x="54" y="20" width="14" height="12" rx="2" fill={c} {...o} transform="rotate(30 61 26)" />
      {band('M66 22 C72 12 80 12 84 8', '#8a6a3a', 2)}
      <path d="M84 8 L90 2 L88 10 L96 10 L88 14 L92 20 L84 16 Z" fill={k} {...o} strokeWidth={1.2} />
      <ellipse cx="36" cy="46" rx="8" ry="5" fill="#fff" opacity="0.35" transform="rotate(-30 36 46)" />
    </g>
  ) },
  shark: { name: 'a shark naiant', draw: (c, k) => (
    <g>
      <path d="M4 58 C20 40 46 34 70 42 L92 26 L86 52 L94 74 L70 60 C50 70 22 70 4 58 Z" fill={c} {...o} />
      <path d="M42 38 L52 14 L60 40 Z" fill={c} {...o} />
      <path d="M4 58 C14 62 26 64 36 62" {...l} />
      <path d="M10 60 l3 3 l3 -3 l3 3 l3 -3 l3 3" {...l} stroke={k} strokeWidth={1.6} />
      <circle cx="20" cy="52" r="2.4" fill={INK} />
      <path d="M38 50 Q40 56 38 62 M44 50 Q46 56 44 62" {...l} />
    </g>
  ) },
  crow: { name: 'a crow', draw: (c, k) => (
    <g>
      <path d="M20 40 C26 28 40 24 50 30 C64 36 72 50 88 52 C80 60 70 62 62 60 C60 72 52 80 40 82 L34 92 L30 82 C24 74 22 60 26 50 Z" fill={c} {...o} />
      <path d="M20 40 L6 44 L20 48 Z" fill={k} {...o} strokeWidth={1.4} />
      <circle cx="28" cy="38" r="2.4" fill={k} />
      <path d="M40 50 C50 52 58 58 62 60 M36 60 C44 62 52 66 56 70" {...l} />
    </g>
  ) },
  apple: { name: 'an apple, a worm issuant', draw: (c, k) => (
    <g>
      <path d="M50 30 C36 18 12 26 14 52 C16 76 34 92 50 84 C66 92 84 76 86 52 C88 26 64 18 50 30 Z" fill={c} {...o} />
      {band('M50 30 C50 22 52 16 56 12', '#6b4423', 3)}
      <path d="M56 18 C64 8 76 10 78 14 C70 20 62 22 56 18 Z" fill={k} {...o} strokeWidth={1.4} />
      {band('M66 56 C74 52 80 44 76 38', '#e8a0a8', 5)}
      <circle cx="77" cy="37" r="1.4" fill={INK} />
      <circle cx="64" cy="58" r="5" fill="#5a2a1a" {...o} strokeWidth={1} />
    </g>
  ) },
  cards: { name: 'two playing cards', draw: (c, k) => (
    <g>
      <rect x="16" y="16" width="40" height="60" rx="5" fill={c} {...o} transform="rotate(-14 36 46)" />
      <rect x="44" y="20" width="40" height="60" rx="5" fill={c} {...o} transform="rotate(12 64 50)" />
      <path d="M64 40 C58 34 54 42 64 54 C74 42 70 34 64 40 Z" fill={k} {...o} strokeWidth={1.2} transform="rotate(12 64 50)" />
      <path d="M33 34 L41 46 L33 58 L25 46 Z" fill={k} {...o} strokeWidth={1.2} transform="rotate(-14 36 46)" />
    </g>
  ) },
  skull: { name: 'a skull', draw: (c, k) => skull(c, k) },
  ghost: { name: 'a spectre', draw: ghost },
  spade: { name: 'a spade', draw: (c, k) => (
    <g>
      <path d="M40 6 L60 6 L60 12 L54 12 L54 20 L46 20 L46 12 L40 12 Z" fill={k} {...o} />
      <rect x="46" y="18" width="8" height="46" fill={k} {...o} />
      <path d="M32 60 L68 60 L68 80 C68 90 58 96 50 96 C42 96 32 90 32 80 Z" fill={c} {...o} />
    </g>
  ) },
  comb: { name: 'a comb', draw: (c, k) => (
    <g>
      <path d="M10 30 C30 22 70 22 90 30 L90 46 L10 46 Z" fill={c} {...o} />
      {Array.from({ length: 11 }, (_, i) => <rect key={i} x={12 + i * 7.2} y="46" width="4.4" height="40" rx="2" fill={c} {...o} strokeWidth={1.4} />)}
      <circle cx="50" cy="36" r="4" fill={k} {...o} strokeWidth={1.2} />
    </g>
  ) },
  hood: { name: 'a hooded wraith', draw: hood },
  scythe: { name: 'a scythe', draw: (c, k) => (
    <g>
      {band('M30 96 C34 66 40 40 44 10', k, 5)}
      <path d="M44 10 C62 6 84 14 94 34 C80 26 64 22 46 24 Z" fill={c} {...o} />
      {band('M36 54 L48 58', k, 4)}
    </g>
  ) },
  crownedskull: { name: 'a skull crowned', draw: (c, k) => (
    <g>
      <g transform="translate(10 18) scale(0.8)">{skull(c, k)}</g>
      <g transform="translate(22 -2) scale(0.56)">{crown(c, k)}</g>
    </g>
  ) },
  bat: { name: 'a bat displayed', draw: (c, k) => (
    <g>
      <path d="M50 34 C38 30 22 26 4 34 C12 40 14 48 12 56 C20 52 26 54 30 60 C34 54 40 54 44 58 L50 66 L56 58 C60 54 66 54 70 60 C74 54 80 52 88 56 C86 48 88 40 96 34 C78 26 62 30 50 34 Z" fill={c} {...o} />
      <path d="M44 34 L42 24 L48 30 L52 30 L58 24 L56 34" fill={c} {...o} strokeWidth={1.6} />
      <circle cx="46" cy="38" r="1.8" fill={k} /><circle cx="54" cy="38" r="1.8" fill={k} />
    </g>
  ) },
  hand: { name: 'a hand clawed', draw: (c, k) => (
    <g>
      <path d="M34 94 L34 58 L26 40 C24 34 30 30 34 34 L40 46 L40 18 C40 12 48 12 48 18 L48 42 L50 12 C50 6 58 6 58 12 L58 42 L62 18 C62 12 70 12 70 18 L68 48 L72 32 C74 26 82 28 80 34 L74 64 L70 94 Z" fill={c} {...o} />
      {[[40, 18], [50, 12], [62, 18], [76, 30]].map(([x, y]) => <path key={x} d={`M${x - 2} ${y + 2} L${x + 1} ${y - 8} L${x + 3} ${y + 2}`} fill={k} {...o} strokeWidth={1.2} />)}
      <path d="M34 78 L70 78" {...l} />
    </g>
  ) },
  bones: { name: 'two bones in saltire', draw: (c) => (
    <g>
      {[-42, 42].map((r) => (
        <g key={r} transform={`rotate(${r} 50 50)`}>
          <rect x="45" y="14" width="10" height="72" rx="4" fill={c} {...o} />
          <circle cx="44" cy="14" r="7" fill={c} {...o} /><circle cx="56" cy="14" r="7" fill={c} {...o} />
          <circle cx="44" cy="86" r="7" fill={c} {...o} /><circle cx="56" cy="86" r="7" fill={c} {...o} />
          <rect x="46.6" y="12" width="6.8" height="76" fill={c} />
        </g>
      ))}
    </g>
  ) },
  moon: { name: 'a crescent', draw: (c) => (
    <g>
      <path d="M62 8 C34 10 16 30 16 54 C16 78 36 94 60 92 C42 84 32 70 32 52 C32 32 44 16 62 8 Z" fill={c} {...o} />
      <path d="M80 26 L82 32 L88 34 L82 36 L80 42 L78 36 L72 34 L78 32 Z" fill={c} {...o} strokeWidth={1.2} />
    </g>
  ) },
  lantern: { name: 'a lantern lit', draw: (c, k) => (
    <g>
      {band('M40 16 C40 4 60 4 60 16', c, 3)}
      <path d="M32 16 L68 16 L64 26 L36 26 Z" fill={c} {...o} />
      <rect x="34" y="26" width="32" height="48" fill={c} {...o} />
      <rect x="40" y="32" width="20" height="36" fill={k} {...o} strokeWidth={1.4} />
      <path d="M50 40 C54 48 56 52 54 58 C52 62 48 62 46 58 C44 52 46 48 50 40 Z" fill="#e8a02a" {...o} strokeWidth={1} />
      <path d="M30 74 L70 74 L64 86 L36 86 Z" fill={c} {...o} />
    </g>
  ) },
  bell: { name: 'a bell', draw: (c, k) => (
    <g>
      {band('M44 14 C44 6 56 6 56 14', c, 3)}
      <path d="M50 14 C30 14 26 32 26 50 C26 64 22 72 12 80 L88 80 C78 72 74 64 74 50 C74 32 70 14 50 14 Z" fill={c} {...o} />
      <path d="M18 72 L82 72" {...l} />
      <circle cx="50" cy="86" r="7" fill={k} {...o} />
    </g>
  ) },
  eye: { name: 'an eye', draw: eye },
  cauldron: { name: 'a cauldron', draw: (c, k) => (
    <g>
      <path d="M14 40 L86 40 C88 66 74 86 50 86 C26 86 12 66 14 40 Z" fill={c} {...o} />
      <rect x="10" y="34" width="80" height="10" rx="4" fill={c} {...o} />
      <path d="M26 82 L20 94 M74 82 L80 94" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      {[[34, 24, 7], [52, 18, 9], [68, 26, 6]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill={k} {...o} strokeWidth={1.4} />)}
    </g>
  ) },
  candle: { name: 'a taper lit', draw: (c, k) => (
    <g>
      <path d="M50 6 C56 16 58 22 56 28 C54 32 46 32 44 28 C42 22 44 16 50 6 Z" fill={k} {...o} strokeWidth={1.4} />
      <path d="M38 34 L62 34 L62 84 L38 84 Z" fill={c} {...o} />
      <path d="M38 34 C38 44 44 46 44 54 C44 46 48 40 50 34" fill={c} {...o} strokeWidth={1.4} />
      <path d="M24 84 L76 84 L72 94 L28 94 Z" fill={k} {...o} />
    </g>
  ) },
  tombstone: { name: 'a gravestone', draw: (c, k) => (
    <g>
      <path d="M22 92 L22 40 C22 18 78 18 78 40 L78 92 Z" fill={c} {...o} />
      <path d="M36 46 L64 46 M36 56 L64 56 M40 66 L60 66" stroke={k} strokeWidth="4" strokeLinecap="round" />
      <path d="M10 92 L90 92" {...l} strokeWidth={3} />
      <path d="M26 92 C28 86 34 86 36 92 M66 92 C68 86 74 86 76 92" {...l} />
    </g>
  ) },
  hourglass: { name: 'an hourglass', draw: (c, k) => (
    <g>
      <rect x="20" y="8" width="60" height="10" rx="3" fill={c} {...o} />
      <rect x="20" y="82" width="60" height="10" rx="3" fill={c} {...o} />
      <path d="M30 18 L70 18 C70 36 56 44 54 50 C56 56 70 64 70 82 L30 82 C30 64 44 56 46 50 C44 44 30 36 30 18 Z" fill={k} {...o} />
      <path d="M38 30 L62 30 C58 38 52 42 50 46 C48 42 42 38 38 30 Z M36 80 C40 70 46 66 50 64 C54 66 60 70 64 80 Z" fill={c} {...o} strokeWidth={1.2} />
      <path d="M24 18 L24 82 M76 18 L76 82" stroke={c} strokeWidth="4" />
    </g>
  ) },
};

// Every nickname in the world maps to its own charge; unknown names fall back to a mullet.
export const NICKNAME_CHARGE: Record<string, string> = {
  Crushers: 'gauntlet', Anvils: 'anvil', Maulers: 'mace', Hammers: 'hammers', Ironclads: 'helm', Wreckers: 'hammer', Titans: 'tower', Grinders: 'cog',
  Breakers: 'brokenSword', Brawlers: 'bear', Forged: 'flame', Warhounds: 'hound', Stompers: 'boot', Bruisers: 'ram', Juggernauts: 'bull', Earthshakers: 'mountain',
  Ironjaws: 'boar', Bulldozers: 'wheel', Ravagers: 'axe', Thunderlords: 'bolt',
  Arrows: 'arrows', Stags: 'stag', Sentinels: 'spear', Comets: 'comet', Phoenix: 'phoenix', Spires: 'spire', Whisperers: 'owl', Sovereigns: 'crown',
  Blades: 'sword', Eagles: 'eaglehead', Starweavers: 'mullet', Wanderers: 'scallop', Fletchers: 'bow', Wardens: 'key', Luminaries: 'sun', Valkyries: 'wing',
  Enchanters: 'crystal', Foxes: 'fox', Dancers: 'swan', Sunriders: 'horse',
  Mudskippers: 'fish', Cutthroats: 'dagger', Marauders: 'ship', Misfits: 'jestercap', Bandits: 'mask', Pirates: 'pirateskull', Swindlers: 'coin', Scoundrels: 'dice',
  'Rat Kings': 'rat', Looters: 'chest', Scallywags: 'parrot', Fangtooths: 'kraken', Smugglers: 'barrel', Rogues: 'cat', 'Salty Dogs': 'anchor', Firecrackers: 'bomb',
  Sharks: 'shark', Crows: 'crow', Maggots: 'apple', Knaves: 'cards',
  Revenants: 'skull', Spectres: 'ghost', Gravediggers: 'spade', Banshees: 'comb', Phantoms: 'mask', Wraiths: 'hood', Reapers: 'scythe', Liches: 'crownedskull',
  Nightmares: 'bat', Ghouls: 'hand', Bonebreakers: 'bones', Shadows: 'moon', Haunters: 'lantern', Deathknells: 'bell', 'Pale Riders': 'horse', Hexers: 'cauldron',
  Shrouds: 'candle', Watchers: 'eye', Ghostwalkers: 'tombstone', Undying: 'hourglass',
};
