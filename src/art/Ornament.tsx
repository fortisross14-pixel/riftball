import type { JSX } from 'react';
import type { NewsKind, Role } from '../types';
import { PortraitGrounds } from './Portrait';
import { TINCTURES } from './Heraldry';

const INK = '#2a1a10';
const GOLD = '#c8962e';
const GOLD_HI = '#f0cf6a';
const LAPIS = '#1f3d7a';
const VERMILION = '#a3271c';
const VERDIGRIS = '#2f6b57';
const MUREX = '#5a2a6b';
const o = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const l = { ...o, fill: 'none', strokeWidth: 1.5 };

/** Definitions shared by every drawing on the page. Mounted once. */
export function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <PortraitGrounds />
        <linearGradient id="rb-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="rb-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD_HI} />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor="#8c6418" />
        </linearGradient>
        <radialGradient id="rb-wax" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#d4473a" />
          <stop offset="0.6" stopColor="#9e1f17" />
          <stop offset="1" stopColor="#5e0f0a" />
        </radialGradient>
        {(['or', 'argent'] as const).map((m) => (
          <filter key={m} id={`rb-fim-${m}`} x="-15%" y="-15%" width="130%" height="130%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="3.4" result="grown" />
            <feFlood floodColor={TINCTURES[m].hex} />
            <feComposite in2="grown" operator="in" result="edge" />
            <feMerge><feMergeNode in="edge" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
      </defs>
    </svg>
  );
}

/* ---------------------------------------------------------------- historiated initial */

const INITIAL_TONES = { lapis: [LAPIS, '#f3e7c8'], vermilion: [VERMILION, '#f3e7c8'], verdigris: [VERDIGRIS, '#f3e7c8'], murex: [MUREX, GOLD_HI] } as const;

export function Initial({ letter, size = 120, tone = 'lapis' }: { letter: string; size?: number; tone?: keyof typeof INITIAL_TONES }) {
  const [field, ink] = INITIAL_TONES[tone];
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="initial" aria-hidden="true">
      <rect x="2" y="2" width="116" height="116" fill="url(#rb-gold)" stroke={INK} strokeWidth="2" />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={10 + i * 20} cy="9" r="1.6" fill="#8c6418" />)}
      {Array.from({ length: 6 }, (_, i) => <circle key={`b${i}`} cx={10 + i * 20} cy="111" r="1.6" fill="#8c6418" />)}
      <rect x="14" y="14" width="92" height="92" fill={field} stroke={INK} strokeWidth="1.6" />
      <g fill="none" stroke={GOLD_HI} strokeWidth="1.6" opacity="0.9">
        <path d="M20 96 C30 80 22 70 34 60 C44 52 40 40 30 34" />
        <path d="M100 24 C90 40 98 50 86 60 C76 68 80 80 90 86" />
      </g>
      {[[30, 34], [90, 86], [24, 90], [96, 28]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y} c-6 -2 -8 -8 -4 -12 c4 4 6 8 4 12 Z`} fill={GOLD_HI} stroke={INK} strokeWidth="0.8" />
      ))}
      <text x="60" y="88" textAnchor="middle" fontFamily="var(--face-display)" fontWeight="700" fontSize="78" fill={ink} stroke={INK} strokeWidth="1.2" paintOrder="stroke">{letter.toUpperCase()}</text>
    </svg>
  );
}

/* ---------------------------------------------------------------- drolleries for story kinds */

const DROLLERY: Record<NewsKind, () => JSX.Element> = {
  result: () => (
    <g>
      <g transform="rotate(-40 24 24)"><path d="M21 4 L27 4 L27 32 L21 32 Z" fill="#d9dde2" {...o} /><rect x="14" y="31" width="20" height="4" fill={GOLD} {...o} /><rect x="22" y="35" width="4" height="8" fill="#6b4423" {...o} /></g>
      <g transform="rotate(40 24 24)"><path d="M21 4 L27 4 L27 32 L21 32 Z" fill="#d9dde2" {...o} /><rect x="14" y="31" width="20" height="4" fill={GOLD} {...o} /><rect x="22" y="35" width="4" height="8" fill="#6b4423" {...o} /></g>
    </g>
  ),
  milestone: () => (
    <g>
      <path d="M8 40 C14 30 12 18 20 10 M40 40 C34 30 36 18 28 10" {...l} stroke={VERDIGRIS} strokeWidth={2.4} />
      {[[10, 30], [14, 20], [19, 12], [38, 30], [34, 20], [29, 12]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="4" ry="2.2" fill={VERDIGRIS} {...o} strokeWidth={1} transform={`rotate(${i < 3 ? -40 : 40} ${x} ${y})`} />)}
      <circle cx="24" cy="30" r="7" fill={GOLD} {...o} />
      <path d="M21 30 L24 33 L28 27" {...l} strokeWidth={1.6} />
    </g>
  ),
  injury: () => (
    <g>
      <path d="M8 38 C8 26 18 22 24 26 C30 18 42 22 40 32 C38 40 30 40 26 38 Z" fill="#c9a06a" {...o} />
      <path d="M26 36 C24 30 30 26 33 30 C35 33 31 36 29 33" {...l} />
      <path d="M8 38 L44 38" {...l} strokeWidth={2} />
      <path d="M10 26 C8 20 10 14 14 12 M14 26 C14 20 18 16 20 16" {...l} />
      <circle cx="14" cy="12" r="1.8" fill={INK} /><circle cx="20" cy="16" r="1.8" fill={INK} />
      <path d="M22 24 L36 36" stroke="#f3e7c8" strokeWidth="5" /><path d="M22 24 L36 36" stroke={VERMILION} strokeWidth="1.2" strokeDasharray="2 2" />
    </g>
  ),
  championship: () => (
    <g>
      <path d="M12 6 L36 6 C36 22 30 28 24 28 C18 28 12 22 12 6 Z" fill={GOLD} {...o} />
      <path d="M12 10 C4 10 4 20 13 21 M36 10 C44 10 44 20 35 21" {...l} strokeWidth={2} />
      <rect x="21" y="28" width="6" height="8" fill={GOLD} {...o} />
      <path d="M14 42 L34 42 L31 36 L17 36 Z" fill={GOLD} {...o} />
      <path d="M18 10 Q20 18 24 20" fill="none" stroke={GOLD_HI} strokeWidth="2" />
    </g>
  ),
  transfer: () => (
    <g>
      <path d="M14 18 C8 26 8 40 24 42 C40 40 40 26 34 18 Z" fill="#8a5a2a" {...o} />
      <path d="M14 18 L34 18 L30 12 L18 12 Z" fill="#6b4423" {...o} />
      <path d="M16 18 Q24 22 32 18" {...l} stroke={GOLD} strokeWidth={2} />
      <circle cx="24" cy="31" r="5" fill={GOLD} {...o} strokeWidth={1.2} />
      <circle cx="38" cy="38" r="4" fill={GOLD} {...o} strokeWidth={1.2} /><circle cx="10" cy="40" r="3.4" fill={GOLD} {...o} strokeWidth={1.2} />
    </g>
  ),
  prospect: () => (
    <g>
      <path d="M24 44 C24 34 24 26 24 18" {...l} stroke={VERDIGRIS} strokeWidth={2.6} />
      <path d="M24 28 C14 28 8 20 8 12 C18 12 24 18 24 28 Z" fill="#6ea05a" {...o} />
      <path d="M24 22 C32 22 40 16 40 8 C30 8 24 14 24 22 Z" fill="#6ea05a" {...o} />
      <path d="M14 44 C14 38 34 38 34 44 Z" fill="#8a5a2a" {...o} />
    </g>
  ),
  scandal: () => (
    <g>
      <path d="M14 42 C8 42 6 34 10 28 C12 22 18 20 22 22 L20 8 C20 4 24 4 25 8 L26 20 L28 6 C28 2 32 2 32 6 L30 22 C38 24 40 34 34 40 C30 44 22 44 14 42 Z" fill="#f0e8d8" {...o} />
      <circle cx="28" cy="28" r="1.8" fill={VERMILION} />
      <path d="M34 34 L46 14" stroke="#d9dde2" strokeWidth="3" strokeLinecap="round" /><path d="M34 34 L46 14" {...l} strokeWidth={1} />
      <path d="M32 30 L38 36" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  roundup: () => (
    <g>
      <path d="M6 22 L30 14 L42 8 L42 36 L30 30 L6 26 Z" fill={GOLD} {...o} />
      <path d="M12 26 L12 40 L22 40 L20 28" fill="#d9dde2" {...o} strokeWidth={1.4} />
      <path d="M14 28 L36 32 L36 44 L26 40 L16 44 Z" fill={VERMILION} {...o} strokeWidth={1.4} />
      <path d="M44 14 L48 12 M44 22 L48 22 M44 30 L48 32" {...l} />
    </g>
  ),
};

export function Drollery({ kind, size = 44 }: { kind: NewsKind; size?: number }) {
  const draw = DROLLERY[kind] ?? DROLLERY.roundup;
  return <svg viewBox="0 0 48 48" width={size} height={size} className="drollery" aria-hidden="true">{draw()}</svg>;
}

/* ---------------------------------------------------------------- role glyphs */

const ROLE_DRAW: Record<Role, JSX.Element> = {
  Bastion: <path d="M8 8 L40 8 L40 22 C40 34 32 42 24 46 C16 42 8 34 8 22 Z M24 8 L24 46 M8 22 L40 22" fill={LAPIS} {...o} />,
  Breaker: (
    <g>
      <path d="M10 30 C10 22 14 18 20 18 L20 12 C20 8 26 8 26 12 L26 16 C26 10 32 10 32 16 L32 18 C34 14 40 16 38 22 L36 34 C34 40 28 42 22 42 C14 42 10 38 10 30 Z" fill="#9aa3ad" {...o} />
      <path d="M14 18 L10 8 L18 16 M24 10 L24 2 L28 10" fill="#d9dde2" {...o} strokeWidth={1.4} />
    </g>
  ),
  Runner: (
    <g>
      <path d="M14 10 L28 10 L28 30 C34 31 42 34 42 40 L42 44 L10 44 L10 38 L14 36 Z" fill="#8a5a2a" {...o} />
      <path d="M14 14 C6 10 2 16 4 22 C8 20 10 22 14 22 M14 22 C6 22 4 28 6 32 C10 30 12 30 14 30" fill="#f3e7c8" {...o} strokeWidth={1.4} />
    </g>
  ),
  Thrower: (
    <g>
      <ellipse cx="24" cy="26" rx="18" ry="14" fill="#8a4a24" {...o} />
      <path d="M8 22 Q24 14 40 22 M8 30 Q24 38 40 30" {...l} stroke={GOLD} strokeWidth={2.4} />
      <path d="M24 12 L24 40" {...l} strokeDasharray="2 2.4" stroke="#f3e7c8" />
    </g>
  ),
  Raider: (
    <g>
      <path d="M24 4 L24 46" {...o} strokeWidth={4} />
      <path d="M24 4 L24 46" stroke="#8a5a2a" strokeWidth="2" />
      <path d="M24 8 C34 6 42 14 42 24 C34 22 28 22 24 26 Z" fill="#9aa3ad" {...o} />
      <path d="M24 8 C16 8 10 14 10 20 C16 18 20 18 24 20" fill="#9aa3ad" {...o} />
    </g>
  ),
  Trickster: (
    <g>
      <path d="M4 22 C10 14 20 16 24 22 C28 16 38 14 44 22 C46 32 40 38 32 36 C28 35 26 32 24 32 C22 32 20 35 16 36 C8 38 2 32 4 22 Z" fill={MUREX} {...o} />
      <path d="M11 25 C13 22 18 22 19 26 C17 28 13 28 11 25 Z M29 26 C30 22 35 22 37 25 C35 28 31 28 29 26 Z" fill="#f3e7c8" {...o} strokeWidth={1} />
      <circle cx="10" cy="14" r="3" fill={GOLD} {...o} strokeWidth={1} /><circle cx="38" cy="14" r="3" fill={GOLD} {...o} strokeWidth={1} />
    </g>
  ),
};

export function RoleGlyph({ role, size = 26 }: { role: Role; size?: number }) {
  return <svg viewBox="0 0 48 48" width={size} height={size} className="role-glyph" aria-hidden="true">{ROLE_DRAW[role]}</svg>;
}

/* ---------------------------------------------------------------- wax seal */

export function WaxSeal({ size = 120, broken = false }: { size?: number; broken?: boolean }) {
  const blob = 'M60 6 C74 4 82 12 92 14 C104 18 108 30 112 40 C118 52 114 64 116 74 C116 88 104 96 96 104 C86 112 74 114 62 116 C48 116 38 112 28 106 C16 98 8 88 6 74 C4 62 8 52 6 40 C8 26 18 18 30 12 C40 8 50 6 60 6 Z';
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={`wax-seal ${broken ? 'is-broken' : ''}`} aria-hidden="true">
      <g className="seal-half seal-left">
        <clipPath id="seal-l"><path d="M0 0 L64 0 L54 40 L66 62 L52 84 L60 120 L0 120 Z" /></clipPath>
        <g clipPath="url(#seal-l)"><SealFace blob={blob} /></g>
      </g>
      <g className="seal-half seal-right">
        <clipPath id="seal-r"><path d="M64 0 L120 0 L120 120 L60 120 L52 84 L66 62 L54 40 Z" /></clipPath>
        <g clipPath="url(#seal-r)"><SealFace blob={blob} /></g>
      </g>
    </svg>
  );
}

function SealFace({ blob }: { blob: string }) {
  return (
    <>
      <path d={blob} fill="url(#rb-wax)" stroke="#4a0c08" strokeWidth="1.6" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="#5e0f0a" strokeWidth="3" opacity="0.7" />
      <circle cx="60" cy="60" r="31" fill="none" stroke="#e06a5a" strokeWidth="1.2" opacity="0.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={60 + Math.cos(a) * 34.5} cy={60 + Math.sin(a) * 34.5} r="1.4" fill="#5e0f0a" />;
      })}
      <text x="60" y="76" textAnchor="middle" fontFamily="var(--face-display)" fontWeight="700" fontSize="46" fill="#6e120c" opacity="0.9">R</text>
      <path d="M40 26 C52 18 70 18 82 26" fill="none" stroke="#f08a7a" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
    </>
  );
}

/* ---------------------------------------------------------------- the Grand Rift crown */

export function RiftCrown({ size = 180 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="rift-crown" aria-hidden="true">
      <circle cx="100" cy="96" r="84" fill={LAPIS} stroke={INK} strokeWidth="2" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <path key={i} d={`M${100 + Math.cos(a) * 52} ${96 + Math.sin(a) * 52} L${100 + Math.cos(a) * 80} ${96 + Math.sin(a) * 80}`} stroke={GOLD_HI} strokeWidth={i % 2 ? 1 : 2.2} opacity="0.75" />;
      })}
      {Array.from({ length: 14 }, (_, i) => <circle key={`s${i}`} cx={40 + ((i * 53) % 120)} cy={30 + ((i * 37) % 120)} r="1.4" fill={GOLD_HI} opacity="0.7" />)}
      <path d="M60 52 L140 52 C140 92 124 112 100 116 C76 112 60 92 60 52 Z" fill="url(#rb-gold)" {...o} />
      <path d="M100 52 L94 70 L104 82 L96 98 L100 116" fill="none" stroke="#7af0ff" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M100 52 L94 70 L104 82 L96 98 L100 116" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M60 60 C42 60 40 84 64 88 M140 60 C158 60 160 84 136 88" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M60 60 C42 60 40 84 64 88 M140 60 C158 60 160 84 136 88" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
      <rect x="92" y="116" width="16" height="20" fill="url(#rb-gold)" {...o} />
      <path d="M72 152 L128 152 L120 136 L80 136 Z" fill="url(#rb-gold)" {...o} />
      <rect x="66" y="152" width="68" height="10" rx="2" fill="#8c6418" {...o} />
      <path d="M58 52 L64 30 L78 44 L90 22 L100 40 L110 22 L122 44 L136 30 L142 52 Z" fill="url(#rb-gold)" {...o} />
      {[[64, 30], [90, 22], [110, 22], [136, 30]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" fill={VERMILION} {...o} strokeWidth={1.2} />)}
      <circle cx="100" cy="40" r="5" fill="#7af0ff" {...o} strokeWidth={1.2} />
      <path d="M72 58 Q76 84 92 100" fill="none" stroke={GOLD_HI} strokeWidth="3" opacity="0.8" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------------------------------------------- realm vignettes */

export function RealmVignette({ realm, className }: { realm: number; className?: string }) {
  const scenes = [
    // Iron Marches: crags, forge chimneys, ember sky
    <g key="iron">
      <rect width="240" height="100" fill="#7a2a1c" />
      <rect width="240" height="56" fill="#b0482a" opacity="0.6" />
      <circle cx="186" cy="34" r="16" fill="#f0a040" opacity="0.85" />
      <path d="M0 70 L30 30 L46 48 L70 12 L96 52 L118 30 L150 66 L176 40 L204 62 L240 28 L240 100 L0 100 Z" fill="#3a2a26" {...o} />
      <path d="M70 12 L80 28 L74 26 L70 32 L64 24 Z M118 30 L124 40 L118 38 Z" fill="#9aa3ad" {...o} strokeWidth={1} />
      <path d="M0 84 C40 76 80 86 120 80 C160 74 200 86 240 78 L240 100 L0 100 Z" fill="#241a17" {...o} />
      {[150, 170].map((x) => <g key={x}><rect x={x} y="58" width="8" height="26" fill="#241a17" {...o} strokeWidth={1.4} /><path d={`M${x + 4} 56 C${x - 4} 44 ${x + 12} 36 ${x + 4} 22`} fill="none" stroke="#c9b9a6" strokeWidth="5" opacity="0.5" strokeLinecap="round" /></g>)}
      <rect x="40" y="70" width="22" height="14" fill="#241a17" {...o} strokeWidth={1.4} />
      <rect x="46" y="74" width="8" height="10" fill="#f0a040" />
    </g>,
    // Verdant Realms: rolling hills, white castle, lapis sky
    <g key="verdant">
      <rect width="240" height="100" fill="#2b4f94" />
      {[[30, 18], [70, 30], [200, 16], [150, 26]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.6" fill={GOLD_HI} />)}
      <path d="M150 22 C156 12 172 12 176 20 C186 18 192 28 184 32 L146 32 C140 30 142 22 150 22 Z" fill="#efe7d2" {...o} strokeWidth={1.2} />
      <path d="M0 64 C40 44 80 50 120 60 C160 70 200 46 240 54 L240 100 L0 100 Z" fill="#4f8a4a" {...o} />
      <path d="M0 80 C50 66 100 74 140 82 C180 90 210 74 240 76 L240 100 L0 100 Z" fill="#2f6b3a" {...o} />
      <g>
        <rect x="96" y="34" width="34" height="26" fill="#efe7d2" {...o} strokeWidth={1.4} />
        <path d="M92 34 L100 18 L108 34 Z M118 34 L126 18 L134 34 Z" fill={VERMILION} {...o} strokeWidth={1.2} />
        <rect x="108" y="46" width="8" height="14" fill="#2a1a10" />
        <path d="M126 18 L126 10 L134 13 L126 16" fill={GOLD} stroke={INK} strokeWidth="0.8" />
      </g>
      {[[30, 66], [52, 60], [190, 62], [212, 66]].map(([x, y]) => <g key={x}><rect x={x - 1.5} y={y} width="3" height="8" fill="#6b4423" /><circle cx={x} cy={y - 4} r="7" fill="#2f6b3a" {...o} strokeWidth={1.2} /></g>)}
    </g>,
    // Ashen Coast: cliffs, lighthouse, sea, sail
    <g key="ashen">
      <rect width="240" height="100" fill="#c97a3a" />
      <rect y="30" width="240" height="30" fill="#e0a060" opacity="0.6" />
      <path d="M0 62 L240 62 L240 100 L0 100 Z" fill="#2a5470" />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${i * 44 - 10} ${72 + (i % 2) * 10} q8 -6 16 0 q8 -6 16 0`} {...l} stroke="#efe7d2" strokeWidth={1.4} />)}
      <path d="M150 100 L162 46 L190 40 L210 52 L240 48 L240 100 Z" fill="#5a4a3e" {...o} />
      <rect x="196" y="18" width="10" height="24" fill="#efe7d2" {...o} strokeWidth={1.4} />
      <path d="M196 26 L206 26 M196 34 L206 34" stroke={VERMILION} strokeWidth="3" />
      <path d="M194 18 L201 10 L208 18 Z" fill={VERMILION} {...o} strokeWidth={1.2} />
      <path d="M201 12 L150 4 M201 12 L168 22" stroke="#f6dc8a" strokeWidth="2" opacity="0.6" />
      <path d="M48 66 L92 66 L86 74 L54 74 Z" fill="#6b4423" {...o} strokeWidth={1.4} />
      <path d="M70 66 L70 34" {...l} />
      <path d="M56 36 L84 36 C86 46 86 54 84 62 L56 62 C54 54 54 46 56 36 Z" fill="#efe7d2" {...o} strokeWidth={1.4} />
      <path d="M62 44 L78 54 M78 44 L62 54" stroke={INK} strokeWidth="2.2" />
    </g>,
    // Gloamlands: violet dusk, moon, dead trees, ruined tower, fog
    <g key="gloam">
      <rect width="240" height="100" fill="#2e1d3e" />
      <circle cx="58" cy="30" r="15" fill="#efe7d2" />
      <circle cx="64" cy="26" r="13" fill="#2e1d3e" />
      {[[120, 14], [160, 26], [200, 12], [100, 36]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.2" fill="#d6cff0" />)}
      <path d="M0 70 C40 60 90 66 130 60 C170 56 210 66 240 60 L240 100 L0 100 Z" fill="#1a1222" {...o} />
      <path d="M150 64 L150 32 L156 26 L160 34 L166 30 L168 64 Z" fill="#3a2e44" {...o} strokeWidth={1.4} />
      <rect x="156" y="42" width="5" height="8" fill="#b07aff" opacity="0.7" />
      {[40, 100, 208].map((x) => <path key={x} d={`M${x} 78 L${x} 54 M${x} 62 L${x - 8} 52 M${x} 58 L${x + 8} 46 M${x + 4} 52 L${x + 10} 52`} {...l} stroke="#120c18" strokeWidth={2.4} />)}
      <path d="M0 84 C30 78 60 88 100 82 C140 76 180 88 240 80" fill="none" stroke="#b9b0d0" strokeWidth="6" opacity="0.25" strokeLinecap="round" />
      <path d="M0 92 C40 86 90 96 140 90 C180 86 210 94 240 90" fill="none" stroke="#b9b0d0" strokeWidth="5" opacity="0.18" strokeLinecap="round" />
    </g>,
  ];
  return (
    <svg viewBox="0 0 240 100" className={`realm-vignette ${className ?? ''}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {scenes[realm] ?? scenes[0]}
      <rect x="1" y="1" width="238" height="98" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/* ---------------------------------------------------------------- small instruments */

export function Hourglass({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 48" width={size} height={size * 1.2} className="hourglass" aria-hidden="true">
      <rect x="4" y="2" width="32" height="6" rx="2" fill="#8c6418" {...o} strokeWidth={1.4} />
      <rect x="4" y="40" width="32" height="6" rx="2" fill="#8c6418" {...o} strokeWidth={1.4} />
      <path d="M9 8 L31 8 C31 18 23 21 21 24 C23 27 31 30 31 40 L9 40 C9 30 17 27 19 24 C17 21 9 18 9 8 Z" fill="#f3ecd8" fillOpacity="0.5" {...o} strokeWidth={1.4} />
      <path className="sand-top" d="M13 13 L27 13 C25 18 22 20 20 22 C18 20 15 18 13 13 Z" fill="#d6a734" />
      <path className="sand-bottom" d="M12 39 C14 33 18 31 20 30 C22 31 26 33 28 39 Z" fill="#d6a734" />
      <path d="M6 8 L6 40 M34 8 L34 40" stroke="#8c6418" strokeWidth="2" />
    </svg>
  );
}

export function Quill({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="quill" aria-hidden="true">
      <path d="M56 4 C38 6 22 20 14 40 L18 42 C26 30 36 22 46 16 C38 24 30 32 22 44 L26 46 C36 32 48 20 56 4 Z" fill="#efe7d2" {...o} strokeWidth={1.4} />
      <path d="M14 40 L8 58 L22 44" fill="#2a1a10" {...o} strokeWidth={1.2} />
      <path d="M52 8 C40 16 28 30 20 44" {...l} strokeWidth={1} />
    </svg>
  );
}
