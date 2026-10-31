// Deterministic variation for artwork: the same id always draws the same face or shield.
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type Dice = {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(list: readonly T[]) => T;
  chance: (p: number) => boolean;
};

export function dice(seed: number | string): Dice {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (p) => next() < p,
  };
}

const ROMAN: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];
export function roman(n: number): string {
  if (n <= 0) return '—';
  let out = '';
  let v = Math.floor(n);
  for (const [value, glyph] of ROMAN) {
    while (v >= value) { out += glyph; v -= value; }
  }
  return out;
}
