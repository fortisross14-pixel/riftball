// The chronicle's voice: Spanish story templates fed with real match data, and the recurring cast.
// Every template is a function of facts the engine already knows. Picks are a hash of the story's
// context, never the world's dice, so writing a story never changes a result.

/** Deterministic pick from a list. */
export function pickLine<T>(options: readonly T[], seed: string | number): T {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return options[h % options.length];
}

/* ------------------------------------------------------------ the recurring cast */

export const COMISIONADO = [
  'El Comisionado ha anunciado una revisión de seguridad. Otra.',
  'El Comisionado anuncia, con voz solemne, una revisión de seguridad «exhaustiva y casi inmediata».',
  'El Comisionado ha convocado una rueda de prensa para anunciar que convocará otra rueda de prensa. Y una revisión de seguridad.',
  'El Comisionado asegura que el incidente será objeto de una revisión de seguridad «con lupa, y si hace falta, con dos».',
  'El Comisionado ha prometido una revisión de seguridad antes de que acabe la temporada. De esta o de otra.',
] as const;
export const GRIMBALDO_LINES = [
  'El Viejo Grimbaldo, desde la cabina: «En Pedravelo esto se jugaba sin casco y sin quejarse».',
  'El Viejo Grimbaldo lo resume así: «Bonito, sí. Pero no tan bonito como lo de Pedravelo en el 82».',
  'El Viejo Grimbaldo, emocionado: «¡Así se juega! Bueno, casi así. En Pedravelo, mejor».',
  'El Viejo Grimbaldo no estaba impresionado: «He visto mejores placajes en la cola del pan de Puertopiedra».',
] as const;
export const PLUMILLA_LINES = [
  'La Dra. Plumilla, sin dormir desde el martes, pide «por favor, un poco de cariño con las rodillas ajenas».',
  'La Dra. Plumilla ha solicitado más vendas, más camillas y, sobre todo, más vacaciones.',
  'La Dra. Plumilla firma el parte médico con un suspiro audible desde la grada.',
  'La Dra. Plumilla recuerda que ella estudió para curar, no para hacer milagros cada fin de semana.',
] as const;
const MASCOTAS = ['Pedrusco', 'Chispitas', 'Don Plumón', 'Burbuja', 'Doña Ceniza', 'Ventolín', 'Remolino', 'Tizón', 'Musguito', 'Coral', 'Trueno Chico', 'Escamita'];
/** Every club has a mascot with opinions. The name follows the club, so it never changes. */
export const mascotName = (clubId: string) => pickLine(MASCOTAS, clubId);
export const mascotOf = (clubId: string, nickname: string) => `${mascotName(clubId)}, la mascota de los ${nickname}`;
export const MASCOT_LINES = [
  (m: string) => `${m}, ha declarado que «esto ya lo veía venir desde el calentamiento».`,
  (m: string) => `${m}, se ha negado a bailar en el descanso como protesta por el arbitraje.`,
  (m: string) => `${m}, opina que el equipo debería dejar de correr tanto y pensar más. Nadie le ha preguntado.`,
  (m: string) => `${m}, ha pedido un aumento de sueldo. Cobra en caramelos.`,
  (m: string) => `${m}, ha dado tres volteretas y se ha mareado. Dice que ha valido la pena.`,
] as const;

/* ------------------------------------------------------------ result stories */

export type ResultCtx = { winner: string; loser: string; wNick: string; lNick: string; hi: number; lo: number; margin: number; star?: string; streak?: number; mascot: string };
export const RESULT_CLOSE: readonly ((c: ResultCtx) => string)[] = [
  (c) => `${c.winner} ganan ${c.hi}-${c.lo} a ${c.loser} en un partido de comerse las uñas, y los nudillos. La liga ha recibido diecisiete quejas de espectadores preocupados.`,
  (c) => `Por ${c.margin} ${c.margin === 1 ? 'punto' : 'puntos'}: así de fino se lo llevan ${c.winner} ante ${c.loser} (${c.hi}-${c.lo}). ${c.star ? `${c.star} firmó la jugada decisiva.` : 'Nadie sabe muy bien cómo.'}`,
  (c) => `${c.wNick} sufren, sudan y ganan: ${c.hi}-${c.lo} contra ${c.lNick}. El cardiólogo del club ya ha pedido la baja.`,
  (c) => `${c.loser} se quedan a un suspiro (${c.lo}-${c.hi}). ${c.mascot.charAt(0).toUpperCase()}${c.mascot.slice(1)} ya ha pedido la repetición de la jugada en cámara lenta. Diez veces.`,
  (c) => `Final de infarto: ${c.winner} ${c.hi}, ${c.loser} ${c.lo}. La grada se fue a casa afónica y con un tic en el ojo.`,
];
export const RESULT_CLEAR: readonly ((c: ResultCtx) => string)[] = [
  (c) => `${c.winner} se imponen a ${c.loser} por ${c.hi}-${c.lo}. La liga confirma el resultado a pesar de varias protestas redactadas con mucha energía.`,
  (c) => `${c.wNick} ${c.hi}, ${c.lNick} ${c.lo}. ${c.star ? `${c.star} hizo el resto.` : 'Trabajo serio, sin florituras.'}`,
  (c) => `Victoria sólida de ${c.winner} (${c.hi}-${c.lo}). ${c.streak && c.streak >= 3 ? `Y ya van ${c.streak} seguidas.` : 'El vestuario celebra con sopa caliente.'}`,
  (c) => `${c.loser} lo intentaron, pero ${c.wNick} tenían otro plan: ${c.hi}-${c.lo} y a casa.`,
  (c) => `${c.winner} suman tres puntos ante ${c.loser} (${c.hi}-${c.lo}). El entrenador rival dice que «hay cosas positivas». No las ha especificado.`,
];
export const RESULT_ROUT: readonly ((c: ResultCtx) => string)[] = [
  (c) => `${c.winner} pasan por encima de ${c.loser}: ${c.hi}-${c.lo}. El marcador tuvo que pedir dígitos de repuesto.`,
  (c) => `Paliza histórica: ${c.wNick} ${c.hi}, ${c.lNick} ${c.lo}. ${c.mascot.charAt(0).toUpperCase()}${c.mascot.slice(1)} se ha escondido debajo de una grada.`,
  (c) => `${c.hi}-${c.lo}. ${c.loser} anuncian una semana de reflexión, terapia de grupo y sopa.`,
  (c) => `${c.winner} no tuvieron piedad (${c.hi}-${c.lo}). ${c.star ? `${c.star} jugó como si le debieran dinero.` : 'Ni un gramo.'}`,
];

/* ------------------------------------------------------------ matchday stars and drama */

export type StarCtx = { name: string; club: string; feats: string; game: string; nick?: string };
export const STAR: readonly ((c: StarCtx) => string)[] = [
  (c) => `${c.name}, de ${c.club}, firma ${c.feats} en el ${c.game}. Ha mandado al rival directamente a un libro de medicina.`,
  (c) => `${c.nick ? `«${c.nick}» ` : ''}${c.name} se sale: ${c.feats} en el ${c.game}. Ha exigido una segunda página en el acta.`,
  (c) => `Exhibición de ${c.name} con ${c.club}: ${c.feats}. El locutor del estadio se ha quedado sin adjetivos y ha empezado a inventarlos.`,
  (c) => `${c.feats}. Ese es el resumen de la tarde de ${c.name} en el ${c.game}. Los rivales piden que se revise si es legal ser así.`,
  (c) => `${c.name} (${c.club}) decide el ${c.game} con ${c.feats}. Sus compañeros dicen que «a veces da un poco de miedo».`,
  (c) => `Si alguien pregunta quién ganó el ${c.game}, la respuesta es ${c.nick ? `«${c.nick}»` : c.name}: ${c.feats}.`,
];
export type DramaCtx = { winner: string; loser: string; hi: number; lo: number; turnovers: number; kos: number; occasion: string };
export const DRAMA: readonly ((c: DramaCtx) => string)[] = [
  (c) => `${c.winner} ganan a ${c.loser} por ${c.hi}–${c.lo} en ${c.occasion}. El acta registra ${c.turnovers} pérdidas y ${c.kos} KO. Los árbitros han pedido una semana libre.`,
  (c) => `${c.occasion.charAt(0).toUpperCase()}${c.occasion.slice(1)}: ${c.winner} ${c.hi}, ${c.loser} ${c.lo}. ${c.kos} KO y ${c.turnovers} balones perdidos después, todavía hay quien pregunta si fue un partido o una pelea con normas.`,
  (c) => `Nadie se aburrió en el ${c.winner}–${c.loser} (${c.hi}–${c.lo}): ${c.occasion}, ${c.turnovers} pérdidas y ${c.kos} jugadores mirando las estrellas.`,
  (c) => `${c.winner} sobreviven a ${c.occasion} ante ${c.loser} (${c.hi}–${c.lo}). La Dra. Plumilla contabiliza ${c.kos} KO y una crisis nerviosa propia.`,
];

/* ------------------------------------------------------------ streaks, rivalries, titles, awards, market */

export type StreakCtx = { club: string; nick: string; n: number; mascot: string };
export const WIN_STREAK: readonly ((c: StreakCtx) => string)[] = [
  (c) => `${c.club} encadenan ${c.n} victorias seguidas. En la ciudad ya se habla de imprimir camisetas de campeones, por si acaso.`,
  (c) => `${c.n} de ${c.n}: los ${c.nick} no conocen la derrota últimamente. ${c.mascot.charAt(0).toUpperCase()}${c.mascot.slice(1)} se lo atribuye a su baile nuevo.`,
  (c) => `Racha de ${c.n} victorias para ${c.club}. Los rivales estudian el vídeo; los ${c.nick}, el calendario.`,
  (c) => `Los ${c.nick} suman ${c.n} triunfos seguidos y el Viejo Grimbaldo ya ha dicho que «esto le recuerda a los buenos tiempos».`,
];
export const LOSE_STREAK: readonly ((c: StreakCtx) => string)[] = [
  (c) => `${c.n} derrotas seguidas para ${c.club}. La directiva ha convocado una reunión de emergencia, con sopa.`,
  (c) => `Los ${c.nick} siguen sin ganar: ${c.n} derrotas al hilo. ${c.mascot.charAt(0).toUpperCase()}${c.mascot.slice(1)} ha empezado a ir a terapia.`,
  (c) => `Crisis en ${c.club}: ${c.n} derrotas consecutivas. El entrenador asegura que «el equipo está bien». El equipo no lo confirma.`,
  (c) => `${c.n} partidos, ${c.n} derrotas. Los ${c.nick} han probado de todo, incluido un amuleto de dudosa procedencia.`,
];
export type ChampCtx = { club: string; nick: string; country: string; captain?: string };
export const NATIONAL_CHAMPS: readonly ((c: ChampCtx) => string)[] = [
  (c) => `${c.club} se coronan en ${c.country} y sacan billete para la Copa del Mundo. La ciudad decreta tres días de destrozos festivos.`,
  (c) => `¡Campeones de ${c.country}! ${c.captain ? `${c.captain} levanta el trofeo` : 'El capitán levanta el trofeo'} y los ${c.nick} ya miran hacia la Copa del Mundo.`,
  (c) => `Los ${c.nick} reinan en ${c.country}. El Comisionado ha anunciado una revisión de seguridad de las celebraciones. Llega tarde.`,
  (c) => `${c.country} ya tiene campeón: ${c.club}. El alcalde ha prometido una estatua. De momento, han puesto una pancarta.`,
];
export const WORLD_CHAMPS: readonly ((c: ChampCtx & { score: string; runnerUp: string }) => string)[] = [
  (c) => `${c.club} son campeones del mundo tras ganar la Gran Final a ${c.runnerUp} (${c.score}). El trofeo ya está en un autobús descapotable, con cinturón.`,
  (c) => `¡La Gran Grieta es para ${c.club}! ${c.score} ante ${c.runnerUp}. ${c.captain ? `${c.captain} no suelta el trofeo ni para dormir.` : 'Nadie suelta el trofeo.'}`,
  (c) => `${c.score} en la Gran Final y ${c.club} tocan el cielo. En ${c.runnerUp.split(' ')[0]} prefieren no hablar del tema.`,
  (c) => `Campeones del mundo: ${c.club}. El Viejo Grimbaldo, ${c.country === 'Pedravelo' ? 'llorando de alegría' : 'con cara de pocos amigos'}, lo resume: «${c.country === 'Pedravelo' ? '¡Lo sabía!' : 'Bah, suerte'}».`,
];
export type RivalCtx = { home: string; away: string; city: string; heat: number; series: string; last: string };
export const RIVAL_PREVIEW: readonly ((c: RivalCtx) => string)[] = [
  (c) => `La rivalidad en ${c.city} arde a ${c.heat} grados. Historial: ${c.series}.${c.last}`,
  (c) => `Semana de derbi: ${c.home} contra ${c.away}. Temperatura ${c.heat}. Los bomberos de ${c.city} ya están avisados.${c.last}`,
  (c) => `${c.home} y ${c.away} vuelven a verse las caras. Historial: ${c.series}. El Comisionado ha reforzado la seguridad con dos señores y un perro.${c.last}`,
  (c) => `En ${c.city} no se habla de otra cosa: derbi a ${c.heat} grados entre ${c.home} y ${c.away}.${c.last}`,
];
export type MvpCtx = { name: string; nick?: string; role: string; race: string; club: string; line: string };
export const MVP_STORY: readonly ((c: MvpCtx) => string)[] = [
  (c) => `${c.name}, ${c.role} ${c.race} de ${c.club}, se lleva la Gárgola de Oro: ${c.line}. El trofeo está asegurado contra mordiscos.`,
  (c) => `${c.nick ? `«${c.nick}» ` : ''}${c.name} es el mejor del mundo esta temporada (${c.line}). El discurso duró noventa segundos y una pequeña explosión.`,
  (c) => `Gárgola de Oro para ${c.name} (${c.club}). ${c.line}. El Comisionado lo ha comprobado tres veces, por si acaso.`,
  (c) => `Ni sorpresa ni debate: ${c.name} gana la Gárgola de Oro con ${c.line}.`,
];
export type TransferCtx = { name: string; to: string; from: string; role: string };
export const TRANSFER: readonly ((c: TransferCtx) => string)[] = [
  (c) => `${c.to} fichan a ${c.name}, procedente de ${c.from}. Según fuentes cercanas, el contrato incluye plus de peligrosidad y sopa ilimitada.`,
  (c) => `${c.name} cambia ${c.from} por ${c.to}. Se despidió de su antiguo vestuario con un abrazo y se llevó, por error, tres toallas.`,
  (c) => `Bombazo en el mercado: ${c.name} (${c.role}) jugará en ${c.to}. En ${c.from} dicen que «ya no le echaban de menos». Mienten.`,
  (c) => `${c.to} se refuerzan con ${c.name}. El traspaso se cerró en una taberna, con un apretón de manos y un trozo de queso.`,
  (c) => `${c.name} deja ${c.from} rumbo a ${c.to}. Su nueva afición ya ha aprendido a pronunciar su nombre. Más o menos.`,
];
export type FarewellCtx = { name: string; seasons: number; breaches: number; titles: number; fame: number };
export const FAREWELL_STORY: readonly ((c: FarewellCtx) => string)[] = [
  (c) => `${c.name} se retira tras ${c.seasons} temporadas, ${c.breaches} brechas y ${c.titles} títulos mundiales. Un goblin con trompeta interrumpió el discurso de despedida.`,
  (c) => `Cuelga las botas ${c.name}: ${c.seasons} temporadas, ${c.breaches} brechas. Las botas, agradecidas, también piden la jubilación.`,
  (c) => `Adiós a ${c.name}. ${c.titles ? `Se va con ${c.titles} títulos mundiales y` : 'Se va sin títulos mundiales, pero con'} el respeto de todos los que alguna vez acabaron debajo.`,
];
export const LEGEND_STORY: readonly ((c: FarewellCtx) => string)[] = [
  (c) => `${c.name} se retira con ${c.fame} puntos de leyenda, ${c.breaches} brechas y ${c.titles} títulos mundiales. Su retrato se cuelga donde pueda intimidar a las generaciones futuras.`,
  (c) => `El Salón de las Leyendas abre sus puertas a ${c.name}: ${c.seasons} temporadas, ${c.breaches} brechas, ${c.titles} coronas. El conserje ya está limpiando el marco.`,
  (c) => `${c.name} entra en la historia. Literalmente: hay una sala con su nombre y una estatua que, según dicen, se le parece un poco.`,
];
export type InjuryCtx = { count: number; name?: string };
export const INJURY: readonly ((c: InjuryCtx) => string)[] = [
  (c) => `Las actas de esta semana recogen ${c.count} lesiones. ${c.name ? `${c.name} está entre quienes necesitan tratamiento. ` : ''}La Dra. Plumilla asegura que las camillas ya son de madera reglamentaria y que, por favor, alguien le traiga un café.`,
  (c) => `${c.count} lesionados esta semana. ${c.name ? `El caso más llamativo: ${c.name}. ` : ''}La Dra. Plumilla ha empezado a cobrar las tiritas.`,
  (c) => `Semana dura en la enfermería: ${c.count} visitas. ${c.name ? `${c.name} ya tiene silla reservada. ` : ''}La Dra. Plumilla ha colgado un cartel: «Cerrado por agotamiento».`,
];
export type NickCtx = { name: string; club: string; nick: string; why: string };
export const NICKNAME_STORY: readonly ((c: NickCtx) => string)[] = [
  (c) => `${c.name}, de ${c.club}, ya tiene apodo: desde hoy la grada le llama «${c.nick}». El motivo: ${c.why}. La grada ya ha encargado las pancartas.`,
  (c) => `Nace una leyenda con nombre propio: «${c.nick}». Así llaman ya a ${c.name} (${c.club}) tras ${c.why}. Su madre sigue llamándole por su nombre, pero es la única.`,
  (c) => `«${c.nick}». Dos palabras, ${c.why} y una afición rendida: ${c.name} estrena apodo en ${c.club}. El club ya vende camisetas, mal escritas, pero se venden.`,
  (c) => `El Viejo Grimbaldo asegura que fue él quien bautizó a ${c.name} como «${c.nick}». Los datos dicen que fue por ${c.why}.`,
];

/* ------------------------------------------------------------ rare world events */

export type EventCtx = { country: string; week: number; home?: string; away?: string; city?: string };
export const STORM: readonly ((c: EventCtx) => string)[] = [
  (c) => `Una tormenta de la Grieta cae sobre ${c.country}: la jornada ${c.week} se aplaza al final de la liga. El Comisionado ha anunciado una revisión de seguridad de las nubes.`,
  (c) => `Rayos violetas, granizo con chispas y un paraguas volando a 200 por hora: en ${c.country} no se juega la jornada ${c.week}. Se recuperará en la jornada 22.`,
  (c) => `La Grieta ruge sobre ${c.country} y la liga aplaza la jornada ${c.week}. Los equipos tendrán doble partido al final. La Dra. Plumilla ya está temblando.`,
];
export const DRAGON: readonly ((c: EventCtx) => string)[] = [
  (c) => `Un dragón ha anidado en el estadio de ${c.home}. El partido contra ${c.away} de la jornada ${c.week} se jugará en ${c.city}, campo del rival. El dragón no ha hecho declaraciones.`,
  (c) => `Problemas de inquilino: un dragón se ha instalado en la grada de ${c.home}. El duelo con ${c.away} (jornada ${c.week}) cambia de sede a ${c.city}. El Comisionado ha anunciado una revisión de seguridad. El dragón, una siesta.`,
  (c) => `${c.home} pierden su campo por un dragón con malas pulgas. Jugarán la jornada ${c.week} en casa de ${c.away}. La mascota del club se niega a salir del armario.`,
];
export const STRIKE: readonly ((c: EventCtx) => string)[] = [
  (c) => `¡Huelga de árbitros goblins en ${c.country}! En la jornada ${c.week} pitarán suplentes que no se saben el reglamento. Se esperan faltas. Muchas faltas.`,
  (c) => `Los árbitros goblins de ${c.country} se plantan: exigen silbatos más grandes. La jornada ${c.week} la arbitrará personal de urgencia, con más entusiasmo que criterio.`,
  (c) => `Huelga arbitral en ${c.country} para la jornada ${c.week}. El Comisionado ha anunciado una revisión de seguridad del silbato.`,
];

/* ------------------------------------------------------------ ultimates that decide knockouts */

export type UltimateCtx = { hero: string; ability: string; winner: string; loser: string; hi: number; lo: number; stage: string };
export const ULTIMATE_STORY: readonly ((c: UltimateCtx) => string)[] = [
  (c) => `${c.hero} activa ${c.ability} en ${c.stage} y ${c.winner} ganan a ${c.loser} por ${c.hi}-${c.lo}. El Viejo Grimbaldo ha tenido que sentarse.`,
  (c) => `Hay jugadas que se cuentan a los nietos. ${c.ability}, de ${c.hero}, es una de ellas: ${c.winner} ${c.hi}, ${c.loser} ${c.lo}, en ${c.stage}.`,
  (c) => `${c.loser} lo tenían en la mano hasta que ${c.hero} desató ${c.ability}. Resultado: ${c.hi}-${c.lo} para ${c.winner}. El Comisionado ha anunciado una revisión de seguridad de lo sobrenatural.`,
  (c) => `Lo decidió ${c.ability}, de ${c.hero}: ${c.winner} ${c.hi}, ${c.loser} ${c.lo}, en ${c.stage}. La Profesora Ébano lo resume: «Estadísticamente, injusto».`,
];
