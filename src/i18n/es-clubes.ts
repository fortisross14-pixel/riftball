// Club identities: stadium, mascot, chant, founding year and legend, and a club trait with a real effect.
// Everything is chosen by a hash of the club, never by the world's dice, so it never changes a result
// by itself (only the trait's effect does, in the engine).
import { mascotName, pickLine } from './es-cronica';

export type ClubTraitKey = 'fortress' | 'academy' | 'cursed' | 'loud' | 'coldblood';
export type ClubIdentity = {
  stadium: { name: string; nickname: string };
  mascot: { name: string; species: string; personality: string };
  chant: string;
  founded: number;
  legend: string;
  trait: ClubTraitKey;
};

export const CLUB_TRAIT_ES: Record<ClubTraitKey, { nombre: string; icono: string; efecto: string }> = {
  fortress: { nombre: 'Fortaleza', icono: '♜', efecto: 'Su estadio intimida: juega con más ventaja en casa.' },
  academy: { nombre: 'Cantera', icono: '❦', efecto: 'Sus novatos llegan con más techo que los de nadie.' },
  cursed: { nombre: 'Malditos en finales', icono: '☠', efecto: 'En las finales, el rival juega un poco mejor. Nadie sabe por qué.' },
  loud: { nombre: 'Afición ruidosa', icono: '♫', efecto: 'Con tanto ruido en su estadio, los visitantes cometen más faltas.' },
  coldblood: { nombre: 'Sangre fría', icono: '❄', efecto: 'Sus pateadores aciertan más portazos.' },
};
const TRAITS: ClubTraitKey[] = ['fortress', 'academy', 'cursed', 'loud', 'coldblood'];

/** Play-style icons, by philosophy key. */
export const ESTILO_ICONO: Record<string, string> = {
  'IRON WALL': '▣', 'SILVER ARROW': '➶', STAMPEDE: '⇶', MISCHIEF: '✦', CLOCKWORK: '⧗', SWARM: '⁂',
};

/** Stadium nicknames: twelve per country, one per club, in the country's element. */
const APODOS_ESTADIO: readonly (readonly string[])[] = [
  ['La Cantera Vieja', 'El Yunque Mayor', 'La Olla de Piedra', 'El Bosque Hueco', 'La Fosa de los Lamentos', 'El Musgal', 'La Zarza', 'La Mina Honda', 'La Atalaya', 'El Túmulo', 'El Círculo de Runas', 'La Pedrera'],
  ['El Caldero', 'La Fragua', 'El Cráter', 'La Boca del Dragón', 'El Brasero', 'La Azufrera', 'El Nido de Fénix', 'El Horno', 'La Escoria', 'La Caldera', 'El Carbonal', 'El Pedernal'],
  ['El Nido', 'La Veleta', 'El Mirador de las Nubes', 'El Ojo del Vendaval', 'La Percha', 'El Torreón del Céfiro', 'La Tronada', 'La Bruma', 'La Cometa', 'El Remolino', 'El Susurro', 'La Vela Mayor'],
  ['El Pozo', 'La Corriente', 'El Arrecife', 'La Galerna', 'El Remanso', 'La Encrucijada', 'La Ostra', 'La Cascada', 'La Estela', 'El Embarcadero', 'El Naufragio', 'La Isla'],
];
const TIPO_ESTADIO = ['Estadio', 'Coliseo', 'Arena', 'Campo', 'Anfiteatro'];

const ESPECIES = ['un topo con casco', 'un dragoncito de trapo', 'una gárgola con bufanda', 'un pez con piernas', 'un búho insomne', 'un cangrejo con capa', 'una piedra con ojos', 'un fénix de peluche', 'un tejón muy serio', 'una nube enfadada'];
const PERSONALIDADES = ['gruñón', 'optimista sin motivo', 'dramático', 'filósofo de grada', 'glotón', 'supersticioso', 'chismoso', 'competitivo hasta en el bingo'];

const CANTICOS: readonly ((nick: string, city: string) => string)[] = [
  (n) => `¡Oé, oé, oé, que vienen los ${n}!`,
  (n, c) => `¡Que tiemble el mundo, que tiemble ${c}, que esto es de los ${n}!`,
  (n) => `¡${n}, ${n}, hasta que se caiga el estadio!`,
  (n) => `¡No hay brecha que se nos resista, somos ${n} y somos artistas!`,
  (n, c) => `¡De ${c} a la Grieta, los ${n} no se están quietos!`,
  (n) => `¡Uno, dos y tres, los ${n} otra vez!`,
  (n) => `¡Ni lluvia ni dragones, los ${n} son campeones!`,
  (n, c) => `¡${c} canta, ${c} grita, los ${n} nunca se agitan!`,
];

const FUNDADORES = ['un herrero sordo', 'tres pescadores aburridos', 'una abuela muy competitiva', 'un mago jubilado', 'un ogro arrepentido', 'dos hermanos que no se hablaban', 'un posadero con deudas', 'un caballero sin caballo'];
const HECHOS = [
  'perdió una apuesta y tuvo que fundar un club',
  'quería un deporte en el que estuviera permitido gritar',
  'confundió un pergamino de reglas con una receta de cocina',
  'buscaba una excusa para no ir a trabajar los domingos',
  'vio un balón caer de la Grieta y decidió que era una señal',
  'necesitaba algo que hacer con cuarenta camisetas que le sobraban',
];
const REMATES = [
  'Las primeras porterías fueron dos puertas robadas.',
  'El primer partido duró tres días porque nadie sabía cómo acabarlo.',
  'El acta fundacional está firmada con una huella de pata.',
  'Todavía conservan el primer balón. Huele fatal.',
  'La primera mascota fue una cabra. Fue despedida por morder al árbitro.',
  'El escudo original era un dibujo de un niño de seis años. Nadie se ha atrevido a cambiarlo del todo.',
];

/** A club's whole identity, from its id and art key. Stable for the life of the world. */
export function clubIdentity(team: { id: string; artKey: string; city: string; nickname: string; region: number }, indexInCountry: number): ClubIdentity {
  const seed = `${team.id}:${team.artKey}`;
  const chant = pickLine(CANTICOS, `${seed}:chant`)(team.nickname, team.city);
  return {
    stadium: { name: `${pickLine(TIPO_ESTADIO, `${seed}:stadium`)} de ${team.city}`, nickname: APODOS_ESTADIO[team.region]?.[indexInCountry % 12] ?? 'El Campo' },
    mascot: { name: mascotName(team.id), species: pickLine(ESPECIES, `${seed}:species`), personality: pickLine(PERSONALIDADES, `${seed}:mood`) },
    chant,
    founded: 700 + (Number.parseInt(pickLine(['13', '57', '91', '128', '203', '277', '341', '402', '455', '488'], `${seed}:year`), 10) % 490),
    legend: `Fundado por ${pickLine(FUNDADORES, `${seed}:founder`)} que ${pickLine(HECHOS, `${seed}:deed`)}. ${pickLine(REMATES, `${seed}:twist`)}`,
    trait: pickLine(TRAITS, `${seed}:trait`),
  };
}

export const MASCOT_SAYS = [
  (m: string) => `${m} ha declarado que «esto ya lo veía venir desde el calentamiento».`,
  (m: string) => `${m} se ha negado a bailar en el descanso como protesta por el arbitraje.`,
  (m: string) => `${m} opina que el equipo debería pensar más y correr menos. Nadie le ha preguntado.`,
  (m: string) => `${m} ha pedido un aumento de sueldo. Cobra en caramelos.`,
  (m: string) => `${m} ha dado tres volteretas y se ha mareado. Dice que ha valido la pena.`,
];

export type AnniversaryCtx = { club: string; founded: number; legend: string; season: number; stadium: string };
export const ANNIVERSARY: readonly ((c: AnniversaryCtx) => string)[] = [
  (c) => `${c.club} celebran un nuevo aniversario: fueron fundados en el año ${c.founded} de la Grieta. ${c.legend} La fiesta será en ${c.stadium}.`,
  (c) => `Hoy se recuerda la fundación de ${c.club} (año ${c.founded} de la Grieta). ${c.legend}`,
];
export type CurseCtx = { club: string; nick: string; finals: number; mascot: string };
export const CURSE: readonly ((c: CurseCtx) => string)[] = [
  (c) => `Otra final, otra derrota: ${c.club} ya suman ${c.finals} finales perdidas. La maldición sigue viva y ${c.mascot} ha encendido una vela.`,
  (c) => `«Malditos en finales», dicen en la grada. ${c.club} vuelven a caer cuando más importaba (${c.finals} finales perdidas). Una bruja local ya ha enviado su presupuesto.`,
];
