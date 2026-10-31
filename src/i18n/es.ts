// Every piece of interface text lives here. Spanish is the game's language.
// Jokes are written natively in Spanish, not translated.
import type { RecordStat, Role, ShowcaseId } from '../types';

/** A deterministic pick, so the same event always shows the same line. */
export function line<T>(options: readonly T[], seed: number | string): T {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return options[h % options.length];
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The four elemental countries. */
export const COUNTRY_ES = ['Pedravelo', 'Piraforte', 'Altonido', 'Talasa'] as const;
export const countryName = (region: number) => COUNTRY_ES[region] ?? '?';

export const ROLE_ES: Record<Role, string> = {
  Bastion: 'Bastión', Breaker: 'Rompedor', Runner: 'Corredor', Thrower: 'Lanzador', Raider: 'Asaltante', Trickster: 'Embaucador',
};

export const AWARD_ES: Record<string, string> = {
  'Golden Gargoyle': 'Gárgola de Oro',
  'Rookie of the Year': 'Novato del Año',
  'Best Bastion': 'Mejor Bastión',
  'Best Breaker': 'Mejor Rompedor',
  'Best Runner': 'Mejor Corredor',
  'Best Thrower': 'Mejor Lanzador',
  'Best Raider': 'Mejor Asaltante',
  'Best Trickster': 'Mejor Embaucador',
};
export const awardName = (award: string) => AWARD_ES[award] ?? award;

export const RECORD_STAT_ES: Record<RecordStat, string> = {
  breaches: 'brechas', tackles: 'placajes', interceptions: 'robos', knockouts: 'KO', assists: 'asistencias',
  distance: 'metros', rushingYards: 'metros de carrera', passingYards: 'metros de pase', mvp: 'premios MVP', gates: 'portazos',
};

export const SHOWCASE_TITLE: Record<ShowcaseId, string> = {
  'national-finals': '¡FINALES NACIONALES!',
  'world-groups': '¡COPA DEL MUNDO!',
  'world-semis': '¡SEMIFINALES!',
  'grand-final': '¡LA GRAN FINAL!',
};

export const SHOWCASE_STAKE: Record<ShowcaseId, string> = {
  'national-finals': 'Cuatro países, cuatro coronas. Quien gane, se va a la Copa del Mundo.',
  'world-groups': 'Ocho clubes, dos grupos. Solo los dos primeros de cada grupo pasan a semifinales.',
  'world-semis': 'Cuatro supervivientes. Dos billetes para la Gran Final.',
  'grand-final': 'Un partido. Un trofeo. Una ciudad que no va a dormir esta noche.',
};

const HYPE: Record<ShowcaseId, readonly string[]> = {
  'national-finals': [
    'Los médicos ya han pedido refuerzos. Y tiritas. Muchas tiritas.',
    'Se espera un lleno absoluto y, como mínimo, un graderío en llamas. El figurado, esperamos.',
    'Las apuestas están tan igualadas que hasta el árbitro ha apostado por los dos.',
  ],
  'world-groups': [
    'El mundo entero mira. Bueno, los que no están haciendo cola para el baño.',
    'Ocho escudos, dos grupos y una sola regla: no morder al árbitro antes del descanso.',
    'Los cuatro elementos, frente a frente. El Comisionado ya ha encargado extintores.',
  ],
  'world-semis': [
    'A partir de aquí, cada error se paga caro. Y en efectivo.',
    'Quedan cuatro. Mañana quedarán dos. Las cuentas son fáciles; los placajes, no.',
    'Los entrenadores juran tener un plan. Nadie les cree, pero queda bonito.',
  ],
  'grand-final': [
    'Esto no es un partido: es el partido. Que tiemble la Grieta.',
    'Dos ciudades contienen la respiración. Una de ellas va a necesitar pañuelos.',
    'El trofeo ha llegado escoltado por doce guardias y un dragón con cara de pocos amigos.',
  ],
};
export const hypeLine = (id: ShowcaseId, seed: number | string) => line(HYPE[id], seed);

const CHAMPION_JOKES = [
  'El capitán levanta el trofeo. El trofeo, por primera vez en su vida, se siente pequeño.',
  'La ciudad decreta tres días de fiesta y uno más para encontrar al alcalde.',
  'El vestuario huele a gloria, a sudor y, misteriosamente, a sopa de ajo.',
  'Alguien ha intentado beber del trofeo. Era la copa equivocada. Era el casco del árbitro.',
  'Los aficionados han prometido no romper nada. Han roto la promesa primero.',
];
export const championJoke = (seed: number | string) => line(CHAMPION_JOKES, seed);

/** Acceptance speeches, one voice per trait. */
const ACCEPTANCE: Record<string, readonly string[]> = {
  'Relentless': ['«¿Ya se ha acabado la temporada? Yo podría seguir otra.»', '«Descansaré cuando me jubile. O quizá tampoco.»'],
  'Showboat': ['«Quiero darme las gracias a mí mismo, por ser tan increíble.»', '«Este premio llega tarde, pero me queda precioso.»'],
  'Ice-Cold': ['«Gracias.» (Y se fue. Eso fue todo.)', '«Era lo esperado. Siguiente pregunta.»'],
  'Undisciplined': ['«Perdón por llegar tarde. Y por la multa. Y por lo otro.»', '«¿Esto cuenta como falta? Porque ya lo he cogido.»'],
  'Fan Favorite': ['«¡Este premio es vuestro! Bueno, me lo quedo yo, pero es vuestro.»', '«A mi abuela, que lleva toda la temporada gritando desde la grada.»'],
  'Tactician': ['«Lo tenía todo previsto. Excepto este discurso.»', '«Ganamos en la pizarra mucho antes que en el campo.»'],
  'Hard-Nosed': ['«Me rompí la nariz tres veces. Mereció la pena dos.»', '«Aquí no se viene a hacer amigos. Pero gracias, amigos.»'],
  'Iron Will': ['«La Dra. Plumilla dijo que no podría jugar. La Dra. Plumilla se equivocó.»', '«El dolor es solo una opinión. Y no la comparto.»'],
  'Hot-Headed': ['«¡Este premio debería ser el doble de grande! ¿Quién lo ha medido?»', '«Lo acepto, pero que conste que el árbitro sigue sin caerme bien.»'],
  'Clutch Performer': ['«Me gusta cuando aprieta. Hoy, por ejemplo, me aprieta el traje.»', '«Los últimos minutos son mis favoritos. Los discursos, no tanto.»'],
  'Born Leader': ['«Esto es de todo el equipo. Sobre todo de los que me hicieron caso.»', '«Un líder no gana solo. Pero ayuda mucho que sea yo.»'],
  'Reckless': ['«No recuerdo la mitad de la temporada, pero me dicen que fue buenísima.»', '«¿Puedo subir al escenario de un salto? ¿No? Demasiado tarde.»'],
};
export const acceptanceQuote = (trait: string, seed: number | string) => line(ACCEPTANCE[trait] ?? ['«Gracias a todos. Y a nadie en particular.»'], seed);

const FAREWELLS = [
  'Se despide entre lágrimas, aplausos y un goblin con trompeta.',
  'Cuelga las botas. Las botas, agradecidas, piden jubilarse también.',
  'Promete visitar el estadio. Los porteros prometen reconocerle.',
  'Se retira a una granja. Las gallinas ya han pedido protección.',
  'Deja el campo con la cabeza alta y las rodillas, bastante más bajas.',
  'Su taquilla se subastará. La puja inicial: un calcetín y dos dientes.',
  'Dice que se va a dedicar a la poesía. Los críticos ya tiemblan.',
  'El club retira su dorsal. Y su silla. Y, por si acaso, su taza.',
  'Se despide con un discurso de cuarenta minutos. Los primeros treinta, sobre sí.',
  'Abrirá una taberna junto al estadio. La primera ronda la pagan los rivales.',
];
/** Farewell lines go in order, so a list of retirements never repeats one until all are used. */
export const farewellLine = (index: number) => FAREWELLS[((index % FAREWELLS.length) + FAREWELLS.length) % FAREWELLS.length];

export const ES = {
  appName: 'Riftball',
  appSub: 'la Crónica del Mundo',
  notice: {
    stageBlocked: 'Primero hay que terminar el evento en curso.',
    failed: (msg: string) => `El escriba ha tropezado con la pluma${msg ? `: ${msg}` : '.'}`,
    refreshed: 'Se ha cargado la copia más reciente de la crónica.',
    archiveClosed: 'El archivo no se abre. Inténtalo de nuevo en un momento.',
    newWorld: 'Se ha fundado un mundo nuevo. Los árbitros ya están nerviosos.',
    clearFailed: 'No se pudo borrar el almacenamiento del navegador; la crónica anterior sigue ahí.',
    imported: 'La crónica importada ya forma parte del libro.',
    importUnreadable: 'Ese archivo no parece una crónica de Riftball.',
  },
  confirm: {
    newWorld: '¿Quemar esta crónica y fundar un mundo completamente nuevo? La partida guardada en este navegador se borrará. Expórtala antes si quieres conservarla.',
    importReplace: '¿Sustituir el mundo actual por la crónica importada?',
    legacyFresh: '¿Empezar un mundo nuevo? La crónica antigua se borrará de este navegador. Si quieres conservarla, expórtala primero.',
  },
  legacy: {
    title: 'Esta crónica es de una versión antigua',
    body: 'Tu partida guardada pertenece a una versión anterior de Riftball, con otros clubes y otro mapa. No se puede cargar sin romperse, así que no vamos a intentarlo a medias.',
    hint: 'Puedes exportarla para guardarla como recuerdo y empezar un mundo nuevo.',
    export: 'Exportar',
    fresh: 'Empezar un mundo nuevo',
    importRejected: 'Esta crónica es de una versión antigua y no se puede importar. Empieza un mundo nuevo.',
  },
  bar: {
    label: 'Controles de la temporada',
    playWeek: (week: number) => `Jugar jornada ${week}`,
    playWeekSub: (n: number) => plural(n, 'partido', 'partidos'),
    toNationalFinals: 'Ir a las Finales Nacionales',
    toNationalFinalsSub: 'se juegan las semifinales nacionales',
    pending: (n: number) => `Quedan ${plural(n, 'partido', 'partidos')}`,
    pendingSub: 'juégalos para continuar',
    awardsPending: (n: number) => `Quedan ${plural(n, 'premio', 'premios')}`,
    awardsPendingSub: 'revélalos en la Gala',
    toWorldCup: 'Ir a la Copa del Mundo',
    toSemis: 'Ir a las Semifinales',
    toFinal: 'Ir a la Gran Final',
    toGala: 'Ver la Gala',
    toMarket: 'Ir al mercado',
    openMarket: 'Abrir el mercado',
    openMarketSub: 'jubilaciones, fichajes y novatos',
    startSeason: (season: number) => `Empezar temporada ${season}`,
    continueSub: 'continuar',
    toEvent: 'Ir al evento',
    simulate: 'Simular hasta el próximo evento',
    simulateSub: (event: string) => `se detiene en: ${event}`,
    busyTitle: 'Los escribas están escribiendo',
    busyBody: 'Triunfos, tragedias y faltas de dudosísima legalidad pasan a tinta.',
    busyCount: (current: number, total: number) => `Semana ${current} de ${total}`,
  },
  progress: ['Liga', 'Finales Nacionales', 'Copa del Mundo', 'Semifinales', 'Gran Final', 'Gala', 'Mercado', 'Pretemporada'] as const,
  stage: {
    navName: 'Evento',
    weekLabel: (season: number, week: number) => `Temporada ${season} · semana ${week}`,
    introGo: '¡Que empiece el espectáculo!',
    vs: 'contra',
    keyPlayer: 'Jugador clave',
    form: 'Racha',
    noForm: 'sin partidos',
    matchesTitle: 'Partidos',
    remaining: (n: number) => (n ? `Quedan ${plural(n, 'partido', 'partidos')} por jugar.` : 'Todos los partidos están jugados.'),
    watch: 'Ver partido',
    quick: 'Resultado rápido',
    quickAll: (n: number) => `Resultado rápido para ${n === 1 ? 'el que queda' : `los ${n} restantes`}`,
    replay: 'Ver repetición',
    group: (g: number) => `Grupo ${g === 0 ? 'A' : 'B'}`,
    resultsTitle: 'Resultados',
    advance: 'se clasifica',
    qualified: (names: string) => `Se clasifican: ${names}.`,
    toFinal: (names: string) => `A la Gran Final: ${names}.`,
    championOf: (country: string) => `Campeón de ${country}`,
    worldChampion: '¡CAMPEONES DEL MUNDO!',
    captain: 'Capitán',
    continue: 'Continuar',
    continueHint: 'Ya puedes continuar con el botón principal.',
  },
  gala: {
    title: 'Gala de premios',
    sub: (season: number) => `Temporada ${season}. Smoking obligatorio; armadura, opcional.`,
    reveal: (k: number, n: number) => `Revelar siguiente premio (${k} de ${n})`,
    allRevealed: 'Todos los premios han sido entregados. ¡Que pase el siguiente!',
    record: 'Récord batido',
    recordLine: (stat: string, value: number, scope: 'season' | 'career') => `${value} ${stat} ${scope === 'season' ? 'en una temporada' : 'en su carrera'}`,
    nothing: 'Esta temporada no hubo premios que entregar.',
    games: (n: number) => plural(n, 'partido', 'partidos'),
    stat: {
      breaches: 'brechas', tackles: 'placajes', interceptions: 'robos', knockouts: 'KO', passingYards: 'm de pase', rushingYards: 'm de carrera', blocks: 'bloqueos', assists: 'asistencias',
    } as Record<string, string>,
  },
  market: {
    title: 'El mercado',
    body: 'La temporada ha terminado. Las jubilaciones, los fichajes y los novatos están a punto de llegar.',
  },
  preseason: {
    title: 'Pretemporada',
    sub: (season: number) => `Así queda el mundo antes de la temporada ${season}.`,
    retired: 'Se retiran',
    transfers: 'Fichajes',
    rookies: 'Novatos a seguir',
    noneRetired: 'Nadie se retira este año. Las mecedoras esperarán.',
    moved: (from: string, to: string) => `de ${from} a ${to}`,
    career: (seasons: number, breaches: number) => `${plural(seasons, 'temporada', 'temporadas')}, ${plural(breaches, 'brecha', 'brechas')}`,
    potential: (n: number) => `potencial ${n}`,
  },
  newSeason: {
    title: '¡Nueva temporada!',
    body: (season: number) => `Arranca la temporada ${season}. Cuarenta y ocho clubes, cuatro países y una sola Copa del Mundo.`,
    go: '¡A jugar!',
  },
} as const;
