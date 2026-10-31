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
function createPlayer(w:World,team:Team,role:Role,newProspect=false):Player {
 const race=drawRace(w,team.region); const rarity=grade(random(w)); const base=(team.division===0?57:51)+(newProspect?-11:0)+boost[rarity]*.65+int(w,-7,7)+(rarity==='Generational'?12:rarity==='Legendary'?4:0);
 const attrs={} as Attributes;
 for(const key of ATTR_KEYS)attrs[key]=clamp(Math.round(base+int(w,-15,15)+(MOD[race][key]||0)+(ROLE_WEIGHT[role][key]?int(w,3,13):0)),13,99);
 const rating=positionRating(attrs,role); const potential=clamp(rating+int(w,1,13)+boost[rarity]*.8,42,99);
 return {id:rid(w,'p'),name:`${pick(w,FIRST[race])} ${pick(w,LAST[race])}`,race,role,teamId:team.id,age:newProspect?int(w,17,21):int(w,19,33),level:newProspect?1:int(w,1,7),xp:0,rating,rarity,potential,attrs,trait:pick(w,TRAITS),ability:pick(w,ABILITIES),injury:0,careerWear:0,stats:EMPTY_STATS(),career:EMPTY_STATS(),titles:0,championships:0,portrait:int(w,1,6),seasons:0};
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
 const w:World={version:1,seed,rng:seed>>>0,season:1,week:1,teams:[],players:[],matches:[],news:[],trophies:[],retired:[],history:[],serial:0,totalGames:0,lastUpdated:Date.now()};
 for(let region=0;region<4;region++)for(let i=0;i<20;i++){
  const city=CITIES[region][i],nickname=NICKNAMES[region][i],colors=PALETTE[region][i%5];
  const team:Team={id:rid(w,'t'),name:`${city} ${nickname}`,city,nickname,initials:(city.slice(0,2)+nickname.slice(0,1)).toUpperCase(),region,division:i<10?0:1,colors,philosophy:pick(w,PHILOSOPHIES).toUpperCase(),power:int(w,45,85),fanbase:int(w,32,94),academy:int(w,35,90),budget:int(w,15,85),roster:[],record:EMPTY_RECORD(),historyTitles:0,worldTitles:0,rival:'',form:[]};
  w.teams.push(team);
  for(const role of [...ROLES,'Bastion','Breaker','Runner','Thrower','Raider','Trickster','Bastion','Breaker','Runner'] as Role[]){
   const player=createPlayer(w,team,role); team.roster.push(player.id);w.players.push(player);
  }
 }
 for(const t of w.teams){const rival=w.teams.find(u=>u.region===t.region&&u.division===t.division&&u.id!==t.id&&u.city!==t.city);t.rival=rival?.id??'';}
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
export function getPlayer(w:World,id:string):Player|undefined {return w.players.find(p=>p.id===id)||w.retired.find(p=>p.id===id);}
export function teamRoster(w:World,t:Team):Player[] { const set=new Set(t.roster);return w.players.filter(p=>set.has(p.id)); }
export function lineup(w:World,t:Team):Player[]{
 const healthy=teamRoster(w,t).filter(p=>p.injury===0);const injured=teamRoster(w,t).filter(p=>p.injury>0).sort((a,b)=>a.injury-b.injury);const pool=healthy.length>=8?healthy:[...healthy,...injured];const chosen:Player[]=[];
 const requirements:Role[]=['Bastion','Bastion','Breaker','Breaker','Runner','Thrower','Raider','Trickster'];
 for(const role of requirements){const possible=pool.filter(p=>!chosen.includes(p));if(!possible.length)break;possible.sort((a,b)=>(b.rating-(b.role===role?0:16))-(a.rating-(a.role===role?0:16)));chosen.push(possible[0]);}
 return chosen;
}
function teamRating(w:World,t:Team):number{const starters=lineup(w,t); if(!starters.length)return 32; return starters.reduce((s,p)=>s+p.rating,0)/starters.length + t.power*.075;}
const mean=(players:Player[],...keys:StatKey[])=>players.length?players.reduce((s,p)=>s+keys.reduce((sum,k)=>sum+p.attrs[k],0)/keys.length,0)/players.length:42;
function addStat(p:Player,key:keyof SeasonStats,amount=1){p.stats[key]+=amount;p.career[key]+=amount;}
function addXp(p:Player,amount:number){p.xp+=amount;const goal=80+p.level*25;if(p.xp>=goal&&p.level<15){p.xp-=goal;p.level++;if(p.rating<p.potential){const keys=Object.keys(ROLE_WEIGHT[p.role]) as StatKey[];const key=keys[(p.level+p.id.length)%keys.length];p.attrs[key]=clamp(p.attrs[key]+1,1,99);p.rating=positionRating(p.attrs,p.role);}}}
function event(m:Match,minute:number,kind:MatchEvent['kind'],teamId:string,player:Player|undefined,text:string,h:number,a:number,x:number){
 if(m.events.length<42)m.events.push({minute,kind,teamId,playerId:player?.id,text,homeScore:h,awayScore:a,x:clamp(x,4,96)});
}
function recordResult(w:World,m:Match){
 const home=getTeam(w,m.home),away=getTeam(w,m.away),h=m.homeScore!,a=m.awayScore!;
 for(const [t,sc,against] of [[home,h,a],[away,a,h]] as [Team,number,number][]){t.record.pf+=sc;t.record.pa+=against; t.form.unshift(sc>against?'W':sc<against?'L':'D');t.form=t.form.slice(0,5);if(sc>against){t.record.w++;t.record.pts+=3;}else if(sc<against){t.record.l++;}else{t.record.d++;t.record.pts++;}}
}
export function simulateMatch(w:World,m:Match){
 if(m.homeScore!==null)return;
 const home=getTeam(w,m.home),away=getTeam(w,m.away),homeLine=lineup(w,home),awayLine=lineup(w,away);
 const sides=[home,away],lines=[homeLine,awayLine];let score=[0,0];
 let strengths=[teamRating(w,home),teamRating(w,away)];
 const possessions=int(w,13,17);let spark=[2,2];let minute=0;
 for(let drive=0;drive<possessions;drive++){
  let side=drive%2,attack=sides[side],defend=sides[1-side],off=lines[side],deff=lines[1-side];
  let x=int(w,12,29),downs=4;let target=x+12;let driveDone=false;let steps=0;
  while(!driveDone&&steps<11&&x<90){steps++;minute=Math.round(((drive+steps/12)/possessions)*32);const isPass=random(w)<(attack.philosophy==='SILVER ARROW'?.62:attack.philosophy==='STAMPEDE'?.22:.42);
   const runner=pick(w,off.filter(p=>isPass?['Runner','Thrower','Trickster'].includes(p.role):['Runner','Breaker','Trickster','Raider'].includes(p.role)).length?off.filter(p=>isPass?['Runner','Thrower','Trickster'].includes(p.role):['Runner','Breaker','Trickster','Raider'].includes(p.role)):off);
   const blocker=pick(w,off.filter(p=>['Bastion','Breaker'].includes(p.role)).length?off.filter(p=>['Bastion','Breaker'].includes(p.role)):off);
   const marker=pick(w,deff.length?deff:[runner]);const attackValue=(runner.attrs[isPass?'passing':'speed']*.35+runner.attrs[isPass?'handling':'agility']*.35+blocker.attrs.blocking*.30);
   const defenseValue=(marker.attrs.tackling*.5+mean(deff,'positioning','strength')*.5);
   const diff=(attackValue-defenseValue)*.017+(strengths[side]-strengths[1-side])*.009;
   const success=clamp((isPass?.59:.67)+diff,.21,.88);
   if(random(w)<.016+Math.max(0,defenseValue-attackValue)*.0004){
    const interceptor=pick(w,deff);addStat(interceptor,'interceptions');event(m,minute,'interception',defend.id,interceptor,`${interceptor.name} STEALS possession! The crowd loses its collective mind.`,score[0],score[1],x);driveDone=true;break;
   }
   if(random(w)<success){const gain=int(w,3,isPass?17:13)+(random(w)<.075?int(w,10,25):0);x+=gain;addStat(runner,'distance',gain);if(isPass)addStat(runner,'passes');if(random(w)<.07){event(m,minute,'bigplay',attack.id,runner,`${runner.name} bursts through for ${gain} metres!`,score[0],score[1],x);}
    if(x>=90){score[side]+=5;addStat(runner,'breaches');addXp(runner,12);event(m,minute,'breach',attack.id,runner,`BREACH! ${runner.name} crashes into the end zone. Five points!`,score[0],score[1],95);
     if(random(w)<.62){score[side]+=1;event(m,minute,'aftershock',attack.id,runner,`AFTERSHOCK! ${attack.nickname} convert for one extra.`,score[0],score[1],95);}driveDone=true;break;}
    if(x>=target){downs=4;target=x+12;}else downs--;
   }else{downs--;if(random(w)<.06){event(m,minute,'fumble',attack.id,runner,`${runner.name} fumbles under a devastating tackle!`,score[0],score[1],x);driveDone=true;break;}}
   if(random(w)<.08){const defender=pick(w,deff);addStat(defender,'tackles',int(w,1,2));if(random(w)<.27){addStat(defender,'knockouts');event(m,minute,'knockout',defend.id,defender,`${defender.name} delivers a spectacular, medically questionable tackle.`,score[0],score[1],x);}}
   if(random(w)<.003){const victim=pick(w,off);const duration=int(w,1,5);victim.injury=Math.max(victim.injury,duration);addStat(victim,'injuries');event(m,minute,'injury',attack.id,victim,`${victim.name} is carried off. The team physician looks concerned.`,score[0],score[1],x);}
   if(spark[side]>0&&x>65&&random(w)<.11){spark[side]--;event(m,minute,'bigplay',attack.id,runner,`${runner.name} unleashes ${runner.ability.toUpperCase()}! The referee checks the spellbook.`,score[0],score[1],x);}
   if(downs===0){if(x>=55&&random(w)<.42){const kicker=off.find(p=>p.role==='Thrower')??runner;const probability=clamp(.72-(90-x)*.01+(kicker.attrs.composure-50)*.004,.23,.87);if(random(w)<probability){score[side]+=2;addStat(kicker,'gates');event(m,minute,'gate',attack.id,kicker,`GATE SHOT! ${kicker.name} threads it through the iron uprights!`,score[0],score[1],x);}else event(m,minute,'whistle',attack.id,kicker,`${kicker.name} misses the gate. The mascot makes no attempt to hide its disappointment.`,score[0],score[1],x);}
    driveDone=true;}
  }
 }
 // Very rare draw-breaker only in knockout games.
 if(m.phase!=='league'&&score[0]===score[1]){const fav=strengths[0]+int(w,-20,20)>strengths[1]+int(w,-20,20)?0:1;score[fav]+=5;const finisher=pick(w,lines[fav]);addStat(finisher,'breaches');event(m,34,'breach',sides[fav].id,finisher,`SUDDEN BREACH! ${finisher.name} wins it in overtime!`,score[0],score[1],95);}
 m.homeScore=score[0];m.awayScore=score[1];w.totalGames++;if(score[0]!==score[1])m.winner=score[0]>score[1]?m.home:m.away;
 for(const row of lines){for(const p of row){addStat(p,'games');addXp(p,int(w,10,20));addStat(p,'tackles',int(w,0,p.role==='Breaker'||p.role==='Raider'?5:2));if(random(w)<.06)addStat(p,'assists');}}
 if(m.phase==='league')recordResult(w,m);
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
function annualAwards(w:World){
 const candidates=w.players.filter(p=>p.stats.games>=7).sort((a,b)=>(b.stats.breaches*4+b.stats.tackles*.4+b.stats.interceptions*3+b.stats.assists*2)-(a.stats.breaches*4+a.stats.tackles*.4+a.stats.interceptions*3+a.stats.assists*2));
 if(candidates.length){const mvp=candidates[0];addStat(mvp,'mvp');addStory(w,'milestone',`${mvp.name.toUpperCase()} NAMED WORLD MVP`,`${mvp.name}, the ${mvp.race.toLowerCase()} ${mvp.role.toLowerCase()} of the ${getTeam(w,mvp.teamId).name}, takes the season's highest individual honor. The trophy is insured against biting.`,mvp.teamId,mvp.id,undefined,5);}
}
function offseason(w:World){
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
  if(p.age>30&&random(w)<(p.race==='Elf'?.10:p.race==='Dwarf'?.14:.18)){const attr=pick(w,['speed','agility','endurance'] as StatKey[]);p.attrs[attr]=clamp(p.attrs[attr]-int(w,1,3),1,99);}
  if(p.age<30&&p.rating<p.potential&&random(w)<.57){const keys=Object.keys(ROLE_WEIGHT[p.role]) as StatKey[];const key=pick(w,keys);p.attrs[key]=clamp(p.attrs[key]+int(w,1,3),1,99);}
  p.rating=positionRating(p.attrs,p.role);
  const ageThreshold=p.race==='Elf'?40:p.race==='Dwarf'?38:p.race==='Revenant'?44:p.race==='Goblin'?30:35;
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
