import { Crown, Trophy, ArrowRight, Shield } from 'lucide-react';
import type { Match, Team, World } from './types';
import { REGIONS } from './types';
import { Crest } from './components';

const phases: {key:Match['phase'];title:string;week:number}[]=[
 {key:'world-quarter',title:'QUARTERFINALS',week:21},
 {key:'world-semi',title:'SEMIFINALS',week:22},
 {key:'grand-final',title:'WORLD FINAL',week:23},
];
export function WorldChampionship({world,onClub,onMatch}:{world:World;onClub:(id:string)=>void;onMatch:(id:string)=>void}){
 const {teams,matches,season,trophies}=world;
 const byId=new Map(teams.map(t=>[t.id,t]));
 const stage=(phase:Match['phase'])=>matches.filter(m=>m.season===season&&m.phase===phase);
 const regionFinals=stage('regional-final');
 const previous=trophies.filter(t=>t.competition==='GRAND RIFT CHAMPIONSHIP').at(-1);
 const lastChampion=previous?byId.get(previous.teamId):undefined;
 const contenders=teams.filter(t=>t.division===0).sort((a,b)=>b.record.pts-a.record.pts||(b.record.pf-b.record.pa)-(a.record.pf-a.record.pa));
 const seeded=stage('world-quarter').flatMap(m=>[m.home,m.away]);
 const regionalLeaders=REGIONS.map((name,i)=>({name,team:contenders.find(t=>t.region===i),winner:regionFinals.find(m=>m.region===i)?.winner}));
 const Club=({id}: {id:string})=>{const t=byId.get(id);return t?<button className="rift-contender" onClick={()=>onClub(id)}><Crest team={t} size={35}/><span><b>{t.nickname}</b><small>{REGIONS[t.region]}</small></span></button>:<span className="rift-placeholder">TBD</span>;};
 return <section className="rift-world">
  <header className="rift-world-header"><div><span className="eyebrow">THE GLOBAL TITLE · YEAR {season}</span><h2><Crown size={28}/> THE GRAND RIFT</h2><p>Four regions. Eight world contenders. One World Champion. Regional titles are decided first; their winners and four wildcard clubs enter the knockout.</p></div><div className="rift-reigning"><span>REIGNING WORLD CHAMPIONS</span>{lastChampion?<Club id={lastChampion.id}/>:<strong>THE FIRST CROWN AWAITS</strong>}</div></header>
  <div className="rift-path"><span>4 REGIONAL PREMIER LEAGUES</span><ArrowRight size={16}/><span>REGIONAL FINAL FOUR</span><ArrowRight size={16}/><span>4 CHAMPIONS + 4 WILDCARDS</span><ArrowRight size={16}/><strong>GRAND RIFT</strong></div>
  <div className="rift-qualifiers">{regionalLeaders.map((r,i)=><div className="rift-region" key={r.name}><small>{r.name}</small>{r.winner?<Club id={r.winner}/>:r.team?<Club id={r.team.id}/>:<span>TBD</span>}<em>{r.winner?'REGIONAL CHAMPION':'CURRENT PREMIER LEADER · NOT QUALIFIED'}</em></div>)}</div>
  <div className="rift-bracket-title"><Trophy size={19}/><h3>THE ROAD TO THE WORLD CROWN</h3><span>{seeded.length?`${seeded.length} entrants confirmed`:'Bracket opens after regional finals · Week 20'}</span></div>
  <div className="rift-bracket">{phases.map(p=><div className="rift-round" key={p.key}><div className="rift-round-heading">{p.title}<small>WEEK {p.week}</small></div>{stage(p.key).length?stage(p.key).map(m=><button className="rift-match" key={m.id} onClick={()=>onMatch(m.id)}><span className={m.winner===m.home?'winner':''}><Crest team={byId.get(m.home)!} size={29}/><b>{byId.get(m.home)?.nickname}</b><strong>{m.homeScore??'—'}</strong></span><span className={m.winner===m.away?'winner':''}><Crest team={byId.get(m.away)!} size={29}/><b>{byId.get(m.away)?.nickname}</b><strong>{m.awayScore??'—'}</strong></span></button>):Array.from({length:p.key==='world-quarter'?4:p.key==='world-semi'?2:1},(_,i)=><div className="rift-empty-match" key={i}><Shield size={20}/>{p.key==='world-quarter'?'QUALIFICATION PENDING':'AWAITING PREVIOUS ROUND'}</div>)}</div>)}</div>
  <footer className="rift-world-footer">{previous?<><Crown size={17}/> Last crowned: <b>{lastChampion?.name}</b> · Year {previous.season}</>:<>The Grand Rift is the world championship. Regional championships are separate honors.</>}</footer>
 </section>;
}
