# GRIMORIO

Juego cooperativo dark-fantasy por turnos en navegador. Una party de héroes
recorre una campaña lineal de 4 capítulos enfrentando enemigos, eventos y jefes.
El Maestro de Ceremonias es siempre la CPU. Sin backend: persistencia en
`localStorage`.

## Stack

- **React 19 + Vite + Zustand**
- Motor de juego en **JS puro** (`src/core/` + `src/systems/`), agnóstico de React
- Tests headless con `node --test`

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción → dist/ (base /Grimorio/ para GitHub Pages)
npm run preview  # previsualizar el build
npm test         # tests headless del motor
```

## Estructura

```
src/
  core/        motor puro: state, save (3 slots), rng (semilla), events
  systems/     sistemas de juego (board, combat, ... — se llenan por milestone)
  data/        CONTENIDO (no lógica): heroes, enemies, chapters, decks, ...
  store/       store Zustand que envuelve el motor (la UI pasa por aquí)
  ui/          componentes React (render desde estado)
assets/img/    arte y prompts de generación
docs/          diseño, arquitectura, esquemas, roadmap, cuestionario
tests/         tests headless del motor
```

## Principio rector

**Motor vs contenido.** La lógica (`core/`, `systems/`) nunca contiene historia
ni balance hardcodeado. Todo el contenido vive en `src/data/` siguiendo los
esquemas de `docs/CONTENT_SCHEMA.md`. Agregar contenido = editar datos.

## Estado

Ver `docs/ROADMAP.md` (milestones M0–M7) y `docs/QUESTIONNAIRE.md` (decisiones).

- **M0 ✅** — Andamiaje: motor (state/save/rng/events), data con esquemas,
  store Zustand, pantalla de título con 3 slots, tests headless.
- **M1 ✅** — Tablero y bucle de mapa: `systems/board.js` (avance lineal),
  Cap.1 completo en datos (16 nodos), render del mapa en React (pergamino,
  sendero, nodos data-driven, peón) y recorrido nodo a nodo.
- **M2 ✅** — Combate: `systems/combat.js` (dados de símbolos, frente/
  retaguardia, hechizos, botín) + `systems/enemyAI.js` (weakest/tank/swarm/
  summon/boss). Selección de party (1–4), `CombatScreen`, enemigos del Cap.1,
  3 dificultades. Combate serializable y reanudable.
- **M3 ✅** — Subsistemas: `decks.js` (robo/descarte/reciclado), `curses.js`
  (maldiciones que penalizan en combate: diceReduce, blocksSpells,
  onIncomingDamage), `pets.js` (bono de dados y reducción de Perdición),
  `doom.js` (track de Perdición). Eventos con elecciones y chequeos de dados
  (`EventScreen`), mazo de comportamiento de Gulrath y Cap.1 jugable de punta a
  punta con jefe. Tests headless de subsistemas.
- **M4 ◐** — Progresión y campamento: `progression.js` (equipo que mejora dados/
  vida, vida persistente entre nodos, descanso, tienda). Combate arranca desde la
  vida persistente y la conserva al terminar (caídos reviven a 1, sin permadeath).
  Pantalla de tienda (`ShopScreen`) y nodos de descanso. Save subido a v2 con
  migración. Tests de progresión. *Pendiente: transición Cap.1 → Cap.2 (necesita
  el contenido del Cap.2 de M5).*
- **M5 ◻** — Contenido completo: capítulos 2–4, jefes, roster e ítems/cartas.

## Documentación

Empezar por `docs/CLAUDE.md`, luego `docs/GAME_DESIGN.md`,
`docs/ARCHITECTURE.md`, `docs/CONTENT_SCHEMA.md` y `docs/ROADMAP.md`.
