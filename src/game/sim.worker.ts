/// <reference lib="webworker" />
// The simulation runs here, off the main thread. The worker keeps its own copy of the world:
// the page sends small requests ("play a week", "resolve these fixtures", "save"), and only
// gets a world back when the simulation actually changed it.
import type { World } from '../types';
import { applyOp, runWeeks, type SimOp, type SimRequest, type SimResponse } from './simCore';
import { SaveConflict, saveWorld } from '../storage';

let world: World | null = null;
const reply = (msg: SimResponse) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);

self.onmessage = async (e: MessageEvent<SimRequest>) => {
  const msg = e.data;
  try {
    if (msg.type === 'load') { world = msg.world; return; }
    if (!world) throw new Error('El mundo aún no está cargado.');
    if (msg.type === 'op') { applyOp(world, msg.op as SimOp); return; }
    if (msg.type === 'run') {
      await runWeeks(world, msg.plan, msg.mode, msg.count, (current, total) => reply({ type: 'progress', id: msg.id, current, total }));
      reply({ type: 'world', id: msg.id, world });
      return;
    }
    if (msg.type === 'resolve') {
      for (const id of msg.ids) applyOp(world, { name: 'resolve', matchId: id });
      reply({ type: 'world', id: msg.id, world });
      return;
    }
    if (msg.type === 'save') {
      const revision = await saveWorld(world, msg.revision);
      reply({ type: 'saved', id: msg.id, revision });
    }
  } catch (err) {
    if (err instanceof SaveConflict) reply({ type: 'conflict', id: 'id' in msg ? msg.id : 0 });
    else reply({ type: 'error', id: 'id' in msg ? msg.id : 0, message: err instanceof Error ? err.message : String(err) });
  }
};
