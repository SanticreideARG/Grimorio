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
- **M1 ◻** — Tablero y bucle de mapa (Cap.1).

## Documentación

Empezar por `docs/CLAUDE.md`, luego `docs/GAME_DESIGN.md`,
`docs/ARCHITECTURE.md`, `docs/CONTENT_SCHEMA.md` y `docs/ROADMAP.md`.
