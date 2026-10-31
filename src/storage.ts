import type { World } from './types';
import { normalizeWorld } from './engine';
const DB_NAME='riftball-chronicle-v1';
const STORE='worlds';
const KEY='main';
export class SaveConflict extends Error {constructor(){super('Another tab has saved a newer version of this universe.');}}
const openDB=()=>new Promise<IDBDatabase>((resolve,reject)=>{
 const request=indexedDB.open(DB_NAME,1);
 request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);};
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
});
export async function loadSave():Promise<{world:World;revision:number}|null>{
 const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(KEY);req.onsuccess=()=>{const found=req.result as {world:World;revision:number}|undefined;if(found)normalizeWorld(found.world);resolve(found??null);};req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});
}
export async function saveWorld(world:World,knownRevision:number):Promise<number>{
 const db=await openDB();return new Promise((resolve,reject)=>{
  let result=knownRevision;let err:Error|undefined;const tx=db.transaction(STORE,'readwrite');const store=tx.objectStore(STORE);const req=store.get(KEY);
  req.onsuccess=()=>{const previous=req.result as {revision:number}|undefined;const actual=previous?.revision??0;if(actual!==knownRevision){err=new SaveConflict();tx.abort();return;}result=knownRevision+1;store.put({world,revision:result},KEY);};
  tx.oncomplete=()=>{db.close();resolve(result);};tx.onabort=()=>{db.close();reject(err??tx.error??new Error('Save was interrupted'));};tx.onerror=()=>{};
 });
}
export async function deleteSave():Promise<void>{const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(KEY);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
export function exportSave(world:World){const blob=new Blob([JSON.stringify({format:'riftball-world-v2',world})],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`riftball-year-${world.season}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
export function validateImport(input:unknown):World{
 if(typeof input!=='object'||input===null)throw new Error('Invalid save file');
 const item=input as {format?:string;world?:World};const w=item.world;
 if((item.format!=='riftball-world-v1'&&item.format!=='riftball-world-v2')||!w||(w.version!==1&&w.version!==2)||!Array.isArray(w.teams)||w.teams.length!==80||!Array.isArray(w.players)||!Array.isArray(w.matches)||!Array.isArray(w.news)||!Array.isArray(w.trophies)||!Number.isInteger(w.rng)||!Number.isInteger(w.season)||!Number.isInteger(w.week)||w.week<1||w.week>26)throw new Error('This is not a compatible Riftball save (v1 or v2).');
 return normalizeWorld(w);
}
