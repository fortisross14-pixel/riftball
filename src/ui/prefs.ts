import { useCallback, useEffect, useState } from 'react';

// Per-browser display preferences. Storage can be blocked (private windows), so every access is guarded.
const PAGE_TURN = 'riftball-page-turn';
const EVENT = 'riftball-prefs';

const read = (key: string, fallback: boolean) => { try { const v = localStorage.getItem(key); return v === null ? fallback : v === '1'; } catch { return fallback; } };
const write = (key: string, value: boolean) => { try { localStorage.setItem(key, value ? '1' : '0'); } catch { /* not saved; the setting lasts for this visit */ } };

/** Touch screens and reduced-motion users never get the page-turn animation. */
export const pageTurnAllowed = () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches;

/** The page-turn animation: optional, on by default where it is allowed. */
export function usePageTurn(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(() => read(PAGE_TURN, true));
  useEffect(() => {
    const sync = () => setOn(read(PAGE_TURN, true));
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  const set = useCallback((value: boolean) => { write(PAGE_TURN, value); setOn(value); window.dispatchEvent(new Event(EVENT)); }, []);
  return [on && pageTurnAllowed(), set];
}
