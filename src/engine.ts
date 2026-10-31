import { ATTR_KEYS, EMPTY_RECORD, EMPTY_STATS, RACES, REGIONS, ROLES } from './types';
import type { Attributes, Match, MatchEvent, Player, Race, Rarity, Role, SeasonStats, StatKey, Story, Team, World } from './types';

const CITIES = [
 ['Coppergate','Anvilford','Hammerfall','Ironhollow','Stonewatch','Rustmoor','Blackforge','Kragspire','Ashvault','Grimpeak','Embercross','Brasshaven','Grudgebrook','Mournrock','Cinderwall','Boulderkeep','Redhammer','Steelhollow','Mithrengard','Thundertop'],
 ['Silvermoon','Eldergrove','Highbloom','Sunmere','Willowcrest','Starfall','Brightvale','Rosewarden','Goldleaf','Dawnreach','Mistral','Windspire','Violetmere','Thornfield','Ivorygate','Larkhaven','Greenmantle','Moonwillow','Amberden','Faycrest'],
 ['Mudhaven','Brineport','Redfen','Ratsmouth','Bramblewick','Cutlass Bay','Slymarsh','Scupperton','Driftbarrow','Whistledock','Crogport','Fangwater',"Smuggler's Rest",'Skullhaven','Blister Bay','Snapwick','Rotterdamn','Crowsnest','Filthwater','Gutterrock'],
 ['Gloomspire','Nightshade','Gravecourt','Duskhaven','Boneharbor','Blackveil','Dreadmoor','Hollowmere','Cryptfall','Wraithwick','Deadwood','Ashenwake','Ghostfen','Mournhaven','Palecrest','Wyrmrest','Shadowfen','Grimwater','Tombstone','Netherhold']
];
const NICKNAMES = [
 ['Crushers','Anvils','Maulers','Hammers','Ironclads','Wreckers','Titans','Grinders','Breakers','Brawlers','Forged','Warhounds','Stompers','Bruisers','Juggernauts','Earthshakers','Ironjaws','Bulldozers','Ravagers','Thunderlords'],
 ['Arrows','Stags','Sentinels','Comets','Phoenix','Spires','Whisperers','Sovereigns','Blades','Eagles','Starweavers','Wanderers','Fletchers','Wardens','Luminaries','Valkyries','Enchanters','Foxes','Dancers','Sunriders'],
 ['Mudskippers','Cutthroats','Marauders','Misfits','Bandits','Pirates','Swindlers','Scoundrels','Rat Kings','Looters','Scallywags','Fangtooths','Smugglers','Rogues','Salty Dogs','Firecrackers','Sharks','Crows','Maggots','Knaves'],
 ['Revenants','Spectres','Gravediggers','Banshees','Phantoms','Wraiths','Reapers','Liches','Nightmares','Ghouls','Bonebreakers','Shadows','Haunters','Deathknells','Pale Riders','Hexers','Shrouds','Watchers','Ghostwalkers','Undying']
];
const FIRST:Record<Race,string[]> = {
 Human:['Gareth','Helena','Cedric','Mara','Rowan','Cassian','Elsa','Tobias','Vera','Bran','Kaela','Dorian','Valen','Alric'],
 Orc:['Gorak','Thrag','Morg','Grusha','Durgan','Urzok','Brakka','Korg','Rugga','Brog','Hruk','Kraz','Mogga'],
 Elf:['Aerith','Faelar','Liora','Thalen','Elowen','Vaelis','Eryndor','Sylra','Aelion','Naeris','Cael','Faryn'],
 Dwarf:['Borin','Durgin','Baldric','Gimra','Thora','Dagna','Kelda','Brokk','Orin','Hilda','Brum','Thorvik'],
 Goblin:['Snik','Fizz','Zibbit','Gribble','Kip','Razz','Nix','Wobble','Snark','Tik','Boggle','Splint'],
 Troll:['Grunk','Ugg','Brug','Mogmuk','Thoom','Droll','Grob','Krum','Rog','Thugga','Grumble'],
 Lizardkin:['Sszar','Krizzt','Xak','Tziri','Sskel','Zirrak','Xiss','Skra','Rizzt','Tsaka'],
 Revenant:['Vesper','Morrow','Malach','Mortis','Lazar','Raven','Noctis','Eidolon','Mirth','Vhal'],
 Satyr:['Pip','Faunus','Thistle','Briar','Rill','Fenn','Merrick','Tansy','Dapple','Puck','Glim']
};
const LAST:Record<Race,string[]> = {
 Human:['Ashford','Thorn','Blackwell','Dawnhart','Vale','Ironwood','Merrick','Graves','Brighton','Stone'],
 Orc:['Ironjaw','Bonecrusher','Skullsplitter','Bloodfist','Mudpunch','Ragehide','Tusksmasher','Grimtooth'],
 Elf:['Dawnrunner','Moonwhisper','Starweave','Swiftwind','Silverbough','Nightarrow','Highleaf'],
 Dwarf:['Stonebeard','Ironhelm','Goldvein','Grudgeborn','Deepdelve','Anvilhand','Copperfist'],
 Goblin:['Quickfinger','Sneakfoot','Ratwhistle','Fumblewick','Mudnose','Teethpicker','Shortstack'],
 Troll:['Boulderbelly','Bridgecrack','Bigbones','Craghead','Mossback','Smashrock'],
 Lizardkin:['Scaleblade','Tailstrike','Emberfang','Sunscale','Shellback','Marshclaw'],
 Revenant:['the Unsettled','Grimveil','Ashbones','the Late','Dreadmourne','Neverrest'],
 Satyr:['Whistlehorn','Meadowkick','Quickhoof','Bramblehorn','Fleetstep','Wildstep']
};
const MOD:Record<Race,Partial<Attributes>>={
 Human:{awareness:3,composure:2},Orc:{strength:9,tackling:5,speed:-4,passing:-6},Elf:{speed:6,agility:7,passing:5,strength:-6},Dwarf:{endurance:8,blocking:7,strength:4,speed:-9},
 Goblin:{agility:12,speed:8,handling:4,strength:-14,blocking:-12},Troll:{strength:16,blocking:10,endurance:7,speed:-15,passing:-12,awareness:-8},
 Lizardkin:{speed:5,strength:5,endurance:4,passing:-7},Revenant:{endurance:12,tackling:4,agility:-7},Satyr:{agility:8,speed:6,handling:6,strength:-5,composure:-4}
};
const ROLE_WEIGHT:Record<Role,Partial<Record<StatKey,number>>>= {
 Bastion:{strength:3,blocking:3,endurance:2,positioning:1,composure:1},
 Breaker:{strength:2.5,tackling:3,endurance:1.5,agility:1,awareness:1,blocking:1},
 Runner:{speed:3,agility:2,handling:2,endurance:1,awareness:1,composure:1},
 Thrower:{passing:3,awareness:2.5,handling:2,composure:1.5,positioning:1},
 Raider:{speed:2.5,tackling:2,positioning:2,awareness:2,agility:1.5},
 Trickster:{agility:3,handling:2.5,speed:1.5,awareness:2,passing:1}
};
const TRAITS=['Relentless','Showboat','Ice-Cold','Undisciplined','Fan Favorite','Tactician','Hard-Nosed','Iron Will','Hot-Headed','Clutch Performer','Born Leader','Reckless'];
const ABILITIES=['Ironhide','Blinkstep','Grave Grip','Perfect Spiral','Thundercharge','Second Wind','Trickster’s Luck','Iron Resolve','Sure Hands','Bonebreaker'];
const PHILOSOPHIES=['IRON WALL','SILVER ARROW','STAMPede','MISCHIEF','CLOCKWORK','SWARM'];
const PALETTE:[string,string][][]=[
 [['#cb634b','#faac6f'],['#a67c44','#edc389'],['#7f7e9d','#cec5e6'],['#be5349','#edbf93'],['#456c79','#9ed4d6']],
 [['#669e8d','#b0d6b5'],['#809abf','#ccd6ef'],['#a48cc7','#e0c8ee'],['#c5a870','#f9e3b0'],['#6d9aa5','#b6e0db']],
 [['#a26b52','#f1ae7a'],['#a17d45','#f3d18d'],['#60827d','#a6cec4'],['#9b676d','#f2c0b2'],['#7769a0','#c5b6e9']],
 [['#7c759e','#c3b5e7'],['#758b9e','#b8d2e1'],['#7d546c','#d9b1cd'],['#587987','#9eb8c4'],['#9a6a70','#d9acbb']]
];
export function random(w:World):number { w.rng = (Math.imul(1664525,w.rng)+1013904223)>>>0; return w.rng/4294967296; }
const int=(w:World,a:number,b:number)=>Math.floor(a+random(w)*(b-a+1));
const pick=<T,>(w:World,a:T[])=>a[int(w,0,a.length-1)];
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const rid=(w:World,prefix:string)=>`${prefix}-${++w.serial}`;
const grade=(r:number):Rarity => r<.003?'Generational':r<.02?'Legendary':r<.09?'Extraordinary':r<.27?'Elite':r<.57?'Professional':'Ordinary';
const boost:Record<Rarity,number>={Ordinary:-5,Professional:0,Elite:5,Extraordinary:9,Legendary:13,Generational:17};
const RACE_WEIGHTS=[[1,4,1,4,1,2,1,1,1],[3,1,5,1,1,0,1,0,2],[3,2,2,0,5,1,2,0,3],[2,1,1,1,2,0,1,6,1]];
function drawRace(w:World, region:number):Race { const arr=RACE_WEIGHTS[region]; const total=arr.reduce((a,b)=>a+b,0); let p=random(w)*total; for(let i=0;i<arr.length;i++){p-=arr[i];if(p<0)return RACES[i];}return 'Human'; }
export function positionRating(attrs:Attributes,role:Role):number { const weights=ROLE_WEIGHT[role]; let total=0,weight=0; Object.entries(weights).forEach(([key,v])=>{ total+=attrs[key as StatKey]*v;weight+=v;});return Math.round(total/weight); }
// Age curve: everyone grows until PEAK_AGE (or earlier if their race declines sooner),
// plateaus, then declines from declineAge. Long-lived races keep their edge.
const PEAK_AGE=27, GROWTH_PER_YEAR=1.7;
const RETIRE_AGE:Record<Race,number>={Human:35,Orc:35,Elf:40,Dwarf:38,Goblin:30,Troll:35,Lizardkin:35,Revenant:44,Satyr:35};
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
 return {id:rid(w,'p'),name:`${pick(w,FIRST[race])} ${pick(w,LAST[race])}`,race,role,teamId:team.id,age,level:newProspect?1:int(w,1,7),xp:0,rating,rarity,potential,attrs,trait:pick(w,TRAITS),ability:pick(w,ABILITIES),injury:0,careerWear:0,stats:EMPTY_STATS(),career:EMPTY_STATS(),titles:0,championships:0,portrait:int(w,1,6),seasons:0};
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
 for(let r=0;r<4;r++)for(let d=0;d<2;d++){
  const teams=w.teams.filter(t=>t.region===r&&t.division===d).map(t=>t.id);
  let rotation=[...teams];
  for(let round=0;round<9;round++){
   for(let k=0;k<5;k++){
    const a=rotation[k],b=rotation[9-k];
    const first=round%2===0?a:b,second=round%2===0?b:a;
    w.matches.push({id:rid(w,'m'),season:w.season,week:round+1,home:first,away:second,homeScore:null,awayScore:null,phase:'league',region:r,events:[],seed:int(w,1,999999999)});
    w.matches.push({id:rid(w,'m'),season:w.season,week:round+10,home:second,away:first,homeScore:null,awayScore:null,phase:'league',region:r,events:[],seed:int(w,1,999999999)});
   }
   rotation=[rotation[0],rotation[9],...rotation.slice(1,9)];
  }
 }
}
export function createWorld(seed=2026):World {
 const w:World={version:1,seed,rng:seed>>>0,season:1,week:1,teams:[],players:[],matches:[],news:[],trophies:[],awards:[],retired:[],history:[],serial:0,totalGames:0,lastUpdated:Date.now()};
 for(let region=0;region<4;region++)for(let i=0;i<20;i++){
  const city=CITIES[region][i],nickname=NICKNAMES[region][i],colors=PALETTE[region][i%5];
  const team:Team={id:rid(w,'t'),name:`${city} ${nickname}`,city,nickname,initials:(city.slice(0,2)+nickname.slice(0,1)).toUpperCase(),region,division:i<10?0:1,colors,philosophy:pick(w,PHILOSOPHIES).toUpperCase(),power:int(w,45,85),fanbase:int(w,32,94),academy:int(w,35,90),budget:int(w,15,85),roster:[],record:EMPTY_RECORD(),historyTitles:0,worldTitles:0,rival:'',rivalHeat:0,rivalRecord:{w:0,d:0,l:0},form:[]};
  w.teams.push(team);
  for(const role of [...ROLES,'Bastion','Breaker','Runner','Thrower','Raider','Trickster','Bastion','Breaker','Runner'] as Role[]){
   const player=createPlayer(w,team,role); team.roster.push(player.id);w.players.push(player);
  }
 }
 // Mutual rival pairs: shuffle each regional division and pair neighbours. Pairs persist across promotion and relegation.
 for(let r=0;r<4;r++)for(const d of [0,1]){
  const pool=w.teams.filter(t=>t.region===r&&t.division===d);
  for(let i=pool.length-1;i>0;i--){const j=int(w,0,i);[pool[i],pool[j]]=[pool[j],pool[i]];}
  for(let i=0;i+1<pool.length;i+=2){const a=pool[i],b=pool[i+1],heat=int(w,20,50);a.rival=b.id;b.rival=a.id;a.rivalHeat=heat;b.rivalHeat=heat;}
 }
 seedSchedule(w);
 addStory(w,'roundup','A NEW ERA OF ABSOLUTE MAYHEM',`Welcome to Year One. Eighty clubs across ${REGIONS.length} regions begin the first recorded Riftball season. The medical guild advises everyone to remain extremely calm.`,undefined,undefined,undefined,5);
 addStory(w,'scandal','REFEREES REQUEST HAZARD PAY',`The Riftball Authority has confirmed that all match officials will receive protective armor, a whistle, and exactly one emergency teleportation voucher.`,undefined,undefined,undefined,1);
 return w;
}
function addStory(w:World,kind:Story['kind'],title:string,body:string,teamId?:string,playerId?:string,matchId?:string,importance=2){
 w.news.unshift({id:rid(w,'n'),season:w.season,week:w.week,kind,title,body,teamId,playerId,matchId,importance});
 if(w.news.length>450)w.news.length=450;
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
function teamRating(w:World,t:Team,starters=lineup(w,t)):number{ if(!starters.length)return 32; return starters.reduce((s,p)=>s+p.rating,0)/starters.length + t.power*.075;}
const mean=(players:Player[],...keys:StatKey[])=>players.length?players.reduce((s,p)=>s+keys.reduce((sum,k)=>sum+p.attrs[k],0)/keys.length,0)/players.length:42;
function addStat(p:Player,key:keyof SeasonStats,amount=1){p.stats[key]+=amount;p.career[key]+=amount;}
function addXp(p:Player,amount:number){p.xp+=amount;const goal=80+p.level*25;if(p.xp>=goal&&p.level<15){p.xp-=goal;p.level++;if(p.rating<p.potential&&p.age<=growthEnd(p.race)){const keys=Object.keys(ROLE_WEIGHT[p.role]) as StatKey[];const key=keys[(p.level+p.id.length)%keys.length];p.attrs[key]=clamp(p.attrs[key]+1,1,99);p.rating=positionRating(p.attrs,p.role);}}}
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
const passRate=(philosophy:string)=>philosophy==='SILVER ARROW'?.62:philosophy==='STAMPEDE'?.22:.42;
function rivalryResult(w:World,m:Match){
 const home=getTeam(w,m.home),away=getTeam(w,m.away);if(home.rival!==away.id)return;
 const h=m.homeScore!,a=m.awayScore!,margin=Math.abs(h-a);
 const heat=3+(margin<=3?6:0)+(margin>=20?8:0)+(m.phase!=='league'?12:0);
 for(const [t,us,them] of [[home,h,a],[away,a,h]] as [Team,number,number][]){t.rivalHeat=Math.min(100,t.rivalHeat+heat);if(us>them)t.rivalRecord.w++;else if(us<them)t.rivalRecord.l++;else t.rivalRecord.d++;}
}
export function simulateMatch(w:World,m:Match){
 if(m.homeScore!==null)return;
 const home=getTeam(w,m.home),away=getTeam(w,m.away),homeLine=lineup(w,home),awayLine=lineup(w,away);
 const sides=[home,away],lines=[homeLine,awayLine];const score=[0,0];
 // A small home edge that grows with the crowd. The Grand Final is played on neutral ground.
 const homeEdge=m.phase==='grand-final'?0:.2+home.fanbase*.01;
 const strengths=[teamRating(w,home,homeLine)+homeEdge,teamRating(w,away,awayLine)];
 // Each side's defensive shape: how well it reads plays, and how heavy its front line is.
 const shape=lines.map(l=>({read:mean(l,'positioning','awareness'),wall:mean(l.filter(p=>p.role==='Bastion'||p.role==='Breaker'),'strength','blocking')}));
 const possessions=int(w,13,17),first=int(w,0,1);const spark=[2,2];let minute=0;
 for(let drive=0;drive<possessions;drive++){
  const side=(drive+first)%2,attack=sides[side],defend=sides[1-side],off=lines[side],deff=lines[1-side];
  // Fatigue builds over the match; high endurance shrugs it off.
  const fatigue=drive/possessions,tired=(p:Player)=>fatigue*Math.max(0,85-p.attrs.endurance)*.13;
  const linemen=off.filter(p=>p.role==='Bastion'||p.role==='Breaker');
  const passer=off.find(p=>p.role==='Thrower')??off.filter(p=>p.role!=='Bastion').sort((a,b)=>b.attrs.passing-a.attrs.passing)[0];
  let x=int(w,12,29),downs=4,target=x+12,steps=0;
  while(steps<11&&x<90){steps++;minute=Math.round(((drive+steps/12)/possessions)*32);
   // Short yardage and the goal line (x >= 80) are power situations: strength and blocking decide them.
   const power=target-x<=4||x>=80;
   const isPass=random(w)<passRate(attack.philosophy)*(power?.6:1);
   const blocker=pick(w,linemen.length?linemen:off);
   const carrier=isPass?pickWeighted(w,off.filter(p=>p!==passer),p=>CATCH[p.role]):pickWeighted(w,off,p=>CARRY[p.role]);
   const defender=pickWeighted(w,deff,p=>isPass?COVER[p.role]:TACKLE[p.role]);
   const c=carrier.attrs,b=blocker.attrs,d=defender.attrs;
   let attackValue:number,defenseValue:number;
   if(isPass){
    attackValue=passer.attrs.passing*.4+c.handling*.25+c[power?'strength':'agility']*.15+b.blocking*.2-(tired(passer)+tired(carrier))*.5;
    defenseValue=d.positioning*.35+d.awareness*.25+d.speed*.15+shape[1-side].read*.25-tired(defender);
   }else if(power){
    attackValue=c.strength*.35+c.handling*.15+b.blocking*.35+b.strength*.15-(tired(carrier)+tired(blocker))*.5;
    defenseValue=d.strength*.35+d.tackling*.35+shape[1-side].wall*.3-tired(defender);
   }else{
    attackValue=c.speed*.3+c.agility*.3+c.handling*.1+b.blocking*.3-(tired(carrier)+tired(blocker))*.5;
    defenseValue=d.tackling*.4+d.speed*.2+shape[1-side].read*.4-tired(defender);
   }
   const diff=(attackValue-defenseValue)*.017+(strengths[side]-strengths[1-side])*.009;
   const success=clamp((isPass?.64:power?.7:.72)+diff,.21,.9);
   if(isPass&&random(w)<.02+Math.max(0,defenseValue-attackValue)*.0006){
    addStat(defender,'interceptions');addXp(defender,8);event(m,minute,'interception',defend.id,defender,`${defender.name} STEALS possession! The crowd loses its collective mind.`,score[0],score[1],x);break;
   }
   let tackled=false;
   if(random(w)<success){
    let gain=isPass?int(w,4,18):power?int(w,1,6):int(w,3,13);
    // Agile ball carriers break more big plays in open space.
    if(!power&&random(w)<clamp(.05+(c.agility-60)*.0025,.02,.15)){gain+=int(w,10,25);event(m,minute,'bigplay',attack.id,carrier,`${carrier.name} bursts through for ${gain} metres!`,score[0],score[1],x+gain);}
    x+=gain;addStat(carrier,'distance',gain);if(isPass)addStat(passer,'passes');else if(gain>=5)addStat(blocker,'blocks');
    if(x>=90){
     score[side]+=5;addStat(carrier,'breaches');addXp(carrier,12);
     if(isPass){addStat(passer,'assists');addXp(passer,6);event(m,minute,'breach',attack.id,carrier,`BREACH! ${passer.name} finds ${carrier.name} in the end zone. Five points!`,score[0],score[1],95);}
     else{addStat(blocker,'blocks');event(m,minute,'breach',attack.id,carrier,`BREACH! ${carrier.name} crashes into the end zone behind ${blocker.name}. Five points!`,score[0],score[1],95);}
     if(random(w)<.62){score[side]+=1;event(m,minute,'aftershock',attack.id,carrier,`AFTERSHOCK! ${attack.nickname} convert for one extra.`,score[0],score[1],95);}break;
    }
    tackled=true;
    if(x>=target){downs=4;target=x+12;}else downs--;
   }else{
    downs--;
    if(!isPass){
     tackled=true;
     // Light, twitchy carriers cough the ball up more; strong ones hold on.
     if(random(w)<clamp(.045+(c.agility-c.strength)*.0012-(power?.015:0),.012,.11)){addStat(defender,'tackles');event(m,minute,'fumble',attack.id,carrier,`${carrier.name} fumbles under a devastating hit from ${defender.name}!`,score[0],score[1],x);break;}
    }
   }
   if(tackled){
    addStat(defender,'tackles');
    if(random(w)<clamp(.008+(d.strength-60)*.0004+(d.tackling-60)*.0003,.003,.04)){
     addStat(defender,'knockouts');addXp(defender,4);event(m,minute,'knockout',defend.id,defender,`${defender.name} flattens ${carrier.name} with a spectacular, medically questionable tackle.`,score[0],score[1],x);
     if(random(w)<.25){carrier.injury=Math.max(carrier.injury,int(w,1,5));addStat(carrier,'injuries');event(m,minute,'injury',attack.id,carrier,`${carrier.name} is carried off. The team physician looks concerned.`,score[0],score[1],x);}
    }else if(random(w)<.001){carrier.injury=Math.max(carrier.injury,int(w,1,3));addStat(carrier,'injuries');event(m,minute,'injury',attack.id,carrier,`${carrier.name} limps off after an awkward landing.`,score[0],score[1],x);}
   }
   if(spark[side]>0&&x>65&&random(w)<.11){spark[side]--;event(m,minute,'bigplay',attack.id,carrier,`${carrier.name} unleashes ${carrier.ability.toUpperCase()}! The referee checks the spellbook.`,score[0],score[1],x);}
   if(downs===0){if(x>=55&&random(w)<.42){const kicker=passer;const probability=clamp(.72-(90-x)*.01+(kicker.attrs.composure-50)*.004,.23,.87);if(random(w)<probability){score[side]+=2;addStat(kicker,'gates');event(m,minute,'gate',attack.id,kicker,`GATE SHOT! ${kicker.name} threads it through the iron uprights!`,score[0],score[1],x);}else event(m,minute,'whistle',attack.id,kicker,`${kicker.name} misses the gate. The mascot makes no attempt to hide its disappointment.`,score[0],score[1],x);}
    break;}
  }
 }
 // Very rare draw-breaker only in knockout games.
 if(m.phase!=='league'&&score[0]===score[1]){const fav=strengths[0]+int(w,-20,20)>strengths[1]+int(w,-20,20)?0:1;score[fav]+=5;const finisher=pickWeighted(w,lines[fav],p=>CARRY[p.role]);addStat(finisher,'breaches');event(m,34,'breach',sides[fav].id,finisher,`SUDDEN BREACH! ${finisher.name} wins it in overtime!`,score[0],score[1],95);}
 m.homeScore=score[0];m.awayScore=score[1];w.totalGames++;if(score[0]!==score[1])m.winner=score[0]>score[1]?m.home:m.away;
 for(const row of lines)for(const p of row){addStat(p,'games');addXp(p,int(w,10,20));}
 if(m.phase==='league')recordResult(w,m);
 rivalryResult(w,m);
 if(m.events.length===0)event(m,32,'whistle',m.home,undefined,'A bruising contest concludes. The commentators are still arguing about the rules.',score[0],score[1],50);
 m.events.sort((a,b)=>a.minute-b.minute);
}
export function sortedStandings(w:World,region:number,division:0|1):Team[]{return w.teams.filter(t=>t.region===region&&t.division===division).sort((a,b)=>b.record.pts-a.record.pts||(b.record.pf-b.record.pa)-(a.record.pf-a.record.pa)||b.record.pf-a.record.pf||a.name.localeCompare(b.name));}
function makeKnockout(w:World,week:number,home:Team,away:Team,phase:Match['phase'],region=-1){w.matches.push({id:rid(w,'m'),season:w.season,week,home:home.id,away:away.id,homeScore:null,awayScore:null,phase,region,events:[],seed:int(w,1,99999999)});}
function matchesIn(w:World,week:number,phase?:Match['phase']){return w.matches.filter(m=>m.season===w.season&&m.week===week&&(!phase||m.phase===phase));}
function setupRegional(w:World){for(let region=0;region<4;region++){const standings=sortedStandings(w,region,0);makeKnockout(w,19,standings[0],standings[3],'regional-semi',region);makeKnockout(w,19,standings[1],standings[2],'regional-semi',region);}}
function setupRegionalFinals(w:World){for(let r=0;r<4;r++){const semis=matchesIn(w,19).filter(m=>m.region===r);if(semis.length===2)makeKnockout(w,20,getTeam(w,semis[0].winner!),getTeam(w,semis[1].winner!),'regional-final',r);}}
function setupWorldQuarter(w:World){
 const champions=matchesIn(w,20,'regional-final').map(m=>getTeam(w,m.winner!));
 for(const t of champions){t.historyTitles++; w.trophies.push({season:w.season,competition:`${REGIONS[t.region]} CHAMPIONS`,teamId:t.id});}
 const others=w.teams.filter(t=>t.division===0&&!champions.some(c=>c.id===t.id)).sort((a,b)=>b.record.pts-a.record.pts||b.record.pf-b.record.pf);
 const extras:Team[]=[];for(const t of others){if(extras.some(e=>e.region===t.region))continue;extras.push(t);if(extras.length===4)break;}
 const entrants=[...champions,...extras].sort((a,b)=>b.record.pts-a.record.pts||b.record.pf-a.record.pf);
 for(let i=0;i<4;i++)makeKnockout(w,21,entrants[i],entrants[7-i],'world-quarter');
 champions.forEach(c=>addStory(w,'championship',`${c.nickname.toUpperCase()} CROWNED REGIONAL CHAMPIONS`,`${c.name} claim the ${REGIONS[c.region]} crown and punch their ticket to the Grand Rift. The city declares three days of celebratory property damage.`,c.id,undefined,undefined,4));
}
function setupFromPrevious(w:World,previousWeek:number,phase:Match['phase'],nextPhase:Match['phase']){const winners=matchesIn(w,previousWeek,phase).map(m=>getTeam(w,m.winner!));for(let i=0;i<winners.length;i+=2)if(winners[i+1])makeKnockout(w,previousWeek+1,winners[i],winners[i+1],nextPhase);}
function pickHeadline(w:World,weekly:Match[]){
 const complete=weekly.filter(m=>m.homeScore!==null),featured=complete.filter(m=>m.phase!=='league');
 const sorted=(featured.length?featured:complete).sort((a,b)=>Math.abs((b.homeScore??0)-(b.awayScore??0))-Math.abs((a.homeScore??0)-(a.awayScore??0)));
 const m=sorted.length?pick(w,sorted.slice(0,Math.min(8,sorted.length))):undefined;if(!m)return;
 const h=getTeam(w,m.home),a=getTeam(w,m.away),winner=getTeam(w,m.winner||m.home),margin=Math.abs((m.homeScore??0)-(m.awayScore??0));
 let headline=margin<=2?`${winner.nickname.toUpperCase()} SURVIVE A CLASSIC`:margin>=20?`${winner.nickname.toUpperCase()} DELIVER A MASSACRE`:`${winner.nickname.toUpperCase()} CLAIM THE SPOILS`;
 if(m.phase==='grand-final')headline=`WORLD CHAMPIONS! ${winner.name.toUpperCase()}`;
 addStory(w,m.phase==='grand-final'?'championship':'result',headline,`${h.name} ${m.homeScore} — ${m.awayScore} ${a.name}. ${margin<=2?'A nail-biter for the ages. The league has received seventeen complaints from concerned spectators.':'The league office confirms the final score despite several strongly worded objections.'}`,winner.id,undefined,m.id,m.phase==='grand-final'?8:m.phase==='league'?2:4);
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
 const give=(p:Player,award:string)=>w.awards.push({season:w.season,award,playerId:p.id,teamId:p.teamId});
 const mvp=eligible.reduce((best,p)=>mvpScore(p)>mvpScore(best)?p:best);addStat(mvp,'mvp');give(mvp,'MVP');
 addStory(w,'milestone',`${mvp.name.toUpperCase()} NAMED WORLD MVP`,`${mvp.name}, the ${mvp.race.toLowerCase()} ${mvp.role.toLowerCase()} of the ${getTeam(w,mvp.teamId).name}, takes the season's highest individual honor. The trophy is insured against biting.`,mvp.teamId,mvp.id,undefined,5);
 const winners:string[]=[];
 for(const role of ROLES){const best=ranked.find(p=>p.role===role);if(best){give(best,POSITION_AWARD[role]);winners.push(`${POSITION_AWARD[role]}: ${best.name}`);}}
 const rookie=w.season>1?ranked.find(p=>p.seasons===0):undefined;
 if(rookie){give(rookie,'Rookie of the Year');winners.push(`Rookie of the Year: ${rookie.name}`);}
 addStory(w,'roundup',`YEAR ${w.season} HONOURS ANNOUNCED`,`${winners.join('. ')}. Acceptance speeches were limited to ninety seconds and one small explosion each.`,undefined,undefined,undefined,3);
}
function offseason(w:World){
 // Old grudges cool slowly.
 for(const t of w.teams)t.rivalHeat=Math.round(t.rivalHeat*.85);
 // Promotion/relegation after the completed season.
 for(let r=0;r<4;r++){
  const top=sortedStandings(w,r,0),bottom=sortedStandings(w,r,1);
  const relegated=top[9],promoted=bottom[0];relegated.division=1;promoted.division=0;
  const playoffTop=top[8],playoffLower=bottom[1];const strength=teamRating(w,playoffTop)-teamRating(w,playoffLower)+int(w,-16,16);if(strength<0){playoffTop.division=1;playoffLower.division=0;}
 }
 // Contract moves between clubs and rookie arrival.
 const movements=int(w,30,55);
 for(let i=0;i<movements;i++){
  const from=pick(w,w.teams),to=pick(w,w.teams);if(from.id===to.id)continue;
  const p=pick(w,teamRoster(w,from)),q=pick(w,teamRoster(w,to));if(!p||!q)continue;
  from.roster=from.roster.filter(id=>id!==p.id);to.roster=to.roster.filter(id=>id!==q.id);from.roster.push(q.id);to.roster.push(p.id);p.teamId=to.id;q.teamId=from.id;
  if(i<3)addStory(w,'transfer',`${p.name.toUpperCase()} SWITCHES COLORS`,`${getTeam(w,to.id).name} sign ${p.name} from ${from.name}. The contract reportedly includes a hazard allowance and unlimited soup.`,to.id,p.id,undefined,2);
 }
 const expired:Player[]=[];
 for(const p of w.players){
  p.seasons++;p.age++;if(p.injury>0)p.injury=Math.max(0,p.injury-7);
  ageCurve(w,p);
  const ageThreshold=RETIRE_AGE[p.race];
  if(p.age>=ageThreshold&&random(w)<.15+Math.max(0,p.age-ageThreshold)*.11)expired.push(p);
  p.stats=EMPTY_STATS();
 }
 for(const p of expired){p.retired=true;w.retired.push(p);w.players=w.players.filter(x=>x.id!==p.id);const t=getTeam(w,p.teamId);t.roster=t.roster.filter(id=>id!==p.id);if(p.career.breaches>35||p.championships>=2)addStory(w,'milestone',`FAREWELL TO ${p.name.toUpperCase()}`,`${p.name} retires after ${p.seasons} seasons, ${p.career.breaches} Breaches and ${p.championships} world titles. The retirement speech was briefly interrupted by a goblin with a trumpet.`,t.id,p.id,undefined,3);}
 for(const t of w.teams){const count=Math.max(0,15-t.roster.length);for(let i=0;i<count;i++){const role=ROLES.filter(role=>teamRoster(w,t).filter(p=>p.role===role).length<2)[0]||pick(w,ROLES);const p=createPlayer(w,t,role,true);w.players.push(p);t.roster.push(p.id);}}
 // Compact long-term history, keep recent seasons full and all finals.
 w.matches=w.matches.filter(m=>m.season>=w.season-2||m.phase==='grand-final'||m.phase==='regional-final');
 w.news=w.news.slice(0,450);
}
export function advanceOneWeek(w:World):World {
 const week=w.week;for(const p of w.players)if(p.injury>0)p.injury--;const fixtures=matchesIn(w,week);
 for(const m of fixtures)simulateMatch(w,m);
 if(week<=23&&fixtures.length)pickHeadline(w,fixtures);
 if(week===18)setupRegional(w);
 if(week===19)setupRegionalFinals(w);
 if(week===20)setupWorldQuarter(w);
 if(week===21)setupFromPrevious(w,21,'world-quarter','world-semi');
 if(week===22)setupFromPrevious(w,22,'world-semi','grand-final');
 if(week===23){const final=matchesIn(w,23,'grand-final')[0];if(final?.winner){const winner=getTeam(w,final.winner);winner.worldTitles++;for(const p of teamRoster(w,winner))p.championships++;w.trophies.push({season:w.season,competition:'GRAND RIFT CHAMPIONSHIP',teamId:winner.id,runnerUpId:final.home===winner.id?final.away:final.home});w.history.unshift({season:w.season,teamId:winner.id,description:`World champions · ${winner.name}`});}}
 if(week===24)annualAwards(w);
 if(week===25){offseason(w);addStory(w,'roundup',`YEAR ${w.season} CLOSES — A NEW WORLD AWAITS`,`Contracts have changed hands, some heroes have retired, and the league claims to have repaired most of the stadiums. The next season approaches.`,undefined,undefined,undefined,3);}
 if(week===26){w.season++;w.week=1;seedSchedule(w);addStory(w,'roundup',`YEAR ${w.season} IS HERE`,`Eighty clubs. Four regions. One world championship. The accountants have approved a fresh season of extremely expensive violence.`,undefined,undefined,undefined,3);}
 else w.week++;
 w.lastUpdated=Date.now();return w;
}
export function simulateWeeks(world:World,n:number):World{const w=structuredClone(world) as World;for(let i=0;i<n;i++)advanceOneWeek(w);return w;}
export function upcoming(w:World){return w.matches.filter(m=>m.season===w.season&&m.week===w.week);}
export function recent(w:World){return [...w.matches].filter(m=>m.homeScore!==null).reverse();}
export function topPlayers(w:World,stat:'breaches'|'tackles'|'interceptions'|'rating'|'knockouts',n=10){return [...w.players].sort((a,b)=>stat==='rating'?b.rating-a.rating:b.stats[stat]-a.stats[stat]||b.rating-a.rating).slice(0,n);}
export function summarize(w:World){const completed=w.matches.filter(m=>m.homeScore!==null&&m.season===w.season).length;return {completed,active:w.players.length,clubs:w.teams.length,stories:w.news.length,champions:w.trophies.filter(x=>x.competition==='GRAND RIFT CHAMPIONSHIP').length};}
// Fill in fields added after a save was written, so older universes keep loading.
export function normalizeWorld(w:World):World{
 w.awards??=[];
 for(const t of w.teams){t.rivalHeat??=30;t.rivalRecord??={w:0,d:0,l:0};}
 for(const p of [...w.players,...w.retired]){p.stats.blocks??=0;p.career.blocks??=0;}
 return w;
}
