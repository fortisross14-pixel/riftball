// The Chronicle's memory: detects storylines (droughts, dynasties, records, rivalries, last dances,
// prodigies, upsets) after each week and offseason, writes stories about them, and lets later
// stories refer back ("Un año después de la decepción de Puertocoral, ...").
import type { Match, NewsKind, Player, RecordEntry, RecordStat, Story, StoryBadge, Storyline, StorylineKind, Team, World } from './types';
import { SEASON, addStory, getPlayer, getTeam, giveNickname, impactScore, lineup, retireAge, storySeed, teamRating } from './engine';
import { ULTIMATE_STORY, DRAMA, INJURY, LOSE_STREAK, NICKNAME_STORY, RIVAL_PREVIEW, STAR, WIN_STREAK, mascotOf, pickLine } from './i18n/es-cronica';
import { PAISES, RECORD_STAT_ES, awardEs, habilidad, rol } from './i18n/es-mundo';

export const RECORD_STATS:RecordStat[]=['breaches','tackles','interceptions','knockouts','assists','distance','rushingYards','passingYards','mvp','gates'];
/** Spanish labels for record statistics. */
export const RECORD_LABEL:Record<RecordStat,string>=RECORD_STAT_ES;
const WORLD_TITLE='GRAND RIFT CHAMPIONSHIP';
const MAX_STORYLINES=600;

const cap=(s:string)=>s.replace(/^([¡¿«"]*)(\p{L})/u,(_,a:string,b:string)=>a+b.toUpperCase());
const ORD_F=['','primera','segunda','tercera','cuarta','quinta','sexta','séptima','octava','novena','décima'];
const ORD_M=['','primer','segundo','tercer','cuarto','quinto','sexto','séptimo','octavo','noveno','décimo'];
const ordinalF=(n:number)=>ORD_F[n]??`${n}.ª`;
const ordinalM=(n:number)=>ORD_M[n]??`${n}.º`;
const yearsAgo=(n:number)=>n===1?'Un año':n===2?'Dos años':n===3?'Tres años':`${n} años`;
/** "después de" + a memory, contracting "de el" to "del". */
const despuesDe=(memory:string)=>memory.startsWith('el ')?`después del ${memory.slice(3)}`:`después de ${memory}`;
const series=(t:Team)=>`${t.rivalRecord.w}-${t.rivalRecord.l}${t.rivalRecord.d?`-${t.rivalRecord.d}`:''}`;

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
// A clause recalling the most recent finished storyline involving `subject`, e.g. "Un año después de la decepción de Puertocoral, ".
const TEAM_MEMORIES:StorylineKind[]=['heartbreak','upset','dynasty','drought','rivalry'];
export function recall(w:World,subject:string,except?:string,kinds:StorylineKind[]=TEAM_MEMORIES,maxYears=5):string{
 let best:Storyline|undefined;
 for(const s of w.storylines)if(s.memory&&s.id!==except&&s.lastSeason<w.season&&w.season-s.lastSeason<=maxYears&&kinds.includes(s.kind)&&s.subjects.includes(subject)&&(!best||s.lastSeason>best.lastSeason))best=s;
 if(!best)return '';
 return `${yearsAgo(w.season-best.lastSeason)} ${despuesDe(best.memory)}, `;
}
const lead=(w:World,subject:string,rest:string,except?:string,kinds?:StorylineKind[],maxYears?:number)=>{const r=recall(w,subject,except,kinds,maxYears);return r?r+rest:cap(rest);};

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
     const line=openStoryline(w,id,'record',[best.id,best.teamId],scope==='season'?`la temporada récord de ${best.name}`:`la carrera récord de ${best.name}`,{stat,scope,value,previous:rec.value,previousHolder:rec.playerName,broken:w.season});
     line.status='resolved';
     const since=chase?` La persecución empezó en la temporada ${chase.startSeason}${chase.data.week?`, semana ${chase.data.week}`:''}.`:'';
     tell(w,line,'RECORD','milestone',scope==='season'?`${best.name.toUpperCase()} BATE EL RÉCORD DE ${label.toUpperCase()} EN UNA TEMPORADA`:`${best.name.toUpperCase()}, MÁXIMO HISTÓRICO EN ${label.toUpperCase()}`,
      `${best.name}, de ${team.name}, suma ya ${value} ${label}${scope==='season'?' esta temporada':' en su carrera'} y supera los ${rec.value} de ${rec.playerName} (temporada ${rec.season})${scope==='career'?`, que tenía el récord desde la temporada ${rec.since??rec.season}`:''}.${since}`,{teamId:team.id,playerId:best.id,importance:5});
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
   const line=openStoryline(w,id,'record',[best.id,best.teamId],`la persecución del récord de ${best.name}`,{stat,scope,week,target:rec.value});
   tell(w,line,'RECORD','milestone',`RÉCORD A LA VISTA: ${best.name.toUpperCase()}`,
    scope==='season'?`${best.name} lleva ${value} ${label} en ${best.stats.games} partidos, a ritmo de alcanzar la marca de ${rec.value} que firmó ${rec.playerName} en la temporada ${rec.season}.`
     :`${best.name} suma ${value} ${label} en su carrera, a solo ${rec.value-value+1} del récord histórico de ${rec.playerName} (${rec.value}).`,{teamId:team.id,playerId:best.id,importance:3});
  }
 }
}

// ---------- Rivalries ----------
const pairId=(a:string,b:string)=>`rivalry:${[a,b].sort().join(':')}`;
function rivalryPreviews(w:World,next:Match[]){
 const games=next.filter(m=>getTeam(w,m.home).rival===m.away&&getTeam(w,m.home).rivalHeat>=55).sort((a,b)=>getTeam(w,b.home).rivalHeat-getTeam(w,a.home).rivalHeat);
 for(const m of games.slice(0,1)){
  const home=getTeam(w,m.home),away=getTeam(w,m.away),line=openStoryline(w,pairId(home.id,away.id),'rivalry',[home.id,away.id],'');
  const last=line.data.lastMeeting?` El último duelo: ${line.data.lastMeeting}.`:'';
  tell(w,line,'RIVALRY','result',`SEMANA DE DERBI: ${home.nickname.toUpperCase()} CONTRA ${away.nickname.toUpperCase()}`,
   pickLine(RIVAL_PREVIEW,storySeed(w,m.id))({home:home.name,away:away.name,city:home.city,heat:home.rivalHeat,series:`${home.nickname} ${series(home)} ${away.nickname}`,last}),{teamId:home.id,matchId:m.id,importance:3});
 }
}
function rivalryRecaps(w:World,fixtures:Match[]){
 const games=fixtures.filter(m=>m.homeScore!==null&&getTeam(w,m.home).rival===m.away&&(getTeam(w,m.home).rivalHeat>=45||m.phase!=='league')).sort((a,b)=>getTeam(w,b.home).rivalHeat-getTeam(w,a.home).rivalHeat);
 for(const m of games.slice(0,1)){
  const home=getTeam(w,m.home),away=getTeam(w,m.away),h=m.homeScore!,a=m.awayScore!;
  const winner=h===a?undefined:h>a?home:away,loser=winner?(winner===home?away:home):undefined,margin=Math.abs(h-a);
  const id=pairId(home.id,away.id),prior=findStoryline(w,id);
  const years=prior&&prior.memory?w.season-prior.lastSeason:0;
  const earlier=years>=1&&years<=5?`${yearsAgo(years)} ${despuesDe(prior!.memory)}, `:'';
  const line=openStoryline(w,id,'rivalry',[home.id,away.id],'');
  const result=winner?`${winner.name} ganan a ${loser!.name} por ${Math.max(h,a)}-${Math.min(h,a)}`:`${home.name} y ${away.name} empatan a ${h}`;
  const kind=margin>=20?'una paliza':margin<=3?'un clásico':m.phase!=='league'?'un duelo de eliminatoria':'un partido de rencores';
  const historial=`${home.nickname} ${series(home)} ${away.nickname}`;
  tell(w,line,'RIVALRY','result',winner?`${winner.nickname.toUpperCase()} GANAN ${kind.toUpperCase()} EN ${home.city.toUpperCase()}`:`TABLAS EN ${home.city.toUpperCase()}`,
   cap(`${earlier}${result} en ${kind}. Historial: ${historial}. Temperatura del derbi: ${home.rivalHeat}.`),{teamId:winner?.id??home.id,matchId:m.id,importance:m.phase==='league'?3:5});
  line.data.lastMeeting=`temporada ${w.season}, ${home.city} ${h}-${a}`;
  if(margin<=3||margin>=20||m.phase!=='league')line.memory=`${margin>=20?'la paliza':margin<=3?'el clásico':'el duelo'} de ${h}-${a} en ${home.city}`;
 }
}

// ---------- Upsets ----------
function upsets(w:World,fixtures:Match[]){
 for(const m of fixtures){
  if(m.phase==='league'||!m.winner)continue;
  const winner=getTeam(w,m.winner),loser=getTeam(w,m.winner===m.home?m.away:m.home);
  const gap=teamRating(w,loser)-teamRating(w,winner);
  if(gap<3.5)continue;
  const home=getTeam(w,m.home),stage=m.phase==='grand-final'?'la Gran Final':m.phase.startsWith('world')?'la Copa del Mundo':'la fase final nacional';
  const line=openStoryline(w,`upset:${m.id}`,'upset',[winner.id,loser.id],`la sorpresa de ${home.city}`,{gap:Math.round(gap*10)/10,matchId:m.id,winner:winner.id,loser:loser.id,phase:m.phase});
  line.status='resolved';
  tell(w,line,'UPSET','result',`¡SORPRESA! ${winner.nickname.toUpperCase()} TUMBAN A ${loser.nickname.toUpperCase()}`,
   `${lead(w,winner.id,`${winner.name}, con ${gap.toFixed(1).replace('.',',')} puntos menos de valoración, eliminan a ${loser.name} en ${stage}: ${Math.max(m.homeScore!,m.awayScore!)}-${Math.min(m.homeScore!,m.awayScore!)}.`,line.id)}`,{teamId:winner.id,matchId:m.id,importance:5});
 }
}

// ---------- Prodigies and last dances ----------
function prodigyWatch(w:World){
 const young=w.players.filter(p=>p.age<=21&&p.potential>=72&&p.stats.games>=5&&!findStoryline(w,`prodigy:${p.id}`));
 const ranked=young.map(p=>{const peers=w.players.filter(q=>q.role===p.role&&q.stats.games>=5);const mine=impactScore(p.role,p.stats);return {p,rank:peers.filter(q=>impactScore(q.role,q.stats)>mine).length+1};})
  .filter(x=>x.rank<=5).sort((a,b)=>a.rank-b.rank||b.p.potential-a.p.potential);
 for(const {p,rank} of ranked.slice(0,2)){
  const team=getTeam(w,p.teamId);
  const line=openStoryline(w,`prodigy:${p.id}`,'prodigy',[p.id,team.id],`la explosión de ${p.name}`,{rank,age:p.age});
  tell(w,line,'PRODIGY','prospect',`PROMESA A SEGUIR: ${p.name.toUpperCase()}`,
   `Con solo ${p.age} años, ${p.name} es ${rank===1?'el':`el ${ordinalM(rank)}`} ${rol(p.role).toLowerCase()} más productivo del mundo esta temporada con ${team.name}: ${p.stats.breaches} brechas, ${p.stats.tackles} placajes y ${p.stats.distance} metros. Los ojeadores calculan que su techo anda por el ${p.potential}.`,{teamId:team.id,playerId:p.id,importance:3});
 }
}
function lastDances(w:World,playoff:Match[]){
 const teams=[...new Set(playoff.flatMap(m=>[m.home,m.away]))].map(id=>getTeam(w,id));
 const veterans=teams.flatMap(t=>lineup(w,t)).filter(p=>p.age>=retireAge(p.race)-1&&p.seasons>=6&&findStoryline(w,`lastdance:${p.id}`)?.lastSeason!==w.season).sort((a,b)=>b.rating-a.rating);
 for(const p of veterans.slice(0,2)){
  const team=getTeam(w,p.teamId);
  const line=openStoryline(w,`lastdance:${p.id}`,'last-dance',[p.id,team.id],`el último baile de ${p.name}`,{age:p.age});
  tell(w,line,'LAST DANCE','milestone',`EL ÚLTIMO BAILE DE ${p.name.toUpperCase()}`,
   `${lead(w,p.id,`a sus ${p.age} años, ${p.name} lleva a ${team.name} a la fase final, quizá por última vez: ${p.seasons} temporadas, ${p.career.breaches} brechas, ${p.career.tackles} placajes y ${p.championships} títulos mundiales.`,line.id,['prodigy','record','last-dance'],30)}`,{teamId:team.id,playerId:p.id,importance:3});
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
   const old=getTeam(w,previous.teamId);fallen.status='resolved';fallen.lastSeason=w.season;fallen.memory=`la caída de la dinastía de los ${old.nickname}`;
   tell(w,fallen,'DYNASTY','championship',`SE ACABÓ LA DINASTÍA DE LOS ${old.nickname.toUpperCase()}`,`Tras ${fallen.data.streak} títulos mundiales seguidos, ${old.name} ya no son campeones. La corona es ahora de ${champ.name}.`,{teamId:old.id,importance:5});
  }
 }
 if(streak>=2){
  const line=openStoryline(w,`dynasty:${champ.id}`,'dynasty',[champ.id,`region:${champ.region}`],`la dinastía de los ${champ.nickname}`,{streak});line.status='active';
  tell(w,line,'DYNASTY','championship',streak===2?`¡DOBLETE! ${champ.name.toUpperCase()}`:streak===3?`¡TRIPLETE! ${champ.name.toUpperCase()}`:`${streak} SEGUIDOS: ${champ.name.toUpperCase()}`,
   `${champ.name} ganan la Gran Grieta por ${ordinalF(streak)} temporada consecutiva; es su ${ordinalM(champ.worldTitles)} título mundial.${runnerUp?` ${runnerUp.name} fueron los últimos en intentarlo y fracasar.`:''}`,{teamId:champ.id,importance:6});
 }
 // The runner-up's heartbreak is remembered.
 if(runnerUp){const h=openStoryline(w,`heartbreak:${runnerUp.id}:${w.season}`,'heartbreak',[runnerUp.id],`la decepción de ${runnerUp.city}`,{season:w.season,champion:champ.id});h.status='resolved';}
 // Redemption: a champion with a painful past.
 const pain=[1,2,3].map(n=>findStoryline(w,`heartbreak:${champ.id}:${w.season-n}`)).find(Boolean);
 const memory=pain?`${yearsAgo(w.season-pain.lastSeason)} ${despuesDe(pain.memory)}, `:'';
 if(memory&&streak===1){
  const line=openStoryline(w,`redemption:${champ.id}:${w.season}`,'heartbreak',[champ.id],`la redención de los ${champ.nickname}`,{});line.status='resolved';
  tell(w,line,'DYNASTY','championship',`REDENCIÓN PARA ${champ.name.toUpperCase()}`,`${memory}${champ.name} son campeones del mundo.`,{teamId:champ.id,importance:5});
 }
 // Country droughts: broken by the champion's country, extended for the others.
 const lastTitle=(region:number,before:number)=>{let last=0;for(const t of titles)if(t.season<before&&getTeam(w,t.teamId).region===region)last=Math.max(last,t.season);return last;};
 const without=lastTitle(champ.region,w.season),wait=w.season-1-without;
 if(wait>=6){
  const line=openStoryline(w,`drought:region:${champ.region}`,'drought',[`region:${champ.region}`,champ.id],`el fin de la sequía de ${PAISES[champ.region]}`,{years:wait});line.status='resolved';
  tell(w,line,'DROUGHT','championship',`¡SE ACABÓ LA SEQUÍA EN ${PAISES[champ.region].toUpperCase()}!`,`${without?`${wait} años`:`${wait} años, desde la fundación de la liga,`} sin un título mundial terminan hoy: ${champ.name} se llevan la Gran Grieta a casa.`,{teamId:champ.id,importance:5});
  w.storylines=w.storylines.filter(s=>s!==line);line.id=`drought:region:${champ.region}:ended:${w.season}`;w.storylines.push(line);
 }
 const dry=PAISES.map((_,r)=>({r,years:w.season-lastTitle(r,w.season+1)})).filter(x=>x.r!==champ.region&&x.years>=8&&(x.years===8||x.years%4===0)).sort((a,b)=>b.years-a.years)[0];
 if(dry){
  const country=PAISES[dry.r],line=openStoryline(w,`drought:region:${dry.r}`,'drought',[`region:${dry.r}`],'',{years:dry.years});line.status='active';
  const ever=titles.some(t=>getTeam(w,t.teamId).region===dry.r);
  tell(w,line,'DROUGHT','roundup',`${country.toUpperCase()}: ${dry.years} AÑOS SIN UN TÍTULO MUNDIAL`,`${ever?`Ningún club de ${country} gana la Gran Grieta desde hace ${dry.years} años.`:`Ningún club de ${country} ha ganado jamás la Gran Grieta, y ya van ${dry.years} temporadas.`} Los historiadores locales hablan de una maldición, sobre todo para vender libros.`,{importance:4});
 }
 // Club droughts: the champion ending a long wait, or the longest-suffering former champion.
 const clubLast=titles.filter(t=>t.teamId===champ.id&&t.season<w.season).reduce((a,t)=>Math.max(a,t.season),0);
 const clubWait=w.season-1-clubLast;
 if(clubWait>=10&&!(wait>=6)){
  const line=openStoryline(w,`drought:club:${champ.id}:${w.season}`,'drought',[champ.id],`el título tan esperado de los ${champ.nickname}`,{years:clubWait});line.status='resolved';
  tell(w,line,'DROUGHT','championship',clubLast?`${champ.nickname.toUpperCase()} ROMPEN ${clubWait} AÑOS DE ESPERA`:`PRIMER TÍTULO DE LA HISTORIA PARA ${champ.name.toUpperCase()}`,clubLast?`${champ.name} no ganaban la Gran Grieta desde la temporada ${clubLast}. Ahora el problema es de otros.`:`${clubWait} temporadas después del nacimiento de la liga, ${champ.name} por fin levantan la Gran Grieta.`,{teamId:champ.id,importance:5});
 }
 const cursed=w.teams.map(t=>({t,last:titles.filter(x=>x.teamId===t.id).reduce((a,x)=>Math.max(a,x.season),0)})).filter(x=>x.last>0&&x.t.id!==champ.id&&w.season-x.last>=12&&(w.season-x.last)%4===0).sort((a,b)=>a.last-b.last)[0];
 if(cursed){
  const years=w.season-cursed.last,line=openStoryline(w,`drought:club:${cursed.t.id}`,'drought',[cursed.t.id],'',{years});
  tell(w,line,'DROUGHT','roundup',`LA MALDICIÓN DE LOS ${cursed.t.nickname.toUpperCase()}: ${years} AÑOS Y SUMANDO`,`${cursed.t.name} ganaron su último título mundial en la temporada ${cursed.last}. Una bruja local se ofrece a levantar la maldición por un precio razonable.`,{teamId:cursed.t.id,importance:3});
 }
}

// Award follow-ups: a prodigy who delivers.
function awardFollowUps(w:World){
 for(const a of w.awards.filter(a=>a.season===w.season&&(a.award==='Golden Gargoyle'||a.award==='Rookie of the Year'||a.award.startsWith('Best ')))){
  const line=findStoryline(w,`prodigy:${a.playerId}`);const p=getPlayer(w,a.playerId);
  if(!line||!p||line.data.delivered)continue;
  line.data.delivered=w.season;line.status='resolved';line.lastSeason=w.season;
  tell(w,line,'PRODIGY','prospect',`LA PROMESA CUMPLE: ${p.name.toUpperCase()}`,`${line.startSeason<w.season?`${yearsAgo(w.season-line.startSeason)} después de que empezara a sonar su nombre, `:'No era humo: '}${p.name} gana el premio ${awardEs(a.award)}.`,{teamId:p.teamId,playerId:p.id,importance:4});
 }
}

// ---------- Nicknames ----------
// Athletes without a nickname earn one with a standout season. One christening per week at most.
function nicknameMilestones(w:World,week:number){
 const reasons=(p:Player):string|undefined=>p.stats.breaches>=12?`${p.stats.breaches} brechas esta temporada`:p.stats.interceptions>=6?`${p.stats.interceptions} robos esta temporada`:p.stats.knockouts>=7?`${p.stats.knockouts} KO esta temporada`:p.stats.tackles>=85?`${p.stats.tackles} placajes esta temporada`:p.career.mvp>=8?`${p.career.mvp} premios al mejor del partido`:undefined;
 const found=w.players.filter(p=>!p.nickname&&reasons(p)).sort((a,b)=>b.fame-a.fame||b.rating-a.rating||a.id.localeCompare(b.id))[0];
 if(!found)return;
 const why=reasons(found)!,team=getTeam(w,found.teamId),nick=giveNickname(w,found);
 addStory(w,'milestone',`NACE UN APODO: «${nick.toUpperCase()}»`,pickLine(NICKNAME_STORY,storySeed(w,`${found.id}:${week}`))({name:found.name,club:team.name,nick,why}),team.id,found.id,undefined,3);
}

// ---------- Ultimates ----------
// A knockout or final decided by an ultimate gets a headline of its own.
function ultimateStories(w:World,fixtures:Match[]){
 for(const m of fixtures){
  if(m.phase==='league'||!m.decidedBy||!m.winner)continue;
  const hero=getPlayer(w,m.decidedBy);if(!hero)continue;
  const win=getTeam(w,m.winner),lose=getTeam(w,m.winner===m.home?m.away:m.home);
  const call=hero.nickname?`«${hero.nickname}»`:hero.name.split(' ').slice(1).join(' ')||hero.name;
  const stage=m.phase==='grand-final'?'la Gran Final':m.phase.startsWith('world')?'la Copa del Mundo':'la fase final nacional';
  addStory(w,'championship',`LA DEFINITIVA DE ${call.toUpperCase()} HUNDE A LOS ${lose.nickname.toUpperCase()}`,
   pickLine(ULTIMATE_STORY,storySeed(w,m.id))({hero:hero.nickname?`«${hero.nickname}» ${hero.name}`:hero.name,ability:habilidad(hero.ability),winner:win.name,loser:lose.name,hi:Math.max(m.homeScore!,m.awayScore!),lo:Math.min(m.homeScore!,m.awayScore!),stage}),
   win.id,hero.id,m.id,m.phase==='grand-final'?7:6);
 }
}

// ---------- Streaks ----------
// A club reaching five wins or five defeats in a row gets a story (once per run, at exactly five).
function streakStories(w:World,week:number){
 for(const t of w.teams){
  const run=(k:string)=>{let n=0;while(n<t.form.length&&t.form[n]===k)n++;return n;};
  const wins=run('W'),losses=run('L');
  if(wins!==5&&losses!==5)continue;
  const ctx={club:t.name,nick:t.nickname,n:5,mascot:mascotOf(t.id,t.nickname)};
  if(wins===5)addStory(w,'result',`${t.nickname.toUpperCase()}: CINCO DE CINCO`,pickLine(WIN_STREAK,storySeed(w,t.id))(ctx),t.id,undefined,undefined,3);
  else addStory(w,'result',`${t.nickname.toUpperCase()} NO LEVANTAN CABEZA`,pickLine(LOSE_STREAK,storySeed(w,t.id))(ctx),t.id,undefined,undefined,2);
  if(week>0)return;
 }
}

// Broadcast stories use recorded match facts and never synthesize statistics from headline events.
function matchReportStories(w:World,fixtures:Match[]){
 const scored=fixtures.filter(m=>m.report&&m.homeScore!==null&&m.awayScore!==null);
 if(!scored.length)return;
 const starCandidates=scored.flatMap(m=>Object.values(m.report!.players).map(row=>({m,row})));
 const standout=starCandidates.sort((a,b)=>b.row.impact-a.row.impact)[0];
 if(standout?.row.impact>=20){
  const p=getPlayer(w,standout.row.playerId),t=getTeam(w,standout.row.teamId);
  if(p){const stats=standout.row;const feats=[stats.breaches?`${stats.breaches} ${stats.breaches===1?'brecha':'brechas'}`:'',stats.interceptions?`${stats.interceptions} ${stats.interceptions===1?'robo':'robos'}`:'',stats.tackles>=4?`${stats.tackles} placajes`:'',stats.yards>=40?`${stats.yards} metros ganados`:'',stats.knockouts?`${stats.knockouts} KO`:''].filter(Boolean);
   addStory(w,'milestone',`${p.name.toUpperCase()} SE ADUEÑA DE LA JORNADA`,pickLine(STAR,storySeed(w,p.id))({name:p.name,nick:p.nickname,club:t.name,feats:feats.slice(0,3).join(', ')||'una actuación decisiva',game:`${getTeam(w,standout.m.home).name} ${standout.m.homeScore}–${standout.m.awayScore} ${getTeam(w,standout.m.away).name}`}),t.id,p.id,standout.m.id,4);
  }
 }
 const drama=scored.map(m=>{
  const report=m.report!,h=report.teams[m.home],a=report.teams[m.away];
  const winner=m.winner,loser=winner==m.home?m.away:m.home;
  const decisive=winner?report.teams[winner]:undefined;
  const leadFlip=!!winner&&m.events.some(e=>e.minute>=14&&e.minute<=28&&(winner===m.home?e.homeScore<e.awayScore:e.awayScore<e.homeScore));
  const turnoverBattle=h.turnovers+a.turnovers;
  const physical=h.knockouts+a.knockouts;
  const points=Math.abs(m.homeScore!-m.awayScore!);
  const score=(leadFlip?12:0)+(points<=3?6:0)+(turnoverBattle>=3?7:0)+(physical>=4?5:0)+((decisive?.turnovers??0)===0?1:0)+(m.phase==='grand-final'?15:0);
  return {m,score,leadFlip,turnoverBattle,physical,winner,loser};
 }).sort((a,b)=>b.score-a.score)[0];
 if(drama&&drama.score>=11&&drama.winner){
  const win=getTeam(w,drama.winner),lose=getTeam(w,drama.loser),m=drama.m;
  const occasion=drama.leadFlip?'una remontada tardía':drama.turnoverBattle>=3?'una batalla llena de pérdidas':drama.physical>=4?'un choque a cara de perro':'un final de infarto';
  const title=drama.leadFlip?`${win.nickname.toUpperCase()} LE DAN LA VUELTA`:drama.turnoverBattle>=3?`CAOS EN EL CAMPO: GANAN ${win.nickname.toUpperCase()}`:`${win.nickname.toUpperCase()} SALEN VIVOS DEL APRIETO`;
  addStory(w,'result',title,pickLine(DRAMA,storySeed(w,m.id))({winner:win.name,loser:lose.name,hi:Math.max(m.homeScore!,m.awayScore!),lo:Math.min(m.homeScore!,m.awayScore!),turnovers:drama.turnoverBattle,kos:drama.physical,occasion}),win.id,undefined,m.id,3);
 }
 // Injury reports are grounded in this week's player-specific match events, not accumulated career totals.
 const injuries=scored.flatMap(m=>m.events.filter(e=>e.kind==='injury'&&e.playerId).map(e=>({m,e}))).slice(0,5);
 if(injuries.length>=2&&w.week%3===0){const sample=injuries[0];const p=sample.e.playerId?getPlayer(w,sample.e.playerId):undefined;
  addStory(w,'injury','LA DRA. PLUMILLA TIENE PREGUNTAS',pickLine(INJURY,storySeed(w,'injury'))({count:injuries.length,name:p?.name}),sample.e.teamId,sample.e.playerId,sample.m.id,2);
 }
}

// Called by the engine after each week's fixtures are played and the next round is scheduled.
export function chronicleWeek(w:World,week:number,fixtures:Match[]){
 trackRecords(w,week);
 matchReportStories(w,fixtures);
 upsets(w,fixtures);
 ultimateStories(w,fixtures);
 rivalryRecaps(w,fixtures);
 rivalryPreviews(w,w.matches.filter(m=>m.season===w.season&&m.week===week+1&&m.homeScore===null));
 if(week<=SEASON.LEAGUE_END&&week%2===0)nicknameMilestones(w,week);
 if(week<=SEASON.LEAGUE_END)streakStories(w,week);
 if(week===10)prodigyWatch(w);
 // The national semifinals are the first knockout week: veterans of the qualified clubs get their last dance.
 if(week===SEASON.LEAGUE_END)lastDances(w,w.matches.filter(m=>m.season===w.season&&m.week===SEASON.NATIONAL_SEMI));
 if(week===SEASON.WORLD_FINAL)seasonEnd(w);
 if(week===SEASON.AWARDS)awardFollowUps(w);
}

// Called by the engine during the offseason, after retirements.
export function chronicleOffseason(w:World,retirees:Player[]){
 for(const p of retirees){
  const line=findStoryline(w,`lastdance:${p.id}`);if(!line||line.status==='resolved')continue;
  line.status='resolved';line.lastSeason=w.season;
  const team=getTeam(w,p.teamId) as Team|undefined;
  tell(w,line,'LAST DANCE','milestone',`${p.name.toUpperCase()} CUELGA LAS BOTAS`,`Se acabó el último baile. ${p.name} se retira tras ${p.seasons} temporadas con ${p.career.breaches} brechas, ${p.career.tackles} placajes y ${p.championships} títulos mundiales${team?`, la última etapa en ${team.name}`:''}.`,{teamId:p.teamId,playerId:p.id,importance:4});
 }
 // Record chases that ran out of season fall short.
 for(const s of w.storylines)if(s.kind==='record'&&s.status==='active'&&s.data.scope==='season'){s.status='resolved';s.memory=`la persecución del récord que se quedó corta`;}
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
