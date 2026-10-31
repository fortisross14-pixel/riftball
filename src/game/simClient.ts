// The page's side of the simulation worker: request/response with promises, and an in-page
// fallback with the same behaviour for browsers without module workers.
import type { World } from '../types';
import { applyOp, runWeeks, type SimOp, type SimRequest, type SimResponse } from './simCore';
import { SaveConflict, saveWorld } from '../storage';

type Pending = { resolve: (r: SimResponse) => void; onProgress?: (current: number, total: number) => void };

export interface SimClient {
  load(world: World): void;
  op(op: SimOp): void;
  run(plan: number, mode: 'count' | 'event', count: number, onProgress: (current: number, total: number) => void): Promise<World>;
  resolve(ids: string[]): Promise<World>;
  /** Save the worker's world. Rejects with SaveConflict if another tab saved first. */
  save(revision: number): Promise<number>;
}

function workerClient(): SimClient {
  const worker = new Worker(new URL('./sim.worker.ts', import.meta.url), { type: 'module' });
  const pending = new Map<number, Pending>();
  let next = 1;
  worker.onmessage = (e: MessageEvent<SimResponse>) => {
    const msg = e.data;
    const p = pending.get(msg.id);
    if (!p) return;
    if (msg.type === 'progress') { p.onProgress?.(msg.current, msg.total); return; }
    pending.delete(msg.id);
    p.resolve(msg);
  };
  const ask = (req: SimRequest & { id: number }, onProgress?: Pending['onProgress']) => new Promise<SimResponse>((resolve) => { pending.set(req.id, { resolve, onProgress }); worker.postMessage(req); });
  const unwrapWorld = (r: SimResponse) => { if (r.type === 'world') return r.world; throw new Error(r.type === 'error' ? r.message : 'Respuesta inesperada del simulador.'); };
  return {
    load: (world) => worker.postMessage({ type: 'load', world } satisfies SimRequest),
    op: (op) => worker.postMessage({ type: 'op', op } satisfies SimRequest),
    run: async (plan, mode, count, onProgress) => unwrapWorld(await ask({ type: 'run', id: next++, plan, mode, count }, onProgress)),
    resolve: async (ids) => unwrapWorld(await ask({ type: 'resolve', id: next++, ids })),
    save: async (revision) => {
      const r = await ask({ type: 'save', id: next++, revision });
      if (r.type === 'saved') return r.revision;
      if (r.type === 'conflict') throw new SaveConflict();
      throw new Error(r.type === 'error' ? r.message : 'No se pudo guardar.');
    },
  };
}

/** Same behaviour on the main thread, for browsers that cannot start a module worker. */
function localClient(): SimClient {
  let world: World | null = null;
  const need = () => { if (!world) throw new Error('El mundo aún no está cargado.'); return world; };
  return {
    load: (w) => { world = structuredClone(w); },
    op: (op) => applyOp(need(), op),
    run: async (plan, mode, count, onProgress) => { await runWeeks(need(), plan, mode, count, onProgress); return structuredClone(need()); },
    resolve: async (ids) => { for (const id of ids) applyOp(need(), { name: 'resolve', matchId: id }); return structuredClone(need()); },
    save: (revision) => saveWorld(need(), revision),
  };
}

export function createSimClient(): SimClient {
  try { return workerClient(); } catch { return localClient(); }
}
