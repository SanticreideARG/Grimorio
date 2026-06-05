# CLAUDE.md — Instrucciones para Claude Code

Este archivo orienta a Claude Code al construir **GRIMORIO**. Leer antes de codear.

## Qué es

Juego cooperativo dark-fantasy por turnos en navegador. La party recorre una
campaña lineal por capítulos contra enemigos, eventos y jefes. **El Maestro de
Ceremonias es siempre la CPU.** Persistencia en localStorage. Sin backend en v1.

## Documentos a leer primero

1. `docs/GAME_DESIGN.md` — qué es el juego (visión, sistemas, modos).
2. `docs/ARCHITECTURE.md` — cómo se construye (stack, estructura, estado).
3. `docs/CONTENT_SCHEMA.md` — formas de datos del contenido.
4. `docs/ROADMAP.md` — en qué orden construir (milestones M0–M7).
5. `docs/ASSETS.md` y `docs/PROMPT_TABLERO.md` — imágenes y mapa.
6. `docs/QUESTIONNAIRE.md` — **decisiones pendientes (🔲)**: NO improvisar las
   marcadas; pedir confirmación o seguir la recomendación indicada.

## Reglas de oro

- **Motor vs contenido:** la lógica (`core/`, `systems/`) NUNCA contiene historia
  ni datos de balance hardcodeados. Todo el contenido vive en `data/` siguiendo
  CONTENT_SCHEMA.md. Agregar contenido = editar datos, no lógica.
- **Estado serializable:** el estado del juego es JSON plano; toda mutación pasa
  por el motor para poder guardar tras cada acción.
- **RNG con semilla** (`core/rng.js`): nada de `Math.random()` suelto en lógica
  de juego; usar el RNG sembrado para reproducibilidad.
- **Sin dependencias de runtime obligatorias.** El build (si lo hay) produce algo
  que corre offline.
- **Respetar los `id`s:** coinciden entre datos e imágenes (ver ASSETS.md).
- **Tests headless** del motor (combate, avance) antes de dar una fase por cerrada.

## Estilo de código

- 🔲 Q-STACK define Vanilla JS vs framework. Hasta confirmarse, asumir
  **Vanilla JS + ES Modules** (patrón validado en el prototipo).
- Funciones puras donde se pueda; `render(state)` por vista.
- Nombres en inglés para código, contenido y textos de juego en español.
- Comentarios concisos; preferir código claro a comentarios extensos.

## Qué NO hacer

- No implementar multiplayer **online** sin que Q-MODO lo confirme (es fase futura
  y cambia la arquitectura: requeriría backend, ver ARCHITECTURE §6).
- No hardcodear capítulos/enemigos/cartas en la lógica.
- No romper la compatibilidad de saves sin subir `version` y agregar migración.

## Referencia

El proyecto prototipo previo es **modelo de contexto** (patrones de estado,
combate, render, save). La versión final debe ser más madura y modular; no copiar
el prototipo tal cual.
