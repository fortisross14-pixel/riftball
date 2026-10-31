import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight, Shield, Sparkles, Sword, Zap } from 'lucide-react';
import type { Player, Race, Team } from './types';
export const nfmt=(v:number)=>new Intl.NumberFormat('en-US').format(v);
export const initials=(s:string)=>s.split(' ').slice(0,2).map(a=>a[0]).join('').toUpperCase();
export function Crest({team,size=52}: {team:Team,size?:number}){
 return <div className="crest" style={{width:size,height:size, '--club':team.colors[0], '--club-alt':team.colors[1]} as CSSProperties}>
  <svg viewBox="0 0 66 72" width="100%" height="100%" aria-hidden="true"><defs><linearGradient id={`g-${team.id}`} x1=".1" x2="1" y1="0" y2="1"><stop stopColor={team.colors[1]}/><stop offset="1" stopColor={team.colors[0]}/></linearGradient></defs>
  <path d="M33 2L61 12V39Q58 58 33 69Q8 58 5 39V12Z" fill={`url(#g-${team.id})`} stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/><path d="M33 8L55 16V39Q53 54 33 62Q13 54 11 39V16Z" fill="#141920" fillOpacity=".7" stroke="rgba(255,255,255,.28)" strokeWidth="1"/><path d="M15 47L51 20M19 54L52 33" stroke={team.colors[1]} strokeWidth="2.6" opacity=".45"/><text x="33" y="42" fontSize="20" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily="Barlow Condensed, sans-serif">{team.initials.slice(0,3)}</text></svg>
 </div>;
}
const raceColors:Record<Race,[string,string]>={Human:['#d9a078','#8f5f4a'],Orc:['#83a677','#3e6650'],Elf:['#d4c5a1','#657b9a'],Dwarf:['#d1a379','#85694f'],Goblin:['#9ec177','#527342'],Troll:['#9494ad','#515a72'],Lizardkin:['#80b3a2','#3c7b79'],Revenant:['#bbc2cf','#687187'],Satyr:['#d9b079','#85633b']};
export function Avatar({player,size=72}: {player:Player,size?:number}){
 const [skin,shade]=raceColors[player.race];const p=player.portrait;
 return <div className={`avatar race-${player.race.toLowerCase()}`} style={{width:size,height:size}} title={`${player.name} · ${player.race}`}>
 <svg viewBox="0 0 100 110" width="100%" height="100%" aria-hidden="true">
  <defs><linearGradient id={`av-${player.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#45505c"/><stop offset="1" stopColor="#141b26"/></linearGradient></defs>
  <rect width="100" height="110" rx="9" fill={`url(#av-${player.id})`}/><circle cx="72" cy="25" r="36" fill={skin} opacity=".13"/><path d="M-10 113Q5 78 30 82L50 77L70 82Q96 78 110 113Z" fill={shade}/><path d="M8 110Q18 89 29 87L50 93L71 87Q85 91 93 110" fill="#242c35" stroke={skin} strokeWidth="1" strokeOpacity=".5"/>
  {['Orc','Troll','Satyr'].includes(player.race)&&<><path d="M21 38L9 8Q35 17 33 41" fill={shade} stroke={skin} strokeWidth="1.5"/><path d="M79 38L91 8Q65 17 67 41" fill={shade} stroke={skin} strokeWidth="1.5"/></>}
  {['Elf','Goblin'].includes(player.race)&&<><path d="M28 45L11 29L23 65Z" fill={skin}/><path d="M72 45L89 29L77 65Z" fill={skin}/></>}
  {player.race==='Lizardkin'&&<><path d="M31 24L19 3L38 22M69 24L81 3L62 22" fill={shade}/><path d="M31 60L22 71L33 67" fill={shade}/></>}
  <ellipse cx="50" cy="48" rx={player.race==='Troll'?30:25} ry="32" fill={skin}/><path d="M27 32Q30 14 49 18Q73 14 74 34L69 30L57 27L39 32Z" fill={player.race==='Revenant'?'#434852':shade}/>
  <path d="M32 46L43 44M57 44L68 46" stroke="#1b2630" strokeWidth="2.5" strokeLinecap="round"/><circle cx="39" cy="47" r="2.3" fill="#1d2b28"/><circle cx="61" cy="47" r="2.3" fill="#1d2b28"/><path d={p%3===0?'M39 66Q50 61 61 66':'M39 65Q50 70 61 65'} fill="none" stroke={shade} strokeWidth="2" strokeLinecap="round"/><path d="M47 49L45 58L53 58" fill="none" stroke={shade} strokeWidth="1.7"/>
  {player.race==='Orc'&&<><path d="M37 66L34 57L42 62M63 66L66 57L58 62" fill="#e3dfcb"/></>}
  {player.race==='Dwarf'&&<path d="M31 61Q27 86 50 90Q73 86 69 61L59 66L50 63L41 66Z" fill={shade} opacity=".98"/>}
  {player.race==='Revenant'&&<path d="M27 54L31 80L50 85L69 80L73 54" fill="none" stroke="#c2cad0" strokeOpacity=".4" strokeWidth="1.2"/>}
  <path d="M24 84L50 95L76 84" stroke="#c2c9d0" strokeOpacity=".32" fill="none" strokeWidth="2"/>
 </svg></div>;
}
export function RarityMark({rarity}: {rarity:Player['rarity']}) {return <span className={`rarity rarity-${rarity.toLowerCase()}`}>{rarity}</span>;}
export function Panel({children,className='',title,subtitle,action}: {children:ReactNode;className?:string;title?:string;subtitle?:string;action?:ReactNode}){return <section className={`panel ${className}`}>{title&&<div className="panel-heading"><div><div className="eyebrow">{subtitle||'RIFTBALL CHRONICLE'}</div><h3>{title}</h3></div>{action}</div>}{children}</section>}
export function EmptyState({children}: {children:ReactNode}){return <div className="empty-state"><Shield size={25}/>{children}</div>}
export const roleIcon=(role:string)=>role==='Bastion'?<Shield size={14}/>:role==='Breaker'?<Sword size={14}/>:role==='Thrower'?<Sparkles size={14}/>:role==='Runner'?<Zap size={14}/>:<ArrowUpRight size={14}/>;
