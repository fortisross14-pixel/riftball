import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceOneWeek, createWorld, dismissIntro as dismissIntroIn, isEventStage, predict as predictIn, isStageComplete, resolveMatch, revealAward as revealAwardIn } from '../engine';
import { deleteSave, exportLegacySave, exportSave, LegacySaveError, loadSave, SaveConflict, saveWorld, validateImport } from '../storage';
import type { World } from '../types';
import { ES } from '../i18n/es';

export type SaveState = 'loading' | 'saving' | 'saved' | 'new' | 'unavailable' | 'conflict';

/** The longest run "simulate to the next event" will ever play (a whole season and then some). */
const MAX_RUN = 40;

/**
 * The book's state: the world, its persistence in IndexedDB, cross-tab conflict protection,
 * and every action that changes the world. Progress always goes through the engine's stage
 * gates: nothing here can play past an unfinished showcase or an unrevealed gala.
 */
export function useWorld() {
  const [world, setWorld] = useState<World | null>(null);
  const [legacy, setLegacy] = useState<{ raw: unknown } | null>(null);
  const [save, setSave] = useState<SaveState>('loading');
  const [conflict, setConflict] = useState(false);
  const [busy, setBusy] = useState<{ current: number; total: number } | null>(null);
  const [notice, setNotice] = useState('');
  const savedRevision = useRef(0);
  const skipLoadedSave = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);
  const session = useRef(`sess-${Math.random().toString(36).slice(2)}`);
  const jobRef = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const found = await loadSave();
        if (!alive) return;
        if (found?.kind === 'legacy') {
          savedRevision.current = found.revision;
          setLegacy({ raw: found.raw });
          setSave('saved');
        } else if (found) {
          savedRevision.current = found.revision;
          skipLoadedSave.current = true;
          setWorld(found.world);
          setSave('saved');
        } else {
          setWorld(createWorld());
          setSave('new');
        }
      } catch {
        if (alive) { setWorld(createWorld()); setSave('unavailable'); }
      }
    })();
    try {
      channel.current = new BroadcastChannel('riftball-world-v1');
      channel.current.onmessage = (e) => { if (e.data?.session !== session.current && e.data?.type === 'updated') setConflict(true); };
    } catch { channel.current = null; }
    return () => { alive = false; channel.current?.close(); };
  }, []);

  useEffect(() => {
    if (!world || conflict) return;
    if (skipLoadedSave.current) { skipLoadedSave.current = false; return; }
    setSave('saving');
    const timer = setTimeout(async () => {
      try {
        const revision = await saveWorld(world, savedRevision.current);
        savedRevision.current = revision;
        setSave('saved');
        channel.current?.postMessage({ type: 'updated', session: session.current, revision });
      } catch (e) {
        if (e instanceof SaveConflict) { setConflict(true); setSave('conflict'); } else setSave('unavailable');
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [world, conflict]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 5200);
    return () => clearTimeout(t);
  }, [notice]);

  /** Play weeks one at a time until `stop` says so, yielding to the browser to draw progress. */
  const run = useCallback(async (plan: number, stop: (w: World, played: number) => boolean) => {
    if (jobRef.current || !world || conflict) return;
    if (!isStageComplete(world)) { setNotice(ES.notice.stageBlocked); return; }
    jobRef.current = true;
    setBusy({ current: 0, total: plan });
    try {
      const w = structuredClone(world) as World;
      let played = 0;
      do {
        advanceOneWeek(w);
        played++;
        if (played % 3 === 0) {
          setBusy({ current: played, total: Math.max(plan, played) });
          await new Promise((r) => setTimeout(r, 0));
        }
      } while (!stop(w, played) && isStageComplete(w) && played < MAX_RUN);
      setWorld(w);
    } catch (e) {
      setNotice(ES.notice.failed(e instanceof Error ? e.message : ''));
    } finally {
      jobRef.current = false;
      setBusy(null);
    }
  }, [world, conflict]);

  /** The main button: finish the current week and move to the next one. */
  const advance = useCallback(async (count = 1) => run(count, (_w, played) => played >= count), [run]);

  /** Play league weeks until the next event (a showcase intro, the gala, the market). Never enters one. */
  const simulateToNextEvent = useCallback(async () => {
    if (!world) return;
    let plan = 0;
    for (let wk = world.week; wk < 22; wk++) plan++;
    return run(Math.max(1, plan), (w) => isEventStage(w));
  }, [run, world]);

  /** Apply a quick, synchronous change to a copy of the world. */
  const mutate = useCallback((fn: (w: World) => void, after?: string) => {
    if (jobRef.current || !world || conflict) return false;
    jobRef.current = true;
    try {
      const w = structuredClone(world) as World;
      fn(w);
      setWorld(w);
      if (after) setNotice(after);
      return true;
    } catch (e) {
      setNotice(ES.notice.failed(e instanceof Error ? e.message : ''));
      return false;
    } finally { jobRef.current = false; }
  }, [world, conflict]);

  const resolveFixture = useCallback(async (id: string) => mutate((w) => resolveMatch(w, id)), [mutate]);
  const resolveFixtures = useCallback((ids: string[]) => mutate((w) => { for (const id of ids) resolveMatch(w, id); }), [mutate]);
  const predict = useCallback((matchId: string, teamId: string) => { mutate((w) => predictIn(w, matchId, teamId)); }, [mutate]);
  const dismissIntro = useCallback(() => { mutate(dismissIntroIn); }, [mutate]);
  const revealAward = useCallback(() => { mutate(revealAwardIn); }, [mutate]);

  const refreshLatest = useCallback(async () => {
    try {
      const stored = await loadSave();
      if (stored?.kind === 'world') {
        savedRevision.current = stored.revision;
        skipLoadedSave.current = true;
        setWorld(stored.world);
        setConflict(false);
        setSave('saved');
        setNotice(ES.notice.refreshed);
      }
    } catch { setNotice(ES.notice.archiveClosed); }
  }, []);

  const startFresh = useCallback(async () => {
    try {
      await deleteSave();
      savedRevision.current = 0;
      setConflict(false);
      setLegacy(null);
      setWorld(createWorld(Math.floor(Math.random() * 1000000000)));
      setNotice(ES.notice.newWorld);
      return true;
    } catch { setNotice(ES.notice.clearFailed); return false; }
  }, []);

  const newUniverse = useCallback(async () => {
    if (!window.confirm(ES.confirm.newWorld)) return false;
    return startFresh();
  }, [startFresh]);

  const importFile = useCallback(async (file: File) => {
    try {
      const parsed = validateImport(JSON.parse(await file.text()));
      if (!window.confirm(ES.confirm.importReplace)) return false;
      await deleteSave();
      savedRevision.current = 0;
      setConflict(false);
      setLegacy(null);
      setWorld(parsed);
      setNotice(ES.notice.imported);
      return true;
    } catch (e) {
      setNotice(e instanceof LegacySaveError ? ES.legacy.importRejected : e instanceof Error ? e.message : ES.notice.importUnreadable);
      return false;
    }
  }, []);

  const exportWorld = useCallback(() => { if (world) exportSave(world); }, [world]);
  const exportLegacy = useCallback(() => { if (legacy) exportLegacySave(legacy.raw); }, [legacy]);

  return { world, legacy, save, conflict, busy, notice, setNotice, advance, simulateToNextEvent, resolveFixture, resolveFixtures, predict, dismissIntro, revealAward, refreshLatest, newUniverse, startFresh, importFile, exportWorld, exportLegacy };
}
