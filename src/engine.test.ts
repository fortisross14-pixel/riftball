import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ABILITY_EFFECTS, PHILOSOPHY_PROFILES, TRAIT_EFFECTS, advanceOneWeek, advanceWeekAuto, createWorld, getPlayer, getTeam, simulateWeeks, sortedStandings, teamRoster } from './engine';
import type { World } from './types';
import { habilidad } from './i18n/es-mundo';

test('Founding a world creates 48 elemental clubs and 720 unique athletes',()=>{
 const w=createWorld(987654);
 assert.equal(w.teams.length,48);assert.equal(w.players.length,720);assert.equal(new Set(w.players.map(p=>p.id)).size,720);
 assert.equal(w.matches.filter(m=>m.phase==='league').length,528);
 for(let r=0;r<4;r++)assert.equal(sortedStandings(w,r,0).length,12);
 for(const t of w.teams)assert.equal(teamRoster(w,t).length,15);
 const games=new Map<string,number>();
 for(const m of w.matches){const key=[m.home,m.away].sort().join('/');games.set(key,(games.get(key)??0)+1);}
 assert.ok([...games.values()].every(n=>n===2));
});

test('Matches are deterministic for the same world seed',()=>{
 const first=simulateWeeks(createWorld(10001),3),second=simulateWeeks(createWorld(10001),3);
 const result=(w:typeof first)=>w.matches.filter(m=>m.homeScore!==null).map(m=>[m.home,m.away,m.homeScore,m.awayScore]);
 assert.deepEqual(result(first),result(second));
});

test('A full season has national and world champions and advances into the next season',()=>{
 const w=createWorld(2026);for(let i=0;i<30;i++)advanceWeekAuto(w);
 assert.equal(w.season,2);assert.equal(w.week,1);
 assert.equal(w.trophies.filter(t=>t.competition==='GRAND RIFT CHAMPIONSHIP').length,1);
 assert.equal(w.trophies.filter(t=>t.competition.endsWith('CHAMPIONS')).length,4);
 assert.equal(w.players.length,720);
 assert.equal(w.teams.filter(t=>t.division===0).length,48);
 assert.ok(w.matches.some(m=>m.season===2&&m.week===1));
});

test('Scoring and player injuries remain within POC calibration limits',()=>{
 const w=createWorld(763);for(let i=0;i<22;i++)advanceOneWeek(w);
 const games=w.matches.filter(m=>m.phase==='league'&&m.homeScore!==null);
 const avg=games.reduce((n,m)=>n+(m.homeScore??0)+(m.awayScore??0),0)/games.length;
 assert.ok(avg>20&&avg<55,`average score: ${avg}`);
 assert.ok(w.players.filter(p=>p.injury>0).length<250);
 assert.ok(games.every(m=>m.homeScore!==null&&m.awayScore!==null&&m.homeScore>=0&&m.awayScore>=0));
});

test('Rivalries are mutual, regional and nearly all distinct, and heat responds to meetings',()=>{
 const w=createWorld(2026);
 for(const t of w.teams){const r=getTeam(w,t.rival);assert.equal(r.rival,t.id);assert.equal(r.region,t.region);assert.notEqual(r.id,t.id);assert.equal(r.rivalHeat,t.rivalHeat);}
 assert.ok(new Set(w.teams.map(t=>t.rival)).size>=48);
 const before=w.teams.reduce((s,t)=>s+t.rivalHeat,0);
 for(let i=0;i<22;i++)advanceOneWeek(w);
 assert.ok(w.teams.reduce((s,t)=>s+t.rivalHeat,0)>before);
 assert.ok(w.teams.some(t=>t.rivalRecord.w+t.rivalRecord.d+t.rivalRecord.l>=2));
});

test('Home advantage is small: league home win rate stays between 45% and 58%',()=>{
 const w=createWorld(4242);for(let i=0;i<22;i++)advanceOneWeek(w);
 const games=w.matches.filter(m=>m.phase==='league'&&m.homeScore!==null);
 const rate=games.filter(m=>m.homeScore!>m.awayScore!).length/games.length;
 assert.ok(rate>.45&&rate<.58,`home win rate ${rate}`);
});

test('Every trait, ability and philosophy is described, and every club uses a known philosophy',()=>{
 const w=createWorld(31);
 assert.equal(Object.keys(TRAIT_EFFECTS).length,12);assert.equal(Object.keys(ABILITY_EFFECTS).length,17);assert.equal(Object.keys(PHILOSOPHY_PROFILES).length,6);
 for(const t of w.teams)assert.ok(PHILOSOPHY_PROFILES[t.philosophy],t.philosophy);
 for(const p of w.players){assert.ok(TRAIT_EFFECTS[p.trait],p.trait);assert.ok(ABILITY_EFFECTS[p.ability],p.ability);}
});

test('Spark abilities and penalties happen in real matches and name what happened',()=>{
 const w=createWorld(5);for(let i=0;i<22;i++)advanceOneWeek(w);
 const events=w.matches.filter(m=>m.homeScore!==null).flatMap(m=>m.events);
 const sparks=events.filter(e=>e.kind==='spark');
 const used=new Set<string>();
 for(const e of sparks){const p=getPlayer(w,e.playerId!)!;assert.ok(e.text.startsWith('¡'+habilidad(p.ability).toUpperCase()+'!'),e.text);used.add(p.ability);}
 assert.ok(used.size>=9,`abilities used: ${[...used].join(', ')}`);
 assert.ok(events.some(e=>e.kind==='penalty'));
});

test('Iron Will athletes are injured less often than Reckless ones',()=>{
 const w=createWorld(77);for(let i=0;i<22;i++)advanceOneWeek(w);
 const rate=(trait:string)=>{const ps=w.players.filter(p=>p.trait===trait);return ps.reduce((s,p)=>s+p.stats.injuries,0)/ps.length;};
 assert.ok(rate('Iron Will')<rate('Reckless'),`Iron Will ${rate('Iron Will')} vs Reckless ${rate('Reckless')}`);
});

test('Pass 3 reports reconcile official scores, attempts, metres and possessions',()=>{
 const w=createWorld(611);for(let i=0;i<4;i++)advanceOneWeek(w);
 const matches=w.matches.filter(m=>m.homeScore!==null);
 assert.ok(matches.length>80);
 for(const m of matches){
  const report=m.report!;assert.ok(report,'completed matches have a full report');
  assert.equal(report.drives.length,report.teams[m.home].possessions+report.teams[m.away].possessions);
  for(const [teamId,expected] of [[m.home,m.homeScore!],[m.away,m.awayScore!]] as const){
   const t=report.teams[teamId];assert.equal(t.breaches*5+t.gates*2+t.aftershocks,expected);
   assert.equal(t.plays,t.runAttempts+t.passAttempts);
   assert.equal(t.yards,t.rushingYards+t.passingYards);
   assert.ok(t.passesCompleted<=t.passAttempts);
   const contributions=Object.values(report.players).filter(p=>p.teamId===teamId);
   assert.equal(contributions.reduce((sum,p)=>sum+p.passesAttempted,0),t.passAttempts);
   assert.equal(contributions.reduce((sum,p)=>sum+p.passesCompleted,0),t.passesCompleted);
  }
 }
});

test('Pass 3 substitutes healthy bench athletes, tracks contributions, and preserves roster integrity',()=>{
 const w=createWorld(612);for(let i=0;i<3;i++)advanceOneWeek(w);
 const matches=w.matches.filter(m=>m.report);
 assert.ok(matches.some(m=>Object.values(m.report!.benchUsed).some(ids=>ids.length>0)));
 for(const m of matches)for(const t of [m.home,m.away]){
  const r=m.report!;assert.equal(r.starters[t].length,8);
  assert.ok(r.benchUsed[t].every(id=>!r.starters[t].includes(id)));
  assert.equal(new Set(r.starters[t]).size,8);
 }
 for(const t of w.teams)assert.equal(teamRoster(w,t).length,15);
});

test('Pass 3 season archives survive offseason and report fields are optional for legacy saves',()=>{
 const w=createWorld(613);for(let i=0;i<60;i++)advanceWeekAuto(w);
 assert.deepEqual(w.seasonArchive?.map(a=>a.season),[1,2]);
 assert.equal(w.seasonArchive?.[0].standings.length,48);
 const historic=w.matches.find(m=>m.season===1&&m.phase==='grand-final')!;assert.ok(historic);
 delete historic.report;
 assert.equal(historic.homeScore!==null,true);
 assert.equal(historic.report,undefined);
});
