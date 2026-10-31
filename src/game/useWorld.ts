import { useCallback, useEffect, useRef, useState } from 'react';
import { createWorld, dismissIntro as dismissIntroIn, isStageComplete, predict as predictIn, revealAward as revealAwardIn } from '../engine';
import { deleteSave, exportLegacySave, exportSave, LegacySaveError, loadSave, SaveConflict, validateImport } from '../storage';
import type { World } from '../types';
import { ES } from '../i18n/es';
import { createSimClient, type SimClient } from './simClient';

export type SaveState = 'loading' | 'saving' | 'saved' | 'new' | 'unavailable' | 'conflict';

/**
 * The book's state: the world, its persistence in IndexedDB, cross-tab conflict protection,
 * and every action that changes the world. The simulation and the saving run in a Web Worker
 * that keeps its own copy of the world, so the page never freezes. Progress always goes through
 * the engine's stage gates: nothing here can play past an unfinished showcase or an unrevealed gala.
 */
export function useWorld() {
  const [world, setWorldState] = useState<World | null>(null);
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
  const sim = useRef<SimClient | null>(null);
  if (!sim.current) sim.current = createSimClient();

  /** Replace the whole world (load, import, new universe): the worker gets its own copy. */
  const replaceWorld = useCallback((w: World) => { sim.current!.load(w); setWorldState(w); }, []);

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
          replaceWorld(found.world);
          setSave('saved');
        } else {
          replaceWorld(createWorld());
          setSave('new');
        }
      } catch {
        if (alive) { replaceWorld(createWorld()); setSave('unavailable'); }
      }
    })();
    try {
      channel.current = new BroadcastChannel('riftball-world-v1');
      channel.current.onmessage = (e) => { if (e.data?.session !== session.current && e.data?.type === 'updated') setConflict(true); };
    } catch { channel.current = null; }
    return () => { alive = false; channel.current?.close(); };
  }, [replaceWorld]);

  // Saving happens in the worker, from its own copy, shortly after each change.
  useEffect(() => {
    if (!world || conflict) return;
    if (skipLoadedSave.current) { skipLoadedSave.current = false; return; }
    setSave('saving');
    const timer = setTimeout(async () => {
      try {
        const revision = await sim.current!.save(savedRevision.current);
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

  /** Run a simulation job in the worker; the page stays responsive and shows progress. */
  const job = useCallback(async (work: () => Promise<World>, showBusy: number) => {
    if (jobRef.current || !world || conflict) return false;
    jobRef.current = true;
    if (showBusy) setBusy({ current: 0, total: showBusy });
    try {
      setWorldState(await work());
      return true;
    } catch (e) {
      setNotice(ES.notice.failed(e instanceof Error ? e.message : ''));
      return false;
    } finally {
      jobRef.current = false;
      setBusy(null);
    }
  }, [world, conflict]);

  /** The main button: finish the current week and move to the next one. */
  const advance = useCallback(async (count = 1) => {
    if (world && !isStageComplete(world)) { setNotice(ES.notice.stageBlocked); return; }
    await job(() => sim.current!.run(count, 'count', count, (current, total) => setBusy({ current, total })), count);
  }, [job, world]);

  /** Play league weeks until the next event (a showcase intro, the gala, the market). Never enters one. */
  const simulateToNextEvent = useCallback(async () => {
    if (!world) return;
    if (!isStageComplete(world)) { setNotice(ES.notice.stageBlocked); return; }
    const plan = Math.max(1, 22 - world.week);
    await job(() => sim.current!.run(plan, 'event', 0, (current, total) => setBusy({ current, total })), plan);
  }, [job, world]);

  const resolveFixtures = useCallback((ids: string[]) => { void job(() => sim.current!.resolve(ids), 0); return true; }, [job]);
  const resolveFixture = useCallback(async (id: string) => job(() => sim.current!.resolve([id]), 0), [job]);

  /**
   * Small changes (intro seen, an award revealed, a prediction) are applied to a shallow copy here,
   * so the tap answers at once, and mirrored into the worker's copy.
   */
  const quick = useCallback((apply: (w: World) => void, op: Parameters<SimClient['op']>[0]) => {
    if (jobRef.current || !world || conflict) return;
    try {
      const copy: World = { ...world, stage: world.stage && { ...world.stage }, predictions: world.predictions && { ...world.predictions } };
      apply(copy);
      setWorldState(copy);
      sim.current!.op(op);
    } catch (e) {
      setNotice(ES.notice.failed(e instanceof Error ? e.message : ''));
    }
  }, [world, conflict]);
  const predict = useCallback((matchId: string, teamId: string) => quick((w) => predictIn(w, matchId, teamId), { name: 'predict', matchId, teamId }), [quick]);
  const dismissIntro = useCallback(() => quick(dismissIntroIn, { name: 'dismissIntro' }), [quick]);
  const revealAward = useCallback(() => quick(revealAwardIn, { name: 'revealAward' }), [quick]);

  const refreshLatest = useCallback(async () => {
    try {
      const stored = await loadSave();
      if (stored?.kind === 'world') {
        savedRevision.current = stored.revision;
        skipLoadedSave.current = true;
        replaceWorld(stored.world);
        setConflict(false);
        setSave('saved');
        setNotice(ES.notice.refreshed);
      }
    } catch { setNotice(ES.notice.archiveClosed); }
  }, [replaceWorld]);

  const startFresh = useCallback(async () => {
    try {
      await deleteSave();
      savedRevision.current = 0;
      setConflict(false);
      setLegacy(null);
      replaceWorld(createWorld(Math.floor(Math.random() * 1000000000)));
      setNotice(ES.notice.newWorld);
      return true;
    } catch { setNotice(ES.notice.clearFailed); return false; }
  }, [replaceWorld]);

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
      replaceWorld(parsed);
      setNotice(ES.notice.imported);
      return true;
    } catch (e) {
      setNotice(e instanceof LegacySaveError ? ES.legacy.importRejected : e instanceof Error ? e.message : ES.notice.importUnreadable);
      return false;
    }
  }, [replaceWorld]);

  const exportWorld = useCallback(() => { if (world) exportSave(world); }, [world]);
  const exportLegacy = useCallback(() => { if (legacy) exportLegacySave(legacy.raw); }, [legacy]);

  return { world, legacy, save, conflict, busy, notice, setNotice, advance, simulateToNextEvent, resolveFixture, resolveFixtures, predict, dismissIntro, revealAward, refreshLatest, newUniverse, startFresh, importFile, exportWorld, exportLegacy };
}
