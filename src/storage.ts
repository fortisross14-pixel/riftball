import type { World } from './types';
import { CURRENT_VERSION, SEASON, TEAM_COUNT, isLegacyWorld, normalizeWorld } from './engine';
const DB_NAME='riftball-chronicle-v1';
const STORE='worlds';
const KEY='main';
/** Export file format tag. Older tags are still read when the world inside is a current one. */
export const SAVE_FORMAT='riftball-world-v6';
const KNOWN_FORMATS=new Set(['riftball-world-v1','riftball-world-v2','riftball-world-v3','riftball-world-v4','riftball-world-v5',SAVE_FORMAT]);
/** The oldest world version that can still be loaded. Version 5 is the Spanish world: older saves have English names and go to the old-version screen. */
export const OLDEST_LOADABLE_VERSION=5;
export class SaveConflict extends Error {constructor(){super('Otra pestaña ha guardado una versión más reciente de este mundo.');}}
/** A save from an older, incompatible version of the game (the 80-club world). */
export class LegacySaveError extends Error {constructor(){super('Esta crónica es de una versión antigua del juego y no se puede cargar.');this.name='LegacySaveError';}}
export type LoadedSave = { kind:'world'; world:World; revision:number } | { kind:'legacy'; raw:unknown; revision:number };
const openDB=()=>new Promise<IDBDatabase>((resolve,reject)=>{
 const request=indexedDB.open(DB_NAME,1);
 request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);};
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
});
/** True when a stored world is too old to load: the 80-club format, or any version before the Spanish world. */
export function isLegacySave(world:unknown):boolean{
 if(isLegacyWorld(world))return true;
 const v=(world as {version?:unknown}).version;
 return typeof v!=='number'||v<OLDEST_LOADABLE_VERSION;
}
export async function loadSave():Promise<LoadedSave|null>{
 const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(KEY);req.onsuccess=()=>{
  const found=req.result as {world:World;revision:number}|undefined;
  if(!found){resolve(null);return;}
  // Old 80-club saves are never half-loaded: the shell offers to export them or start over.
  if(isLegacySave(found.world)){resolve({kind:'legacy',raw:found.world,revision:found.revision});return;}
  resolve({kind:'world',world:normalizeWorld(found.world),revision:found.revision});
 };req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});
}
export async function saveWorld(world:World,knownRevision:number):Promise<number>{
 const db=await openDB();return new Promise((resolve,reject)=>{
  let result=knownRevision;let err:Error|undefined;const tx=db.transaction(STORE,'readwrite');const store=tx.objectStore(STORE);const req=store.get(KEY);
  req.onsuccess=()=>{const previous=req.result as {revision:number}|undefined;const actual=previous?.revision??0;if(actual!==knownRevision){err=new SaveConflict();tx.abort();return;}result=knownRevision+1;store.put({world,revision:result},KEY);};
  tx.oncomplete=()=>{db.close();resolve(result);};tx.onabort=()=>{db.close();reject(err??tx.error??new Error('Se interrumpió el guardado'));};tx.onerror=()=>{};
 });
}
export async function deleteSave():Promise<void>{const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(KEY);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
/** The exported file's text. Kept separate from the download so it can be round-trip tested. */
export function serializeWorld(world:World):string{return JSON.stringify({format:SAVE_FORMAT,world});}
function download(text:string,filename:string){const blob=new Blob([text],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
export function exportSave(world:World){download(serializeWorld(world),`riftball-temporada-${world.season}.json`);}
/** Export an old, unloadable save exactly as stored, so nothing is lost. */
export function exportLegacySave(raw:unknown){download(JSON.stringify({format:'riftball-world-legacy',world:raw}),'riftball-cronica-antigua.json');}
export function validateImport(input:unknown):World{
 if(typeof input!=='object'||input===null)throw new Error('El archivo no es una partida válida.');
 const item=input as {format?:string;world?:World};const w=item.world;
 if(!item.format||!KNOWN_FORMATS.has(item.format)||!w||typeof w!=='object')throw new Error('Este archivo no es una partida de Riftball.');
 if(isLegacySave(w))throw new LegacySaveError();
 const fail=()=>{throw new Error('Esta partida de Riftball está dañada o incompleta.');};
 if(!Number.isInteger(w.version)||w.version>CURRENT_VERSION)fail();
 if(!Array.isArray(w.teams)||w.teams.length!==TEAM_COUNT||!w.teams.every(t=>t&&typeof t.id==='string'&&Array.isArray(t.roster)))fail();
 if(!Array.isArray(w.players)||!Array.isArray(w.matches)||!Array.isArray(w.news)||!Array.isArray(w.trophies)||!Array.isArray(w.retired)||!Array.isArray(w.history))fail();
 if(!Number.isInteger(w.rng)||!Number.isInteger(w.season)||w.season<1||!Number.isInteger(w.week)||w.week<1||w.week>SEASON.NEW_SEASON)fail();
 return normalizeWorld(w);
}
