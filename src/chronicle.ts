// The Chronicle's memory: detects storylines (droughts, dynasties, records, rivalries, last dances,
// prodigies, upsets) after each week and offseason, writes stories about them, and lets later
// stories refer back ("A year after the heartbreak in Brineport, ...").
import { REGIONS } from './types';
import type { Match, NewsKind, Player, RecordEntry, RecordStat, Story, StoryBadge, Storyline, StorylineKind, Team, World } from './types';
import { addStory, getPlayer, getTeam, impactScore, lineup, retireAge, teamRating } from './engine';

export const RECORD_STATS:RecordStat[]=['breaches','tackles','interceptions','knockouts','assists','distance','gates'];
export const RECORD_LABEL:Record<RecordStat,string>={breaches:'Breaches',tackles:'tackles',interceptions:'interceptions',knockouts:'knockouts',assists:'assists',distance:'metres gained',gates:'gate shots'};
const WORLD_TITLE='GRAND RIFT CHAMPIONSHIP';
const MAX_STORYLINES=600;

const cap=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);
const ordinal=(n:number)=>n===1?'first':n===2?'second':n===3?'third':n===4?'fourth':n===5?'fifth':`${n}th`;

export function findStoryline(w:World,id:string):Storyline|undefined{return w.storylines.find(s=>s.id===id);}
function openStoryline(w:World,id:string,kind:StorylineKind,subjects:string[],memory:string,data:Storyline['data']={}):Storyline{
 let line=findStoryline(w,id);
 if(!line){line={id,kind,subjects,startSeason:w.season,lastSeason:w.season,status:'active',memory,data:{...data}};w.storylines.push(line);}
 else{line.lastSeason=w.season;line.memory=memory||line.memory;Object.assign(line.data,data);}
 return line;
}
function tell(w:World,line:Storyline,badge:StoryBadge,kind:NewsKind,title:string,body:string,opts:{teamId?:string;playerId?:string;matchId?:string;importance?:number}={}):Story{
 const story=addStory(w,kind,title,body,opts.teamId,opts.playerId,opts.matchId,opts.importance??4);
 story.badge=badge;story.storylineId=line.id;return story;
}
// A clause recalling the most recent finished storyline involving `subject`, e.g. "A year after the heartbreak in Brineport, ".
const TEAM_MEMORIES:StorylineKind[]=['heartbreak','upset','dynasty','drought','rivalry'];
export function recall(w:World,subject:string,except?:string,kinds:StorylineKind[]=TEAM_MEMORIES,maxYears=5):string{
 let best:Storyline|undefined;
 for(const s of w.storylines)if(s.memory&&s.id!==except&&s.lastSeason<w.season&&w.season-s.lastSeason<=maxYears&&kinds.includes(s.kind)&&s.subjects.includes(subject)&&(!best||s.lastSeason>best.lastSeason))best=s;
 if(!best)return '';
 const years=w.season-best.lastSeason;
 return `${years===1?'A year':years===2?'Two years':years===3?'Three years':`${years} years`} after ${best.memory}, `;
}
const lead=(w:World,subject:string,rest:string,except?:string,kinds?:StorylineKind[],maxYears?:number)=>{const r=recall(w,subject,except,kinds,maxYears);return r?r+rest:cap(rest);};
const titleCase=(s:string)=>s.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());

// ---------- Records ----------
function recordFor(w:World,stat:RecordStat,scope:'season'|'career'):RecordEntry|undefined{return w.records.find(r=>r.stat===stat&&r.scope===scope);}
function setRecord(w:World,stat:RecordStat,scope:'season'|'career',p:Player,value:number){
 const i=w.records.findIndex(r=>r.stat===stat&&r.scope===scope),old=w.records[i];
 const entry:RecordEntry={stat,scope,value,playerId:p.id,playerName:p.name,teamId:p.teamId,season:w.season,since:old&&old.playerId===p.id?old.since??old.season:w.season};if(i>=0)w.records[i]=entry;else w.records.push(entry);
}
function trackRecords(w:World,week:number){
 let watched=false;
 for(const stat of RECORD_STATS){
  for(const scope of ['season','career'] as const){
   let best:Player|undefined,value=0;
   for(const p of w.players){const v=(scope==='season'?p.stats:p.career)[stat];if(v>value){value=v;best=p;}}
   if(!best)continue;
   const rec=recordFor(w,stat,scope),team=getTeam(w,best.teamId);
   // Records are only news once there is some history to break: season records from Year 2, career records from Year 5.
   const established=scope==='season'?w.season>=2:w.season>=6&&w.season-(rec?.since??rec?.season??w.season)>=2;
   const label=RECORD_LABEL[stat];
   if(!rec||value>rec.value){
    const sameHolder=rec&&rec.playerId===best.id;
    if(rec&&established&&!(sameHolder&&(scope==='career'||rec.season===w.season))){
     const id=scope==='season'?`record:season:${stat}:${w.season}`:`record:career:${stat}:${best.id}`;
     const chase=findStoryline(w,id);
     const line=openStoryline(w,id,'record',[best.id,best.teamId],`${best.name}'s record-breaking ${scope==='season'?'season':'career'}`,{stat,scope,value,previous:rec.value,previousHolder:rec.playerName,broken:w.season});
     line.status='resolved';
     const since=chase?` The chase began in Year ${chase.startSeason}${chase.data.week?`, week ${chase.data.week}`:''}.`:'';
     tell(w,line,'RECORD','milestone',scope==='season'?`${best.name.toUpperCase()} BREAKS THE SINGLE-SEASON ${label.toUpperCase()} RECORD`:`${best.name.toUpperCase()} IS THE ALL-TIME ${label.toUpperCase()} LEADER`,
      `${best.name} of the ${team.name} now has ${value} ${label}${scope==='season'?' this season':' in a career'}, passing the ${rec.value} set by ${rec.playerName} in Year ${rec.season}${scope==='career'?`, who had held it since Year ${rec.since??rec.season}`:''}.${since}`,{teamId:team.id,playerId:best.id,importance:5});
    }
    setRecord(w,stat,scope,best,value);
    continue;
   }
   // Record chases: close enough, on pace (season), or within touching distance (career).
   if(!established||rec.playerId===best.id||rec.value<5)continue;
   const id=scope==='season'?`record:season:${stat}:${w.season}`:`record:career:${stat}:${best.id}`;
   if(findStoryline(w,id))continue;
   const onPace=scope==='season'?week>=9&&week<=17&&value>=rec.value*.75&&value/Math.max(1,best.stats.games)*18>=rec.value:value>=rec.value*.93;
   if(!onPace||watched)continue;
   watched=true;
   const line=openStoryline(w,id,'record',[best.id,best.teamId],`${best.name}'s record chase`,{stat,scope,week,target:rec.value});
   tell(w,line,'RECORD','milestone',`RECORD WATCH: ${best.name.toUpperCase()}`,
    scope==='season'?`${best.name} has ${value} ${label} after ${best.stats.games} games, on pace to catch the single-season mark of ${rec.value} set by ${rec.playerName} in Year ${rec.season}.`
     :`${best.name} sits on ${value} career ${label}, just ${rec.value-value+1} short of ${rec.playerName}'s all-time record of ${rec.value}.`,{teamId:team.id,playerId:best.id,importance:3});
  }
 }
}

// ---------- Rivalries ----------
const pairId=(a:string,b:string)=>`rivalry:${[a,b].sort().join(':')}`;
function rivalryPreviews(w:World,next:Match[]){
 const games=next.filter(m=>getTeam(w,m.home).rival===m.away&&getTeam(w,m.home).rivalHeat>=55).sort((a,b)=>getTeam(w,b.home).rivalHeat-getTeam(w,a.home).rivalHeat);
 for(const m of games.slice(0,1)){
  const home=getTeam(w,m.home),away=getTeam(w,m.away),line=openStoryline(w,pairId(home.id,away.id),'rivalry',[home.id,away.id],'');
  const last=line.data.lastMeeting?` Last time out: ${line.data.lastMeeting}.`:'';
  tell(w,line,'RIVALRY','result',`RIVALRY WEEK: ${home.nickname.toUpperCase()} vs ${away.nickname.toUpperCase()}`,
   `Rivalry heat in ${home.city} stands at ${home.rivalHeat}. The ${home.nickname} lead the all-time series ${home.rivalRecord.w}-${home.rivalRecord.l}${home.rivalRecord.d?`-${home.rivalRecord.d}`:''}.${last}`,{teamId:home.id,matchId:m.id,importance:3});
 }
}
function rivalryRecaps(w:World,fixtures:Match[]){
 const games=fixtures.filter(m=>m.homeScore!==null&&getTeam(w,m.home).rival===m.away&&(getTeam(w,m.home).rivalHeat>=45||m.phase!=='league')).sort((a,b)=>getTeam(w,b.home).rivalHeat-getTeam(w,a.home).rivalHeat);
 for(const m of games.slice(0,1)){
  const home=getTeam(w,m.home),away=getTeam(w,m.away),h=m.homeScore!,a=m.awayScore!;
  const winner=h===a?undefined:h>a?home:away,loser=winner?(winner===home?away:home):undefined,margin=Math.abs(h-a);
  const id=pairId(home.id,away.id),prior=findStoryline(w,id);
  const years=prior&&prior.memory?w.season-prior.lastSeason:0;
  const earlier=years>=1&&years<=5?`${years===1?'A year':`${years} years`} after ${prior!.memory}, `:'';
  const line=openStoryline(w,id,'rivalry',[home.id,away.id],'');
  const result=winner?`${winner.name} beat ${loser!.name} ${Math.max(h,a)}-${Math.min(h,a)}`:`${home.name} and ${away.name} draw ${h}-${a}`;
  const kind=margin>=20?'a rout':margin<=3?'a classic':m.phase!=='league'?'a playoff clash':'a grudge match';
  const series=`${home.nickname} ${home.rivalRecord.w}-${home.rivalRecord.l}${home.rivalRecord.d?`-${home.rivalRecord.d}`:''} ${away.nickname}`;
  tell(w,line,'RIVALRY','result',winner?`${winner.nickname.toUpperCase()} WIN ${kind.toUpperCase()} IN ${home.city.toUpperCase()}`:`STALEMATE IN ${home.city.toUpperCase()}`,
   `${earlier}${result} in ${kind}. All-time series: ${series}. Heat: ${home.rivalHeat}.`,{teamId:winner?.id??home.id,matchId:m.id,importance:m.phase==='league'?3:5});
  line.data.lastMeeting=`Year ${w.season}, ${home.city} ${h}-${a}`;
  if(margin<=3||margin>=20||m.phase!=='league')line.memory=`the ${h}-${a} ${kind.slice(2)} in ${home.city}`;
 }
}

// ---------- Upsets ----------
function upsets(w:World,fixtures:Match[]){
 for(const m of fixtures){
  if(m.phase==='league'||!m.winner)continue;
  const winner=getTeam(w,m.winner),loser=getTeam(w,m.winner===m.home?m.away:m.home);
  const gap=teamRating(w,loser)-teamRating(w,winner);
  if(gap<3.5)continue;
  const home=getTeam(w,m.home),stage=m.phase==='grand-final'?'Grand Final':m.phase.startsWith('world')?'world playoffs':'regional playoffs';
  const line=openStoryline(w,`upset:${m.id}`,'upset',[winner.id,loser.id],`the shock in ${home.city}`,{gap:Math.round(gap*10)/10,matchId:m.id,winner:winner.id,loser:loser.id,phase:m.phase});
  line.status='resolved';
  tell(w,line,'UPSET','result',`UPSET! ${winner.nickname.toUpperCase()} STUN ${loser.nickname.toUpperCase()}`,
   `${lead(w,winner.id,`the ${winner.name}, rated ${gap.toFixed(1)} points below their opponents, knock the ${loser.name} out of the ${stage}, ${Math.max(m.homeScore!,m.awayScore!)}-${Math.min(m.homeScore!,m.awayScore!)}.`,line.id)}`,{teamId:winner.id,matchId:m.id,importance:5});
 }
}

// ---------- Prodigies and last dances ----------
function prodigyWatch(w:World){
 const young=w.players.filter(p=>p.age<=21&&p.potential>=72&&p.stats.games>=5&&!findStoryline(w,`prodigy:${p.id}`));
 const ranked=young.map(p=>{const peers=w.players.filter(q=>q.role===p.role&&q.stats.games>=5);const mine=impactScore(p.role,p.stats);return {p,rank:peers.filter(q=>impactScore(q.role,q.stats)>mine).length+1};})
  .filter(x=>x.rank<=5).sort((a,b)=>a.rank-b.rank||b.p.potential-a.p.potential);
 for(const {p,rank} of ranked.slice(0,2)){
  const team=getTeam(w,p.teamId);
  const line=openStoryline(w,`prodigy:${p.id}`,'prodigy',[p.id,team.id],`the breakout of ${p.name}`,{rank,age:p.age});
  tell(w,line,'PRODIGY','prospect',`PRODIGY WATCH: ${p.name.toUpperCase()}`,
   `Only ${p.age}, ${p.name} is the ${ordinal(rank)}-most productive ${p.role.toLowerCase()} in the world this season for the ${team.name}, with ${p.stats.breaches} Breaches, ${p.stats.tackles} tackles and ${p.stats.distance} metres. Scouts say the ceiling is somewhere near ${p.potential}.`,{teamId:team.id,playerId:p.id,importance:3});
 }
}
function lastDances(w:World,playoff:Match[]){
 const teams=[...new Set(playoff.flatMap(m=>[m.home,m.away]))].map(id=>getTeam(w,id));
 const veterans=teams.flatMap(t=>lineup(w,t)).filter(p=>p.age>=retireAge(p.race)-1&&p.seasons>=6&&findStoryline(w,`lastdance:${p.id}`)?.lastSeason!==w.season).sort((a,b)=>b.rating-a.rating);
 for(const p of veterans.slice(0,2)){
  const team=getTeam(w,p.teamId);
  const line=openStoryline(w,`lastdance:${p.id}`,'last-dance',[p.id,team.id],`${p.name}'s last dance`,{age:p.age});
  tell(w,line,'LAST DANCE','milestone',`THE LAST DANCE OF ${p.name.toUpperCase()}`,
   `${lead(w,p.id,`at ${p.age}, ${p.name} leads the ${team.name} into the playoffs, perhaps for the final time: ${p.seasons} seasons, ${p.career.breaches} Breaches, ${p.career.tackles} tackles and ${p.championships} world titles so far.`,line.id,['prodigy','record','last-dance'],30)}`,{teamId:team.id,playerId:p.id,importance:3});
 }
}

// ---------- Season end: dynasties, droughts, heartbreak ----------
function worldTitles(w:World){return w.trophies.filter(t=>t.competition===WORLD_TITLE);}
function seasonEnd(w:World){
 const titles=worldTitles(w),current=titles.find(t=>t.season===w.season);if(!current)return;
 const champ=getTeam(w,current.teamId),runnerUp=current.runnerUpId?getTeam(w,current.runnerUpId):undefined;
 // Dynasties: back-to-back, three-peats, and the end of a run.
 let streak=0;for(let s=w.season;titles.find(t=>t.season===s)?.teamId===champ.id;s--)streak++;
 const previous=titles.find(t=>t.season===w.season-1);
 if(previous&&previous.teamId!==champ.id){
  const fallen=findStoryline(w,`dynasty:${previous.teamId}`);
  if(fallen&&fallen.status==='active'){
   const old=getTeam(w,previous.teamId);fallen.status='resolved';fallen.lastSeason=w.season;fallen.memory=`the fall of the ${old.nickname} dynasty`;
   tell(w,fallen,'DYNASTY','championship',`THE ${old.nickname.toUpperCase()} DYNASTY IS OVER`,`After ${fallen.data.streak} straight world titles, the ${old.name} are no longer champions. The ${champ.name} take the crown.`,{teamId:old.id,importance:5});
  }
 }
 if(streak>=2){
  const line=openStoryline(w,`dynasty:${champ.id}`,'dynasty',[champ.id,`region:${champ.region}`],`the ${champ.nickname} dynasty`,{streak});line.status='active';
  tell(w,line,'DYNASTY','championship',streak===2?`BACK-TO-BACK: ${champ.name.toUpperCase()}`:streak===3?`THREE-PEAT! ${champ.name.toUpperCase()}`:`${streak} IN A ROW: ${champ.name.toUpperCase()}`,
   `The ${champ.name} win the Grand Rift for the ${ordinal(streak)} straight season, and their ${ordinal(champ.worldTitles)} world title overall.${runnerUp?` The ${runnerUp.name} were the latest to try and fail.`:''}`,{teamId:champ.id,importance:6});
 }
 // The runner-up's heartbreak is remembered.
 if(runnerUp){const h=openStoryline(w,`heartbreak:${runnerUp.id}:${w.season}`,'heartbreak',[runnerUp.id],`the heartbreak in ${runnerUp.city}`,{season:w.season,champion:champ.id});h.status='resolved';}
 // Redemption: a champion with a painful past.
 const pain=[1,2,3].map(n=>findStoryline(w,`heartbreak:${champ.id}:${w.season-n}`)).find(Boolean);
 const memory=pain?`${w.season-pain.lastSeason===1?'A year':`${w.season-pain.lastSeason} years`} after ${pain.memory}, `:'';
 if(memory&&streak===1){
  const line=openStoryline(w,`redemption:${champ.id}:${w.season}`,'heartbreak',[champ.id],`the ${champ.nickname}' redemption`,{});line.status='resolved';
  tell(w,line,'DYNASTY','championship',`REDEMPTION FOR ${champ.name.toUpperCase()}`,`${memory}the ${champ.name} are champions of the world.`,{teamId:champ.id,importance:5});
 }
 // Region droughts: broken by the champion's region, extended for the others.
 const lastTitle=(region:number,before:number)=>{let last=0;for(const t of titles)if(t.season<before&&getTeam(w,t.teamId).region===region)last=Math.max(last,t.season);return last;};
 const without=lastTitle(champ.region,w.season),wait=w.season-1-without;
 if(wait>=6){
  const line=openStoryline(w,`drought:region:${champ.region}`,'drought',[`region:${champ.region}`,champ.id],`the end of the ${titleCase(REGIONS[champ.region])} drought`,{years:wait});line.status='resolved';
  tell(w,line,'DROUGHT','championship',`${REGIONS[champ.region]}' DROUGHT IS OVER`,`${without?`${wait} years`:`${wait} years, since the founding of the league,`} without a world title end as the ${champ.name} bring the Grand Rift home.`,{teamId:champ.id,importance:5});
  w.storylines=w.storylines.filter(s=>s!==line);line.id=`drought:region:${champ.region}:ended:${w.season}`;w.storylines.push(line);
 }
 const dry=REGIONS.map((_,r)=>({r,years:w.season-lastTitle(r,w.season+1)})).filter(x=>x.r!==champ.region&&x.years>=8&&(x.years===8||x.years%4===0)).sort((a,b)=>b.years-a.years)[0];
 if(dry){
  const region=REGIONS[dry.r],line=openStoryline(w,`drought:region:${dry.r}`,'drought',[`region:${dry.r}`],'',{years:dry.years});line.status='active';
  const ever=titles.some(t=>getTeam(w,t.teamId).region===dry.r);
  tell(w,line,'DROUGHT','roundup',`${region}: ${dry.years} YEARS WITHOUT A WORLD TITLE`,`${ever?`No club from ${titleCase(region)} has won the Grand Rift in ${dry.years} years.`:`No club from ${titleCase(region)} has ever won the Grand Rift, ${dry.years} seasons in.`} Local historians have started calling it a curse, mostly to sell books.`,{importance:4});
 }
 // Club droughts: the champion ending a long wait, or the longest-suffering former champion.
 const clubLast=titles.filter(t=>t.teamId===champ.id&&t.season<w.season).reduce((a,t)=>Math.max(a,t.season),0);
 const clubWait=w.season-1-clubLast;
 if(clubWait>=10&&!(wait>=6)){
  const line=openStoryline(w,`drought:club:${champ.id}:${w.season}`,'drought',[champ.id],`the ${champ.nickname}' long-awaited title`,{years:clubWait});line.status='resolved';
  tell(w,line,'DROUGHT','championship',clubLast?`${champ.nickname.toUpperCase()} END ${clubWait}-YEAR WAIT`:`FIRST EVER TITLE FOR ${champ.name.toUpperCase()}`,clubLast?`The ${champ.name} had not won the Grand Rift since Year ${clubLast}. That is now somebody else's problem.`:`${clubWait} seasons after the league began, the ${champ.name} finally lift the Grand Rift.`,{teamId:champ.id,importance:5});
 }
 const cursed=w.teams.map(t=>({t,last:titles.filter(x=>x.teamId===t.id).reduce((a,x)=>Math.max(a,x.season),0)})).filter(x=>x.last>0&&x.t.id!==champ.id&&w.season-x.last>=12&&(w.season-x.last)%4===0).sort((a,b)=>a.last-b.last)[0];
 if(cursed){
  const years=w.season-cursed.last,line=openStoryline(w,`drought:club:${cursed.t.id}`,'drought',[cursed.t.id],'',{years});
  tell(w,line,'DROUGHT','roundup',`THE ${cursed.t.nickname.toUpperCase()} CURSE: ${years} YEARS AND COUNTING`,`The ${cursed.t.name} last won the world title in Year ${cursed.last}. A local witch has offered to lift the curse for a reasonable fee.`,{teamId:cursed.t.id,importance:3});
 }
}

// Award follow-ups: a prodigy who delivers.
function awardFollowUps(w:World){
 for(const a of w.awards.filter(a=>a.season===w.season&&(a.award==='MVP'||a.award==='Rookie of the Year'||a.award.startsWith('Best ')))){
  const line=findStoryline(w,`prodigy:${a.playerId}`);const p=getPlayer(w,a.playerId);
  if(!line||!p||line.data.delivered)continue;
  line.data.delivered=w.season;line.status='resolved';line.lastSeason=w.season;
  tell(w,line,'PRODIGY','prospect',`THE PRODIGY DELIVERS: ${p.name.toUpperCase()}`,`${line.startSeason<w.season?`${w.season-line.startSeason===1?'A year':`${w.season-line.startSeason} years`} after the prodigy watch began, `:'The hype was real: '}${p.name} wins ${a.award}.`,{teamId:p.teamId,playerId:p.id,importance:4});
 }
}

// Called by the engine after each week's fixtures are played and the next round is scheduled.
export function chronicleWeek(w:World,week:number,fixtures:Match[]){
 trackRecords(w,week);
 upsets(w,fixtures);
 rivalryRecaps(w,fixtures);
 rivalryPreviews(w,w.matches.filter(m=>m.season===w.season&&m.week===week+1&&m.homeScore===null));
 if(week===10)prodigyWatch(w);
 if(week===18)lastDances(w,w.matches.filter(m=>m.season===w.season&&m.week===19));
 if(week===23)seasonEnd(w);
 if(week===24)awardFollowUps(w);
}

// Called by the engine during the offseason, after retirements.
export function chronicleOffseason(w:World,retirees:Player[]){
 for(const p of retirees){
  const line=findStoryline(w,`lastdance:${p.id}`);if(!line||line.status==='resolved')continue;
  line.status='resolved';line.lastSeason=w.season;
  const team=getTeam(w,p.teamId) as Team|undefined;
  tell(w,line,'LAST DANCE','milestone',`${p.name.toUpperCase()} HANGS UP THE BOOTS`,`The last dance is over. ${p.name} retires after ${p.seasons} seasons with ${p.career.breaches} Breaches, ${p.career.tackles} tackles and ${p.championships} world titles${team?` for clubs including the ${team.name}`:''}.`,{teamId:p.teamId,playerId:p.id,importance:4});
 }
 // Record chases that ran out of season fall short.
 for(const s of w.storylines)if(s.kind==='record'&&s.status==='active'&&s.data.scope==='season'){s.status='resolved';s.memory=`the record chase that fell short`;}
 // Old storylines fade: keep every active one and the most recent finished ones.
 if(w.storylines.length>MAX_STORYLINES){const active=w.storylines.filter(s=>s.status==='active'),done=w.storylines.filter(s=>s.status!=='active').sort((a,b)=>b.lastSeason-a.lastSeason);w.storylines=[...active,...done.slice(0,MAX_STORYLINES-active.length)];}
}

// Rebuild the records table from player histories (used when migrating older saves).
export function rebuildRecords(w:World){
 w.records=[];
 for(const stat of RECORD_STATS)for(const scope of ['season','career'] as const){
  let best:Player|undefined,value=0;
  for(const p of [...w.players,...w.retired]){const v=(scope==='season'?p.stats:p.career)[stat]??0;if(v>value){value=v;best=p;}}
  if(best)w.records.push({stat,scope,value,playerId:best.id,playerName:best.name,teamId:best.teamId,season:w.season});
 }
}
