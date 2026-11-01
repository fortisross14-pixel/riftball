export type Role = 'Bastion' | 'Breaker' | 'Runner' | 'Thrower' | 'Raider' | 'Trickster';
export type Race = 'Human' | 'Orc' | 'Elf' | 'Dwarf' | 'Giantkin' | 'Goblin' | 'Troll' | 'Lizardkin' | 'Revenant';
export type Rarity = 'Ordinary' | 'Professional' | 'Elite' | 'Extraordinary' | 'Legendary' | 'Generational';
export type StatKey = 'strength' | 'speed' | 'agility' | 'endurance' | 'handling' | 'passing' | 'tackling' | 'blocking' | 'positioning' | 'awareness' | 'composure' | 'arcana';
export type Attributes = Record<StatKey, number>;
export type SeasonStats = { games:number; breaches:number; assists:number; tackles:number; knockouts:number; interceptions:number; distance:number; rushingYards:number; passingYards:number; passes:number; gates:number; mvp:number; injuries:number; blocks:number; ultimates:number; decisive:number; };
export type Player = { id:string; name:string; race:Race; role:Role; teamId:string; age:number; level:number; xp:number; rating:number; rarity:Rarity; potential:number; attrs:Attributes; trait:string; ability:string; injury:number; careerWear:number; stats:SeasonStats; career:SeasonStats; titles:number; championships:number; fame:number; portrait:number; portraitKey:string; nickname?:string; history?:SeasonLine[]; retired?:boolean; retiredSeason?:number; hallOfLegends?:boolean; seasons:number; };
export type RecordTable = { w:number; d:number; l:number; pf:number; pa:number; pts:number; };
export type Team = { id:string; artKey:string; name:string; city:string; nickname:string; initials:string; region:number; division:0|1; colors:[string,string]; philosophy:string; power:number; fanbase:number; academy:number; budget:number; roster:string[]; record:RecordTable; historyTitles:number; worldTitles:number; rival:string; rivalHeat:number; rivalRecord:{w:number;d:number;l:number}; form:string[]; };
export type EventKind = 'breach' | 'gate' | 'aftershock' | 'interception' | 'knockout' | 'fumble' | 'bigplay' | 'injury' | 'whistle' | 'penalty' | 'spark' | 'miss' | 'ultimate';
export type MatchTeamStats = { possessions:number; plays:number; firstDowns:number; yards:number; runAttempts:number; rushingYards:number; passAttempts:number; passesCompleted:number; passingYards:number; breaches:number; gatesAttempted:number; gates:number; aftershocks:number; turnovers:number; interceptions:number; fumblesLost:number; tackles:number; blocks:number; knockouts:number; penalties:number; sparks:number; injuries:number; substitutions:number; };
export type MatchPlayerStats = { ultimates:number; playerId:string; teamId:string; plays:number; rushAttempts:number; yards:number; passesAttempted:number; passesCompleted:number; passingYards:number; catches:number; breaches:number; assists:number; gates:number; tackles:number; blocks:number; interceptions:number; knockouts:number; turnovers:number; sparks:number; impact:number; };
export type MatchDrive = { index:number; teamId:string; startMinute:number; endMinute:number; startX:number; endX:number; plays:number; firstDowns:number; yards:number; points:number; result:'breach'|'gate'|'miss'|'interception'|'fumble'|'downs'|'end'|'overtime'; scorerId?:string; };
export type MatchReport = { version:1; teams:Record<string,MatchTeamStats>; players:Record<string,MatchPlayerStats>; drives:MatchDrive[]; starters:Record<string,string[]>; benchUsed:Record<string,string[]>; winner?:string; };
export type MatchEvent = { minute:number; kind:EventKind; teamId:string; playerId?:string; text:string; homeScore:number; awayScore:number; x:number; };
export type Match = { id:string; season:number; week:number; home:string; away:string; homeScore:number|null; awayScore:number|null; phase:'league'|'regional-semi'|'regional-final'|'world-group'|'world-semi'|'grand-final'; region:number; group?:number; events:MatchEvent[]; report?:MatchReport; winner?:string; mvpId?:string; seed:number; decidedBy?:string; };
export type NewsKind = 'result' | 'milestone' | 'injury' | 'championship' | 'transfer' | 'prospect' | 'scandal' | 'roundup';
export type Story = { id:string; season:number; week:number; kind:NewsKind; title:string; body:string; teamId?:string; playerId?:string; matchId?:string; importance:number; badge?:StoryBadge; storylineId?:string; };
export type Award = { season:number; award:string; playerId:string; teamId:string; };
export type Trophy = { season:number; competition:string; teamId:string; runnerUpId?:string; };
export type World = { version:number; seasonArchive?: {season:number; leaders:{playerId:string; teamId:string; breaches:number; tackles:number; interceptions:number; passes:number; yards:number}[]; standings:{teamId:string; division:number; region:number; w:number; d:number; l:number; pf:number; pa:number; pts:number}[]}[]; seed:number; rng:number; season:number; week:number; teams:Team[]; players:Player[]; matches:Match[]; news:Story[]; trophies:Trophy[]; awards:Award[]; storylines:Storyline[]; records:RecordEntry[]; retired:Player[]; history:{season:number; teamId:string; description:string}[]; serial:number; totalGames:number; lastUpdated:number; stage?:StageState; offseasonLog?:OffseasonLog; predictions?:Record<string,Prediction>; coins?:Record<number,number>; worldEvents?:WorldEvent[]; };
/** A rare world event: a Rift storm, a dragon in a stadium, or a goblin referees' strike. */
export type WorldEvent = { season:number; week:number; kind:'storm'|'dragon'|'strike'; region:number; matchId?:string; home?:string; away?:string };
export type SeasonLine = { season:number; teamId:string; games:number; breaches:number; tackles:number; interceptions:number; rating:number };
/** A pick in the showcase prediction game: the chosen club and its pre-match win chance. */
export type Prediction = { teamId:string; chance:number; settled?:'won'|'lost'; coins?:number };
/** The four showcase stages. Each one blocks the calendar until every fixture in it is played. */
export type ShowcaseId = 'national-finals' | 'world-groups' | 'world-semis' | 'grand-final';
export type StageKind = 'league' | 'showcase' | 'awards' | 'market' | 'preseason';
/** Progress through the current week's stage: `introSeen` for showcases, `revealed`/`total` for the awards gala. */
export type StageState = { season:number; week:number; kind:StageKind; showcase?:ShowcaseId; introSeen:boolean; revealed:number; total:number; };
/** What the last market did, for the pre-season summary. */
export type OffseasonLog = { season:number; retired:string[]; transfers:{playerId:string; from:string; to:string}[]; rookies:string[]; };
export type GalaItem =
  | { kind:'award'; award:string; playerId:string; teamId:string }
  | { kind:'record'; stat:RecordStat; scope:'season'|'career'; value:number; playerId:string; teamId:string };
/** The four permanent elemental countries of Riftball. Region is retained as the internal key for old saves. */
export const REGIONS = ['STONEVEIL','PYREHOLD','AERIE DOMINION','THALASSA'];
export const REGION_CAPTIONS = ['Earth Realm · mountains, forests & mines','Fire Realm · forges, ash & volcanoes','Wind Realm · clouds, storms & high citadels','Water Realm · rivers, ports & deep seas'];
export const ROLES:Role[] = ['Bastion','Breaker','Runner','Thrower','Raider','Trickster'];
export const RACES:Race[] = ['Human','Orc','Elf','Dwarf','Giantkin','Goblin','Troll','Lizardkin','Revenant'];
export const ATTR_KEYS:StatKey[]=['strength','speed','agility','endurance','handling','passing','tackling','blocking','positioning','awareness','composure','arcana'];
export const EMPTY_STATS = (): SeasonStats => ({games:0,breaches:0,assists:0,tackles:0,knockouts:0,interceptions:0,distance:0,rushingYards:0,passingYards:0,passes:0,gates:0,mvp:0,injuries:0,blocks:0,ultimates:0,decisive:0});
export const EMPTY_RECORD = ():RecordTable => ({w:0,d:0,l:0,pf:0,pa:0,pts:0});
export type StorylineKind = 'drought' | 'dynasty' | 'record' | 'rivalry' | 'last-dance' | 'prodigy' | 'upset' | 'heartbreak';
// A storyline is the Chronicle's memory: later stories can refer back to it through `memory` ("the heartbreak in Brineport").
// subjects hold team ids, player ids, or `region:N`.
export type Storyline = { id:string; kind:StorylineKind; subjects:string[]; startSeason:number; lastSeason:number; status:'active'|'resolved'; memory:string; data:Record<string,number|string>; };
export type StoryBadge = 'DROUGHT' | 'DYNASTY' | 'RECORD' | 'RIVALRY' | 'UPSET' | 'PRODIGY' | 'LAST DANCE';
export type RecordStat = 'breaches' | 'tackles' | 'interceptions' | 'knockouts' | 'assists' | 'distance' | 'rushingYards' | 'passingYards' | 'mvp' | 'gates';
export type RecordEntry = { stat:RecordStat; scope:'season'|'career'; value:number; playerId:string; playerName:string; teamId:string; season:number; since?:number; };
