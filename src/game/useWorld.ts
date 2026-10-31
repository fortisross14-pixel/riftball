import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceOneWeek, createWorld, resolveMatch } from '../engine';
import { deleteSave, exportSave, loadSave, SaveConflict, saveWorld, validateImport } from '../storage';
import type { World } from '../types';

export type SaveState = 'loading' | 'saving' | 'saved' | 'new' | 'unavailable' | 'conflict';

/**
 * The book's state: the world, its persistence in IndexedDB, cross-tab conflict protection,
 * and the act of writing new weeks. Behaviour matches the previous release exactly.
 */
export function useWorld() {
  const [world, setWorld] = useState<World | null>(null);
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
        if (found) {
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

  const advance = useCallback(async (count: number) => {
    if (jobRef.current || !world || conflict) return;
    jobRef.current = true;
    setBusy({ current: 0, total: count });
    try {
      const w = structuredClone(world) as World;
      for (let i = 0; i < count; i++) {
        advanceOneWeek(w);
        if (i % 3 === 0 || i === count - 1) {
          setBusy({ current: i + 1, total: count });
          await new Promise((r) => setTimeout(r, 0));
        }
      }
      setWorld(w);
      setNotice(`${count === 1 ? 'One week is' : `${count} weeks are`} written. The ink is still wet: Year ${w.season}, week ${w.week}.`);
    } catch (e) {
      setNotice(`The scribe dropped the quill: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      jobRef.current = false;
      setBusy(null);
    }
  }, [world, conflict]);

  const resolveFixture = useCallback(async (id: string) => {
    if (jobRef.current || !world || conflict) return false;
    jobRef.current = true;
    try {
      const w = structuredClone(world) as World;
      resolveMatch(w, id);
      setWorld(w);
      setNotice('The contest is written into the chronicle. Its replay and official ledger are now preserved.');
      return true;
    } catch (e) {
      setNotice(`The fixture could not be resolved: ${e instanceof Error ? e.message : 'unknown error'}`);
      return false;
    } finally { jobRef.current = false; }
  }, [world, conflict]);

  const refreshLatest = useCallback(async () => {
    try {
      const stored = await loadSave();
      if (stored) {
        savedRevision.current = stored.revision;
        skipLoadedSave.current = true;
        setWorld(stored.world);
        setConflict(false);
        setSave('saved');
        setNotice('The newest copy of the chronicle has been fetched from the archive.');
      }
    } catch { setNotice('The archive would not open. Try again in a moment.'); }
  }, []);

  const newUniverse = useCallback(async () => {
    if (!window.confirm('Burn this chronicle and found an entirely new universe? The current local save will be erased. Export it first if you want to keep it.')) return false;
    try {
      await deleteSave();
      savedRevision.current = 0;
      setConflict(false);
      setWorld(createWorld(Math.floor(Math.random() * 1000000000)));
      setNotice('A new universe has been founded. The referees are nervous.');
      return true;
    } catch { setNotice('Could not clear browser storage, so the old chronicle remains.'); return false; }
  }, []);

  const importFile = useCallback(async (file: File) => {
    try {
      const parsed = validateImport(JSON.parse(await file.text()));
      if (!window.confirm('Replace the current universe with the imported chronicle?')) return false;
      await deleteSave();
      savedRevision.current = 0;
      setConflict(false);
      setWorld(parsed);
      setNotice('The imported chronicle has been bound into the book.');
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'That file could not be read as a Riftball chronicle.');
      return false;
    }
  }, []);

  const exportWorld = useCallback(() => { if (world) exportSave(world); }, [world]);

  return { world, save, conflict, busy, notice, setNotice, advance, resolveFixture, refreshLatest, newUniverse, importFile, exportWorld };
}
