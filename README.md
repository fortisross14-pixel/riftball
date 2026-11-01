# RIFTBALL — la Crónica del Mundo

Un simulador de un mundo deportivo de fantasía que se escribe solo. Tú pasas las páginas, eliges qué partidos ver y lees lo que pasa. Hecho con Vite, React 19 y TypeScript. **Sin servidor ni claves de API**: todo funciona en el navegador, también sin conexión.

*A self-writing fantasy sports world, in Spanish. Vite + React 19 + TypeScript, no backend.*

## Cómo arrancarlo

Necesita Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite (normalmente `http://localhost:5173`).

Para publicar:

```bash
npm test          # todas las pruebas (tarda varios minutos)
npm run build     # comprueba los tipos y genera dist/
npm run preview
```

`vite.config.ts` usa `base: './'`, así que `dist/` funciona en GitHub Pages y en subcarpetas. Al hacer push a `main`, el flujo de GitHub Actions ejecuta `npm test`, compila y publica.

## Pruebas: rápidas y completas

| Orden | Qué ejecuta | Tiempo aprox. |
|---|---|---|
| `npm run test:fast` | Motor, etapas y eventos, guardado/importación, arte. Sin simulaciones largas. | unos segundos |
| `npm test` | Todo lo anterior más las simulaciones largas: 10 y 30 temporadas, 5 semillas, igualdad de los partidos y variedad de la crónica. | varios minutos |

Durante el desarrollo usa `npm run test:fast`; ejecuta `npm test` antes de publicar.

## Los primeros cinco minutos

1. La primera vez, un recorrido de cuatro pasos te explica lo básico (se puede saltar).
2. En la **Crónica**, el recuadro «Qué pasa ahora» te dice en qué punto de la temporada estás y cuál es el próximo evento.
3. Pulsa el botón principal, **«Jugar jornada 1»**. Siempre dice exactamente qué va a pasar.
4. Pulsa **«Simular hasta el próximo evento»**: juega la liga y se detiene en la presentación de las **Finales Nacionales**, sin saltarse nada.
5. En el evento, elige un pronóstico (ganas *monedas de la Grieta* si aciertas), pulsa **«Ver partido»** para verlo en directo o **«Resultado rápido»**. El calendario no avanza hasta que se juegan todos los partidos.
6. Sigue por la **Copa del Mundo**, las **Semifinales**, **la Gran Final** y la **Gala de premios**, donde se revela cada premio uno a uno. Después llegan el mercado, la pretemporada y una temporada nueva.

## Cómo es una temporada

30 semanas: 22 jornadas de liga (ida y vuelta, 12 clubes por país), semifinales nacionales (semana 23), **Finales Nacionales** (24), **Copa del Mundo** en dos grupos (25), **Semifinales** (26), **la Gran Final** (27), **Gala de premios** (28), **mercado** (29) y **pretemporada** (30). Los eventos en negrita detienen el calendario hasta completarse.

**Formas de anotar:** ¡BRECHA! (5 puntos), ¡RÉPLICA! (1 punto extra tras una brecha) y ¡PORTAZO! (2 puntos, una patada entre los postes). Otras palabras del juego: ¡CHISPA! (habilidad de un solo uso), ¡KO! y ¡ROBO!. Pasa el cursor o toca las palabras subrayadas para ver el glosario.

## Lo que hay

- **48 clubes en cuatro países elementales** (Pedravelo, Piraforte, Altonido y Talasa), **720 atletas de nueve pueblos**, con apodos que se ganan con grandes temporadas.
- **Partido en directo a pantalla completa**: marcador, reloj, posesión, inercia, el campo, las últimas cinco jugadas, dos comentaristas y llamadas con el retrato del protagonista en cada gran jugada. Velocidad 1×/2×/4×, «Ir al final» y marcador oculto hasta el saque inicial. Al terminar: probabilidad de victoria, jugada del partido, declaraciones, estadísticas, jugadores y jugadas.
- **Partidos igualados**: los equipos que pierden por mucho arriesgan y los que ganan por mucho protegen la ventaja. Alrededor de un tercio de los partidos se decide por 6 puntos o menos, y uno de cada diez por 20 o más.
- **Una crónica viva**: más de 70 plantillas de noticias con datos reales, personajes recurrentes (El Comisionado, el Viejo Grimbaldo, la Dra. Plumilla y las mascotas), derbis, rachas, récords, dinastías, sequías y eventos raros (tormentas de la Grieta, dragones, huelgas de árbitros goblins) con efectos reales.
- **Atletas, Clubes, Estadísticas e Historia** con trayectorias, palmarés, cara a cara con el rival, récords y el Salón de las Leyendas.
- **Guardado automático** en IndexedDB, exportación e importación en JSON, y protección si otra pestaña escribe a la vez.

## Novedades de la v0.6

- **Las estrellas deciden**: los Legendarios y Generacionales tocan más balón, el mejor titular cuenta doble en la fuerza del equipo, dan un aura de temple en los momentos clave y crecen más rápido. Los clubes con una estrella titular llegan a la final nacional unas 2,5–3 veces más que el resto, pero los favoritos siguen perdiendo casi un tercio de las eliminatorias. Contra las dinastías, tras ganar el título nacional, un club rico del país ficha a la figura del campeón.
- **Habilidades por rareza**: Básicas (Común y Profesional), Avanzadas (Élite y Épico) y siete **Definitivas** nuevas, solo para Legendarios y Generacionales: Último Aliento, Carrera Infinita, Lanza del Cielo, Mano del Destino, Muro Eterno, Rugido de la Grieta y Furia Ancestral. Tienen carga propia, solo saltan en momentos clave, paran la repetición con un callout casi a pantalla completa y deciden alrededor de un 12 % de los partidos igualados.
- **El fondo del retrato muestra la rareza**: pergamino, verde, azul, morado (Épico), dorado con rayos y carmesí con borde iridiscente, en todas partes.
- **Partido en móvil vertical**: una columna con scroll, el marcador fijo arriba y los controles al alcance del pulgar. El menú se desliza en pantallas estrechas.
- **Nombres**: todos los retratos pintados son masculinos, así que por ahora solo hay nombres masculinos (149 en total). Las partidas antiguas cambian los nombres retirados al cargarlas.
- **Clubes con personalidad**: estadio con apodo, mascota con carácter, cántico, año de fundación, leyenda fundacional y un **rasgo con efecto real** (Fortaleza, Cantera, Malditos en finales, Afición ruidosa, Sangre fría). Sus colores aparecen en el escudo, la clasificación, el marcador y las celebraciones. La ficha del club tiene estantería de trofeos, leyendas del club y una línea de temporadas.
- Herramientas de medida: `npx tsx scripts/stars.ts`, `scripts/ultimates.ts` y `scripts/margins.ts`.

## Guardado y partidas antiguas

El mundo se guarda en el navegador después de cada cambio. Si borras los datos del navegador o usas una ventana privada, puedes perderlo: **exporta una copia** desde Ajustes de vez en cuando.

Las partidas de versiones anteriores (el mundo de 80 clubes, o los mundos de 48 clubes con nombres en inglés) no se pueden cargar sin romperse. El juego lo detecta y muestra la pantalla «Esta crónica es de una versión antigua», con **Exportar** y **Empezar un mundo nuevo**.

Cada mundo es determinista: la misma semilla y las mismas decisiones dan siempre los mismos resultados.

## Rendimiento

La simulación y el guardado se ejecutan en un Web Worker, así que la página no se congela al jugar. El arte se sirve en WebP con miniaturas para listas, las texturas son imágenes pequeñas ya horneadas y la animación de pasar página es corta, opcional (Ajustes) y nunca se usa en pantallas táctiles ni con movimiento reducido.

## Archivos clave

- `src/engine.ts`: generador del mundo, motor de partidos, calendario, etapas que detienen el calendario, pronósticos y eventos del mundo.
- `src/chronicle.ts`: historias, récords, derbis, dinastías, sequías y apodos.
- `src/i18n/es.ts`: todo el texto de la interfaz. `src/i18n/es-mundo.ts`: nombres, clubes y frases del partido. `src/i18n/es-cronica.ts`: plantillas de noticias y personajes.
- `src/game/`: estado del mundo (`useWorld.ts`), el worker de simulación (`sim.worker.ts`, `simCore.ts`, `simClient.ts`), el siguiente paso (`nextStep.ts`), datos del partido (`matchday.ts`) y rutas.
- `src/screens/`: Crónica, Torneos, Partidos, Atletas, Clubes, Estadísticas, Historia, Ajustes, el evento (`Stage.tsx`) y el partido (`ContestFolio.tsx`).
- `src/art/registry.ts` y `src/art/raster/`: escudos y retratos. Las fuentes PNG están en `raster/crests` y `raster/portraits`; `node scripts/bake-art.cjs` genera las versiones WebP en `raster/web` y las texturas en `src/styles/tex` (necesita Chrome y `playwright-core`).
- `scripts/margins.ts` y `scripts/stories.ts`: informes de igualdad de los partidos y de variedad de la crónica.
- Pruebas: `src/engine.test.ts`, `src/stage.test.ts`, `src/storage.test.ts`, `src/art.test.ts` (rápidas) y `src/engine.slow.test.ts` (largas).
