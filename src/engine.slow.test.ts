// Long simulations: multi-season and multi-seed balance runs. Part of the full suite only (npm test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceWeekAuto, createWorld, getPlayer, getTeam } from './engine';
import type { World } from './types';
import { assertArtResolves } from './testing/art';
test('Ten years preserves rosters, histories, unique athlete IDs and valid championships',()=>{
 const w=createWorld(2026);for(let i=0;i<300;i++)advanceWeekAuto(w);
 assert.equal(w.season,11);assert.equal(w.week,1);
 assert.equal(w.trophies.filter(t=>t.competition==='GRAND RIFT CHAMPIONSHIP').length,10);
 assert.equal(w.teams.length,48);assert.equal(w.players.length,720);
 assert.ok(w.totalGames>=5400);
 assert.equal(new Set(w.players.map(p=>p.id)).size,720);
 const allRosterIds=w.teams.flatMap(t=>t.roster);
 assert.equal(allRosterIds.length,720);assert.equal(new Set(allRosterIds).size,720);
 assert.deepEqual([...allRosterIds].sort(),w.players.map(p=>p.id).sort());
 assert.ok(w.retired.length>150);
 for(const t of w.teams){assert.equal(t.roster.length,15);assert.equal(t.record.w+t.record.d+t.record.l,0);}
});

// Long-run balance: five worlds simulated for 30 seasons each, shared by the tests below.
const LONG_SEEDS=[2026,1,2,3,4];
let longRuns:{seed:number;startRating:number;world:World}[]|undefined;
const meanRating=(w:World)=>w.players.reduce((s,p)=>s+p.rating,0)/w.players.length;
function runLong(){
 if(!longRuns)longRuns=LONG_SEEDS.map(seed=>{const world=createWorld(seed),startRating=meanRating(world);while(world.season<=30)advanceWeekAuto(world);return {seed,startRating,world};});
 return longRuns;
}

test('Mean rating stays within 2 points of year one across 30 seasons',()=>{
 for(const {seed,startRating,world} of runLong()){
  const end=meanRating(world);
  assert.ok(Math.abs(end-startRating)<=2,`seed ${seed}: ${startRating.toFixed(1)} -> ${end.toFixed(1)}`);
 }
});

test('No region wins more than 40% of world titles across 5 seeds x 30 seasons',()=>{
 const titles=[0,0,0,0];let total=0;
 for(const {world} of runLong())for(const t of world.trophies.filter(t=>t.competition==='GRAND RIFT CHAMPIONSHIP')){titles[getTeam(world,t.teamId).region]++;total++;}
 assert.equal(total,150);
 assert.ok(Math.max(...titles)<=total*.4,`titles by region: ${titles.join('/')}`);
});

test('MVPs span at least 4 roles and every season has positional awards',()=>{
 const roles=new Set<string>();
 for(const {world} of runLong()){
  const mvps=world.awards.filter(a=>a.award==='Golden Gargoyle');
  assert.equal(mvps.length,30);
  for(const a of mvps)roles.add(getPlayer(world,a.playerId)!.role);
  for(const name of ['Best Bastion','Best Breaker','Best Runner','Best Thrower','Best Raider','Best Trickster'])assert.equal(world.awards.filter(a=>a.award===name).length,30);
  assert.equal(world.awards.filter(a=>a.award==='Rookie of the Year').length,29);
 }
 assert.ok(roles.size>=4,`MVP roles: ${[...roles].join(', ')}`);
});

test('Club power drifts with results, and max level stays rare over 30 seasons',()=>{
 for(const {world} of runLong()){
  const start=createWorld(world.seed);
  const moved=world.teams.filter((t,i)=>Math.abs(t.power-start.teams[i].power)>=8).length;
  assert.ok(moved>=20,`only ${moved} clubs changed power`);
  const maxed=world.players.filter(p=>p.level>=15).length/world.players.length;
  assert.ok(maxed<.03,`max level share ${maxed}`);
 }
});

test('Every club and athlete still resolves raster art after 5 seasons',()=>{
 const w=createWorld(3131);
 while(w.season<=5)advanceWeekAuto(w);
 assert.equal(w.season,6);
 assertArtResolves(w,'after 5 seasons');
});

test('Games stay close: 30-35% end within one score (6 points) and under 12% by 20 or more',()=>{
 let games=0,close=0,blowouts=0;
 for(const seed of [55,66,77,88,99]){
  const w=createWorld(seed);
  while(w.season<=2)advanceWeekAuto(w);
  for(const m of w.matches){if(m.homeScore===null)continue;const margin=Math.abs(m.homeScore-m.awayScore!);games++;if(margin<=6)close++;if(margin>=20)blowouts++;}
 }
 assert.ok(games>5000,`games ${games}`);
 const closeShare=close/games,blowoutShare=blowouts/games;
 assert.ok(closeShare>=.30&&closeShare<=.35,`one-score games ${(closeShare*100).toFixed(1)}%`);
 assert.ok(blowoutShare<.12,`20+ games ${(blowoutShare*100).toFixed(1)}%`);
});
