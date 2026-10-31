import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceOneWeek, createWorld, simulateWeeks, sortedStandings, teamRoster } from './engine';

test('Founding a world creates 80 clubs, eight divisions and 1,200 unique athletes',()=>{
 const w=createWorld(987654);
 assert.equal(w.teams.length,80);assert.equal(w.players.length,1200);assert.equal(new Set(w.players.map(p=>p.id)).size,1200);
 assert.equal(w.matches.filter(m=>m.phase==='league').length,720);
 for(let r=0;r<4;r++)for(const d of [0,1] as const){assert.equal(sortedStandings(w,r,d).length,10);}
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

test('A full season has regional and world champions and advances into the next season',()=>{
 const w=createWorld(2026);for(let i=0;i<26;i++)advanceOneWeek(w);
 assert.equal(w.season,2);assert.equal(w.week,1);
 assert.equal(w.trophies.filter(t=>t.competition==='GRAND RIFT CHAMPIONSHIP').length,1);
 assert.equal(w.trophies.filter(t=>t.competition.endsWith('CHAMPIONS')).length,4);
 assert.equal(w.players.length,1200);
 assert.equal(w.teams.filter(t=>t.division===0).length,40);
 assert.ok(w.matches.some(m=>m.season===2&&m.week===1));
});

test('Ten years preserves rosters, histories, unique athlete IDs and valid championships',()=>{
 const w=createWorld(2026);for(let i=0;i<260;i++)advanceOneWeek(w);
 assert.equal(w.season,11);assert.equal(w.week,1);
 assert.equal(w.trophies.filter(t=>t.competition==='GRAND RIFT CHAMPIONSHIP').length,10);
 assert.equal(w.teams.length,80);assert.equal(w.players.length,1200);
 assert.ok(w.totalGames>=7390);
 assert.equal(new Set(w.players.map(p=>p.id)).size,1200);
 const allRosterIds=w.teams.flatMap(t=>t.roster);
 assert.equal(allRosterIds.length,1200);assert.equal(new Set(allRosterIds).size,1200);
 assert.deepEqual([...allRosterIds].sort(),w.players.map(p=>p.id).sort());
 assert.ok(w.retired.length>150);
 for(const t of w.teams){assert.equal(t.roster.length,15);assert.equal(t.record.w+t.record.d+t.record.l,0);}
});

test('Scoring and player injuries remain within POC calibration limits',()=>{
 const w=createWorld(763);for(let i=0;i<18;i++)advanceOneWeek(w);
 const games=w.matches.filter(m=>m.phase==='league'&&m.homeScore!==null);
 const avg=games.reduce((n,m)=>n+(m.homeScore??0)+(m.awayScore??0),0)/games.length;
 assert.ok(avg>20&&avg<55,`average score: ${avg}`);
 assert.ok(w.players.filter(p=>p.injury>0).length<250);
 assert.ok(games.every(m=>m.homeScore!==null&&m.awayScore!==null&&m.homeScore>=0&&m.awayScore>=0));
});
