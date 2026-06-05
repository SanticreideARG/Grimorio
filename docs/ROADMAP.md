# GRIMORIO — Roadmap de construcción

> Fases para Claude Code. Cada fase termina en algo ejecutable y probado. No
> empezar M2 sin cerrar las decisiones 🔲 que esa fase necesita (ver QUESTIONNAIRE).

## M0 — Andamiaje y datos (requiere: Q-STACK)
- Estructura de carpetas de ARCHITECTURE.md.
- `core/state.js`, `core/save.js` (slots + autosave + versión), `core/rng.js` (semilla).
- Cargar `data/` vacío con los esquemas de CONTENT_SCHEMA.md.
- **Entregable:** app que arranca, crea/guarda/carga partida vacía.

## M1 — Tablero y bucle de mapa (requiere: Q-RAMIFICACION)
- `systems/board.js`: avance lineal por nodos, resolución por tipo.
- Render del mapa con imagen de capítulo + nodos + peón.
- Capítulo 1 completo en datos (~16 nodos).
- **Entregable:** recorrer el Cap.1 resolviendo nodos no-combate.

## M2 — Combate (requiere: Q-COMBATE-POS)
- `systems/combat.js` (dados de símbolos, rondas, acciones).
- `systems/enemyAI.js` (comportamientos: weakest/tank/curse/summon/swarm).
- Botín al ganar. Tests headless de combate.
- **Entregable:** combates jugables y balanceados en Cap.1.

## M3 — Subsistemas (requiere: Q-MALDICION, Q-MASCOTAS, Q-MAZOS)
- `decks.js`, `curses.js`, `pets.js`, `doom.js`.
- Eventos con elecciones y (opcional) chequeos.
- **Entregable:** Cap.1 completo de punta a punta con jefe (mazo de comportamiento).

## M4 — Progresión y campamento (requiere: Q-PROGRESION, Q-DERROTA)
- `progression.js` (nivel / dice-building / equipo).
- Campamento + tienda entre capítulos. Manejo de derrota/reintento.
- **Entregable:** transición Cap.1 → Cap.2 con progreso persistente.

## M5 — Contenido completo
- Capítulos 2, 3, 4 en datos + jefes. Roster de héroes completo.
- Todas las cartas, ítems, magias, pociones, maldiciones, mascotas.
- **Entregable:** campaña completa jugable (single-player).

## M6 — Multijugador hotseat (requiere: Q-MODO, Q-PARTY-REPARTO)
- `turn.js` con `ownerId` por héroe y bloqueo de input por jugador.
- UI de "turno de [jugador]". (Online queda como fase futura aparte.)

## M7 — Pulido
- Animación de tirada de dados, transiciones, feedback.
- Audio 🔲 Q-AUDIO. Accesibilidad 🔲 Q-A11Y. i18n 🔲 Q-IDIOMA.
- Balance final con tests.

## Futuro (post-v1)
Multiplayer online (backend Laravel/Reverb), editor de capítulos, modo roguelite.
