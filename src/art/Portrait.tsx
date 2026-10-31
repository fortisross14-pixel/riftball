import { memo, useId } from 'react';
import type { JSX } from 'react';
import type { Player, Race, Rarity, Role } from '../types';
import { dice, type Dice } from './hash';
import { darken, lighten } from './color';
import { paintedPortrait } from './registry';

// Illuminated-miniature portraits: flat pigment fills, iron-gall ink outlines, white-lead highlights,
// set on a tooled ground whose pigment follows the athlete's rarity.

export const INK = '#2a1a10';
const TEETH = '#f3e9cf';
const EYE_WHITE = '#f6eedb';

type Ctx = {
  d: Dice;
  skin: string;
  shade: string;
  hi: string;
  hair: string;
  iris: string;
  expr: 0 | 1 | 2 | 3; // calm, grin, grim, roar
  clip: string;
  a: string; // house colour
  b: string; // house metal
  paint: boolean;
  scar: boolean;
};

const ink = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const fine = { stroke: INK, strokeWidth: 1.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, fill: 'none' };

const SKINS: Record<Race, string[]> = {
  Human: ['#f1c9a5', '#e2ad84', '#c48a5f', '#9a6440', '#6e4429'],
  Orc: ['#7fa35a', '#6b904a', '#8fae66', '#5c7f45', '#7b9a72'],
  Elf: ['#f3dcc0', '#ead0ae', '#dcbb95', '#b8a6cc', '#c9b49a'],
  Dwarf: ['#e8ad8a', '#d29373', '#b77b5c', '#8f5d42'],
  Goblin: ['#a2c45c', '#8db04f', '#b8c86c', '#7fa46e', '#c0b25a'],
  Troll: ['#8d9aa9', '#7c8f86', '#9aa1b6', '#88917a'],
  Lizardkin: ['#5f9c7a', '#4f8a8a', '#7aa35a', '#a07a4a', '#6f7fa8'],
  Revenant: ['#c9cfc4', '#b8c0c7', '#d6d0bc', '#a9b6ad'],
  Satyr: ['#d9a37c', '#bd865f', '#e5bb94', '#a8714c'],
};
const HAIRS: Record<Race, string[]> = {
  Human: ['#2b1a12', '#5a3420', '#9a5a2a', '#d4ad5a', '#8d8a86', '#a8341c'],
  Orc: ['#1f1a17', '#3b2a1e', '#5a2c1c', '#c9c1b0'],
  Elf: ['#efe2b8', '#d9b45a', '#2a2238', '#8a3b23', '#c8ccd6'],
  Dwarf: ['#a8411f', '#5a3420', '#2b1a12', '#c8c2b6', '#d49a3c'],
  Goblin: ['#1f1a17', '#4a3a2a', '#b84a2a', '#d8d0b8'],
  Troll: ['#3d4a33', '#5a5f45', '#2c2f38'],
  Lizardkin: ['#c94f3a', '#e0b040', '#4a6fb5', '#8a3a8a'],
  Revenant: ['#e8e6dc', '#9aa0a8', '#2b2a30'],
  Satyr: ['#3a2416', '#6b4423', '#a46a3a', '#d8c8a0'],
};
const IRIS = ['#2f5f8f', '#3f7a3a', '#6b4423', '#7a5a1a', '#4a3a7a', '#2a2a2a'];

const GROUND: Record<Rarity, { id: string; base: string; rim: string }> = {
  Ordinary: { id: 'rb-ground-ordinary', base: '#b7a07a', rim: '#6a5236' },
  Professional: { id: 'rb-ground-professional', base: '#2f6b57', rim: '#173a2f' },
  Elite: { id: 'rb-ground-elite', base: '#1f3d7a', rim: '#0f2048' },
  Extraordinary: { id: 'rb-ground-extraordinary', base: '#5a2a6b', rim: '#2e1238' },
  Legendary: { id: 'rb-ground-legendary', base: '#c8962e', rim: '#7a5414' },
  Generational: { id: 'rb-ground-generational', base: '#a3271c', rim: '#56110b' },
};

/* ---------------------------------------------------------------- shared features */

function Eyes({ y, gap = 13, iris, kind = 'almond', expr }: { y: number; gap?: number; iris: string; kind?: 'almond' | 'small' | 'big' | 'slit' | 'glow' | 'round'; expr: Ctx['expr'] }) {
  const xs = [90 - gap, 90 + gap];
  const brows = xs.map((x, i) => {
    const dir = i === 0 ? 1 : -1;
    const tilt = expr === 2 || expr === 3 ? 4 : expr === 1 ? -1 : 1;
    return <path key={`b${i}`} d={`M${x - 8 * dir} ${y - 9 + (tilt > 0 ? -tilt / 2 : 0)} Q${x} ${y - 13} ${x + 8 * dir} ${y - 9 + tilt}`} {...fine} strokeWidth={2.6} />;
  });
  return (
    <g>
      {xs.map((x, i) => {
        if (kind === 'glow') {
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={9} ry={8} fill="#1d1a22" />
              <circle cx={x} cy={y} r={5.5} fill={iris} opacity={0.35} />
              <circle cx={x} cy={y} r={2.6} fill={lighten(iris, 0.5)} />
            </g>
          );
        }
        if (kind === 'small') {
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={4.2} ry={3.4} fill={EYE_WHITE} {...ink} strokeWidth={1.6} />
              <circle cx={x} cy={y + 0.3} r={2} fill={iris} />
            </g>
          );
        }
        if (kind === 'slit') {
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={6.5} ry={5.5} fill={iris} {...ink} strokeWidth={1.8} />
              <ellipse cx={x} cy={y} rx={1.4} ry={4.6} fill={INK} />
              <circle cx={x - 2} cy={y - 2} r={1.1} fill="#fff" opacity={0.8} />
            </g>
          );
        }
        if (kind === 'big') {
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={8.5} ry={8} fill={iris} {...ink} strokeWidth={1.8} />
              <circle cx={x + (i ? -1 : 1)} cy={y + 1} r={2.4} fill={INK} />
              <circle cx={x - 2.5} cy={y - 3} r={1.6} fill="#fff" />
            </g>
          );
        }
        const rx = kind === 'round' ? 6 : 7;
        const lift = kind === 'almond' && i === 0 ? -1 : kind === 'almond' ? 1 : 0;
        return (
          <g key={i}>
            <path d={`M${x - rx} ${y + lift * 0.5} Q${x} ${y - 6} ${x + rx} ${y - lift * 0.5} Q${x} ${y + 4.5} ${x - rx} ${y + lift * 0.5} Z`} fill={EYE_WHITE} {...ink} strokeWidth={1.7} />
            <circle cx={x} cy={y - 0.4} r={2.9} fill={iris} />
            <circle cx={x} cy={y - 0.4} r={1.3} fill={INK} />
            <circle cx={x - 1.2} cy={y - 1.6} r={0.8} fill="#fff" />
          </g>
        );
      })}
      {kind !== 'glow' && brows}
    </g>
  );
}

function Mouth({ y, expr, width = 10 }: { y: number; expr: Ctx['expr']; width?: number }) {
  const l = 90 - width;
  const r = 90 + width;
  if (expr === 1) return <path d={`M${l - 2} ${y - 2} Q90 ${y + 9} ${r + 2} ${y - 2} Q90 ${y + 3} ${l - 2} ${y - 2} Z`} fill={TEETH} {...ink} strokeWidth={1.8} />;
  if (expr === 2) return <path d={`M${l} ${y + 2} Q90 ${y - 2} ${r} ${y + 2}`} {...fine} strokeWidth={2.2} />;
  if (expr === 3) {
    return (
      <g>
        <ellipse cx={90} cy={y + 3} rx={width * 0.75} ry={6.5} fill="#4a1810" {...ink} strokeWidth={1.8} />
        <path d={`M${90 - width * 0.6} ${y - 1} L${90 + width * 0.6} ${y - 1}`} stroke={TEETH} strokeWidth={2.6} />
      </g>
    );
  }
  return <path d={`M${l + 2} ${y} Q90 ${y + 3.5} ${r - 2} ${y}`} {...fine} strokeWidth={2} />;
}

function Shading({ face, c, light = true }: { face: string; c: Ctx; light?: boolean }) {
  return (
    <>
      <clipPath id={c.clip}><path d={face} /></clipPath>
      <g clipPath={`url(#${c.clip})`}>
        <ellipse cx={124} cy={100} rx={36} ry={56} fill={c.shade} opacity={0.55} />
        {light && <ellipse cx={72} cy={62} rx={11} ry={15} fill={c.hi} opacity={0.45} />}
        <ellipse cx={74} cy={98} rx={7} ry={4.5} fill="#d4584a" opacity={0.18} />
        <ellipse cx={106} cy={98} rx={7} ry={4.5} fill="#d4584a" opacity={0.14} />
      </g>
    </>
  );
}

function Paint({ c, y }: { c: Ctx; y: number }) {
  if (!c.paint) return null;
  return (
    <g clipPath={`url(#${c.clip})`} opacity={0.85}>
      <path d={`M54 ${y - 3} L126 ${y - 3}`} stroke={c.a} strokeWidth={5} />
      <path d={`M54 ${y + 4} L82 ${y + 4} M98 ${y + 4} L126 ${y + 4}`} stroke={c.b} strokeWidth={2} />
    </g>
  );
}

function Scar({ c, x = 104, y = 72 }: { c: Ctx; x?: number; y?: number }) {
  if (!c.scar) return null;
  return (
    <g>
      <path d={`M${x} ${y} L${x + 7} ${y + 16}`} stroke="#7a3428" strokeWidth={1.8} strokeLinecap="round" />
      {[4, 8, 12].map((t) => <path key={t} d={`M${x + t * 0.45 - 2.5} ${y + t + 1} l5 -2`} stroke="#7a3428" strokeWidth={1.1} />)}
    </g>
  );
}

const nose = (y: number) => <path d={`M88 ${y - 12} Q85 ${y} 87 ${y + 2} Q90 ${y + 4} 94 ${y + 1}`} {...fine} strokeWidth={1.8} />;

/* ---------------------------------------------------------------- races */

function Human(c: Ctx) {
  const face = 'M90 40 C112 40 122 58 121 80 C120 104 106 121 90 121 C74 121 60 104 59 80 C58 58 68 40 90 40 Z';
  const style = c.d.int(0, 5);
  const beard = c.d.chance(0.45);
  const back = style === 1
    ? <path d="M58 72 C54 40 76 30 92 30 C114 30 128 46 124 74 L128 138 C118 146 110 140 112 122 L68 122 C70 140 60 146 52 140 Z" fill={c.hair} {...ink} />
    : style === 2 ? <circle cx={90} cy={33} r={11} fill={c.hair} {...ink} /> : null;
  const front = [
    <path key="crop" d="M60 78 C57 50 72 35 90 35 C110 35 124 50 120 79 C116 64 106 56 90 55 C75 55 64 62 60 78 Z" fill={c.hair} {...ink} />,
    <path key="long" d="M60 76 C62 48 80 37 96 39 C113 41 123 54 121 74 C111 59 96 52 79 58 C70 61 64 67 60 76 Z" fill={c.hair} {...ink} />,
    <path key="bun" d="M60 74 C60 50 74 38 90 38 C106 38 120 50 120 74 C112 60 102 54 90 54 C78 54 68 60 60 74 Z" fill={c.hair} {...ink} />,
    <g key="knot"><path d="M74 44 C80 38 100 38 106 44 C102 52 78 52 74 44 Z" fill={c.hair} {...ink} /><path d="M86 42 C82 26 98 26 94 42" fill={c.hair} {...ink} /><path d="M62 76 C60 64 64 56 68 52 M118 76 C120 64 116 56 112 52" {...fine} strokeDasharray="2 3" /></g>,
    <g key="curl">{[62, 70, 79, 88, 97, 106, 115].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 44 : 50 - (i === 0 || i === 6 ? -10 : 0)} r={9} fill={c.hair} {...ink} strokeWidth={1.8} />)}</g>,
    <path key="bald" d="M72 46 Q90 40 108 46" {...fine} stroke={c.hi} strokeWidth={3} opacity={0.6} />,
  ][style];
  return (
    <g>
      {back}
      <ellipse cx={59} cy={84} rx={5} ry={9} fill={c.skin} {...ink} />
      <ellipse cx={121} cy={84} rx={5} ry={9} fill={c.skin} {...ink} />
      <path d={face} fill={c.skin} {...ink} />
      <Shading face={face} c={c} />
      <Paint c={c} y={80} />
      <Eyes y={80} iris={c.iris} expr={c.expr} />
      {nose(96)}
      {beard ? (
        <g>
          <path d="M61 90 C63 116 77 130 90 130 C103 130 117 116 119 90 C113 104 104 110 90 110 C76 110 67 104 61 90 Z" fill={c.hair} {...ink} />
          <path d="M78 104 Q90 98 102 104" fill="none" stroke={c.hair} strokeWidth={5} strokeLinecap="round" />
          <Mouth y={109} expr={c.expr} width={7} />
        </g>
      ) : <Mouth y={108} expr={c.expr} />}
      <Scar c={c} />
      {front}
    </g>
  );
}

function Orc(c: Ctx) {
  const face = 'M90 42 C114 42 127 58 127 80 C127 98 123 113 112 121 C104 127 76 127 68 121 C57 113 53 98 53 80 C53 58 66 42 90 42 Z';
  const hair = c.d.int(0, 2);
  return (
    <g>
      <path d="M57 74 L34 62 L50 90 Z" fill={c.skin} {...ink} />
      <path d="M123 74 L146 62 L130 90 Z" fill={c.skin} {...ink} />
      <path d="M47 72 L40 68" {...fine} />
      <path d={face} fill={c.skin} {...ink} />
      <Shading face={face} c={c} />
      <Paint c={c} y={84} />
      <path d="M63 74 C73 65 84 69 90 73 C96 69 107 65 117 74 L115 80 C105 74 97 78 90 80 C83 78 75 74 65 80 Z" fill={c.shade} {...ink} strokeWidth={1.8} />
      <Eyes y={85} gap={14} iris={c.d.pick(['#d4a017', '#c0392b', '#e0c040'])} kind="small" expr={c.expr} />
      <path d="M82 92 C80 100 84 104 90 104 C96 104 100 100 98 92" fill={c.shade} {...ink} strokeWidth={1.8} />
      <circle cx={86} cy={100} r={1.5} fill={INK} /><circle cx={94} cy={100} r={1.5} fill={INK} />
      <Mouth y={112} expr={c.expr} width={13} />
      <path d="M75 115 L72 99 L82 112 Z" fill={TEETH} {...ink} strokeWidth={1.6} />
      <path d="M105 115 L108 99 L98 112 Z" fill={TEETH} {...ink} strokeWidth={1.6} />
      <Scar c={c} x={70} y={68} />
      {c.d.chance(0.6) && <circle cx={40} cy={74} r={4} fill="none" stroke="#d4a537" strokeWidth={2.4} />}
      {hair === 0 && <path d="M80 46 L84 22 L90 40 L96 20 L100 46 Z" fill={c.hair} {...ink} />}
      {hair === 1 && <g><path d="M72 48 C80 40 100 40 108 48 C100 52 80 52 72 48 Z" fill={c.hair} {...ink} /><path d="M86 44 C80 24 104 22 96 44" fill={c.hair} {...ink} /><path d="M92 26 C104 18 112 30 108 40" fill="none" stroke={c.hair} strokeWidth={5} strokeLinecap="round" /></g>}
      {hair === 2 && <path d="M70 52 Q90 44 110 52" {...fine} strokeWidth={1.4} opacity={0.6} />}
    </g>
  );
}

function Elf(c: Ctx) {
  const face = 'M90 40 C108 40 118 56 117 78 C116 100 104 120 90 123 C76 120 64 100 63 78 C62 56 72 40 90 40 Z';
  const circlet = c.d.chance(0.4);
  return (
    <g>
      <path d="M60 64 C54 46 76 30 92 30 C110 30 126 46 120 66 L124 140 C116 146 108 140 110 120 L70 120 C72 140 64 146 56 140 Z" fill={c.hair} {...ink} />
      <path d="M66 78 C54 73 42 62 33 47 C39 66 50 82 65 91 Z" fill={c.skin} {...ink} />
      <path d="M114 78 C126 73 138 62 147 47 C141 66 130 82 115 91 Z" fill={c.skin} {...ink} />
      <path d={face} fill={c.skin} {...ink} />
      <Shading face={face} c={c} />
      <path d="M72 96 Q78 102 80 110 M108 96 Q102 102 100 110" {...fine} strokeWidth={1.1} opacity={0.45} />
      <Eyes y={80} gap={12} iris={c.d.pick(['#3f8a5a', '#3a6fb5', '#7a4ab0', '#c08a2a', '#4aa0a0'])} expr={c.expr === 3 ? 2 : c.expr} />
      <path d="M89 84 Q87 96 89 99 Q91 100 93 99" {...fine} strokeWidth={1.5} />
      <Mouth y={109} expr={c.expr === 3 ? 0 : c.expr} width={7} />
      <path d="M64 76 C62 50 74 36 90 36 C106 36 118 50 116 76 C110 58 100 49 90 47 C80 49 70 58 64 76 Z" fill={c.hair} {...ink} />
      <path d="M90 37 L90 50" {...fine} strokeWidth={1.2} opacity={0.6} />
      {circlet && <g><path d="M64 62 Q90 50 116 62" fill="none" stroke="#d4a537" strokeWidth={3} /><path d="M90 52 L94 58 L90 63 L86 58 Z" fill={c.d.pick(['#3a6fb5', '#2f8a5a', '#b2271d'])} {...ink} strokeWidth={1.2} /></g>}
    </g>
  );
}

function Dwarf(c: Ctx) {
  const face = 'M90 46 C112 46 123 60 123 80 C123 96 117 108 106 112 L74 112 C63 108 57 96 57 80 C57 60 68 46 90 46 Z';
  const helm = c.d.chance(0.34);
  return (
    <g>
      <ellipse cx={57} cy={84} rx={5} ry={8} fill={c.skin} {...ink} />
      <ellipse cx={123} cy={84} rx={5} ry={8} fill={c.skin} {...ink} />
      <path d={face} fill={c.skin} {...ink} />
      <Shading face={face} c={c} />
      <Eyes y={80} gap={13} iris={c.iris} kind="small" expr={c.expr} />
      <path d="M68 70 C74 64 82 66 86 70 M94 70 C98 66 106 64 112 70" fill="none" stroke={c.hair} strokeWidth={6} strokeLinecap="round" />
      <path d="M56 86 C54 122 66 152 90 162 C114 152 126 122 124 86 C118 100 108 104 98 102 C94 109 86 109 82 102 C72 104 62 100 56 86 Z" fill={c.hair} {...ink} />
      <path d="M70 110 C74 128 82 142 90 150 M110 110 C106 128 98 142 90 150 M80 106 C82 124 86 136 90 142 M100 106 C98 124 94 136 90 142" {...fine} strokeWidth={1.2} opacity={0.55} />
      <path d="M72 100 C80 92 88 96 90 99 C92 96 100 92 108 100 C100 102 94 104 90 103 C86 104 80 102 72 100 Z" fill={darken(c.hair, 0.15)} {...ink} strokeWidth={1.8} />
      <ellipse cx={90} cy={90} rx={10} ry={8.5} fill={c.shade} {...ink} strokeWidth={1.8} />
      <ellipse cx={87} cy={87} rx={3} ry={2} fill={c.hi} opacity={0.7} />
      {c.expr === 1 || c.expr === 3 ? <path d="M82 106 Q90 112 98 106" fill={TEETH} {...ink} strokeWidth={1.4} /> : null}
      <rect x={70} y={146} width={6} height={10} rx={2} fill="#d4a537" {...ink} strokeWidth={1.2} />
      <rect x={104} y={146} width={6} height={10} rx={2} fill="#d4a537" {...ink} strokeWidth={1.2} />
      {helm ? (
        <g>
          <path d="M56 70 C56 44 72 32 90 32 C108 32 124 44 124 70 Z" fill="#9aa3ad" {...ink} />
          <path d="M56 70 L124 70 L124 76 L56 76 Z" fill="#7d858f" {...ink} strokeWidth={1.8} />
          <path d="M86 70 L94 70 L93 88 L87 88 Z" fill="#9aa3ad" {...ink} strokeWidth={1.6} />
          <path d="M90 33 L90 69" {...fine} strokeWidth={1.4} />
          {[64, 76, 104, 116].map((x) => <circle key={x} cx={x} cy={73} r={1.4} fill={INK} />)}
          <path d="M70 46 Q78 38 86 36" stroke="#e8edf2" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
          {c.d.chance(0.5) && <><path d="M58 56 C44 52 34 40 34 26 C42 36 50 40 60 44 Z" fill={TEETH} {...ink} /><path d="M122 56 C136 52 146 40 146 26 C138 36 130 40 120 44 Z" fill={TEETH} {...ink} /></>}
        </g>
      ) : (
        <g>
          <path d="M60 68 C58 54 72 44 90 44 C108 44 122 54 120 68" {...fine} stroke={c.hi} strokeWidth={3} opacity={0.5} />
          <path d="M80 56 C84 50 96 50 100 56 C96 62 84 62 80 56 Z" fill="none" stroke="#3a6fb5" strokeWidth={1.6} />
          <path d="M57 78 C56 66 60 60 64 58 M123 78 C124 66 120 60 116 58" fill="none" stroke={c.hair} strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function Goblin(c: Ctx) {
  const face = 'M90 50 C110 50 121 64 119 84 C117 102 104 117 90 121 C76 117 63 102 61 84 C59 64 70 50 90 50 Z';
  const cap = c.d.chance(0.45);
  return (
    <g>
      <path d="M65 78 C47 70 26 64 8 68 C24 80 46 94 66 95 Z" fill={c.skin} {...ink} />
      <path d="M115 78 C133 70 154 64 172 68 C156 80 134 94 114 95 Z" fill={c.skin} {...ink} />
      <path d="M58 82 C44 78 30 74 18 72 M122 82 C136 78 150 74 162 72" {...fine} strokeWidth={1.2} opacity={0.6} />
      <path d={face} fill={c.skin} {...ink} />
      <Shading face={face} c={c} />
      <Eyes y={80} gap={14} iris={c.d.pick(['#e0c020', '#e07a20', '#c0e040'])} kind="big" expr={c.expr} />
      <path d="M88 84 C92 92 102 100 112 104 C100 106 92 102 86 96 Z" fill={c.shade} {...ink} strokeWidth={1.8} />
      {c.expr === 2 ? <Mouth y={108} expr={2} width={12} /> : (
        <g>
          <path d="M70 104 Q90 120 110 104 Q90 112 70 104 Z" fill={TEETH} {...ink} strokeWidth={1.8} />
          <path d="M76 107 L79 111 L82 108 L86 112 L90 109 L94 112 L98 108 L101 111 L104 107" {...fine} strokeWidth={1.1} />
        </g>
      )}
      <Scar c={c} x={66} y={70} />
      {cap ? (
        <g>
          <path d="M62 70 C60 50 74 44 90 44 C106 44 120 50 118 70 C108 62 72 62 62 70 Z" fill="#7a4a2a" {...ink} />
          <circle cx={78} cy={58} r={7} fill="#c9d8e0" stroke="#b08a3e" strokeWidth={3} />
          <circle cx={102} cy={58} r={7} fill="#c9d8e0" stroke="#b08a3e" strokeWidth={3} />
          <path d="M75 55 l3 -2 M99 55 l3 -2" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      ) : (
        <path d="M78 54 L74 38 L84 50 L88 34 L94 50 L102 38 L100 54" fill={c.hair} {...ink} strokeWidth={1.8} />
      )}
    </g>
  );
}

function Troll(c: Ctx) {
  const face = 'M90 34 C124 34 141 55 141 82 C141 108 128 128 108 135 L72 135 C52 128 39 108 39 82 C39 55 56 34 90 34 Z';
  return (
    <g>
      <path d="M42 80 C30 82 28 96 40 100 Z" fill={c.skin} {...ink} />
      <path d="M138 80 C150 82 152 96 140 100 Z" fill={c.skin} {...ink} />
      <path d={face} fill={c.skin} {...ink} />
      <Shading face={face} c={c} light={false} />
      <g clipPath={`url(#${c.clip})`}>
        <path d="M44 56 C56 38 72 32 90 34 C76 40 64 46 58 60 Z" fill={c.hair} opacity={0.8} />
        <circle cx={60} cy={50} r={6} fill="#5e7d3c" opacity={0.85} />
        <circle cx={70} cy={42} r={4} fill="#6f9446" opacity={0.85} />
      </g>
      {[[112, 48], [122, 60], [66, 108]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={3} fill={c.shade} {...ink} strokeWidth={1.2} />)}
      <path d="M58 70 C70 62 80 64 86 70 L84 76 C78 72 70 72 60 76 Z M122 70 C110 62 100 64 94 70 L96 76 C102 72 110 72 120 76 Z" fill={c.shade} {...ink} strokeWidth={1.6} />
      <Eyes y={80} gap={17} iris="#d48a20" kind="small" expr={c.expr} />
      <path d="M85 74 C80 92 78 106 92 110 C106 106 102 92 95 74 Z" fill={c.shade} {...ink} strokeWidth={1.8} />
      <path d="M62 116 C74 126 106 126 118 116 C110 132 70 132 62 116 Z" fill={darken(c.skin, 0.1)} {...ink} strokeWidth={1.8} />
      <Mouth y={117} expr={c.expr === 1 ? 2 : c.expr} width={18} />
      <path d="M70 120 L66 96 L80 116 Z" fill={TEETH} {...ink} strokeWidth={1.6} />
      <path d="M110 120 L114 96 L100 116 Z" fill={TEETH} {...ink} strokeWidth={1.6} />
      <path d="M84 36 C82 26 86 20 90 18 M96 36 C98 28 104 24 108 24" {...fine} stroke={c.hair} strokeWidth={2} />
    </g>
  );
}

function Lizardkin(c: Ctx) {
  const head = 'M70 48 C86 38 105 42 113 55 C127 60 147 68 152 81 C154 92 142 99 126 99 C117 109 103 117 88 119 C72 119 61 105 61 87 C61 71 63 58 70 48 Z';
  const crest = c.hair;
  return (
    <g>
      <path d="M70 48 L56 40 L66 58 L48 56 L62 70 L44 74 L62 84 L46 94 L64 98 L54 110 L70 106" fill={crest} {...ink} strokeWidth={1.8} />
      <path d={head} fill={c.skin} {...ink} />
      <clipPath id={c.clip}><path d={head} /></clipPath>
      <g clipPath={`url(#${c.clip})`}>
        <path d="M60 100 C90 112 124 104 156 88 L156 130 L60 130 Z" fill={lighten(c.skin, 0.35)} />
        <ellipse cx={128} cy={60} rx={40} ry={18} fill={c.hi} opacity={0.25} />
        {Array.from({ length: 18 }).map((_, i) => {
          const x = 72 + (i % 6) * 12 + (Math.floor(i / 6) % 2) * 6;
          const y = 58 + Math.floor(i / 6) * 11;
          return <path key={i} d={`M${x - 4} ${y} Q${x} ${y + 4} ${x + 4} ${y}`} {...fine} strokeWidth={1} opacity={0.45} />;
        })}
      </g>
      <path d="M150 84 C138 90 124 92 110 92" {...fine} strokeWidth={1.8} />
      {c.expr === 3 || c.expr === 1 ? <path d="M150 85 C140 98 124 102 110 96 C124 94 138 92 150 85 Z" fill="#7a1f22" {...ink} strokeWidth={1.4} /> : null}
      <path d="M116 92 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4" {...fine} stroke={TEETH} strokeWidth={1.4} />
      <circle cx={146} cy={77} r={1.6} fill={INK} />
      <path d="M90 62 C96 54 110 54 114 62" fill={darken(c.skin, 0.2)} {...ink} strokeWidth={1.6} />
      <ellipse cx={102} cy={68} rx={7.5} ry={6.5} fill={c.d.pick(['#e0c020', '#e07a20', '#c8e040'])} {...ink} strokeWidth={1.8} />
      <ellipse cx={103} cy={68} rx={1.5} ry={5.2} fill={INK} />
      <circle cx={100} cy={65.5} r={1.2} fill="#fff" />
      <Scar c={c} x={78} y={74} />
    </g>
  );
}

function Revenant(c: Ctx) {
  const face = 'M90 40 C110 40 120 56 119 76 C118 92 112 100 110 110 C106 120 98 125 90 125 C82 125 74 120 70 110 C68 100 62 92 61 76 C60 56 70 40 90 40 Z';
  const hood = c.d.chance(0.6);
  const glow = c.d.pick(['#4ae0d0', '#8ae04a', '#b07aff', '#ff8a3a']);
  return (
    <g>
      {!hood && <path d="M62 64 C56 44 74 32 90 32 C108 32 124 44 118 64 L126 132 L112 126 L114 100 L66 100 L66 126 L54 132 Z" fill={c.hair} {...ink} opacity={0.95} />}
      <path d={face} fill={c.skin} {...ink} />
      <Shading face={face} c={c} light={false} />
      <path d="M66 92 C72 100 74 108 74 112 M114 92 C108 100 106 108 106 112" fill="none" stroke={c.shade} strokeWidth={5} opacity={0.7} strokeLinecap="round" />
      <Eyes y={78} gap={12} iris={glow} kind="glow" expr={c.expr} />
      <path d="M90 88 L86 97 L94 97 Z" fill="#1d1a22" />
      <path d="M78 108 L102 108 L100 116 L80 116 Z" fill={TEETH} {...ink} strokeWidth={1.4} />
      {[83, 87, 91, 95, 99].map((x) => <path key={x} d={`M${x} 108 L${x} 116`} {...fine} strokeWidth={1} />)}
      <path d="M96 46 L100 56 L96 60 L101 68" {...fine} strokeWidth={1.2} />
      {c.scar && <path d="M68 70 L80 66 M70 66 l2 4 M74 64 l2 4 M78 63 l1 4" {...fine} strokeWidth={1.2} stroke="#5a2a2a" />}
      {hood && <path d="M44 140 C40 82 54 30 90 26 C126 30 140 82 136 140 C126 128 120 108 118 84 C116 58 104 44 90 44 C76 44 64 58 62 84 C60 108 54 128 44 140 Z" fill={darken(c.a, 0.45)} {...ink} />}
      {hood && <path d="M58 60 C66 44 78 36 90 34" fill="none" stroke={lighten(c.a, 0.2)} strokeWidth={2} opacity={0.5} />}
    </g>
  );
}

function Satyr(c: Ctx) {
  const face = 'M90 44 C111 44 121 60 120 82 C119 104 106 120 90 120 C74 120 61 104 60 82 C59 60 69 44 90 44 Z';
  const ram = c.d.chance(0.5);
  const horn = '#d8c8a0';
  return (
    <g>
      <path d="M62 80 C48 78 38 70 32 60 C44 62 54 66 64 72 Z" fill={c.skin} {...ink} />
      <path d="M118 80 C132 78 142 70 148 60 C136 62 126 66 116 72 Z" fill={c.skin} {...ink} />
      <path d={face} fill={c.skin} {...ink} />
      <Shading face={face} c={c} />
      <Eyes y={82} gap={13} iris={c.d.pick(['#c08a2a', '#6b8a2a', '#8a4a2a'])} expr={c.expr} />
      <path d="M86 86 C84 96 86 100 90 101 C94 100 96 96 94 86" {...fine} strokeWidth={1.7} />
      <circle cx={87} cy={98} r={1.3} fill={INK} /><circle cx={93} cy={98} r={1.3} fill={INK} />
      <Mouth y={108} expr={c.expr === 0 ? 1 : c.expr} width={9} />
      <path d="M80 114 C82 128 88 140 90 146 C92 140 98 128 100 114 C96 118 84 118 80 114 Z" fill={c.hair} {...ink} />
      {[62, 71, 80, 89, 98, 107, 116].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 46 : 52} r={8} fill={c.hair} {...ink} strokeWidth={1.8} />)}
      {ram ? (
        <g>
          <path d="M70 52 C56 30 30 38 32 58 C34 74 54 76 58 64 C61 55 52 50 47 56" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
          <path d="M70 52 C56 30 30 38 32 58 C34 74 54 76 58 64 C61 55 52 50 47 56" fill="none" stroke={horn} strokeWidth={8} strokeLinecap="round" />
          <path d="M110 52 C124 30 150 38 148 58 C146 74 126 76 122 64 C119 55 128 50 133 56" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
          <path d="M110 52 C124 30 150 38 148 58 C146 74 126 76 122 64 C119 55 128 50 133 56" fill="none" stroke={horn} strokeWidth={8} strokeLinecap="round" />
          <path d="M46 40 l4 6 M38 48 l6 2 M134 40 l-4 6 M142 48 l-6 2" {...fine} strokeWidth={1.2} />
        </g>
      ) : (
        <g>
          <path d="M76 48 C70 30 62 18 52 12 C62 26 66 38 70 52 Z" fill={horn} {...ink} />
          <path d="M104 48 C110 30 118 18 128 12 C118 26 114 38 110 52 Z" fill={horn} {...ink} />
          <path d="M70 34 l5 -2 M66 26 l5 -2 M110 34 l-5 -2 M114 26 l-5 -2" {...fine} strokeWidth={1.2} />
        </g>
      )}
    </g>
  );
}

const RACE_DRAW: Record<Race, (c: Ctx) => JSX.Element> = { Human, Orc, Elf, Dwarf, Goblin, Troll, Lizardkin, Revenant, Satyr };

/* ---------------------------------------------------------------- body and gear */

const STEEL = '#9aa3ad';

function Body({ role, c, race }: { role: Role; c: Ctx; race: Race }) {
  const torso = 'M16 182 C18 154 44 139 72 135 L108 135 C136 139 162 154 164 182 Z';
  const neckW = race === 'Troll' ? 0 : race === 'Elf' ? 11 : race === 'Dwarf' || race === 'Orc' ? 17 : 13;
  return (
    <g>
      {neckW > 0 && <path d={`M${90 - neckW} 108 L${90 - neckW} 140 L${90 + neckW} 140 L${90 + neckW} 108 Z`} fill={c.skin} {...ink} />}
      {neckW > 0 && <path d={`M${90 + neckW - 6} 112 L${90 + neckW - 6} 138`} stroke={c.shade} strokeWidth={6} opacity={0.6} />}
      <path d={torso} fill={c.a} {...ink} />
      <clipPath id={`${c.clip}-t`}><path d={torso} /></clipPath>
      <g clipPath={`url(#${c.clip}-t)`}>
        <path d="M80 135 L100 135 L104 182 L76 182 Z" fill={c.b} />
        <path d="M128 140 C150 150 162 164 164 182 L130 182 Z" fill={darken(c.a, 0.3)} opacity={0.6} />
      </g>
      <path d="M70 136 Q90 150 110 136" fill="none" stroke={c.b} strokeWidth={4} />
      <path d="M70 136 Q90 150 110 136" {...fine} strokeWidth={1.2} />
      {role === 'Bastion' && (
        <g>
          <path d="M12 170 C10 146 26 132 52 134 C64 136 70 150 64 168 Z" fill={STEEL} {...ink} />
          <path d="M168 170 C170 146 154 132 128 134 C116 136 110 150 116 168 Z" fill={STEEL} {...ink} />
          <path d="M20 160 C22 148 32 140 46 140 M160 160 C158 148 148 140 134 140" {...fine} stroke="#e8edf2" strokeWidth={2.4} opacity={0.7} />
          <path d="M66 136 C74 146 106 146 114 136 L112 146 C102 154 78 154 68 146 Z" fill="#7d858f" {...ink} strokeWidth={1.8} />
          {[30, 44, 136, 150].map((x) => <circle key={x} cx={x} cy={156} r={1.8} fill={INK} />)}
        </g>
      )}
      {role === 'Breaker' && (
        <g>
          <path d="M14 172 C10 148 28 134 54 136 C64 138 68 152 62 170 Z" fill="#6b5a4a" {...ink} />
          <path d="M22 142 L14 120 L32 136 Z M38 136 L36 112 L48 134 Z" fill={STEEL} {...ink} strokeWidth={1.8} />
          <path d="M40 182 L132 138" stroke="#5a3a20" strokeWidth={9} />
          <path d="M40 182 L132 138" {...fine} strokeWidth={1.2} />
          <circle cx={88} cy={160} r={4} fill="#d4a537" {...ink} strokeWidth={1.2} />
          <path d="M116 140 l6 -6 l4 7 l6 -6 l4 7 l6 -5 l3 8" fill="#c8b89a" {...ink} strokeWidth={1.4} />
        </g>
      )}
      {role === 'Runner' && (
        <g>
          <path d="M60 138 C66 128 114 128 120 138 C116 150 64 150 60 138 Z" fill={c.b} {...ink} />
          <path d="M116 144 C130 150 142 166 150 182 L136 182 C130 168 122 156 112 150 Z" fill={c.b} {...ink} />
          <path d="M36 166 l10 -6 l2 8 l8 -5" {...fine} stroke={c.b} strokeWidth={2} />
        </g>
      )}
      {role === 'Thrower' && (
        <g>
          <path d="M24 182 C26 166 34 156 46 150 L56 182 Z" fill="#7a4a2a" {...ink} />
          <path d="M28 168 L50 164 M30 176 L52 172" {...fine} stroke="#d4a537" strokeWidth={2} />
        </g>
      )}
      {role === 'Raider' && (
        <g>
          <path d="M58 136 C64 126 116 126 122 136 L126 152 C108 160 72 160 54 152 Z" fill="#8a929c" {...ink} />
          <g opacity={0.55}>{Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={62 + (i % 6) * 11 + (i > 5 ? 5 : 0)} cy={140 + (i > 5 ? 8 : 0)} r={3.4} fill="none" stroke={INK} strokeWidth={1} />)}</g>
          <path d="M-10 182 A44 44 0 0 1 34 138 L34 182 Z" fill={c.b} {...ink} />
          <circle cx={14} cy={166} r={6} fill="#d4a537" {...ink} strokeWidth={1.4} />
        </g>
      )}
      {role === 'Trickster' && (
        <g>
          {[[50, 140], [70, 148], [90, 150], [110, 148], [130, 140]].map(([x, y], i) => (
            <g key={x}>
              <path d={`M${x - 11} ${y - 8} L${x + 11} ${y - 8} L${x} ${y + 12} Z`} fill={i % 2 ? c.a : c.b} {...ink} strokeWidth={1.8} />
              <circle cx={x} cy={y + 14} r={3.4} fill="#d4a537" {...ink} strokeWidth={1.2} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

function FrontProp({ role, c }: { role: Role; c: Ctx }) {
  if (role !== 'Thrower') return null;
  return (
    <g>
      <ellipse cx={140} cy={162} rx={13} ry={9} fill={c.skin} {...ink} strokeWidth={1.8} />
      <ellipse cx={141} cy={148} rx={17} ry={14} fill="#8a4a24" {...ink} />
      <path d="M126 146 Q141 138 156 146 M126 150 Q141 158 156 150" fill="none" stroke="#d4a537" strokeWidth={2.4} />
      <path d="M141 135 L141 162" {...fine} strokeDasharray="2 2" stroke={TEETH} />
      <ellipse cx={135} cy={142} rx={4} ry={2.5} fill="#fff" opacity={0.35} />
    </g>
  );
}

/* ---------------------------------------------------------------- component */

export type PortraitProps = {
  player: Pick<Player, 'id' | 'race' | 'role' | 'rarity' | 'portrait' | 'age'>;
  house?: [string, string];
  size?: number;
  framed?: boolean;
  title?: string;
};

function PortraitImpl({ player, house = ['#7d2420', '#d4a537'], size = 180, framed = true, title }: PortraitProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const painted = paintedPortrait(player.id, player.race, player.portrait);
  if (painted) return <img src={painted} width={size} height={size} alt={title ?? ''} className="portrait-img" draggable={false} />;
  const d = dice(`${player.id}:${player.portrait}`);
  const skins = SKINS[player.race];
  const skin = d.pick(skins);
  let hair = d.pick(HAIRS[player.race]);
  if (player.age >= 33 && (player.race === 'Human' || player.race === 'Dwarf' || player.race === 'Satyr') && d.chance(0.6)) hair = '#b9b4aa';
  const ctx: Ctx = {
    d,
    skin,
    shade: darken(skin, 0.28),
    hi: lighten(skin, 0.55),
    hair,
    iris: d.pick(IRIS),
    expr: d.pick([0, 1, 1, 2, 2, 3] as const),
    clip: `pc${uid}`,
    a: house[0],
    b: house[1],
    paint: (player.race === 'Orc' || player.race === 'Human' || player.race === 'Troll') && d.chance(0.35),
    scar: d.chance(0.22),
  };
  const ground = GROUND[player.rarity];
  return (
    <svg viewBox="0 0 180 180" width={size} height={size} className="portrait" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {framed && (
        <>
          <rect width="180" height="180" fill={ground.base} />
          <rect width="180" height="180" fill={`url(#${ground.id})`} />
          <rect x="4" y="4" width="172" height="172" fill="none" stroke={ground.rim} strokeWidth="2" opacity="0.7" />
        </>
      )}
      <g>
        <Body role={player.role} c={ctx} race={player.race} />
        {RACE_DRAW[player.race](ctx)}
        <FrontProp role={player.role} c={ctx} />
      </g>
    </svg>
  );
}

export const Portrait = memo(PortraitImpl, (a, b) => a.player.id === b.player.id && a.player.rarity === b.player.rarity && a.size === b.size && a.house?.[0] === b.house?.[0] && a.player.age === b.player.age && a.framed === b.framed);

/** Pattern grounds shared by every portrait; mounted once at the root. */
export function PortraitGrounds() {
  return (
    <>
      <pattern id="rb-ground-ordinary" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0 L0 12" stroke="#8f7a56" strokeWidth="1" opacity="0.5" />
      </pattern>
      <pattern id="rb-ground-professional" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="8" r="1.4" fill="#cfe3d6" opacity="0.55" />
        <path d="M0 8 L8 0 L16 8 L8 16 Z" fill="none" stroke="#1d4a3c" strokeWidth="1" opacity="0.7" />
      </pattern>
      <pattern id="rb-ground-elite" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M10 5 L11.2 8.8 L15 10 L11.2 11.2 L10 15 L8.8 11.2 L5 10 L8.8 8.8 Z" fill="#e8c35a" opacity="0.85" />
        <circle cx="0" cy="0" r="1" fill="#e8c35a" opacity="0.6" /><circle cx="20" cy="20" r="1" fill="#e8c35a" opacity="0.6" />
      </pattern>
      <pattern id="rb-ground-extraordinary" width="22" height="22" patternUnits="userSpaceOnUse">
        <g fill="#e2b13c" opacity="0.75">
          <circle cx="11" cy="7.5" r="2.4" /><circle cx="11" cy="14.5" r="2.4" /><circle cx="7.5" cy="11" r="2.4" /><circle cx="14.5" cy="11" r="2.4" />
        </g>
        <circle cx="11" cy="11" r="1.4" fill="#5a2a6b" />
      </pattern>
      <pattern id="rb-ground-legendary" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="7" r="3.2" fill="none" stroke="#8c6418" strokeWidth="1" opacity="0.8" />
        <circle cx="7" cy="7" r="0.9" fill="#8c6418" opacity="0.8" />
        <circle cx="0" cy="0" r="1.2" fill="#f6dc8a" opacity="0.8" />
      </pattern>
      <pattern id="rb-ground-generational" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="#e8c35a" strokeWidth="1.3" opacity="0.85" />
        <circle cx="10" cy="10" r="2" fill="#f0cf6a" />
      </pattern>
    </>
  );
}
