import { useCallback, useEffect, useState } from 'react';

export type Section = 'chronicle' | 'tourneys' | 'bestiary' | 'armorial' | 'lists' | 'rolls' | 'annals' | 'colophon';
export type Route =
  | { kind: 'section'; section: Section }
  | { kind: 'athlete'; id: string }
  | { kind: 'house'; id: string }
  | { kind: 'contest'; id: string };

const SECTIONS: Section[] = ['chronicle', 'tourneys', 'bestiary', 'armorial', 'lists', 'rolls', 'annals', 'colophon'];

export function parseHash(hash: string): Route {
  const [a, b] = hash.replace(/^#\/?/, '').split('/');
  if (a === 'athlete' && b) return { kind: 'athlete', id: decodeURIComponent(b) };
  if (a === 'house' && b) return { kind: 'house', id: decodeURIComponent(b) };
  if (a === 'contest' && b) return { kind: 'contest', id: decodeURIComponent(b) };
  if (SECTIONS.includes(a as Section)) return { kind: 'section', section: a as Section };
  return { kind: 'section', section: 'chronicle' };
}

export function hrefOf(r: Route): string {
  return r.kind === 'section' ? `#/${r.section}` : `#/${r.kind}/${encodeURIComponent(r.id)}`;
}

export const routeKey = (r: Route) => (r.kind === 'section' ? r.section : `${r.kind}:${r.id}`);

/** Hash routing so the browser's Back button turns pages back. */
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
