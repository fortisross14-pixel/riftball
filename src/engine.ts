import { ATTR_KEYS, EMPTY_RECORD, EMPTY_STATS, RACES, REGIONS, ROLES } from './types';
import { chronicleOffseason, chronicleWeek, rebuildRecords } from './chronicle';
import { APELLIDOS, APODOS_CLUB, APODOS_RASGO, APODOS_ROL, CIUDADES, EV, NOMBRES, PAISES, awardEs, filosofia, raza, rol } from './i18n/es-mundo';
import type { Attributes, GalaItem, Match, MatchEvent, Player, Race, Rarity, Role, SeasonStats, StatKey, Story, Team, World, StageState, ShowcaseId, MatchTeamStats, MatchPlayerStats, MatchDrive, MatchReport } from './types';

/** A 30-week Chronicle calendar. These numbers are intentionally exported so UI and jump controls cannot drift from the engine. */
export const SEASON = { LEAGUE_END:22, NATIONAL_SEMI:23, NATIONAL_FINAL:24, WORLD_GROUPS:25, WORLD_SEMI:26, WORLD_FINAL:27, AWARDS:28, MARKET:29, NEW_SEASON:30 } as const;

/** Save format version. Bumped whenever a saved world needs migrating. */
export const CURRENT_VERSION=5;
/** The current world has exactly this many clubs. Older 80-club saves cannot be mapped onto them. */
export const TEAM_COUNT=48;
/** Stable art keys: lower-case, dash-separated. Never derived from a (translatable) display name at runtime. */
export const slugKey=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
export const portraitKeyOf=(race:Race,variant:number)=>`${race.toLowerCase()}-${String(variant).padStart(2,'0')}`;
/** True for saves from before the 48-club world (the 80-club format). Those cannot be loaded. */
export function isLegacyWorld(raw:unknown):boolean{
 const w=raw as Partial<World>|null;
 return !w||typeof w!=='object'||!Array.isArray(w.teams)||w.teams.length!==TEAM_COUNT||!Array.isArray(w.players);
}
/** Twelve permanent clubs per elemental country, as authored in English. These only supply each club's stable art key;
 * the names players see come from src/i18n/es-mundo.ts. */
const CITIES = [
 ['Stonehaven','Ironroot','Deepmount','Oakridge','Granitefall','Mossvale','Thornwall','Copperhollow','Pinewatch','Valebarrow','Runestone','Boulderwake'],
 ['Emberfall','Ashforge','Cinderpeak','Moltenreach','Charspire','Brimstone','Searhaven','Furnace Gate','Scoriavale','Red Caldera','Coalwatch','Flintmarch'],
 ['Skyreach','Galecrest','Cloudspire','Stormwind','High Aerie','Zephyrhold','Thunderrest','Mistwatch','Kitehaven','Tempest Vale','Whisperpeak','Sunsail'],
 ['Deepwell','Riverrun','Coralhaven','Stormbay','Silverbrook','Tidecross','Pearlport','Cascadia','Bluewake','Lakeward','Seafall','Mistral Isle']
];
const NICKNAMES = [
 ['Titans','Hammers','Wardens','Guardians','Quarrymen','Stags','Bramblebacks','Miners','Sentinels','Badgers','Monoliths','Rams'],
 ['Inferno','Blazers','Flames','Dragons','Salamanders','Forgers','Phoenix','Sparks','Basalts','Volcanos','Firebrands','Anvils'],
 ['Falcons','Tempests','Eagles','Zephyrs','Kestrels','Skyriders','Thunderheads','Gusts','Ospreys','Cyclones','Cloudrunners','Windriders'],
 ['Cascade','Waters','Tides','Mariners','Rapids','Leviathans','Nautilus','Undertow','Breakers','Herons','Driftwood','Seastars']
];
// Athlete names come from src/i18n/es-mundo.ts (NOMBRES, APELLIDOS).
const MOD:Record<Race,Partial<Attributes>>={
 Human:{awareness:3,composure:2},Orc:{strength:9,tackling:5,speed:-4,passing:-6},Elf:{speed:6,agility:7,passing:5,strength:-6},Dwarf:{endurance:8,blocking:7,strength:4,speed:-9},
 Goblin:{agility:12,speed:8,handling:4,strength:-14,blocking:-12},Troll:{strength:16,blocking:10,endurance:7,speed:-15,passing:-12,awareness:-8},
 Lizardkin:{speed:5,strength:5,endurance:4,passing:-7},Revenant:{endurance:12,tackling:4,agility:-7},Giantkin:{strength:13,endurance:7,blocking:7,speed:-6,agility:-4}
};
const ROLE_WEIGHT:Record<Role,Partial<Record<StatKey,number>>>= {
 Bastion:{strength:3,blocking:3,endurance:2,positioning:1,composure:1},
 Breaker:{strength:2.5,tackling:3,endurance:1.5,agility:1,awareness:1,blocking:1},
 Runner:{speed:3,agility:2,handling:2,endurance:1,awareness:1,composure:1},
 Thrower:{passing:3,awareness:2.5,handling:2,composure:1.5,positioning:1},
 Raider:{speed:2.5,tackling:2,positioning:2,awareness:2,agility:1.5},
 Trickster:{agility:3,handling:2.5,speed:1.5,awareness:2,passing:1}
};
// Every trait has a mechanical effect in the match engine (see simulateMatch) or the offseason.
export const TRAIT_EFFECTS:Record<string,string>={
 'Relentless':'Barely tires: ignores most late-game fatigue, and runs harder when the team is behind.',
 'Showboat':'Breaks more big plays and adds extra metres to them, but fumbles more often.',
 'Ice-Cold':'Far more accurate on gate shots, and their passes are rarely intercepted.',
 'Undisciplined':'Prone to false starts and illegal blocks that cost 5 metres and a down.',
 'Fan Favorite':'Lifts the home crowd for an extra home edge, and grows the club fanbase every year.',
 'Tactician':'Organises teammates: the whole defence reads plays better while they are on the field.',
 'Hard-Nosed':'Wins short-yardage and goal-line collisions, on offence and defence.',
 'Iron Will':'Much lower injury risk, and recovers from injuries faster.',
 'Hot-Headed':'Commits personal fouls on defence, gifting 10 metres and a fresh set of downs.',
 'Clutch Performer':'Raises their game in the final quarter and in knockout matches.',
 'Born Leader':'The whole lineup plays a little better while they are on the field.',
 'Reckless':'Lands more knockouts but gets hurt far more often, sometimes by their own tackles.'
};
const TRAITS=Object.keys(TRAIT_EFFECTS);
// Abilities are one-shot effects. Each use spends one of the team's two Spark charges per match.
export const ABILITY_EFFECTS:Record<string,string>={
 'Ironhide':'Spark: cancels an injury the moment it happens.',
 'Blinkstep':'Spark: blinks past the defence for a guaranteed 15-25 metre run.',
 'Grave Grip':'Spark (defence): rips the ball loose on a tackle, forcing a turnover.',
 'Perfect Spiral':'Spark: a 20-35 metre pass that cannot miss or be intercepted.',
 'Thundercharge':'Spark: a short-yardage or goal-line run that always gains the yards needed.',
 'Second Wind':'Spark: removes all fatigue for the rest of the match.',
 'Trickster’s Luck':'Spark: turns a failed play into a success.',
 'Iron Resolve':'Spark (defence): a guaranteed stop near the goal line.',
 'Sure Hands':'Spark: cancels a fumble or an interception.',
 'Bonebreaker':'Spark (defence): a guaranteed knockout tackle.'
};
const ABILITIES=Object.keys(ABILITY_EFFECTS);
// Philosophies are play-calling profiles.
// pass: share of plays that are passes. aggression: big plays and hard hits, but more turnovers.
// gate: willingness to kick gate shots on a final down. tempo: drives per match and fatigue. defense: flat defensive bonus.
export type PlayProfile={pass:number;aggression:number;gate:number;tempo:number;defense:number;summary:string};
export const PHILOSOPHY_PROFILES:Record<string,PlayProfile>={
 'IRON WALL':{pass:.32,aggression:.35,gate:.75,tempo:.3,defense:2.5,summary:'Defence first, slow drives, takes the gate shot whenever in range.'},
 'SILVER ARROW':{pass:.62,aggression:.55,gate:.4,tempo:.6,defense:0,summary:'Pass-heavy and quick.'},
 'STAMPEDE':{pass:.22,aggression:.65,gate:.2,tempo:.5,defense:1,summary:'Runs straight through you and rarely settles for a gate.'},
 'MISCHIEF':{pass:.48,aggression:.75,gate:.35,tempo:.7,defense:-1,summary:'Trick plays: big gains, bigger turnovers.'},
 'CLOCKWORK':{pass:.45,aggression:.2,gate:.8,tempo:.3,defense:.5,summary:'Low risk, ball control, almost no turnovers.'},
 'SWARM':{pass:.38,aggression:.6,gate:.4,tempo:.8,defense:.5,summary:'High tempo and relentless defensive pressure.'}
};
const PHILOSOPHIES=Object.keys(PHILOSOPHY_PROFILES);
export const playProfile=(philosophy:string)=>{const p=PHILOSOPHY_PROFILES[philosophy.toUpperCase()]??PHILOSOPHY_PROFILES['CLOCKWORK'];return {...p,summary:filosofia(philosophy).resumen};};
const PALETTE:[string,string][][]=[
 [['#cb634b','#faac6f'],['#a67c44','#edc389'],['#7f7e9d','#cec5e6'],['#be5349','#edbf93'],['#456c79','#9ed4d6']],
 [['#669e8d','#b0d6b5'],['#809abf','#ccd6ef'],['#a48cc7','#e0c8ee'],['#c5a870','#f9e3b0'],['#6d9aa5','#b6e0db']],
 [['#a26b52','#f1ae7a'],['#a17d45','#f3d18d'],['#60827d','#a6cec4'],['#9b676d','#f2c0b2'],['#7769a0','#c5b6e9']],
 [['#7c759e','#c3b5e7'],['#758b9e','#b8d2e1'],['#7d546c','#d9b1cd'],['#587987','#9eb8c4'],['#9a6a70','#d9acbb']]
];
export function random(w:World):number { w.rng = (Math.imul(1664525,w.rng)+1013904223)>>>0; return w.rng/4294967296; }
export const int=(w:World,a:number,b:number)=>Math.floor(a+random(w)*(b-a+1));
export const pick=<T,>(w:World,a:readonly T[])=>a[int(w,0,a.length-1)];
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const rid=(w:World,prefix:string)=>`${prefix}-${++w.serial}`;
const grade=(r:number):Rarity => r<.003?'Generational':r<.02?'Legendary':r<.09?'Extraordinary':r<.27?'Elite':r<.57?'Professional':'Ordinary';
const boost:Record<Rarity,number>={Ordinary:-5,Professional:0,Elite:5,Extraordinary:9,Legendary:13,Generational:17};
// Country-specific demographics. Every one of the nine races remains eligible in all four realms.
const RACE_WEIGHTS=[[4,2,2,4,1,2,1,1,2],[3,3,1,2,1,2,3,1,1],[3,1,5,1,2,1,1,1,4],[4,1,2,1,3,2,3,1,2]];
// Authored asset allocation: elite portraits are unique within a founding roster; regular portraits may recur.
const PORTRAIT_COUNTS:Record<Race,number>={Human:40,Elf:36,Dwarf:33,Giantkin:19,Orc:33,Goblin:30,Troll:19,Lizardkin:20,Revenant:27};
const ELITE_PORTRAIT_COUNTS:Record<Race,number>={Human:20,Elf:18,Dwarf:16,Giantkin:8,Orc:16,Goblin:15,Troll:8,Lizardkin:7,Revenant:12};
const REGULAR_PORTRAIT_COUNTS:Record<Race,number>={Human:6,Elf:6,Dwarf:5,Giantkin:4,Orc:5,Goblin:5,Troll:4,Lizardkin:6,Revenant:6};
function drawRace(w:World, region:number):Race { const arr=RACE_WEIGHTS[region]; const total=arr.reduce((a,b)=>a+b,0); let p=random(w)*total; for(let i=0;i<arr.length;i++){p-=arr[i];if(p<0)return RACES[i];}return 'Human'; }
export function positionRating(attrs:Attributes,role:Role):number { const weights=ROLE_WEIGHT[role]; let total=0,weight=0; Object.entries(weights).forEach(([key,v])=>{ total+=attrs[key as StatKey]*v;weight+=v;});return Math.round(total/weight); }
// Age curve: everyone grows until PEAK_AGE (or earlier if their race declines sooner),
// plateaus, then declines from declineAge. Long-lived races keep their edge.
const PEAK_AGE=27, GROWTH_PER_YEAR=1.7;
const RETIRE_AGE:Record<Race,number>={Human:35,Orc:35,Elf:40,Dwarf:38,Giantkin:37,Goblin:30,Troll:35,Lizardkin:35,Revenant:44};
export const retireAge=(race:Race)=>RETIRE_AGE[race];
export const declineAge=(race:Race)=>RETIRE_AGE[race]-4;
const growthEnd=(race:Race)=>Math.min(PEAK_AGE,declineAge(race));
// Expected distance between a player's current rating and their peak at a given age.
const ageGap=(race:Race,age:number)=>Math.max(0,growthEnd(race)-age)*GROWTH_PER_YEAR+Math.max(0,age-declineAge(race))*1.8;
const PHYSICAL:StatKey[]=['speed','agility','endurance','strength'];
// Move a player's position rating by `delta` points by nudging attributes. Growth goes into the
// role's key attributes; decline hits the physical ones first.
function shiftRating(w:World,p:Player,delta:number){
 const steps=Math.floor(Math.abs(delta)+random(w));if(!steps)return;
 const roleKeys=Object.keys(ROLE_WEIGHT[p.role]) as StatKey[];
 const physical=roleKeys.filter(k=>PHYSICAL.includes(k));
 const target=p.rating+(delta>0?steps:-steps);
 for(let i=0;i<80;i++){
  const now=positionRating(p.attrs,p.role);if(delta>0?now>=target:now<=target)break;
  const key=delta>0||!physical.length||random(w)<.35?pick(w,roleKeys):pick(w,physical);
  p.attrs[key]=clamp(p.attrs[key]+(delta>0?1:-1),1,99);
 }
 p.rating=positionRating(p.attrs,p.role);
}
function createPlayer(w:World,team:Team,role:Role,newProspect=false):Player {
 const race=drawRace(w,team.region); const rarity=grade(random(w));
 const age=newProspect?int(w,17,21):int(w,19,33);
 // Potential is the rating this player is expected to reach at their peak. Academies raise rookie ceilings.
 const peak=(team.division===0?68:62)+boost[rarity]*.8+int(w,-5,5)+(rarity==='Generational'?8:rarity==='Legendary'?3:0)+(newProspect?(team.academy-60)*.1:0);
 const base=peak-ageGap(race,age)-8;
 const attrs={} as Attributes;
 for(const key of ATTR_KEYS)attrs[key]=clamp(Math.round(base+int(w,-15,15)+(MOD[race][key]||0)+(ROLE_WEIGHT[role][key]?int(w,3,13):0)),13,99);
 const rating=positionRating(attrs,role); const potential=clamp(Math.round(rating+ageGap(race,age)),rating,99);
 const p:Player={id:rid(w,'p'),name:`${pick(w,NOMBRES[race])} ${pick(w,APELLIDOS[race])}`,race,role,teamId:team.id,age,level:newProspect?1:int(w,1,7),xp:0,rating,rarity,potential,attrs,trait:pick(w,TRAITS),ability:pick(w,ABILITIES),injury:0,careerWear:0,stats:EMPTY_STATS(),career:EMPTY_STATS(),titles:0,championships:0,fame:0,portrait:int(w,ELITE_PORTRAIT_COUNTS[race]+1,ELITE_PORTRAIT_COUNTS[race]+REGULAR_PORTRAIT_COUNTS[race]),portraitKey:'',seasons:0};
 p.portraitKey=portraitKeyOf(race,p.portrait);return p;
}
/** How many of the founding athletes start with a nickname. */
const STAR_NICKNAMES=36;
/**
 * Give an athlete a nickname drawn from their position (or trait), avoiding names already worn by
 * active athletes. The choice is a hash of the id, so it never consumes the world's dice.
 */
export function giveNickname(w:World,p:Player):string{
 if(p.nickname)return p.nickname;
 const h=hashIndex(p.id,1000003);
 const pool=[...(APODOS_RASGO[p.trait]&&h%3===0?APODOS_RASGO[p.trait]:[]),...APODOS_ROL[p.role]];
 const taken=new Set(w.players.map(q=>q.nickname).filter(Boolean));
 const start=h%pool.length;
 let choice=pool[start];
 for(let i=0;i<pool.length;i++){const c=pool[(start+i)%pool.length];if(!taken.has(c)){choice=c;break;}}
 p.nickname=choice;
 return choice;
}
function assignFoundingPortraits(w:World){
 for(const race of RACES){
  const pool=w.players.filter(p=>p.race===race).sort((a,b)=>b.rating-a.rating||a.id.localeCompare(b.id));
  const elite=ELITE_PORTRAIT_COUNTS[race];
  pool.slice(0,elite).forEach((p,i)=>{p.portrait=i+1;p.portraitKey=portraitKeyOf(p.race,p.portrait);});
 }
}
// One offseason of the age curve. Academy quality speeds up young players' growth.
function ageCurve(w:World,p:Player){
 const team=w.teams.find(t=>t.id===p.teamId);
 if(p.age<=growthEnd(p.race)){
  const yearsLeft=Math.max(1,growthEnd(p.race)-p.age+1);
  const academy=team&&p.age<=23?(team.academy-60)*.012:0;
  shiftRating(w,p,Math.max(0,(p.potential-p.rating)/yearsLeft*(.6+random(w)*.8)+academy));
 }else if(p.age>declineAge(p.race)){
  shiftRating(w,p,-(int(w,1,2)+(p.age-declineAge(p.race))*.35));
 }else if(random(w)<.3)shiftRating(w,p,random(w)<.5?1:-1);
}
function seedSchedule(w:World){
 for (const team of w.teams){team.record=EMPTY_RECORD();team.form=[];}
 for(let r=0;r<4;r++){
  const teams=w.teams.filter(t=>t.region===r&&t.division===0).map(t=>t.id);
  let rotation=[...teams];
  const n=rotation.length;
  for(let round=0;round<n-1;round++){
   for(let k=0;k<n/2;k++){
    const a=rotation[k],b=rotation[n-1-k];
    const first=round%2===0?a:b,second=round%2===0?b:a;
    w.matches.push({id:rid(w,'m'),season:w.season,week:round+1,home:first,away:second,homeScore:null,awayScore:null,phase:'league',region:r,events:[],seed:int(w,1,999999999)});
    w.matches.push({id:rid(w,'m'),season:w.season,week:round+n,home:second,away:first,homeScore:null,awayScore:null,phase:'league',region:r,events:[],seed:int(w,1,999999999)});
   }
   rotation=[rotation[0],rotation[n-1],...rotation.slice(1,n-1)];
  }
 }
}
export function createWorld(seed=2026):World {
 const w:World={version:CURRENT_VERSION,seed,rng:seed>>>0,season:1,week:1,teams:[],players:[],matches:[],news:[],trophies:[],awards:[],storylines:[],records:[],retired:[],history:[],serial:0,totalGames:0,lastUpdated:Date.now()};
 for(let region=0;region<4;region++)for(let i=0;i<12;i++){
  const city=CIUDADES[region][i],nickname=APODOS_CLUB[region][i],colors=PALETTE[region][i%5];
  const team:Team={id:rid(w,'t'),artKey:slugKey(`${CITIES[region][i]} ${NICKNAMES[region][i]}`),name:`${city} ${nickname}`,city,nickname,initials:(city.slice(0,2)+nickname.slice(0,1)).toUpperCase(),region,division:0,colors,philosophy:pick(w,PHILOSOPHIES).toUpperCase(),power:int(w,45,85),fanbase:int(w,32,94),academy:int(w,35,90),budget:int(w,15,85),roster:[],record:EMPTY_RECORD(),historyTitles:0,worldTitles:0,rival:'',rivalHeat:0,rivalRecord:{w:0,d:0,l:0},form:[]};
  w.teams.push(team);
  for(const role of [...ROLES,'Bastion','Breaker','Runner','Thrower','Raider','Trickster','Bastion','Breaker','Runner'] as Role[]){
   const player=createPlayer(w,team,role); team.roster.push(player.id);w.players.push(player);
  }
 }
 // Mutual rival pairs: shuffle each regional division and pair neighbours. Pairs persist across promotion and relegation.
 for(let r=0;r<4;r++){
  const pool=w.teams.filter(t=>t.region===r&&t.division===0);
  for(let i=pool.length-1;i>0;i--){const j=int(w,0,i);[pool[i],pool[j]]=[pool[j],pool[i]];}
  for(let i=0;i+1<pool.length;i+=2){const a=pool[i],b=pool[i+1],heat=int(w,20,50);a.rival=b.id;b.rival=a.id;a.rivalHeat=heat;b.rivalHeat=heat;}
 }
 assignFoundingPortraits(w);
 // Stars start with a nickname; everyone else has to earn one (see chronicle.ts).
 [...w.players].sort((a,b)=>b.rating-a.rating||a.id.localeCompare(b.id)).slice(0,STAR_NICKNAMES).forEach(p=>giveNickname(w,p));
 seedSchedule(w);
 enterWeek(w);
 addStory(w,'roundup','COMIENZA UNA ERA DE CAOS ABSOLUTO',`Bienvenidos al Año Uno. Cuarenta y ocho clubes de los cuatro países elementales inauguran la primera temporada registrada de Riftball. El gremio médico recomienda mantener la calma. Muchísima calma.`,undefined,undefined,undefined,5);
 addStory(w,'scandal','LOS ÁRBITROS PIDEN PLUS DE PELIGROSIDAD',`El Comisionado confirma que cada colegiado recibirá armadura, silbato y exactamente un vale de teletransporte de emergencia, previa revisión de seguridad.`,undefined,undefined,undefined,1);
 return w;
}
export function addStory(w:World,kind:Story['kind'],title:string,body:string,teamId?:string,playerId?:string,matchId?:string,importance=2):Story{
 const story:Story={id:rid(w,'n'),season:w.season,week:w.week,kind,title,body,teamId,playerId,matchId,importance};w.news.unshift(story);
 if(w.news.length>450)w.news.length=450;
 return story;
}
export function getTeam(w:World,id:string):Team {return w.teams.find(t=>t.id===id)!;}
// Player lookup by id. Rebuilt whenever the active player list is replaced or changes size.
const playerIndex=new WeakMap<Player[],{size:number;byId:Map<string,Player>}>();
function activeById(w:World):Map<string,Player>{
 let entry=playerIndex.get(w.players);
 if(!entry||entry.size!==w.players.length){entry={size:w.players.length,byId:new Map(w.players.map(p=>[p.id,p]))};playerIndex.set(w.players,entry);}
 return entry.byId;
}
export function getPlayer(w:World,id:string):Player|undefined {return activeById(w).get(id)||w.retired.find(p=>p.id===id);}
export function teamRoster(w:World,t:Team):Player[] { const byId=activeById(w);return t.roster.map(id=>byId.get(id)).filter((p):p is Player=>!!p); }
export function lineup(w:World,t:Team):Player[]{
 const roster=teamRoster(w,t),healthy=roster.filter(p=>p.injury===0);const injured=roster.filter(p=>p.injury>0).sort((a,b)=>a.injury-b.injury);const pool=healthy.length>=8?healthy:[...healthy,...injured];const chosen:Player[]=[];
 const requirements:Role[]=['Bastion','Bastion','Breaker','Breaker','Runner','Thrower','Raider','Trickster'];
 for(const role of requirements){const possible=pool.filter(p=>!chosen.includes(p));if(!possible.length)break;possible.sort((a,b)=>(b.rating-(b.role===role?0:16))-(a.rating-(a.role===role?0:16)));chosen.push(possible[0]);}
 return chosen;
}
export function teamRating(w:World,t:Team,starters=lineup(w,t)):number{ if(!starters.length)return 32; return starters.reduce((s,p)=>s+p.rating,0)/starters.length + t.power*.075;}
const mean=(players:Player[],...keys:StatKey[])=>players.length?players.reduce((s,p)=>s+keys.reduce((sum,k)=>sum+p.attrs[k],0)/keys.length,0)/players.length:42;
function addStat(p:Player,key:keyof SeasonStats,amount=1){p.stats[key]+=amount;p.career[key]+=amount;}
// XP needed for the next level grows with the square of the level, so level 15 is reserved for long, busy careers.
export const xpGoal=(level:number)=>90+level*level*9;
function addXp(p:Player,amount:number){p.xp+=amount;const goal=xpGoal(p.level);if(p.xp>=goal&&p.level<15){p.xp-=goal;p.level++;if(p.rating<p.potential&&p.age<=growthEnd(p.race)){const keys=Object.keys(ROLE_WEIGHT[p.role]) as StatKey[];const key=keys[(p.level+p.id.length)%keys.length];p.attrs[key]=clamp(p.attrs[key]+1,1,99);p.rating=positionRating(p.attrs,p.role);}}}
function event(m:Match,minute:number,kind:MatchEvent['kind'],teamId:string,player:Player|undefined,text:string,h:number,a:number,x:number){
 if(m.events.length<42)m.events.push({minute,kind,teamId,playerId:player?.id,text,homeScore:h,awayScore:a,x:clamp(x,4,96)});
}
function recordResult(w:World,m:Match){
 const home=getTeam(w,m.home),away=getTeam(w,m.away),h=m.homeScore!,a=m.awayScore!;
 for(const [t,sc,against] of [[home,h,a],[away,a,h]] as [Team,number,number][]){t.record.pf+=sc;t.record.pa+=against; t.form.unshift(sc>against?'W':sc<against?'L':'D');t.form=t.form.slice(0,5);if(sc>against){t.record.w++;t.record.pts+=3;}else if(sc<against){t.record.l++;}else{t.record.d++;t.record.pts++;}}
}
function pickWeighted<T>(w:World,items:T[],weight:(item:T)=>number):T{
 let total=0;for(const item of items)total+=weight(item);
 let roll=random(w)*total;for(const item of items){roll-=weight(item);if(roll<0)return item;}
 return items[items.length-1];
}
// Who touches the ball, makes the tackle, or covers the pass, by role.
const CARRY:Record<Role,number>={Runner:6,Trickster:2,Breaker:1.5,Raider:1,Bastion:.2,Thrower:.3};
const CATCH:Record<Role,number>={Runner:2,Trickster:3,Raider:2.5,Breaker:1,Bastion:.2,Thrower:.1};
const TACKLE:Record<Role,number>={Breaker:3,Raider:3,Bastion:1.5,Trickster:1.2,Runner:.8,Thrower:.5};
const COVER:Record<Role,number>={Raider:3,Trickster:2,Breaker:1.5,Runner:.8,Bastion:.4,Thrower:.4};
const has=(p:Player,trait:string)=>p.trait===trait;
const count=(line:Player[],trait:string)=>line.filter(p=>p.trait===trait).length;
function rivalryResult(w:World,m:Match){
 const home=getTeam(w,m.home),away=getTeam(w,m.away);if(home.rival!==away.id)return;
 const h=m.homeScore!,a=m.awayScore!,margin=Math.abs(h-a);
 const heat=2+(margin<=3?4:0)+(margin>=20?5:0)+(m.phase!=='league'?10:0);
 for(const [t,us,them] of [[home,h,a],[away,a,h]] as [Team,number,number][]){t.rivalHeat=Math.min(100,t.rivalHeat+heat);if(us>them)t.rivalRecord.w++;else if(us<them)t.rivalRecord.l++;else t.rivalRecord.d++;}
}
// Rich match reports are the authoritative source for box scores. Legacy saves keep their highlight archive.
export const emptyMatchTeamStats=():MatchTeamStats=>({possessions:0,plays:0,firstDowns:0,yards:0,runAttempts:0,rushingYards:0,passAttempts:0,passesCompleted:0,passingYards:0,breaches:0,gatesAttempted:0,gates:0,aftershocks:0,turnovers:0,interceptions:0,fumblesLost:0,tackles:0,blocks:0,knockouts:0,penalties:0,sparks:0,injuries:0,substitutions:0});
const emptyMatchPlayerStats=(p:Player):MatchPlayerStats=>({playerId:p.id,teamId:p.teamId,plays:0,rushAttempts:0,yards:0,passesAttempted:0,passesCompleted:0,passingYards:0,catches:0,breaches:0,assists:0,gates:0,tackles:0,blocks:0,interceptions:0,knockouts:0,turnovers:0,sparks:0,impact:0});
export function simulateMatch(w:World,m:Match){
 if(m.homeScore!==null)return;
 const home=getTeam(w,m.home),away=getTeam(w,m.away),homeLine=lineup(w,home),awayLine=lineup(w,away);
 const sides=[home,away],lines=[homeLine,awayLine],profiles=[playProfile(home.philosophy),playProfile(away.philosophy)];const score=[0,0];
 const report:MatchReport={version:1,teams:{[home.id]:emptyMatchTeamStats(),[away.id]:emptyMatchTeamStats()},players:{},drives:[],starters:{[home.id]:homeLine.map(p=>p.id),[away.id]:awayLine.map(p=>p.id)},benchUsed:{[home.id]:[],[away.id]:[]}};
 const used=new Set([...homeLine,...awayLine].map(p=>p.id));
 const teamStat=(side:number,key:keyof MatchTeamStats,amount=1)=>{report.teams[sides[side].id][key]+=amount;};
 const pStat=(p:Player,key:Exclude<keyof MatchPlayerStats,'playerId'|'teamId'>,amount=1)=>{const entry=report.players[p.id]??(report.players[p.id]=emptyMatchPlayerStats(p));entry[key]+=amount;};
 const benches=sides.map((t,side)=>teamRoster(w,t).filter(p=>p.injury===0&&!lines[side].some(q=>q.id===p.id)));
 const rotate=(side:number,drive:number)=>{
  const line=lines[side],bench=benches[side];if(!bench.length)return;
  // Forced replacement when a player has been injured, or a one-player rotation after sustained exposure.
  const injured=line.find(p=>p.injury>0);
  const weary=drive>=5&&drive%4===side?line.filter(p=>p.injury===0).sort((a,b)=>a.attrs.endurance-b.attrs.endurance)[0]:undefined;
  const out=injured??weary;if(!out)return;
  const candidates=bench.filter(p=>p.injury===0);
  if(!candidates.length)return;
  const choice=[...candidates].sort((a,b)=>(b.rating-(b.role===out.role?0:19))-(a.rating-(a.role===out.role?0:19)))[0];
  if(!injured&&choice.rating<out.rating-13)return;
  line[line.indexOf(out)]=choice;bench.splice(bench.indexOf(choice),1);
  if(out.injury===0)bench.push(out);
  teamStat(side,'substitutions');used.add(choice.id);
  const entries=report.benchUsed[sides[side].id];if(!entries.includes(choice.id)&&!report.starters[sides[side].id].includes(choice.id))entries.push(choice.id);
 };

 const knockout=m.phase!=='league';
 // A small home edge that grows with the crowd (and its favourite players). The Grand Final is played on neutral ground.
 const homeEdge=m.phase==='grand-final'?0:.2+home.fanbase*.01+count(homeLine,'Fan Favorite')*.4;
 // Born Leaders lift the whole lineup.
 const startingLineRating=lines.map(line=>line.reduce((sum,p)=>sum+p.rating,0)/line.length);
 const strengths=[0,1].map(s=>teamRating(w,sides[s],lines[s])+(s===0?homeEdge:0)+Math.min(2,count(lines[s],'Born Leader')));
 // Each side's defensive shape: how well it reads plays (Tacticians help), and how heavy its front line is.
 const shape=lines.map((l,s)=>({read:mean(l,'positioning','awareness')+Math.min(3,count(l,'Tactician')*1.5)+profiles[s].defense,wall:mean(l.filter(p=>p.role==='Bastion'||p.role==='Breaker'),'strength','blocking')+profiles[s].defense}));
 // Tempo: fast teams play more drives and tire everyone out.
 const tempo=profiles[0].tempo+profiles[1].tempo;
 const possessions=int(w,12,16)+Math.round(tempo),first=int(w,0,1);const spark=[2,2];let minute=0;
 const fresh=new Set<string>(); // players who used Second Wind
 const spentAbility=new Set<string>(); // one active signature activation per player per match
 const sideOf=(p:Player)=>p.teamId===home.id?0:1;
 const sparkEvent=(s:number,p:Player,text:string,x:number)=>{spark[s]--;spentAbility.add(p.id);teamStat(s,'sparks');pStat(p,'sparks');addXp(p,5);event(m,minute,'spark',sides[s].id,p,EV.spark(p.ability,text),score[0],score[1],x);};
 // Injuries respect Iron Will, Reckless and the Ironhide ability.
 const hurt=(p:Player,min:number,max:number,text:string,x:number)=>{
  const s=sideOf(p);
  if(p.ability==='Ironhide'&&spark[s]>0&&!spentAbility.has(p.id)){sparkEvent(s,p,EV.ironhide(p.name),x);return;}
  const weeks=Math.max(1,int(w,min,max)-(has(p,'Iron Will')?1:0));
  p.injury=Math.max(p.injury,weeks);addStat(p,'injuries');teamStat(s,'injuries');event(m,minute,'injury',sides[s].id,p,text,score[0],score[1],x);
 };
 const injuryRisk=(p:Player)=>has(p,'Iron Will')?.4:has(p,'Reckless')?1.5:1;
 for(let drive=0;drive<possessions;drive++){
  rotate(0,drive);rotate(1,drive);
  const side=(drive+first)%2,attack=sides[side],defend=sides[1-side],off=lines[side],deff=lines[1-side],plan=profiles[side],defPlan=profiles[1-side];
  // Fatigue builds over the match; high endurance shrugs it off, Relentless players barely notice, Second Wind resets it.
  const fatigue=drive/possessions,tiredness=fatigue*(.75+tempo*.25);
  const tired=(p:Player)=>fresh.has(p.id)?0:tiredness*Math.max(0,85-p.attrs.endurance)*.13*(has(p,'Relentless')?.3:1);
  // Clutch Performers raise their game in the final quarter and in knockouts.
  const clutch=(p:Player)=>has(p,'Clutch Performer')?(fatigue>=.75?4:0)+(knockout?2:0):0;
  const linemen=off.filter(p=>p.role==='Bastion'||p.role==='Breaker');
  // Substitutions can leave a Bastion-only line, so the last fallback is whoever passes best.
  const byPassing=(a:Player,b:Player)=>b.attrs.passing-a.attrs.passing;
  const passer=off.find(p=>p.role==='Thrower')??off.filter(p=>p.role!=='Bastion').sort(byPassing)[0]??[...off].sort(byPassing)[0];
  let x=int(w,12,29),downs=4,target=x+12,steps=0;
  const matchDrive:MatchDrive={index:drive+1,teamId:attack.id,startMinute:Math.round(drive/possessions*32),endMinute:0,startX:x,endX:x,plays:0,firstDowns:0,yards:0,points:0,result:'downs'};
  teamStat(side,'possessions');const beforeScore=score[side];
  while(steps<11&&x<90){steps++;minute=Math.round(((drive+steps/12)/possessions)*32);
   // Short yardage and the goal line (x >= 80) are power situations: strength and blocking decide them.
   const power=target-x<=4||x>=80;
   const routeEdge=(mean(off,'passing','handling')-mean(deff,'awareness','positioning'))/180;
   const blockEdge=(mean(off.filter(p=>p.role==='Bastion'||p.role==='Breaker'),'blocking','strength')-mean(deff,'tackling','strength'))/180;
   const isPass=random(w)<clamp(plan.pass+routeEdge-blockEdge*.5+(target-x>=9?.06:0),.12,.86)*(power?.6:1);
   const blocker=pick(w,linemen.length?linemen:off);
   const carrier=isPass?pickWeighted(w,off.filter(p=>p!==passer),p=>CATCH[p.role]):pickWeighted(w,off,p=>CARRY[p.role]);
   const defender=pickWeighted(w,deff,p=>isPass?COVER[p.role]:TACKLE[p.role]);
   const c=carrier.attrs,b=blocker.attrs,d=defender.attrs;
   // Undisciplined blockers jump early.
   if(has(blocker,'Undisciplined')&&random(w)<.03){x=Math.max(5,x-5);downs--;teamStat(side,'penalties');event(m,minute,'penalty',attack.id,blocker,EV.falseStart(blocker.name),score[0],score[1],x);if(downs<=0)break;continue;}
   matchDrive.plays++;teamStat(side,'plays');pStat(carrier,'plays');pStat(blocker,'plays');pStat(defender,'plays');
   if(isPass){teamStat(side,'passAttempts');pStat(passer,'passesAttempted');}else{teamStat(side,'runAttempts');pStat(carrier,'rushAttempts');}
   let attackValue:number,defenseValue:number;
   if(isPass){
    attackValue=passer.attrs.passing*.4+c.handling*.25+c[power?'strength':'agility']*.15+b.blocking*.2-(tired(passer)+tired(carrier))*.5;
    defenseValue=d.positioning*.35+d.awareness*.25+d.speed*.15+shape[1-side].read*.25-tired(defender);
   }else if(power){
    attackValue=c.strength*.35+c.handling*.15+b.blocking*.35+b.strength*.15-(tired(carrier)+tired(blocker))*.5+(has(carrier,'Hard-Nosed')||has(blocker,'Hard-Nosed')?4:0);
    defenseValue=d.strength*.35+d.tackling*.35+shape[1-side].wall*.3-tired(defender)+(has(defender,'Hard-Nosed')?4:0);
   }else{
    attackValue=c.speed*.3+c.agility*.3+c.handling*.1+b.blocking*.3-(tired(carrier)+tired(blocker))*.5;
    defenseValue=d.tackling*.4+d.speed*.2+shape[1-side].read*.4-tired(defender);
   }
   attackValue+=clutch(carrier)+(isPass?clutch(passer):0)+(has(carrier,'Relentless')&&score[side]<score[1-side]?2:0);
   defenseValue+=clutch(defender);
   // Distinct tactical matchups: pass rush, route discipline and power fronts matter more than a flat team rating.
   const tacticalEdge=isPass?(plan.pass-defPlan.defense*.045)*.07:(power?(plan.aggression-defPlan.defense*.08):plan.tempo-defPlan.tempo)*.055;
   const lineupShift=off.reduce((sum,p)=>sum+p.rating,0)/off.length-startingLineRating[side];
   const diff=(attackValue-defenseValue)*.017+(strengths[side]-strengths[1-side])*.009+tacticalEdge+lineupShift*.004;
   const success=clamp((isPass?.64:power?.7:.72)+diff,.21,.9);
   // Spark abilities: offence first, then the defence's goal-line stand.
   let forced:'success'|'fail'|undefined,gain=0;
   if(spark[side]>0&&random(w)<.35){
    if(!isPass&&!power&&(carrier.ability==='Blinkstep'&&!spentAbility.has(carrier.id))){gain=int(w,15,25);forced='success';sparkEvent(side,carrier,EV.blinkstep(carrier.name,gain),x+gain);}
    else if(!isPass&&power&&(carrier.ability==='Thundercharge'&&!spentAbility.has(carrier.id))){gain=x>=84?90-x:Math.max(target-x,int(w,3,6));forced='success';sparkEvent(side,carrier,EV.thundercharge(carrier.name,gain),x+gain);}
    else if(isPass&&x<70&&(passer.ability==='Perfect Spiral'&&!spentAbility.has(passer.id))){gain=int(w,20,35);forced='success';sparkEvent(side,passer,EV.spiral(passer.name,gain,carrier.name),x+gain);}
    else{const winded=[carrier,passer].find(p=>p.ability==='Second Wind'&&!fresh.has(p.id)&&!spentAbility.has(p.id)&&fatigue>=.55);if(winded){fresh.add(winded.id);sparkEvent(side,winded,EV.secondWind(winded.name),x);}}
   }
   if(!forced&&x>=80&&(defender.ability==='Iron Resolve'&&!spentAbility.has(defender.id))&&spark[1-side]>0&&random(w)<.5){forced='fail';sparkEvent(1-side,defender,EV.ironResolve(defender.name),x);}
   if(isPass&&!forced){
    const pickRisk=(.02+Math.max(0,defenseValue-attackValue)*.0006)*(.8+plan.aggression*.4)*(has(passer,'Ice-Cold')?.6:1);
    if(random(w)<pickRisk){
     const saver=[carrier,passer].find(p=>p.ability==='Sure Hands'&&!spentAbility.has(p.id));
     if(saver&&spark[side]>0){forced='fail';sparkEvent(side,saver,EV.sureHandsPass(saver.name,defender.name),x);}
     else{addStat(defender,'interceptions');teamStat(1-side,'interceptions');teamStat(side,'turnovers');pStat(defender,'interceptions');pStat(passer,'turnovers');matchDrive.result='interception';addXp(defender,8);event(m,minute,'interception',defend.id,defender,EV.interception(defender.name),score[0],score[1],x);break;}
    }
   }
   let succeeded=forced?forced==='success':random(w)<success;
   if(!succeeded&&!forced){const lucky=[carrier,passer].find(p=>p.ability==='Trickster’s Luck'&&!spentAbility.has(p.id));if(lucky&&spark[side]>0&&random(w)<.25){succeeded=true;sparkEvent(side,lucky,EV.tricksterLuck(lucky.name),x);}}
   let tackled=false;
   if(succeeded){
    if(!gain){
     gain=isPass?int(w,3,Math.round(12+plan.aggression*8)):power?int(w,1,6):int(w,3,14);
     // Agile carriers, Showboats and aggressive schemes break more big plays in open space.
     const bigChance=clamp(.05+(c.agility-60)*.0025,.02,.15)*(.7+plan.aggression*.6)*(has(carrier,'Showboat')?1.6:1);
     if(!power&&random(w)<bigChance){gain+=int(w,10,25)+(has(carrier,'Showboat')?int(w,3,8):0);event(m,minute,'bigplay',attack.id,carrier,EV.bigplay(carrier.name,gain),score[0],score[1],x+gain);}
    }
    x+=gain;teamStat(side,'yards',gain);matchDrive.yards+=gain;pStat(carrier,'yards',gain);addStat(carrier,'distance',gain);
    if(isPass){teamStat(side,'passesCompleted');teamStat(side,'passingYards',gain);pStat(passer,'passesCompleted');pStat(passer,'passingYards',gain);pStat(carrier,'catches');addStat(passer,'passes');addStat(passer,'passingYards',gain);} else {addStat(carrier,'rushingYards',gain);teamStat(side,'rushingYards',gain);if(gain>=5){addStat(blocker,'blocks');teamStat(side,'blocks');pStat(blocker,'blocks');}}
    if(x>=90){
     score[side]+=5;teamStat(side,'breaches');pStat(carrier,'breaches');matchDrive.result='breach';matchDrive.scorerId=carrier.id;addStat(carrier,'breaches');addXp(carrier,12);
     if(isPass){pStat(passer,'assists');addStat(passer,'assists');addXp(passer,6);event(m,minute,'breach',attack.id,carrier,EV.breachPass(passer.name,carrier.name),score[0],score[1],95);}
     else{addStat(blocker,'blocks');teamStat(side,'blocks');pStat(blocker,'blocks');event(m,minute,'breach',attack.id,carrier,EV.breachRun(carrier.name,blocker.name),score[0],score[1],95);}
     if(random(w)<.62){score[side]+=1;teamStat(side,'aftershocks');event(m,minute,'aftershock',attack.id,carrier,EV.aftershock(attack.nickname),score[0],score[1],95);}break;
    }
    tackled=true;
    if(x>=target){downs=4;target=x+12;teamStat(side,'firstDowns');matchDrive.firstDowns++;}else downs--;
   }else{
    downs--;
    if(!isPass){
     tackled=true;
     // Light, twitchy carriers cough the ball up more; strong ones hold on. Showboats and aggressive schemes fumble more.
     const fumbleRisk=clamp(.045+(c.agility-c.strength)*.0012-(power?.015:0),.012,.11)*(.8+plan.aggression*.4)*(has(carrier,'Showboat')?1.5:1);
     if(forced!=='fail'&&random(w)<fumbleRisk){
      if((carrier.ability==='Sure Hands'&&!spentAbility.has(carrier.id))&&spark[side]>0)sparkEvent(side,carrier,EV.sureHandsFumble(carrier.name),x);
      else{addStat(defender,'tackles');teamStat(1-side,'tackles');teamStat(side,'turnovers');teamStat(side,'fumblesLost');pStat(defender,'tackles');pStat(carrier,'turnovers');matchDrive.result='fumble';event(m,minute,'fumble',attack.id,carrier,EV.fumble(carrier.name,defender.name),score[0],score[1],x);break;}
     }
    }
   }
   if(tackled){
    addStat(defender,'tackles');teamStat(1-side,'tackles');pStat(defender,'tackles');
    // Hot-Headed defenders take a swing after the whistle.
    if(has(defender,'Hot-Headed')&&random(w)<.03){x=Math.min(89,x+10);downs=4;target=x+12;teamStat(1-side,'penalties');event(m,minute,'penalty',defend.id,defender,EV.hotHeaded(defender.name),score[0],score[1],x);}
    if((defender.ability==='Grave Grip'&&!spentAbility.has(defender.id))&&spark[1-side]>0&&x>=50&&random(w)<.25){addStat(defender,'interceptions');teamStat(1-side,'interceptions');teamStat(side,'turnovers');pStat(defender,'interceptions');pStat(carrier,'turnovers');matchDrive.result='interception';sparkEvent(1-side,defender,EV.graveGrip(defender.name,carrier.name),x);break;}
    const bonebreaker=(defender.ability==='Bonebreaker'&&!spentAbility.has(defender.id))&&spark[1-side]>0&&random(w)<.08;
    const knockoutRisk=clamp(.008+(d.strength-60)*.0004+(d.tackling-60)*.0003,.003,.04)*(.7+defPlan.aggression*.6)*(has(defender,'Reckless')?1.8:1);
    if(bonebreaker||random(w)<knockoutRisk){
     if(bonebreaker)sparkEvent(1-side,defender,EV.bonebreaker(defender.name,carrier.name),x);
     addStat(defender,'knockouts');teamStat(1-side,'knockouts');pStat(defender,'knockouts');addXp(defender,4);event(m,minute,'knockout',defend.id,defender,EV.knockout(defender.name,carrier.name),score[0],score[1],x);
     if(random(w)<(bonebreaker?.35:.25)*injuryRisk(carrier))hurt(carrier,1,5,EV.carriedOff(carrier.name),x);
    }else if(random(w)<.001*injuryRisk(carrier))hurt(carrier,1,3,EV.limpsOff(carrier.name),x);
    if(has(defender,'Reckless')&&random(w)<.0012)hurt(defender,1,3,EV.recklessSelf(defender.name),x);
   }
   if(downs<=0){
    // Final down: the philosophy decides whether to kick a gate shot. Ice-Cold kickers rarely miss.
    if(x>=70-plan.gate*25&&random(w)<.2+plan.gate*.5){teamStat(side,'gatesAttempted');const kicker=passer;const probability=clamp(.72-(90-x)*.01+(kicker.attrs.composure-50)*.004+(has(kicker,'Ice-Cold')?.12:0)+clutch(kicker)*.02,.23,.92);if(random(w)<probability){score[side]+=2;teamStat(side,'gates');pStat(kicker,'gates');matchDrive.result='gate';matchDrive.scorerId=kicker.id;addStat(kicker,'gates');event(m,minute,'gate',attack.id,kicker,EV.gate(kicker.name),score[0],score[1],x);}else {matchDrive.result='miss';event(m,minute,'whistle',attack.id,kicker,EV.gateMiss(kicker.name),score[0],score[1],x);}}
    break;}
  }
  matchDrive.endX=x;matchDrive.endMinute=minute;matchDrive.points=score[side]-beforeScore;
  report.drives.push(matchDrive);
 }
 // Very rare draw-breaker only in knockout games.
 if(knockout&&score[0]===score[1]){const fav=strengths[0]+int(w,-20,20)>strengths[1]+int(w,-20,20)?0:1;score[fav]+=5;teamStat(fav,'breaches');const finisher=pickWeighted(w,lines[fav],p=>CARRY[p.role]+(has(p,'Clutch Performer')?3:0));addStat(finisher,'breaches');pStat(finisher,'breaches');report.drives.push({index:report.drives.length+1,teamId:sides[fav].id,startMinute:33,endMinute:34,startX:50,endX:90,plays:1,firstDowns:0,yards:40,points:5,result:'overtime',scorerId:finisher.id});teamStat(fav,'possessions');teamStat(fav,'plays');teamStat(fav,'runAttempts');pStat(finisher,'rushAttempts');pStat(finisher,'yards',40);teamStat(fav,'rushingYards',40);teamStat(fav,'yards',40);event(m,34,'breach',sides[fav].id,finisher,EV.overtime(finisher.name),score[0],score[1],95);}
 m.homeScore=score[0];m.awayScore=score[1];m.report=report;w.totalGames++;if(score[0]!==score[1])m.winner=score[0]>score[1]?m.home:m.away;
 for(const id of used){const p=getPlayer(w,id);if(p){addStat(p,'games');addXp(p,int(w,10,20));}}
 if(m.phase==='league')recordResult(w,m);
 rivalryResult(w,m);
 if(m.events.length===0)event(m,32,'whistle',m.home,undefined,EV.whistle,score[0],score[1],50);
 m.events.sort((a,b)=>a.minute-b.minute);
 for(const entry of Object.values(report.players)){
  entry.impact=entry.breaches*12+entry.assists*7+entry.gates*5+entry.yards*.045+entry.passingYards*.025+entry.tackles*.7+entry.blocks*.35+entry.interceptions*9+entry.knockouts*5+entry.sparks*3-entry.turnovers*6;
 }
 const matchMvp=Object.values(report.players).sort((a,b)=>b.impact-a.impact)[0];
 if(matchMvp){ const p=getPlayer(w,matchMvp.playerId); if(p){ addStat(p,'mvp'); p.fame+=2+(m.phase==='league'?0:3); m.mvpId=p.id; } }
 report.winner=m.winner;
}
export function sortedStandings(w:World,region:number,division:0|1):Team[]{return w.teams.filter(t=>t.region===region&&t.division===division).sort((a,b)=>b.record.pts-a.record.pts||(b.record.pf-b.record.pa)-(a.record.pf-a.record.pa)||b.record.pf-a.record.pf||a.name.localeCompare(b.name));}
function makeKnockout(w:World,week:number,home:Team,away:Team,phase:Match['phase'],region=-1){w.matches.push({id:rid(w,'m'),season:w.season,week,home:home.id,away:away.id,homeScore:null,awayScore:null,phase,region,events:[],seed:int(w,1,99999999)});}
function matchesIn(w:World,week:number,phase?:Match['phase']){return w.matches.filter(m=>m.season===w.season&&m.week===week&&(!phase||m.phase===phase));}
function setupRegional(w:World){for(let region=0;region<4;region++){const standings=sortedStandings(w,region,0);makeKnockout(w,SEASON.NATIONAL_SEMI,standings[0],standings[3],'regional-semi',region);makeKnockout(w,SEASON.NATIONAL_SEMI,standings[1],standings[2],'regional-semi',region);}}
function setupRegionalFinals(w:World){for(let r=0;r<4;r++){const semis=matchesIn(w,SEASON.NATIONAL_SEMI).filter(m=>m.region===r);if(semis.length===2)makeKnockout(w,SEASON.NATIONAL_FINAL,getTeam(w,semis[0].winner!),getTeam(w,semis[1].winner!),'regional-final',r);}}
function setupWorldGroups(w:World){
 const champions=matchesIn(w,SEASON.NATIONAL_FINAL,'regional-final').map(m=>getTeam(w,m.winner!));
 for(const t of champions){t.historyTitles++; w.trophies.push({season:w.season,competition:`${REGIONS[t.region]} CHAMPIONS`,teamId:t.id});}
 const others=w.teams.filter(t=>t.division===0&&!champions.some(c=>c.id===t.id)).sort((a,b)=>b.record.pts-a.record.pts||b.record.pf-b.record.pf);
 const extras:Team[]=[];for(const t of others){if(extras.some(e=>e.region===t.region))continue;extras.push(t);if(extras.length===4)break;}
 const entrants=[...champions,...extras].sort((a,b)=>b.record.pts-a.record.pts||b.record.pf-a.record.pf);
 for(let group=0;group<2;group++){
  const pool=entrants.slice(group*4,group*4+4), pairings:[[number,number],[number,number],[number,number],[number,number],[number,number],[number,number]]=[[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];
  for(const [a,b] of pairings){ const m:Match={id:rid(w,'m'),season:w.season,week:SEASON.WORLD_GROUPS,home:pool[a].id,away:pool[b].id,homeScore:null,awayScore:null,phase:'world-group',region:-1,group,events:[],seed:int(w,1,99999999)}; w.matches.push(m); }
 }
 champions.forEach(c=>addStory(w,'championship',`${c.nickname.toUpperCase()}, CAMPEONES DE ${PAISES[c.region].toUpperCase()}`,`${c.name} se coronan en ${PAISES[c.region]} y sacan billete para la Copa del Mundo. La ciudad decreta tres días de destrozos festivos.`,c.id,undefined,undefined,4));
}
function setupWorldSemis(w:World){
 const all=matchesIn(w,SEASON.WORLD_GROUPS,'world-group');
 const qualify=(group:number)=>{
  const matches=all.filter(m=>m.group===group), rows=new Map<string,{id:string;p:number;d:number}>();
  for(const m of matches){for(const id of [m.home,m.away])if(!rows.has(id))rows.set(id,{id,p:0,d:0});const h=rows.get(m.home)!,a=rows.get(m.away)!;h.d+=(m.homeScore??0)-(m.awayScore??0);a.d+=(m.awayScore??0)-(m.homeScore??0);if(m.homeScore!>m.awayScore!)h.p+=3;else if(m.homeScore!<m.awayScore!)a.p+=3;else{h.p++;a.p++;}}
  return [...rows.values()].sort((a,b)=>b.p-a.p||b.d-a.d).slice(0,2).map(r=>getTeam(w,r.id));
 };
 const [a1,a2]=qualify(0),[b1,b2]=qualify(1); if(a1&&a2&&b1&&b2){makeKnockout(w,SEASON.WORLD_SEMI,a1,b2,'world-semi');makeKnockout(w,SEASON.WORLD_SEMI,b1,a2,'world-semi');}
}
function setupFromPrevious(w:World,previousWeek:number,phase:Match['phase'],nextPhase:Match['phase']){const winners=matchesIn(w,previousWeek,phase).map(m=>getTeam(w,m.winner!));for(let i=0;i<winners.length;i+=2)if(winners[i+1])makeKnockout(w,previousWeek+1,winners[i],winners[i+1],nextPhase);}
function pickHeadline(w:World,weekly:Match[]){
 const complete=weekly.filter(m=>m.homeScore!==null),featured=complete.filter(m=>m.phase!=='league');
 const sorted=(featured.length?featured:complete).sort((a,b)=>Math.abs((b.homeScore??0)-(b.awayScore??0))-Math.abs((a.homeScore??0)-(a.awayScore??0)));
 const m=sorted.length?pick(w,sorted.slice(0,Math.min(8,sorted.length))):undefined;if(!m)return;
 const h=getTeam(w,m.home),a=getTeam(w,m.away),winner=getTeam(w,m.winner||m.home),margin=Math.abs((m.homeScore??0)-(m.awayScore??0));
 let headline=margin<=2?`${winner.nickname.toUpperCase()} SOBREVIVEN A UN CLÁSICO`:margin>=20?`${winner.nickname.toUpperCase()} FIRMAN UNA MASACRE`:`${winner.nickname.toUpperCase()} SE LLEVAN EL BOTÍN`;
 if(m.phase==='grand-final')headline=`¡CAMPEONES DEL MUNDO! ${winner.name.toUpperCase()}`;
 addStory(w,m.phase==='grand-final'?'championship':'result',headline,`${h.name} ${m.homeScore} — ${m.awayScore} ${a.name}. ${margin<=2?'Un partido de comerse las uñas, y los nudillos. La liga ha recibido diecisiete quejas de espectadores preocupados.':'La liga confirma el resultado a pesar de varias protestas redactadas con mucha energía.'}`,winner.id,undefined,m.id,m.phase==='grand-final'?8:m.phase==='league'?2:4);
}
// Role-aware impact: each role is judged only on the work that role is meant to do.
const ROLE_IMPACT:Record<Role,Partial<Record<keyof SeasonStats,number>>>={
 Bastion:{blocks:1,knockouts:2,tackles:.3,breaches:3},
 Breaker:{tackles:.6,knockouts:3,blocks:.4,interceptions:4,breaches:4},
 Runner:{breaches:6,distance:.04,assists:3},
 Thrower:{assists:5,passes:.25,gates:2,breaches:4},
 Raider:{tackles:.5,interceptions:6,knockouts:3,breaches:4,distance:.02},
 Trickster:{breaches:5,distance:.035,interceptions:5,tackles:.3}
};
export function impactScore(role:Role,s:SeasonStats):number{let total=0;for(const [k,v] of Object.entries(ROLE_IMPACT[role]))total+=s[k as keyof SeasonStats]*v!;return total;}
export const POSITION_AWARD:Record<Role,string>={Bastion:'Best Bastion',Breaker:'Best Breaker',Runner:'Best Runner',Thrower:'Best Thrower',Raider:'Best Raider',Trickster:'Best Trickster'};
function annualAwards(w:World){
 const eligible=w.players.filter(p=>p.stats.games>=12);if(!eligible.length)return;
 // Role-aware impact: each player is compared with others in the same role (z-score), plus a bonus for team success.
 const z=new Map<string,number>();
 for(const role of ROLES){
  const group=eligible.filter(p=>p.role===role);if(!group.length)continue;
  const values=group.map(p=>impactScore(role,p.stats)/Math.max(p.stats.games,12));
  const mu=values.reduce((a,b)=>a+b,0)/values.length,sd=Math.sqrt(values.reduce((a,v)=>a+(v-mu)**2,0)/values.length)||1;
  group.forEach((p,i)=>z.set(p.id,(values[i]-mu)/sd));
 }
 const winShare=(p:Player)=>{const r=getTeam(w,p.teamId).record,g=r.w+r.d+r.l;return g?(r.w+r.d*.5)/g:0;};
 // Positional awards and Rookie of the Year: best season relative to the position, nudged by team success.
 const score=new Map(eligible.map(p=>[p.id,z.get(p.id)!+winShare(p)*1.5]));
 const ranked=[...eligible].sort((a,b)=>score.get(b.id)!-score.get(a.id)!);
 // MVP: the positional score is capped, because run-heavy or pass-heavy schemes inflate some roles' volume stats.
 // Once a player clearly leads their position, team success and overall quality decide it.
 const mvpScore=(p:Player)=>Math.min(z.get(p.id)!,3)+winShare(p)*2+(p.rating-60)*.04;
 const give=(p:Player,award:string)=>{w.awards.push({season:w.season,award,playerId:p.id,teamId:p.teamId});p.fame+=(award==='Golden Gargoyle'?18:award==='Rookie of the Year'?9:7);};
 const mvp=eligible.reduce((best,p)=>mvpScore(p)>mvpScore(best)?p:best);give(mvp,'Golden Gargoyle');
 addStory(w,'milestone',`${mvp.name.toUpperCase()} GANA LA GÁRGOLA DE ORO`,`${mvp.name}, ${rol(mvp.role).toLowerCase()} ${raza(mvp.race).toLowerCase()} de ${getTeam(w,mvp.teamId).name}, se lleva el máximo honor individual de la temporada. El trofeo está asegurado contra mordiscos.`,mvp.teamId,mvp.id,undefined,5);
 const winners:string[]=[];
 for(const role of ROLES){const best=ranked.find(p=>p.role===role);if(best){give(best,POSITION_AWARD[role]);winners.push(`${awardEs(POSITION_AWARD[role])}: ${best.name}`);}}
 // In a smaller league a rookie may miss the 12-game bar, so fall back to the most-used first-year athlete.
 const fallbackRookie=()=>w.players.filter(p=>p.seasons===0&&p.stats.games>0).sort((a,b)=>b.stats.games-a.stats.games||impactScore(b.role,b.stats)-impactScore(a.role,a.stats))[0];
 const rookie=w.season>1?ranked.find(p=>p.seasons===0)??fallbackRookie():undefined;
 if(rookie){give(rookie,'Rookie of the Year');winners.push(`${awardEs('Rookie of the Year')}: ${rookie.name}`);}
 addStory(w,'roundup',`LOS PREMIOS DE LA TEMPORADA ${w.season}`,`${winners.join('. ')}. Los discursos se limitaron a noventa segundos y una pequeña explosión por cabeza.`,undefined,undefined,undefined,3);
}
function offseason(w:World){
 // Old grudges cool slowly.
 for(const t of w.teams)t.rivalHeat=Math.round(t.rivalHeat*.75);
 // Clubs rise and fall: results move budget and fanbase, and budget and results move club power.
 // A pull back toward the middle keeps dynasties from lasting forever.
 for(const t of w.teams){
  const r=t.record,g=r.w+r.d+r.l,share=g?(r.w+r.d*.5)/g:.5;
  const champion=w.trophies.some(x=>x.season===w.season&&x.teamId===t.id&&x.competition==='GRAND RIFT CHAMPIONSHIP');
  const favourites=teamRoster(w,t).filter(p=>p.trait==='Fan Favorite').length;
  t.budget=clamp(Math.round(t.budget+(share-.5)*10+(t.division===0?1:-1)+(champion?3:0)+(50-t.budget)*.05+int(w,-3,3)),10,95);
  t.fanbase=clamp(Math.round(t.fanbase+(share-.5)*4+(champion?3:0)+favourites+(55-t.fanbase)*.04+int(w,-1,1)),20,99);
  t.power=clamp(Math.round(t.power+(share-.5)*12+(t.budget-50)*.06+(champion?2:0)+(60-t.power)*.12+int(w,-3,3)),30,95);
 }
 // Promotion/relegation after the completed season.
 for(let r=0;r<4;r++){
  const top=sortedStandings(w,r,0),bottom=sortedStandings(w,r,1);
  // Elemental countries now have one twelve-club national league; identities never move division.
 }
 // Contract moves between clubs and rookie arrival.
 const log={season:w.season,retired:[] as string[],transfers:[] as {playerId:string;from:string;to:string}[],rookies:[] as string[]};w.offseasonLog=log;
 const movements=int(w,30,55);
 for(let i=0;i<movements;i++){
  const from=pick(w,w.teams),to=pick(w,w.teams);if(from.id===to.id)continue;
  const p=pick(w,teamRoster(w,from)),q=pick(w,teamRoster(w,to));if(!p||!q)continue;
  from.roster=from.roster.filter(id=>id!==p.id);to.roster=to.roster.filter(id=>id!==q.id);from.roster.push(q.id);to.roster.push(p.id);p.teamId=to.id;q.teamId=from.id;log.transfers.push({playerId:p.id,from:from.id,to:to.id},{playerId:q.id,from:to.id,to:from.id});
  if(i<3)addStory(w,'transfer',`${p.name.toUpperCase()} CAMBIA DE COLORES`,`${getTeam(w,to.id).name} fichan a ${p.name}, procedente de ${from.name}. Según fuentes cercanas, el contrato incluye plus de peligrosidad y sopa ilimitada.`,to.id,p.id,undefined,2);
 }
 const expired:Player[]=[];
 for(const p of w.players){
  p.seasons++;p.age++;if(p.injury>0)p.injury=Math.max(0,p.injury-7);
  ageCurve(w,p);
  const ageThreshold=RETIRE_AGE[p.race];
  if(p.age>=ageThreshold&&random(w)<.15+Math.max(0,p.age-ageThreshold)*.11)expired.push(p);
  p.stats=EMPTY_STATS();
 }
 for(const p of expired){p.retired=true;p.retiredSeason=w.season;log.retired.push(p.id);p.hallOfLegends=p.fame>=85||p.championships>=2||p.career.breaches>=55;w.retired.push(p);w.players=w.players.filter(x=>x.id!==p.id);const t=getTeam(w,p.teamId);t.roster=t.roster.filter(id=>id!==p.id);if(p.hallOfLegends) addStory(w,'milestone',`${p.name.toUpperCase()} ENTRA EN EL SALÓN DE LEYENDAS`,`${p.name} se retira con ${p.fame} puntos de leyenda, ${p.career.breaches} brechas y ${p.championships} títulos mundiales. Su retrato se cuelga donde pueda intimidar como es debido a las generaciones futuras.`,t.id,p.id,undefined,5);else if(p.career.breaches>35||p.championships>=2)addStory(w,'milestone',`ADIÓS A ${p.name.toUpperCase()}`,`${p.name} se retira tras ${p.seasons} temporadas, ${p.career.breaches} brechas y ${p.championships} títulos mundiales. Un goblin con trompeta interrumpió brevemente el discurso de despedida.`,t.id,p.id,undefined,3);}
 chronicleOffseason(w,expired);
 for(const t of w.teams){const count=Math.max(0,15-t.roster.length);for(let i=0;i<count;i++){const role=ROLES.filter(role=>teamRoster(w,t).filter(p=>p.role===role).length<2)[0]||pick(w,ROLES);const p=createPlayer(w,t,role,true);w.players.push(p);t.roster.push(p.id);log.rookies.push(p.id);}}
 // Compact long-term history, keep recent seasons full and all finals.
 w.matches=w.matches.filter(m=>m.season>=w.season-2||m.phase==='grand-final'||m.phase==='regional-final');
 w.news=w.news.slice(0,450);
}
/** Resolve a single fixture without advancing the calendar: used by Watch Match and Quick Result. */
export function resolveMatch(w:World,id:string):World { const m=w.matches.find(x=>x.id===id); if(!m) throw new Error('Ese partido no está en esta crónica.'); if(m.season!==w.season||m.week!==w.week) throw new Error('Solo se pueden jugar los partidos de esta semana.'); simulateMatch(w,m); w.lastUpdated=Date.now(); return w; }

// ── Stages ──────────────────────────────────────────────────────────────────────────────
// Every week belongs to a stage. Showcase stages (national finals, World Cup groups, semifinals,
// the Grand Final) and the awards gala block the calendar: advanceOneWeek refuses to run until
// every showcase fixture has been played and every award revealed.
export const SHOWCASE_WEEKS:Record<number,ShowcaseId>={[SEASON.NATIONAL_FINAL]:'national-finals',[SEASON.WORLD_GROUPS]:'world-groups',[SEASON.WORLD_SEMI]:'world-semis',[SEASON.WORLD_FINAL]:'grand-final'};
export class StageBlockedError extends Error{constructor(message:string){super(message);this.name='StageBlockedError';}}
function stageKindOf(week:number):StageState['kind']{
 if(SHOWCASE_WEEKS[week])return 'showcase';
 if(week===SEASON.AWARDS)return 'awards';
 if(week===SEASON.MARKET)return 'market';
 if(week===SEASON.NEW_SEASON)return 'preseason';
 return 'league';
}
/** The gala's running order: positional awards, Rookie of the Year, the Golden Gargoyle (MVP), then records broken this season. */
export function galaItems(w:World):GalaItem[]{
 const season=w.awards.filter(a=>a.season===w.season);
 const order=[...ROLES.map(r=>POSITION_AWARD[r]),'Rookie of the Year','Golden Gargoyle'];
 const items:GalaItem[]=[];
 for(const name of order)for(const a of season.filter(x=>x.award===name))items.push({kind:'award',award:a.award,playerId:a.playerId,teamId:a.teamId});
 const records=w.records.filter(r=>r.season===w.season).sort((a,b)=>(a.scope===b.scope?0:a.scope==='career'?-1:1)||b.value-a.value).slice(0,4);
 for(const r of records)items.push({kind:'record',stat:r.stat,scope:r.scope,value:r.value,playerId:r.playerId,teamId:r.teamId});
 return items;
}
/** Set up the stage for the week the world has just entered. The gala's awards are decided on arrival. */
function enterWeek(w:World){
 const kind=stageKindOf(w.week);
 if(kind==='awards'&&!w.awards.some(a=>a.season===w.season))annualAwards(w);
 w.stage={season:w.season,week:w.week,kind,showcase:SHOWCASE_WEEKS[w.week],introSeen:false,revealed:0,total:kind==='awards'?galaItems(w).length:0};
}
/** The current stage, rebuilt if the save predates stages or the stored one is stale. */
export function currentStage(w:World):StageState{
 if(!w.stage||w.stage.season!==w.season||w.stage.week!==w.week)enterWeek(w);
 return w.stage!;
}
export const currentFixtures=(w:World)=>matchesIn(w,w.week);
export const pendingFixtures=(w:World)=>matchesIn(w,w.week).filter(m=>m.homeScore===null);
/** Showcases are complete when every fixture is played; the gala when every award is revealed. */
export function isStageComplete(w:World):boolean{
 const stage=currentStage(w);
 if(stage.kind==='showcase')return pendingFixtures(w).length===0;
 if(stage.kind==='awards')return stage.revealed>=stage.total;
 return true;
}
/** Showcase intro dismissed: the match list opens. */
export function dismissIntro(w:World):World{const stage=currentStage(w);if(stage.kind==='showcase')stage.introSeen=true;return w;}
/** Reveal the next award at the gala. */
export function revealAward(w:World):World{const stage=currentStage(w);if(stage.kind==='awards')stage.revealed=Math.min(stage.total,stage.revealed+1);return w;}
/** "Simulate to the next event" stops on any week that is not a plain league week. */
export const isEventStage=(w:World)=>currentStage(w).kind!=='league';
export function advanceOneWeek(w:World):World {
 const stage=currentStage(w);
 if(!isStageComplete(w))throw new StageBlockedError(stage.kind==='awards'?'Aún quedan premios por revelar en la Gala.':`Aún quedan ${pendingFixtures(w).length} partidos por jugar en este evento.`);
 const week=w.week;const fixtures=matchesIn(w,week);
 for(const m of fixtures)simulateMatch(w,m);
 if(week<=SEASON.WORLD_FINAL&&fixtures.length)pickHeadline(w,fixtures);
 if(week===SEASON.LEAGUE_END)setupRegional(w);
 if(week===SEASON.NATIONAL_SEMI)setupRegionalFinals(w);
 if(week===SEASON.NATIONAL_FINAL)setupWorldGroups(w);
 if(week===SEASON.WORLD_GROUPS)setupWorldSemis(w);
 if(week===SEASON.WORLD_SEMI)setupFromPrevious(w,SEASON.WORLD_SEMI,'world-semi','grand-final');
 if(week===SEASON.WORLD_FINAL){const final=matchesIn(w,SEASON.WORLD_FINAL,'grand-final')[0];if(final?.winner){const winner=getTeam(w,final.winner);winner.worldTitles++;for(const p of teamRoster(w,winner)){p.championships++;p.fame+=25;}w.trophies.push({season:w.season,competition:'GRAND RIFT CHAMPIONSHIP',teamId:winner.id,runnerUpId:final.home===winner.id?final.away:final.home});w.history.unshift({season:w.season,teamId:winner.id,description:`Campeones del mundo · ${winner.name}`});}}
 chronicleWeek(w,week,fixtures);
 if(week===SEASON.MARKET){
  w.seasonArchive??=[];
  w.seasonArchive.push({season:w.season,leaders:[...w.players].sort((a,b)=>b.stats.breaches-a.stats.breaches).slice(0,30).map(p=>({playerId:p.id,teamId:p.teamId,breaches:p.stats.breaches,tackles:p.stats.tackles,interceptions:p.stats.interceptions,passes:p.stats.passes,yards:p.stats.distance})),standings:w.teams.map(t=>({teamId:t.id,division:t.division,region:t.region,w:t.record.w,d:t.record.d,l:t.record.l,pf:t.record.pf,pa:t.record.pa,pts:t.record.pts}))});
  if(w.seasonArchive.length>40)w.seasonArchive.shift();
  offseason(w);addStory(w,'roundup',`SE CIERRA LA TEMPORADA ${w.season}`,`Hay contratos que han cambiado de manos, héroes que cuelgan las botas y una liga que jura haber reparado casi todos los estadios. La próxima temporada se acerca.`,undefined,undefined,undefined,3);}
 if(week===SEASON.NEW_SEASON){w.season++;w.week=1;seedSchedule(w);addStory(w,'roundup',`¡ARRANCA LA TEMPORADA ${w.season}!`,`Cuarenta y ocho clubes. Cuatro países elementales. Un solo campeonato del mundo. Los contables han aprobado otra temporada de violencia carísima.`,undefined,undefined,undefined,3);}
 else w.week++;
 // Injuries heal as the new week begins, before any of its fixtures can be played.
 for(const p of w.players)if(p.injury>0)p.injury--;
 enterWeek(w);
 w.lastUpdated=Date.now();return w;
}
/**
 * Headless play for tests, scripts and balance runs: plays any showcase fixtures, reveals the
 * whole gala, then advances. The UI never calls this; players resolve showcases themselves.
 */
export function advanceWeekAuto(w:World):World{
 const stage=currentStage(w);
 if(stage.kind==='showcase'){stage.introSeen=true;for(const m of pendingFixtures(w))simulateMatch(w,m);}
 if(stage.kind==='awards')stage.revealed=stage.total;
 return advanceOneWeek(w);
}
export function simulateWeeks(world:World,n:number):World{const w=structuredClone(world) as World;for(let i=0;i<n;i++)advanceWeekAuto(w);return w;}
export function upcoming(w:World){return w.matches.filter(m=>m.season===w.season&&m.week===w.week);}
export function recent(w:World){return [...w.matches].filter(m=>m.homeScore!==null).reverse();}
export function topPlayers(w:World,stat:'breaches'|'tackles'|'interceptions'|'rating'|'knockouts',n=10){return [...w.players].sort((a,b)=>stat==='rating'?b.rating-a.rating:b.stats[stat]-a.stats[stat]||b.rating-a.rating).slice(0,n);}
export function summarize(w:World){const completed=w.matches.filter(m=>m.homeScore!==null&&m.season===w.season).length;return {completed,active:w.players.length,clubs:w.teams.length,stories:w.news.length,champions:w.trophies.filter(x=>x.competition==='GRAND RIFT CHAMPIONSHIP').length};}
// Fill in fields added after a save was written, so older universes keep loading.
// Callers must reject legacy 80-club worlds first (see isLegacyWorld).
export function normalizeWorld(w:World):World{
 w.awards??=[];w.seasonArchive??=[];
 // v1 -> v2: storylines and the records table.
 if(!w.version||w.version<2){w.storylines??=[];if(!w.records)rebuildRecords(w);w.version=2;}
 w.storylines??=[];if(!w.records)rebuildRecords(w);
 for(const t of w.teams){t.rivalHeat??=30;t.rivalRecord??={w:0,d:0,l:0};}
 for(const p of [...w.players,...w.retired]){p.stats.blocks??=0;p.career.blocks??=0;p.stats.rushingYards??=p.stats.distance??0;p.career.rushingYards??=p.career.distance??0;p.stats.passingYards??=0;p.career.passingYards??=0;p.fame??=(p.championships??0)*25+(p.career?.mvp??0)*2;p.hallOfLegends??=false;if((p.race as string)==='Satyr')p.race='Giantkin';}
 // v3 -> v4: stable art keys. Clubs are matched to the authored list by their English city, else by position in their country.
 for(let r=0;r<4;r++)w.teams.filter(t=>t.region===r).forEach((t,i)=>{
  if(t.artKey)return;
  const at=CITIES[r].indexOf(t.city),k=at>=0?at:i;
  t.artKey=CITIES[r][k]?slugKey(`${CITIES[r][k]} ${NICKNAMES[r][k]}`):slugKey(t.name);
 });
 for(const p of [...w.players,...w.retired]){
  if(p.portraitKey)continue;
  const max=PORTRAIT_COUNTS[p.race]-1;
  if(!(p.portrait>=1&&p.portrait<=max))p.portrait=1+hashIndex(p.id,max);
  p.portraitKey=portraitKeyOf(p.race,p.portrait);
 }
 w.version=CURRENT_VERSION;
 currentStage(w);
 return w;
}
const hashIndex=(s:string,n:number)=>{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(h,31)+s.charCodeAt(i))>>>0;return h%n;};
