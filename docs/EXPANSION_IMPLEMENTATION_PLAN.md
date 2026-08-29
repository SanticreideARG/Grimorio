# GRIMORIO — Plan de implementación de «Ecos del Vacío»

Este documento convierte el diseño de `EXPANSION_ECOS_DEL_VACIO.md` y
`BOARD_ENGINE_V2.md` en un orden de trabajo verificable. Los IDs, estadísticas y
decisiones narrativas siguen viviendo en esos documentos; aquí se define cómo
llevarlos al juego sin romper la campaña actual.

## Principios de integración

- La campaña base debe poder terminar igual que hoy sin instalar ni jugar la
  expansión.
- Cada fase debe quedar jugable y testeable antes de comenzar la siguiente.
- Los assets definitivos usan IDs estables y formatos optimizados; los candidatos
  viven en `assets/candidates/` y no se incluyen en el bundle.
- El modo debug nunca debe modificar un slot normal ni quedar accesible por
  accidente en una build pública.
- La coherencia visual se decide con referencias pequeñas antes de generar la
  familia completa.

## Fase 1 — Assets visuales

**Estado agosto 2026:** lote de expansión publicado; colección completa de seis
fondos V2, siete símbolos, peón y brújula integrada. Los másteres y rollbacks se
conservan en `assets/candidates/`. Pendiente únicamente el recorrido visual de
capítulos 2–6 y ajustes de coordenadas que surjan de esos composites.

### 1.1 Referencias de estilo

Estado inicial: generadas cuatro imágenes candidatas que fijan la dirección:

- `assets/candidates/board/map1-v2.png`: lenguaje cartográfico del tablero.
- `assets/candidates/nodes/combat-v2.png`: lenguaje de iconos de nodo.
- `assets/candidates/cap5/enemies/ahogado_sal.png`: familia visual de Costa.
- `assets/candidates/cap5/bosses/leviatan_sal_negra.png`: escala y acabado de jefe.

Antes de producir en serie hay que aceptar o corregir estas referencias. Después,
cada familia se genera usando su referencia regional, no la imagen anterior de la
cadena, para evitar deriva de estilo.

### 1.2 Orden de producción

1. Capítulo 5: enemigos, jefe, derrota, héroe, eventos y recompensas.
2. Capítulo 6: enemigos, jefe, derrota, héroe, eventos y recompensas.
3. Tablero: seis fondos, siete nodos, peón de party y rosa de los vientos.
4. Conversión final a WebP/PNG según transparencia y registro en `assets.js`.

### 1.3 Criterios de aceptación

- Cartas en relación 4:3, personaje completo y silueta legible en miniatura.
- Fondos de mapa 16:9, sin caminos, nodos, texto ni elementos de interfaz
  horneados en la ilustración.
- Iconos con alfa real y lectura clara entre 40 y 76 px.
- Paleta Costa: negro húmedo, nácar, verde petróleo y ámbar.
- Paleta Monasterio: azul noche, oro viejo, rojo eclipse y blanco lunar.
- Ningún candidato se sustituye sobre un asset existente hasta ser aprobado.

## Fase 2 — Diálogos y narrativa jugable

Crear datos separados de la lógica con estas familias:

- apertura y cierre de cada capítulo;
- introducción, transición de fase, victoria y derrota de cada jefe;
- texto, elecciones y consecuencias de los diez eventos;
- conversaciones de descanso y tienda;
- barks de Mara y Elian: entrada, daño, crítico, curación, aliado caído,
  victoria y reacción regional;
- epílogos para destruir, conservar o usar la semilla del Vacío.

Cada línea tendrá `speaker`, `text`, `portrait`, `condition` opcional y un ID
estable. Las consecuencias continuarán expresándose mediante `flags`, para que
texto y reglas puedan probarse por separado. Se añadirá una prueba que compruebe
referencias rotas de speakers, portraits, eventos y flags.

## Fase 3 — Modo debug transversal

Conviene implementarlo al terminar los assets y antes de integrar los diálogos:
permitirá recorrer rápidamente todo lo que venga después.

### Activación segura

- Disponible si `import.meta.env.DEV` es verdadero o si la build fue creada con
  `VITE_ENABLE_DEBUG=true`.
- Atajo `Ctrl+Shift+D` para abrir o cerrar el panel; también un botón discreto en
  el menú sólo cuando debug está permitido.
- Al entrar, se crea una sesión efímera con `activeSlot: null`; nunca hay autosave
  local o cloud sobre los tres slots normales.
- El panel muestra permanentemente una cinta `DEBUG — NO SE GUARDARÁ`.

### Primera versión

- Crear una party de prueba o reutilizar la elegida.
- Selector de capítulo y nodo con nombre, tipo e ID.
- `Saltar al nodo`: cancela combate/evento/tienda, cambia a mapa, marca como
  resueltos los nodos anteriores del capítulo y configura un checkpoint válido.
- `Entrar al encuentro`: abre directamente combate, evento, descanso o tienda del
  nodo seleccionado usando las mismas acciones públicas del store.
- Semilla RNG editable y botón para reiniciar el nodo.
- Controles mínimos: curar party, oro, Perdición y desbloqueos narrativos.

### Contrato de estado

El estado de debug de la interfaz (`isOpen`, selección y controles) no se
serializa. El salto produce una copia válida de `createNewGame`, inicializa party,
HP y mazos con las funciones existentes, y sólo entonces modifica
`chapterIndex`, `nodeIndex`, `visited`, `checkpointNodeIndex` y `view`. No se
escriben estados parciales a mano en componentes React.

Pruebas obligatorias:

- una build normal no renderiza ni activa debug;
- abrir debug no toca localStorage ni cloud;
- saltar a cualquier nodo genera un estado válido y reproducible;
- iniciar un encuentro desde debug usa el contenido real del nodo;
- salir de debug descarta la sesión y vuelve al menú.

## Fase 4 — Ataques y animaciones

### Arquitectura

Añadir a ataques y hechizos un identificador declarativo `fxId`; la UI consulta
un registro de efectos y no contiene condiciones por nombre de carta. Cada efecto
tendrá capas separadas: anticipación, proyectil/trazo, impacto, estado y números.
Debe respetar `prefers-reduced-motion` y disponer de un fallback breve.

Familias nuevas:

- **Marea/sal:** barrido líquido oscuro, cristales que crecen y retroceden.
- **Nácar:** destello radial frío con borde cálido.
- **Eclipse:** disco de sombra, corona roja y caída momentánea de exposición.
- **Tiempo/campana:** anillos concéntricos, agujas fantasma y pulso de impacto.
- **Vacío:** distorsión corta y partículas que convergen, sin flashes agresivos.

Orden: prototipo de una animación por familia, validación de legibilidad y coste,
luego variantes por intensidad. Los eventos del bus siguen siendo la fuente de
verdad; las animaciones nunca retrasan ni deciden la resolución del combate.

## Fase 5 — Mejorar las previas

Las previas deberían ayudar a decidir, no revelar toda la solución:

1. Sustituir la lista textual por miniaturas de formación: frente y retaguardia.
2. Mostrar cantidad, élite/jefe y etiquetas de amenaza (`enjambre`, `maldición`,
   `invoca`, `tanque`) con iconos consistentes.
3. Estado de información: silueta para enemigos aún no descubiertos y ficha
   completa tras el primer encuentro.
4. Panel de detalle al pulsar una miniatura: HP estimado, comportamiento conocido,
   resistencias y botín posible; nunca el mazo exacto de un jefe.
5. Antes de entrar, comparar de forma visual HP actual de la party, pociones y
   peligro del nodo; la decisión principal queda siempre visible.
6. En móvil, usar una hoja inferior; en escritorio, un panel lateral. Ambos leen
   el mismo modelo `EncounterPreview`.
7. Precargar sólo retratos de la preview actual y la siguiente para evitar que el
   arte nuevo aumente demasiado el arranque.

## Fase 6 — Motor del tablero V2

Implementar el contrato de `BOARD_ENGINE_V2.md`: fondo ilustrado sin ruta, ruta
SVG/HTML generada por anclas normalizadas, nodos interactivos sobre ella y peón de
party animado. Empezar con los capítulos actuales para detectar regresiones y
añadir luego los capítulos 5 y 6.

Entregables: esquema de mapa, renderer, navegación teclado/táctil, estados de
nodo, responsive, precarga progresiva y pruebas de anclas. El mapa debe seguir
siendo navegable si una imagen falla o si el usuario reduce movimiento.

## Fase 7 — Nuevo display de batallas

> El rediseño de reglas propuesto posteriormente está especificado en
> `COMBAT_ENGINE_V2_DESIGN.md`. Por ahora es documentación y no altera el motor.

El motor de reglas se conserva salvo hooks explícitamente aprobados. El rediseño
se concentra en presentación:

- escenario regional por capas;
- formación frontal/trasera comprensible;
- foco claro en héroe activo, dados, objetivos válidos y cola enemiga;
- espacio estable para animaciones, barks y estados sin saltos de layout;
- resumen de ronda y accesibilidad para color, movimiento y teclado;
- layout adaptable de una sola columna en móvil y campo lateral en escritorio.

Primero se construye un adaptador de vista a partir del estado de combate actual;
después se reemplaza el display por partes. Así las reglas existentes y sus tests
continúan protegiendo el juego durante el cambio visual.

### Tarea pendiente — Cards de selección de héroe

- Sustituir el retrato contenido en un recuadro por el arte del héroe como fondo
  completo de cada card.
- Mantener el rostro y la silueta principal dentro de una zona segura para los
  recortes responsive.
- Aplicar un degradado inferior y, si hace falta, una viñeta lateral para que
  nombre, rol, fila y estadísticas conserven contraste sobre cualquier retrato.
- Diferenciar selección, límite de party, héroe bloqueado y foco de teclado sin
  depender únicamente del color.
- Conservar click derecho, botón de información y long-press sin convertirlos en
  zonas ambiguas.
- Validar el roster completo en escritorio, tablet y móvil; los retratos faltantes
  deben conservar un fallback legible.

## Definition of Done de la expansión

- Los seis capítulos se pueden recorrer desde una partida nueva y desde debug.
- Los capítulos 1–4 y sus finales no cambian sin intención.
- Todo asset referenciado existe, está optimizado y tiene licencia/origen trazable.
- No hay diálogo, nodo, evento, enemigo, recompensa ni `fxId` huérfano.
- Debug no existe en la build pública por defecto y jamás toca slots normales.
- Tests unitarios, integración, build y recorrido manual de ambos escenarios pasan.
