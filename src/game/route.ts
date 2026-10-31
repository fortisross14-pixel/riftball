import { useCallback, useEffect, useState } from 'react';

export type Section = 'chronicle' | 'tourneys' | 'bestiary' | 'armorial' | 'lists' | 'rolls' | 'annals' | 'colophon' | 'evento';
export type Route =
  | { kind: 'section'; section: Section }
  | { kind: 'athlete'; id: string }
  | { kind: 'house'; id: string }
  | { kind: 'contest'; id: string };

/** Spanish addresses for each page. Internal section ids stay as they were. */
const SLUG: Record<Section, string> = {
  chronicle: 'cronica', tourneys: 'torneos', bestiary: 'atletas', armorial: 'clubes', lists: 'partidos',
  rolls: 'estadisticas', annals: 'historia', colophon: 'ajustes', evento: 'evento',
};
const KIND_SLUG = { athlete: 'atleta', house: 'club', contest: 'partido' } as const;
const SECTION_OF_SLUG = new Map<string, Section>(Object.entries(SLUG).map(([k, v]) => [v, k as Section]));

export function parseHash(hash: string): Route {
  const [a, b] = hash.replace(/^#\/?/, '').split('/');
  const id = b ? decodeURIComponent(b) : '';
  // Old English addresses keep working.
  if ((a === 'atleta' || a === 'athlete') && id) return { kind: 'athlete', id };
  if ((a === 'club' || a === 'house') && id) return { kind: 'house', id };
  if ((a === 'partido' || a === 'contest') && id) return { kind: 'contest', id };
  const section = SECTION_OF_SLUG.get(a) ?? (a in SLUG ? (a as Section) : undefined);
  return { kind: 'section', section: section ?? 'chronicle' };
}

export function hrefOf(r: Route): string {
  return r.kind === 'section' ? `#/${SLUG[r.section]}` : `#/${KIND_SLUG[r.kind]}/${encodeURIComponent(r.id)}`;
}

export const routeKey = (r: Route) => (r.kind === 'section' ? r.section : `${r.kind}:${r.id}`);

/** Hash routing so the browser's Back button goes back a page. */
export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const go = useCallback((r: Route) => {
    const h = hrefOf(r);
    if (window.location.hash !== h) window.location.hash = h;
  }, []);
  return { route, go };
}
