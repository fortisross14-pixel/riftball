import { memo, useId } from 'react';
import type { JSX } from 'react';
import type { Team } from '../types';
import { dice } from './hash';
import { CHARGES, NICKNAME_CHARGE } from './charges';
import { paintedCrest } from './registry';

const INK = '#2a1a10';

export const TINCTURES = {
  or: { name: 'Or', hex: '#d6a734', metal: true },
  argent: { name: 'Argent', hex: '#efe7d2', metal: true },
  gules: { name: 'Gules', hex: '#b2271d', metal: false },
  azure: { name: 'Azure', hex: '#24438a', metal: false },
  vert: { name: 'Vert', hex: '#2f6e4a', metal: false },
  sable: { name: 'Sable', hex: '#2a231f', metal: false },
  purpure: { name: 'Purpure', hex: '#6a2f72', metal: false },
  tenne: { name: 'Tenné', hex: '#b8652a', metal: false },
  sanguine: { name: 'Sanguine', hex: '#7a1f22', metal: false },
} as const;
export type Tincture = keyof typeof TINCTURES;

// Each realm leans on its own pigments.
const REALM_COLOURS: Tincture[][] = [
  ['gules', 'sable', 'sanguine', 'tenne', 'azure'],
  ['azure', 'vert', 'purpure', 'gules', 'vert'],
  ['tenne', 'azure', 'sable', 'gules', 'vert'],
  ['sable', 'purpure', 'sanguine', 'azure', 'sable'],
];

type Division = 'plain' | 'perPale' | 'perFess' | 'perBend' | 'perChevron' | 'quarterly' | 'paly' | 'barry' | 'bendy' | 'chequy' | 'perSaltire' | 'gyronny' | 'chief' | 'bordure';
const DIVISIONS: Division[] = ['plain', 'perPale', 'perFess', 'perBend', 'perChevron', 'quarterly', 'paly', 'barry', 'bendy', 'chequy', 'perSaltire', 'gyronny', 'chief', 'bordure'];
const DIVISION_TEXT: Record<Division, string> = {
  plain: '', perPale: 'Per pale', perFess: 'Per fess', perBend: 'Per bend', perChevron: 'Per chevron', quarterly: 'Quarterly',
  paly: 'Paly', barry: 'Barry', bendy: 'Bendy', chequy: 'Chequy', perSaltire: 'Per saltire', gyronny: 'Gyronny', chief: '', bordure: '',
};

export type Arms = {
  colour: Tincture;
  metal: Tincture;
  division: Division;
  charge: string;
  chargeTincture: Tincture;
  detailTincture: Tincture;
  fimbriated: boolean;
  shape: number;
  blazon: string;
};

const cache = new Map<string, Arms>();

export function armsOf(team: Pick<Team, 'id' | 'nickname' | 'region' | 'name'>): Arms {
  const key = `${team.id}|${team.nickname}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const d = dice(`arms:${team.name}:${team.id}`);
  const colour = d.pick(REALM_COLOURS[team.region] ?? REALM_COLOURS[0]);
  const metal: Tincture = d.chance(0.55) ? 'or' : 'argent';
  const division = d.pick(DIVISIONS);
  const charge = NICKNAME_CHARGE[team.nickname] ?? 'mullet';
  const simpleField = division === 'plain' || division === 'chief' || division === 'bordure';
  let chargeTincture: Tincture = metal;
  let detailTincture: Tincture = colour;
  let fimbriated = false;
  if (!simpleField) {
    const others = (Object.keys(TINCTURES) as Tincture[]).filter((t) => !TINCTURES[t].metal && t !== colour);
    chargeTincture = d.chance(0.5) ? 'sable' : d.pick(others);
    if (chargeTincture === colour) chargeTincture = 'sable';
    detailTincture = metal;
    fimbriated = true;
  } else if (division === 'chief' || division === 'bordure') {
    detailTincture = colour === 'sable' ? 'gules' : 'sable';
  }
  const t = (x: Tincture) => TINCTURES[x].name;
  const name = CHARGES[charge]?.name ?? 'a mullet';
  let field = '';
  if (division === 'plain') field = t(colour);
  else if (division === 'chief') field = `${t(colour)}, on a chief ${t(metal)}`;
  else if (division === 'bordure') field = `${t(colour)}, within a bordure ${t(metal)}`;
  else field = `${DIVISION_TEXT[division]} ${t(colour)} and ${t(metal)}`;
  const blazon = division === 'chief'
    ? `${t(colour)}, ${name} ${t(chargeTincture)}, a chief ${t(metal)}.`
    : `${field}, ${name} ${t(chargeTincture)}${fimbriated ? ` fimbriated ${t(metal)}` : ''}.`;
  const arms: Arms = { colour, metal, division, charge, chargeTincture, detailTincture, fimbriated, shape: team.region % 4, blazon };
  cache.set(key, arms);
  return arms;
}

/** House colours for tunics and banners, taken from the arms so a club looks the same everywhere. */
export function houseColours(team: Pick<Team, 'id' | 'nickname' | 'region' | 'name'>): [string, string] {
  const a = armsOf(team);
  return [TINCTURES[a.colour].hex, TINCTURES[a.metal].hex];
}

// Shield outlines, one per realm: Iron Marches round-based, Verdant heater, Ashen Coast accolade, Gloamlands horned.
export const SHIELD_PATHS = [
  'M6 6 L94 6 L94 70 C94 97 74 115 50 115 C26 115 6 97 6 70 Z',
  'M6 6 L94 6 L94 50 C94 82 73 104 50 116 C27 104 6 82 6 50 Z',
  'M6 6 L94 6 L94 84 C94 98 80 101 66 104 C58 106 52 110 50 116 C48 110 42 106 34 104 C20 101 6 98 6 84 Z',
  'M4 4 C30 14 70 14 96 4 L92 56 C90 86 72 104 50 116 C28 104 10 86 8 56 Z',
];

function Field({ arms }: { arms: Arms }) {
  const A = TINCTURES[arms.colour].hex;
  const B = TINCTURES[arms.metal].hex;
  const r = (x: number, y: number, w: number, h: number, fill: string, key?: string | number) => <rect key={key} x={x} y={y} width={w} height={h} fill={fill} />;
  const parts: JSX.Element[] = [r(0, 0, 100, 120, A, 'base')];
  switch (arms.division) {
    case 'perPale': parts.push(r(50, 0, 50, 120, B, 'p')); break;
    case 'perFess': parts.push(r(0, 54, 100, 66, B, 'f')); break;
    case 'perBend': parts.push(<path key="b" d="M0 0 L100 120 L0 120 Z" fill={B} />); break;
    case 'perChevron': parts.push(<path key="c" d="M0 120 L0 96 L50 46 L100 96 L100 120 Z" fill={B} />); break;
    case 'quarterly': parts.push(r(50, 0, 50, 56, B, 'q1'), r(0, 56, 50, 64, B, 'q2')); break;
    case 'paly': for (let i = 1; i < 6; i += 2) parts.push(r(i * (100 / 6), 0, 100 / 6, 120, B, `pl${i}`)); break;
    case 'barry': for (let i = 1; i < 8; i += 2) parts.push(r(0, i * 15, 100, 15, B, `br${i}`)); break;
    case 'bendy': for (let i = -6; i < 8; i += 2) parts.push(<path key={`bd${i}`} d={`M${i * 16} 0 L${i * 16 + 16} 0 L${i * 16 + 16 + 100} 120 L${i * 16 + 100} 120 Z`} fill={B} />); break;
    case 'chequy': for (let y = 0; y < 6; y++) for (let x = 0; x < 5; x++) if ((x + y) % 2) parts.push(r(x * 20, y * 20, 20, 20, B, `ch${x}${y}`)); break;
    case 'perSaltire': parts.push(<path key="s" d="M0 0 L50 56 L0 120 Z M100 0 L50 56 L100 120 Z" fill={B} />); break;
    case 'gyronny': for (let i = 0; i < 8; i += 2) {
      const pts = [[50, -20], [120, -20], [120, 56], [120, 132], [50, 132], [-20, 132], [-20, 56], [-20, -20], [50, -20]];
      parts.push(<path key={`g${i}`} d={`M50 56 L${pts[i][0]} ${pts[i][1]} L${pts[i + 1][0]} ${pts[i + 1][1]} Z`} fill={B} />);
    } break;
    case 'chief': parts.push(r(0, 0, 100, 32, B, 'chief'), <path key="cl" d="M0 32 L100 32" stroke={INK} strokeWidth={1.6} />); break;
    default: break;
  }
  return <>{parts}</>;
}

type ShieldProps = { team: Pick<Team, 'id' | 'nickname' | 'region' | 'name'> & { artKey?: string }; size?: number; title?: boolean };

function ShieldImpl({ team, size = 64, title = false }: ShieldProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const painted = paintedCrest(team.id, team.artKey);
  if (painted) return <img src={painted} width={size} height={size * 1.2} alt={title ? `Arms of ${team.name}` : ''} className="shield-img" draggable={false} />;
  const arms = armsOf(team);
  const path = SHIELD_PATHS[arms.shape];
  const charge = CHARGES[arms.charge] ?? CHARGES.mullet;
  const c = TINCTURES[arms.chargeTincture].hex;
  const k = TINCTURES[arms.detailTincture].hex;
  const metal = TINCTURES[arms.metal].hex;
  const place = arms.division === 'chief' ? 'translate(22 38) scale(0.56)' : arms.division === 'bordure' ? 'translate(23 26) scale(0.54)' : 'translate(17 22) scale(0.66)';
  const clip = `sh${uid}`;
  return (
    <svg viewBox="-4 -4 108 128" width={size} height={size * 1.185} className="shield" role={title ? 'img' : undefined} aria-label={title ? `Arms of ${team.name}: ${arms.blazon}` : undefined} aria-hidden={title ? undefined : true}>
      <defs><clipPath id={clip}><path d={path} /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        <Field arms={arms} />
        {arms.division === 'bordure' && <path d={path} fill="none" stroke={metal} strokeWidth={22} />}
        {arms.division === 'bordure' && <path d={path} fill="none" stroke={INK} strokeWidth={1.4} transform="translate(9.5 10) scale(0.81)" />}
        <g transform={place}>
          <g filter={arms.fimbriated ? `url(#rb-fim-${arms.metal})` : undefined}>{charge.draw(c, k)}</g>
        </g>
        <path d={path} fill="url(#rb-sheen)" />
      </g>
      <path d={path} fill="none" stroke="#c9952f" strokeWidth={4} />
      <path d={path} fill="none" stroke={INK} strokeWidth={1.4} />
    </svg>
  );
}

export const Shield = memo(ShieldImpl, (a, b) => a.team.id === b.team.id && a.size === b.size && a.team.nickname === b.team.nickname);

const MOTTOS: Record<string, string> = {
  'IRON WALL': 'Nothing Passes, Least of All Time',
  'SILVER ARROW': 'Faster Than Our Excuses',
  STAMPEDE: 'Through, Never Around',
  MISCHIEF: 'It Was Like That When We Got Here',
  CLOCKWORK: 'Precisely Adequate',
  SWARM: 'Many Elbows, One Purpose',
};
export const mottoOf = (philosophy: string) => MOTTOS[philosophy.toUpperCase()] ?? 'Victory, Eventually';

/** The full achievement: shield, mantling in house colours, and a motto scroll. */
export function Achievement({ team, size = 260 }: { team: Team; size?: number }) {
  const [a, b] = houseColours(team);
  const motto = mottoOf(team.philosophy);
  const leaf = (flip: boolean) => (
    <g transform={flip ? 'translate(300 0) scale(-1 1)' : undefined}>
      <path d="M150 40 C118 30 86 40 70 66 C58 86 64 110 50 128 C40 140 26 142 18 152 C36 150 48 140 58 130 C56 150 44 170 30 182 C52 176 66 160 72 142 C76 164 70 186 60 204 C82 192 90 168 88 146 C96 170 96 194 88 214 C106 196 108 170 100 150 L150 150 Z" fill={a} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M150 52 C124 46 98 54 86 74 C76 92 80 112 70 128 C80 120 86 108 90 96 C94 114 92 132 86 146 C98 134 102 116 100 98 C108 112 110 130 106 144" fill="none" stroke={b} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 300 330" width={size} height={size * 1.1} className="achievement" role="img" aria-label={`The achievement of ${team.name}, motto: ${motto}`}>
      {leaf(false)}
      {leaf(true)}
      <g transform="translate(78 44) scale(1.44)">
        <ShieldBody team={team} />
      </g>
      <path d="M30 262 C60 248 90 270 150 262 C210 270 240 248 270 262 L262 300 C232 290 206 306 150 300 C94 306 68 290 38 300 Z" fill="#efe2c2" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M30 262 L14 272 L28 284 L38 300 M270 262 L286 272 L272 284 L262 300" fill="#d9c79c" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path id={`motto-${team.id}`} d="M44 284 C80 274 110 290 150 284 C190 290 220 274 256 284" fill="none" />
      <text fontFamily="var(--face-rubric)" fontSize={motto.length > 26 ? 13 : 15} fill="#a3271c" letterSpacing="0.6">
        <textPath href={`#motto-${team.id}`} startOffset="50%" textAnchor="middle">{motto}</textPath>
      </text>
    </svg>
  );
}

/** Shield drawing without its own <svg>, for embedding in larger compositions. */
function ShieldBody({ team }: { team: Team }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const arms = armsOf(team);
  const path = SHIELD_PATHS[arms.shape];
  const charge = CHARGES[arms.charge] ?? CHARGES.mullet;
  const metal = TINCTURES[arms.metal].hex;
  const place = arms.division === 'chief' ? 'translate(22 38) scale(0.56)' : arms.division === 'bordure' ? 'translate(23 26) scale(0.54)' : 'translate(17 22) scale(0.66)';
  return (
    <g>
      <clipPath id={`sb${uid}`}><path d={path} /></clipPath>
      <g clipPath={`url(#sb${uid})`}>
        <Field arms={arms} />
        {arms.division === 'bordure' && <path d={path} fill="none" stroke={metal} strokeWidth={22} />}
        <g transform={place}>
          <g filter={arms.fimbriated ? `url(#rb-fim-${arms.metal})` : undefined}>{charge.draw(TINCTURES[arms.chargeTincture].hex, TINCTURES[arms.detailTincture].hex)}</g>
        </g>
        <path d={path} fill="url(#rb-sheen)" />
      </g>
      <path d={path} fill="none" stroke="#c9952f" strokeWidth={4} />
      <path d={path} fill="none" stroke={INK} strokeWidth={1.4} />
    </g>
  );
}

export { ShieldBody };
