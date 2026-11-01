// The world in Spanish: countries, clubs, peoples, names, nicknames, gifts and the words of a match.
// The engine draws names from here; display code translates internal keys (traits, roles…) with these maps.
// Only types are imported, so the engine can depend on this file without a cycle.
import type { Race, Rarity, RecordStat, Role, StatKey } from '../types';

/* ------------------------------------------------------------ countries and clubs */

export const PAISES = ['Pedravelo', 'Piraforte', 'Altonido', 'Talasa'] as const;
export const PAIS_LEMA = [
  'Reino de la Tierra · montañas, bosques y minas',
  'Reino del Fuego · forjas, ceniza y volcanes',
  'Reino del Viento · nubes, tormentas y ciudadelas',
  'Reino del Agua · ríos, puertos y mares profundos',
] as const;

/** Same order as the engine's authored English list, which supplies each club's art key. */
export const CIUDADES: readonly (readonly string[])[] = [
  ['Puertopiedra', 'Raízférrea', 'Montehondo', 'Lomarroble', 'Peñagranito', 'Valmusgo', 'Muralzarza', 'Hondocobre', 'Atalayapino', 'Valtúmulo', 'Piedrarruna', 'Rodapeña'],
  ['Lluviabrasa', 'Forjaceniza', 'Picoceniza', 'Lavalejana', 'Agujatizón', 'Azufral', 'Puertoardiente', 'Bocahorno', 'Valescoria', 'Caldera Roja', 'Vigíacarbón', 'Marcapedernal'],
  ['Alcancielo', 'Crestavendaval', 'Agujanube', 'Vientotormenta', 'Nido Alto', 'Fortecéfiro', 'Reposotrueno', 'Vigíabruma', 'Puertocometa', 'Valle Tempestad', 'Picosusurro', 'Velasol'],
  ['Pozohondo', 'Ríocorriente', 'Puertocoral', 'Bahíatormenta', 'Arroyoplata', 'Crucemarea', 'Puertoperla', 'Cascadia', 'Estelazul', 'Guardalago', 'Caídamar', 'Isla Mistral'],
];
export const APODOS_CLUB: readonly (readonly string[])[] = [
  ['Titanes', 'Martillos', 'Custodios', 'Guardianes', 'Canteros', 'Ciervos', 'Zarzales', 'Mineros', 'Centinelas', 'Tejones', 'Monolitos', 'Carneros'],
  ['Infernales', 'Abrasadores', 'Llamas', 'Dragones', 'Salamandras', 'Forjadores', 'Fénix', 'Centellas', 'Basaltos', 'Volcanes', 'Antorchas', 'Yunques'],
  ['Halcones', 'Tempestades', 'Águilas', 'Céfiros', 'Cernícalos', 'Jinetes del Cielo', 'Nubarrones', 'Ráfagas', 'Águilas Pescadoras', 'Ciclones', 'Correnubes', 'Surcavientos'],
  ['Cascadas', 'Aguasvivas', 'Mareas', 'Marineros', 'Rápidos', 'Leviatanes', 'Nautilos', 'Resacas', 'Rompeolas', 'Garzas', 'Náufragos', 'Estrellas de Mar'],
];

/* ------------------------------------------------------------ peoples, positions, rarity */

export const RAZA_ES: Record<Race, string> = {
  Human: 'Humano', Orc: 'Orco', Elf: 'Elfo', Dwarf: 'Enano', Giantkin: 'Gigante', Goblin: 'Goblin', Troll: 'Trol', Lizardkin: 'Saurio', Revenant: 'Renacido',
};
export const RAZA_PLURAL_ES: Record<Race, string> = {
  Human: 'Humanos', Orc: 'Orcos', Elf: 'Elfos', Dwarf: 'Enanos', Giantkin: 'Gigantes', Goblin: 'Goblins', Troll: 'Troles', Lizardkin: 'Saurios', Revenant: 'Renacidos',
};
export const ROL_ES: Record<Role, string> = {
  Bastion: 'Bastión', Breaker: 'Rompedor', Runner: 'Corredor', Thrower: 'Lanzador', Raider: 'Asaltante', Trickster: 'Embaucador',
};
export const RAREZA_ES: Record<Rarity, string> = {
  Ordinary: 'Común', Professional: 'Profesional', Elite: 'Élite', Extraordinary: 'Épico', Legendary: 'Legendario', Generational: 'Generacional',
};
export const raza = (r: Race) => RAZA_ES[r];
export const rol = (r: Role) => ROL_ES[r];
export const rareza = (r: Rarity) => RAREZA_ES[r];

/** Award names. The stored keys stay as the engine writes them; these are what players read. */
export const PREMIO_ES: Record<string, string> = {
  'Golden Gargoyle': 'Gárgola de Oro',
  'Rookie of the Year': 'Novato del Año',
  'Best Bastion': 'Mejor Bastión',
  'Best Breaker': 'Mejor Rompedor',
  'Best Runner': 'Mejor Corredor',
  'Best Thrower': 'Mejor Lanzador',
  'Best Raider': 'Mejor Asaltante',
  'Best Trickster': 'Mejor Embaucador',
};
export const awardEs = (award: string) => PREMIO_ES[award] ?? award;

export const RECORD_STAT_ES: Record<RecordStat, string> = {
  breaches: 'brechas', tackles: 'placajes', interceptions: 'robos', knockouts: 'KO', assists: 'asistencias',
  distance: 'metros recorridos', rushingYards: 'metros de carrera', passingYards: 'metros de pase', mvp: 'premios al mejor del partido', gates: 'portazos',
};

export const ATRIBUTO_ES: Record<StatKey, string> = {
  strength: 'fuerza', speed: 'velocidad', agility: 'agilidad', endurance: 'resistencia', handling: 'manejo', passing: 'pase',
  tackling: 'placaje', blocking: 'bloqueo', positioning: 'colocación', awareness: 'visión', composure: 'temple', arcana: 'arcano',
};

/* ------------------------------------------------------------ names */

// All painted portraits are men, so every first name is a man's name for now.
export const NOMBRES: Record<Race, readonly string[]> = {
  Human: ['Gonzalo', 'Rodrigo', 'Tristán', 'Bruno', 'Álvaro', 'Darío', 'Alonso', 'Fernán', 'Sancho', 'Íñigo', 'Lope', 'Garcilaso', 'Bermudo', 'Ramiro', 'Tello', 'Nuño', 'Fadrique', 'Gaspar', 'Leandro', 'Martín'],
  Orc: ['Gorak', 'Thrag', 'Morg', 'Durgan', 'Urzok', 'Brakka', 'Korg', 'Brog', 'Hruk', 'Kraz', 'Grashnak', 'Ugluk', 'Zoggo', 'Murzog', 'Brugnak', 'Rakdush', 'Ghor', 'Skarbak'],
  Elf: ['Faelar', 'Thalen', 'Vaelis', 'Eryndor', 'Aelion', 'Cael', 'Ilmarin', 'Thranduil', 'Celebor', 'Aldarion', 'Finrael', 'Galdor', 'Lindir', 'Sorael', 'Elrohir', 'Taurion'],
  Dwarf: ['Borin', 'Durgin', 'Baldrico', 'Brokk', 'Orín', 'Brum', 'Thorvik', 'Gundar', 'Hagrim', 'Dolgrin', 'Barbaroc', 'Thrain', 'Kazdur', 'Ragnor', 'Grimbor', 'Fundin'],
  Goblin: ['Snik', 'Fizz', 'Zibbit', 'Gríbel', 'Kip', 'Razz', 'Nix', 'Tambal', 'Snark', 'Tik', 'Bogle', 'Esquirla', 'Pizco', 'Ratón', 'Gubbo', 'Zarpa', 'Chusco', 'Mizbit'],
  Troll: ['Grunk', 'Ugg', 'Brug', 'Mogmuk', 'Thoom', 'Drol', 'Grob', 'Krum', 'Rog', 'Thugga', 'Gruñón', 'Bonk', 'Murg', 'Glut', 'Pedrolo', 'Tronco'],
  Lizardkin: ['Sszar', 'Krizzt', 'Xak', 'Sskel', 'Zirrak', 'Xiss', 'Skra', 'Rizzt', 'Tsaka', 'Ssalvador', 'Kesh', 'Zahrak', 'Xolotl', 'Tzunk', 'Ssith'],
  Revenant: ['Vesper', 'Morrow', 'Malaquías', 'Mortis', 'Lázaro', 'Cuervo', 'Noctis', 'Eidolón', 'Mirto', 'Vhal', 'Osario', 'Sepulcro', 'Ánimo', 'Tumbal', 'Ceniciento', 'Orfeo'],
  Giantkin: ['Brakka', 'Karn', 'Torén', 'Garr', 'Brek', 'Harkan', 'Ymrik', 'Bergelmir', 'Skollen', 'Hrodgar', 'Thrym', 'Goliat', 'Atlante', 'Kolosso'],
};
/** First names used before v0.6 that are being retired (all portraits are men). Saves rename them on load. */
export const RETIRED_FIRST_NAMES = new Set(['Elena', 'Marisa', 'Inés', 'Ximena', 'Leonor', 'Valeria', 'Beatriz', 'Grusha', 'Rugga', 'Mogga', 'Aerith', 'Liora', 'Elowen', 'Sylra', 'Naeris', 'Faryn', 'Gimra', 'Thora', 'Dagna', 'Kelda', 'Hilda', 'Tziri', 'Mira', 'Ossa', 'Vala', 'Noma', 'Siv']);
export const APELLIDOS: Record<Race, readonly string[]> = {
  Human: ['Valdés', 'del Espino', 'Montenegro', 'Escudero', 'Robledo', 'Piedrahíta', 'Cuervo', 'Lanzagrís', 'Sotomayor', 'Albarracín'],
  Orc: ['Rompecráneos', 'Quiebrahuesos', 'Muerdehierro', 'Puñosangre', 'Pisabarro', 'Colmillotuerto', 'Machacamuelas', 'Tripadura'],
  Elf: ['Albacorriente', 'Susurraluna', 'Tejeastros', 'Vientoveloz', 'Ramaplata', 'Flechanoche', 'Hojalta'],
  Dwarf: ['Barbapiedra', 'Yelmohierro', 'Vetadeoro', 'Rencorviejo', 'Hondocavo', 'Manoyunque', 'Puñocobre'],
  Goblin: ['Dedoslistos', 'Pisaquedo', 'Silbarratas', 'Mechatorpe', 'Narizbarro', 'Mondadientes', 'Tapón'],
  Troll: ['Panzarroca', 'Rompepuentes', 'Huesogordo', 'Testapeña', 'Lomomusgo', 'Machacapiedras'],
  Lizardkin: ['Filoescama', 'Golpecola', 'Colmilloascua', 'Escamasol', 'Caparazón', 'Garramarisma'],
  Revenant: ['el Inquieto', 'Velosombrío', 'Cenizahueso', 'el Tardío', 'Penatriste', 'Sindescanso'],
  Giantkin: ['Puñopiedra', 'Zancalarga', 'Rompenubes', 'Nacidodepeña', 'Pasolargo', 'Manotrueno'],
};

/** Athlete nicknames: by position first, flavoured by trait when one fits. */
export const APODOS_ROL: Record<Role, readonly string[]> = {
  Bastion: ['El Yunque', 'La Muralla', 'El Armario', 'Portón', 'La Roca', 'Cerrojo', 'El Dique', 'Tres Puertas'],
  Breaker: ['El Ariete', 'La Trituradora', 'La Apisonadora', 'Mazazo', 'El Derribo', 'Rompetechos', 'El Alud', 'Tumbacarros'],
  Runner: ['La Centella', 'El Relámpago', 'Pies de Liebre', 'La Exhalación', 'Chispazo', 'El Cohete', 'Viento en Popa', 'Talones'],
  Thrower: ['Cien Codos', 'El Cañón', 'Brazo de Oro', 'La Catapulta', 'El Arquitecto', 'Mano de Seda', 'Ojo de Halcón', 'El Cartero'],
  Raider: ['El Halcón', 'La Sombra', 'Uñas', 'El Carroñero', 'Guante Blanco', 'La Garra', 'El Recaudador', 'Pellizco'],
  Trickster: ['El Ilusionista', 'Humo', 'La Anguila', 'El Truco', 'Jabón', 'Mil Caras', 'Ahora No', 'El Espejismo'],
};
export const APODOS_RASGO: Record<string, readonly string[]> = {
  'Hot-Headed': ['El Volcán', 'Mecha Corta'],
  'Showboat': ['El Espejo', 'Flashes'],
  'Iron Will': ['El Inquebrantable', 'Piedra Pómez'],
  'Relentless': ['Pila Eterna', 'Sin Freno'],
  'Reckless': ['Kamikaze', 'Sin Casco'],
  'Ice-Cold': ['Témpano', 'Nevera'],
  'Clutch Performer': ['Minuto Final', 'Don Último Segundo'],
  'Born Leader': ['El Capitán', 'La Brújula'],
  'Fan Favorite': ['El Niño Mimado', 'Gradas'],
  'Tactician': ['El Profesor', 'Pizarra'],
};

/* ------------------------------------------------------------ gifts and play styles */

export const RASGO_ES: Record<string, { nombre: string; efecto: string }> = {
  'Relentless': { nombre: 'Incansable', efecto: 'Apenas se cansa: ignora casi todo el desgaste del final y corre más cuando su equipo va perdiendo.' },
  'Showboat': { nombre: 'Fanfarrón', efecto: 'Consigue más jugadas grandes y les saca metros extra, pero pierde más balones.' },
  'Ice-Cold': { nombre: 'Sangre Fría', efecto: 'Mucho más preciso en los portazos, y casi nunca le roban un pase.' },
  'Undisciplined': { nombre: 'Indisciplinado', efecto: 'Propenso a salidas en falso y bloqueos ilegales: cinco metros y un intento perdidos.' },
  'Fan Favorite': { nombre: 'Ídolo de la Grada', efecto: 'Enciende a su afición: más ventaja en casa, y el club gana seguidores cada año.' },
  'Tactician': { nombre: 'Estratega', efecto: 'Ordena a los suyos: mientras está en el campo, toda la defensa lee mejor las jugadas.' },
  'Hard-Nosed': { nombre: 'Duro de Pelar', efecto: 'Gana los choques de pocos metros y en la línea de gol, en ataque y en defensa.' },
  'Iron Will': { nombre: 'Voluntad de Hierro', efecto: 'Se lesiona mucho menos, y cuando se lesiona se recupera antes.' },
  'Hot-Headed': { nombre: 'Cabeza Caliente', efecto: 'Comete faltas personales en defensa: regala diez metros y una nueva serie de intentos.' },
  'Clutch Performer': { nombre: 'Decisivo', efecto: 'Sube su nivel en el último cuarto y en las eliminatorias.' },
  'Born Leader': { nombre: 'Líder Nato', efecto: 'Toda la alineación juega un poco mejor mientras está en el campo.' },
  'Reckless': { nombre: 'Temerario', efecto: 'Consigue más KO, pero se lesiona muchísimo más, a veces con sus propios placajes.' },
};
export const HABILIDAD_ES: Record<string, { nombre: string; efecto: string }> = {
  'Ironhide': { nombre: 'Piel de Hierro', efecto: 'Chispa: anula una lesión en el momento en que ocurre.' },
  'Blinkstep': { nombre: 'Paso Fugaz', efecto: 'Chispa: se teletransporta entre la defensa y gana entre 15 y 25 metros seguros.' },
  'Grave Grip': { nombre: 'Garra de Tumba', efecto: 'Chispa (defensa): arranca el balón en un placaje y fuerza un cambio de posesión.' },
  'Perfect Spiral': { nombre: 'Espiral Perfecta', efecto: 'Chispa: un pase de 20 a 35 metros que no puede fallar ni ser robado.' },
  'Thundercharge': { nombre: 'Carga del Trueno', efecto: 'Chispa: una carrera corta o en la línea de gol que siempre gana los metros necesarios.' },
  'Second Wind': { nombre: 'Segundo Aire', efecto: 'Chispa: elimina todo el cansancio durante el resto del partido.' },
  'Trickster’s Luck': { nombre: 'Suerte del Pícaro', efecto: 'Chispa: convierte una jugada fallida en un éxito.' },
  'Iron Resolve': { nombre: 'Temple de Hierro', efecto: 'Chispa (defensa): una parada segura junto a la línea de gol.' },
  'Sure Hands': { nombre: 'Manos Seguras', efecto: 'Chispa: anula una pérdida de balón o un robo.' },
  'Bonebreaker': { nombre: 'Rompehuesos', efecto: 'Chispa (defensa): un placaje que deja KO seguro.' },
  'Last Breath': { nombre: 'Último Aliento', efecto: 'Definitiva: en las dos últimas posesiones, con el partido a un tanteo o menos, la ¡BRECHA! es segura.' },
  'Endless Run': { nombre: 'Carrera Infinita', efecto: 'Definitiva: cuando su equipo pierde en un momento clave, recorre el campo entero hasta la ¡BRECHA!.' },
  'Sky Lance': { nombre: 'Lanza del Cielo', efecto: 'Definitiva: cuando su equipo pierde en un momento clave, un pase desde donde sea que acaba en ¡BRECHA!.' },
  'Hand of Fate': { nombre: 'Mano del Destino', efecto: 'Definitiva: convierte un ¡PORTAZO! fallado en acierto.' },
  'Eternal Wall': { nombre: 'Muro Eterno', efecto: 'Definitiva (defensa): detiene en la línea de gol una ¡BRECHA! segura.' },
  'Rift Roar': { nombre: 'Rugido de la Grieta', efecto: 'Definitiva: el rival pierde todas sus chispas.' },
  'Ancestral Fury': { nombre: 'Furia Ancestral', efecto: 'Definitiva: si su equipo pierde en un momento clave, todos juegan mucho mejor el resto del partido.' },
};
/** Tier names for abilities, as players read them. */
export const NIVEL_ES = { basic: 'Básica', advanced: 'Avanzada', ultimate: 'Definitiva' } as const;
export const rasgo = (key: string) => RASGO_ES[key]?.nombre ?? key;
export const habilidad = (key: string) => HABILIDAD_ES[key]?.nombre ?? key;

export const FILOSOFIA_ES: Record<string, { nombre: string; resumen: string; lema: string }> = {
  'IRON WALL': { nombre: 'Muro de Hierro', resumen: 'Defensa primero, ataques lentos, y portazo en cuanto está a tiro.', lema: 'Aquí no pasa nada, ni el tiempo' },
  'SILVER ARROW': { nombre: 'Flecha de Plata', resumen: 'Mucho pase y mucha prisa.', lema: 'Más rápidos que nuestras excusas' },
  'STAMPEDE': { nombre: 'Estampida', resumen: 'Corre a través de ti y casi nunca se conforma con un portazo.', lema: 'Por encima, nunca alrededor' },
  'MISCHIEF': { nombre: 'Travesura', resumen: 'Jugadas de pizarra: grandes ganancias y pérdidas aún mayores.', lema: 'Ya estaba así cuando llegamos' },
  'CLOCKWORK': { nombre: 'Relojería', resumen: 'Poco riesgo, control del balón y casi ninguna pérdida.', lema: 'Puntualmente suficientes' },
  'SWARM': { nombre: 'Enjambre', resumen: 'Ritmo altísimo y presión defensiva sin descanso.', lema: 'Muchos codos, un solo propósito' },
};
export const filosofia = (key: string) => FILOSOFIA_ES[key.toUpperCase()] ?? FILOSOFIA_ES.CLOCKWORK;

/* ------------------------------------------------------------ the words of a match */

/** One line per thing that can happen on the field. The engine passes names; nothing here touches the dice. */
export const EV = {
  spark: (ability: string, text: string) => `¡${habilidad(ability).toUpperCase()}! ${text}`,
  ironhide: (n: string) => `${n} se sacude un golpe que debería haberle mandado a la enfermería.`,
  falseStart: (n: string) => `¡FALTA! ${n} se adelanta. Cinco metros atrás y una mirada asesina del árbitro.`,
  blinkstep: (n: string, g: number) => `${n} desaparece y reaparece ${g} metros más allá.`,
  thundercharge: (n: string, g: number) => `${n} se convierte en un trueno y arrolla ${g} metros entre la melé.`,
  spiral: (p: string, g: number, c: string) => `${p} lanza una espiral de ${g} metros que cae en manos de ${c} como si llegara por correo certificado.`,
  secondWind: (n: string) => `${n} se bebe un tónico brillante. El cansancio, desaparecido.`,
  ironResolve: (n: string) => `${n} clava los pies en la línea de gol. Por aquí no pasa nadie.`,
  sureHandsPass: (s: string, d: string) => `${s} le arranca el balón de los dedos a ${d}. No hay robo.`,
  interception: (d: string) => `¡ROBO! ${d} se queda con el balón. La grada pierde la cabeza, colectivamente.`,
  tricksterLuck: (n: string) => `La jugada estaba muerta. ${n} le guiña un ojo y resucita.`,
  bigplay: (n: string, g: number) => `¡${n} rompe la defensa y gana ${g} metros!`,
  breachPass: (p: string, c: string) => `¡BRECHA! ${p} encuentra a ${c} en la zona de anotación. ¡Cinco puntos!`,
  breachRun: (c: string, b: string) => `¡BRECHA! ${c} se estrella en la zona de anotación tras el bloqueo de ${b}. ¡Cinco puntos!`,
  aftershock: (club: string) => `¡RÉPLICA! ${club} suman uno más.`,
  sureHandsFumble: (c: string) => `A ${c} se le escapa el balón… y lo caza al vuelo. Posesión salvada.`,
  fumble: (c: string, d: string) => `¡A ${c} se le cae el balón tras un golpe demoledor de ${d}!`,
  /** The attacking side is recovered from this phrase in the replay; keep "FALTA PERSONAL" in it. */
  hotHeaded: (d: string) => `¡FALTA PERSONAL! ${d} sigue repartiendo después del pitido. Diez metros y nueva serie de intentos.`,
  graveGrip: (d: string, c: string) => `Una mano espectral sale del guante de ${d} y le arranca el balón a ${c}. ¡Cambio de posesión!`,
  bonebreaker: (d: string, c: string) => `${d} golpea a ${c} tan fuerte que la repetición necesita clasificación para adultos.`,
  knockout: (d: string, c: string) => `¡KO! ${d} aplasta a ${c} con un placaje espectacular y médicamente cuestionable.`,
  carriedOff: (c: string) => `${c} sale en camilla. La Dra. Plumilla pone cara de preocupación.`,
  limpsOff: (c: string) => `${c} se retira cojeando tras una mala caída.`,
  recklessSelf: (d: string) => `${d} placa con tanta temeridad que se lesiona a sí mismo.`,
  gate: (k: string) => `¡PORTAZO! ${k} la cuela entre los postes de hierro.`,
  gateMiss: (k: string) => `${k} falla el portazo. La mascota no disimula su decepción.`,
  overtime: (f: string) => `¡BRECHA DE ORO! ${f} lo gana en la prórroga.`,
  whistle: 'Termina un partido durísimo. Los comentaristas siguen discutiendo el reglamento.',
  ultimate: (ability: string, text: string) => `¡${habilidad(ability).toUpperCase()}! ${text}`,
  lastBreath: (n: string) => `${n} respira hondo, mira el reloj y cruza el campo entero. Nadie se atreve a tocarle.`,
  endlessRun: (n: string, g: number) => `${n} arranca y no para: ${g} metros, tres rivales por el suelo y la grada en pie.`,
  skyLance: (p: string, c: string, g: number) => `${p} lanza el balón ${g} metros hacia el cielo y cae, como un rayo, en las manos de ${c}.`,
  handOfFate: (n: string) => `El portazo de ${n} iba fuera. Una mano invisible lo empuja entre los postes.`,
  eternalWall: (d: string, c: string) => `${c} ya celebraba la brecha. ${d} se planta en la línea y el mundo entero se detiene.`,
  riftRoar: (n: string, rival: string) => `${n} ruge y la Grieta responde: ${rival} se quedan sin chispas.`,
  ancestralFury: (n: string, club: string) => `${n} invoca a los ancestros. ${club} juegan poseídos el resto del partido.`,
};
