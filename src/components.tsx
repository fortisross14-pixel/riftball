import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight, Shield, Sparkles, Sword, Zap } from 'lucide-react';
import type { Player, Race, Team } from './types';

export const nfmt=(v:number)=>new Intl.NumberFormat('en-US').format(v);
export const initials=(s:string)=>s.split(' ').slice(0,2).map(a=>a[0]).join('').toUpperCase();

const mascotGlyphs = ['⚒','✦','☠','♜','⚡','◆','♞','✹','☾','♠','✶','♛'];
const crestMotifs = ['MOUNTAIN','RUNE','BOLT','MOON','CROWN','SPIKE','FLAME','SKULL','TEMPEST'];
const roleAccent:Record<Player['role'],string>={Bastion:'#cfa46a',Breaker:'#d06857',Runner:'#6fd1e4',Thrower:'#8ba8ff',Raider:'#8fd27e',Trickster:'#d98cff'};

function hashed(seed:string){let n=0; for(const c of seed) n=(n*31+c.charCodeAt(0))>>>0; return n;}
function mascotGlyph(team:Team){return mascotGlyphs[hashed(team.id)%mascotGlyphs.length];}
function crestMotif(team:Team){return crestMotifs[hashed(team.nickname)%crestMotifs.length];}

export function Crest({team,size=52}: {team:Team,size?:number}){
 const glyph=mascotGlyph(team);const motif=crestMotif(team);const hash=hashed(team.id);
 const pattern=[0,1,2,3][hash%4];
 return <div className="crest crest-upgraded" style={{width:size,height:size,'--club':team.colors[0],'--club-alt':team.colors[1]} as CSSProperties}>
  <svg viewBox="0 0 180 180" width="100%" height="100%" aria-hidden="true">
   <defs>
    <linearGradient id={`crest-bg-${team.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={team.colors[1]}/><stop offset="1" stopColor={team.colors[0]}/></linearGradient>
    <radialGradient id={`crest-core-${team.id}`} cx="50%" cy="35%" r="75%"><stop offset="0" stopColor="#2d3340"/><stop offset="1" stopColor="#11161e"/></radialGradient>
    <linearGradient id={`crest-rim-${team.id}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f4d3a0"/><stop offset="1" stopColor="#8a6439"/></linearGradient>
    <clipPath id={`crest-clip-${team.id}`}><path d="M90 10C132 10 165 43 165 85c0 54-38 79-75 88C52 164 15 139 15 85 15 43 48 10 90 10z"/></clipPath>
   </defs>
   <path d="M90 6C136 6 171 41 171 87c0 58-39 84-81 93C48 171 9 145 9 87 9 41 44 6 90 6z" fill="url(#crest-rim-${team.id})" opacity=".98"/>
   <path d="M90 14C131 14 162 45 162 86c0 52-34 74-72 83C53 160 18 138 18 86c0-41 31-72 72-72z" fill="url(#crest-bg-${team.id})"/>
   <g clipPath={`url(#crest-clip-${team.id})`}>
    <rect x="18" y="14" width="144" height="155" fill="url(#crest-core-${team.id})"/>
    {pattern===0&&<><path d="M20 123L160 38" stroke={team.colors[1]} strokeOpacity=".18" strokeWidth="18"/><path d="M20 150L160 65" stroke={team.colors[0]} strokeOpacity=".22" strokeWidth="14"/></>}
    {pattern===1&&<><circle cx="90" cy="87" r="58" fill={team.colors[0]} fillOpacity=".16"/><circle cx="90" cy="87" r="38" fill={team.colors[1]} fillOpacity=".14"/></>}
    {pattern===2&&<>{[0,1,2,3].map(i=><path key={i} d={`M${18+i*36} 20v149`} stroke={i%2?team.colors[1]:team.colors[0]} strokeOpacity=".18" strokeWidth="16"/>)}</>}
    {pattern===3&&<>{[0,1,2,3,4].map(i=><path key={i} d={`M20 ${42+i*23}H160`} stroke={i%2?team.colors[1]:team.colors[0]} strokeOpacity=".17" strokeWidth="12"/>)}</>}
    <circle cx="90" cy="86" r="47" fill="#141a23" stroke="rgba(255,255,255,.12)" strokeWidth="3"/>
    <circle cx="90" cy="86" r="56" fill="none" stroke={team.colors[1]} strokeOpacity=".35" strokeWidth="2" strokeDasharray="6 5"/>
    <text x="90" y="96" fontSize="42" fontWeight="900" textAnchor="middle" fill="#fff4df" fontFamily="Georgia,serif">{glyph}</text>
    <path d="M40 120H140" stroke="rgba(255,255,255,.12)" strokeWidth="2"/>
    <text x="90" y="134" fontSize="11" fontWeight="900" letterSpacing="3" textAnchor="middle" fill="#f5d8aa">{motif}</text>
   </g>
   <path d="M34 26H146" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2"/>
   <path d="M52 152h76" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="2"/>
   <path d="M52 32H128" fill="#0f141c" stroke="rgba(255,255,255,.14)" strokeWidth="2"/>
   <text x="90" y="43" fontSize="12" fontWeight="900" letterSpacing="2" textAnchor="middle" fill="#ffe3b7">{team.initials.slice(0,3)}</text>
  </svg>
 </div>;
}

const raceColors:Record<Race,[string,string,string]>={
 Human:['#d9a078','#8f5f4a','#f0c39d'],Orc:['#83a677','#3e6650','#bfd68e'],Elf:['#d4c5a1','#657b9a','#efe3c3'],Dwarf:['#d1a379','#85694f','#f0c39a'],Goblin:['#9ec177','#527342','#d2ebb0'],Troll:['#9494ad','#515a72','#c2c5df'],Lizardkin:['#80b3a2','#3c7b79','#aed9ca'],Revenant:['#bbc2cf','#687187','#edf3ff'],Satyr:['#d9b079','#85633b','#efc798']
};
const rarityFrame:Record<Player['rarity'],[string,string]>={Ordinary:['#59616d','#2b3440'],Professional:['#4f8b6e','#22392d'],Elite:['#3c73c6','#16253d'],Extraordinary:['#764db0','#261737'],Legendary:['#c69442','#392611'],Generational:['#bb4949','#391617']};

function roleProp(role:Player['role']){
 if(role==='Thrower') return <><ellipse cx="118" cy="86" rx="13" ry="9" fill="#7b4b2b" stroke="#e8d0ad" strokeWidth="2"/><path d="M108 86h20" stroke="#f3e6c8" strokeWidth="1.5"/></>;
 if(role==='Runner'||role==='Raider') return <path d="M120 95l15-11" stroke="#d3ecf2" strokeWidth="5" strokeLinecap="round"/>;
 if(role==='Bastion'||role==='Breaker') return <path d="M24 114h102" stroke="#d6b07a" strokeWidth="7" strokeLinecap="round" opacity=".8"/>;
 return <path d="M114 82l11 16" stroke="#f4d6a6" strokeWidth="4" strokeLinecap="round"/>;
}

export function Avatar({player,size=72}: {player:Player,size?:number}){
 const [skin,shade,highlight]=raceColors[player.race];
 const [frame,shadow]=rarityFrame[player.rarity];
 const accent=roleAccent[player.role];
 const p=player.portrait%5;
 return <div className={`avatar avatar-upgraded race-${player.race.toLowerCase()}`} style={{width:size,height:size,'--role-accent':accent,'--frame':frame,'--frame-shadow':shadow} as CSSProperties} title={`${player.name} · ${player.race}`}>
 <svg viewBox="0 0 180 180" width="100%" height="100%" aria-hidden="true">
  <defs>
   <linearGradient id={`card-bg-${player.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#293447"/><stop offset=".55" stopColor="#111926"/><stop offset="1" stopColor="#0a1017"/></linearGradient>
   <linearGradient id={`field-${player.id}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={accent} stopOpacity=".28"/><stop offset="1" stopColor="#11222f" stopOpacity=".1"/></linearGradient>
   <radialGradient id={`glow-${player.id}`} cx="66%" cy="20%" r="70%"><stop offset="0" stopColor={highlight} stopOpacity=".35"/><stop offset="1" stopColor={highlight} stopOpacity="0"/></radialGradient>
  </defs>
  <rect x="3" y="3" width="174" height="174" rx="17" fill={shadow}/>
  <rect x="7" y="7" width="166" height="166" rx="15" fill="url(#card-bg-${player.id})" stroke={frame} strokeWidth="4"/>
  <rect x="12" y="12" width="156" height="156" rx="12" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="1.8"/>
  <circle cx="131" cy="34" r="43" fill="url(#glow-${player.id})"/>
  <path d="M14 124c24-25 47-33 76-35 28-2 58 11 76 33v40H14z" fill="url(#field-${player.id})"/>
  {[0,1,2].map(i=><path key={i} d={`M${20+i*48} 116h34`} stroke="rgba(255,255,255,.08)" strokeWidth="2"/>) }
  <path d="M40 143h98" stroke="rgba(255,255,255,.08)" strokeWidth="3"/>
  {['Orc','Troll','Satyr'].includes(player.race)&&<><path d="M52 65L36 33Q63 40 65 72" fill={shade} stroke={highlight} strokeOpacity=".35" strokeWidth="2"/><path d="M128 65l16-32q-27 7-29 39" fill={shade} stroke={highlight} strokeOpacity=".35" strokeWidth="2"/></>}
  {['Elf','Goblin'].includes(player.race)&&<><path d="M62 72L37 55l12 31Z" fill={skin} opacity=".95"/><path d="M118 72l25-17-12 31Z" fill={skin} opacity=".95"/></>}
  {player.race==='Lizardkin'&&<><path d="M62 47L48 23l18 14" fill={shade}/><path d="M118 47l14-24-18 14" fill={shade}/><path d="M62 95l-11 14 14-5" fill={shade}/></>}
  <ellipse cx="90" cy="77" rx={player.race==='Troll'?35:30} ry="37" fill={skin}/>
  <path d="M58 54q5-24 32-20 30-3 33 23l-10-6-18-4-27 6z" fill={player.race==='Revenant'?'#494f59':shade}/>
  <path d="M67 80h10M103 80h10" stroke="#1b2833" strokeWidth="4" strokeLinecap="round"/>
  <circle cx="72" cy="82" r="3.1" fill="#192b2b"/><circle cx="108" cy="82" r="3.1" fill="#192b2b"/>
  <path d={p%2===0?'M72 107q18 10 36 0':'M72 104q18-8 36 0'} fill="none" stroke={shade} strokeWidth="3.2" strokeLinecap="round"/>
  <path d="M87 85l-4 13h12" fill="none" stroke={shade} strokeWidth="2.2" strokeLinecap="round"/>
  {player.race==='Orc'&&<><path d="M71 106l-6-12 13 6" fill="#eadfc5"/><path d="M109 106l6-12-13 6" fill="#eadfc5"/></>}
  {player.race==='Dwarf'&&<path d="M59 104q-8 29 31 37 39-8 31-37l-12 7-19-4-19 4z" fill={shade} opacity=".98"/>}
  {player.race==='Revenant'&&<path d="M58 92l4 27 28 9 28-9 4-27" fill="none" stroke="#d8e0f0" strokeOpacity=".44" strokeWidth="1.5"/>}
  <path d="M44 139q7-20 18-28l28 8 28-8q12 8 18 28v12H44z" fill={player.role==='Bastion'||player.role==='Breaker'?'#454c5a':'#25364e'} stroke={accent} strokeWidth="2"/>
  <path d="M44 142h92" stroke="#f2d4a4" strokeOpacity=".7" strokeWidth="3"/>
  <path d="M72 113l18 8 18-8" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2"/>
  <path d="M56 137l13-18M124 137l-13-18" stroke="rgba(255,255,255,.13)" strokeWidth="2"/>
  {roleProp(player.role)}
  <rect x="13" y="14" width="40" height="24" rx="6" fill="rgba(9,12,17,.8)" stroke={frame} strokeWidth="1.5"/>
  <text x="33" y="31" fontSize="14" fontWeight="900" textAnchor="middle" fill="#f6dfb4">{player.rating}</text>
  <rect x="127" y="14" width="40" height="24" rx="6" fill="rgba(9,12,17,.8)" stroke={accent} strokeWidth="1.4"/>
  <text x="147" y="31" fontSize="13" fontWeight="900" textAnchor="middle" fill="#e5eef5">{player.role[0]}</text>
  <path d="M18 156h144" stroke="rgba(255,255,255,.12)" strokeWidth="1.4"/>
  <text x="18" y="168" fontSize="9" fontWeight="800" fill="#f2cb91">{player.race.toUpperCase()}</text>
  <text x="162" y="168" fontSize="9" fontWeight="800" textAnchor="end" fill={accent}>{player.role.toUpperCase()}</text>
 </svg></div>;
}

export function RarityMark({rarity}: {rarity:Player['rarity']}) {return <span className={`rarity rarity-${rarity.toLowerCase()}`}>{rarity}</span>;}
export function Panel({children,className='',title,subtitle,action}: {children:ReactNode;className?:string;title?:string;subtitle?:string;action?:ReactNode}){return <section className={`panel ${className}`}>{title&&<div className="panel-heading"><div><div className="eyebrow">{subtitle||'RIFTBALL CHRONICLE'}</div><h3>{title}</h3></div>{action}</div>}{children}</section>}
export function EmptyState({children}: {children:ReactNode}){return <div className="empty-state"><Shield size={25}/>{children}</div>}
export const roleIcon=(role:string)=>role==='Bastion'?<Shield size={14}/>:role==='Breaker'?<Sword size={14}/>:role==='Thrower'?<Sparkles size={14}/>:role==='Runner'?<Zap size={14}/>:<ArrowUpRight size={14}/>;
