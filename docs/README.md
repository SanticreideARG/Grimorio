# GRIMORIO — Proyecto (definiciones)

Carpeta de **definiciones y assets** para construir la versión madura del juego
cooperativo dark-fantasy por turnos. Todavía **sin código**: el foco está en dejar
todo definido para que Claude Code lo implemente.

## Contenido

```
CLAUDE.md                  ← instrucciones para Claude Code (leer primero)
README.md                  ← este archivo
docs/
  GAME_DESIGN.md           visión, pilares, sistemas, modos, campaña larga
  ARCHITECTURE.md          stack, estructura, estado, persistencia, multiplayer
  CONTENT_SCHEMA.md        formas de datos de todo el contenido
  ROADMAP.md               milestones M0–M7
  ASSETS.md                pipeline de imágenes (prompt → png → datos)
  BOARD_ENGINE_V2.md       motor del tablero + sistema visual y pipeline de assets
  EXPANSION_ECOS_DEL_VACIO.md  plan de los capítulos 5–6
  PROMPT_TABLERO.md        referencia histórica del tablero V1
  QUESTIONNAIRE.md         cuestionario de definiciones (decisiones 🔲)
assets/img/                árbol de carpetas + un .txt de prompt por imagen
  _STYLE.txt  README.txt
  heroes/ enemies/ bosses/ events/ cardbacks/ ui/
  items/ spells/ potions/ curses/ pets/ board/
```

## Cómo usarlo

1. Completar `docs/QUESTIONNAIRE.md` (resuelve las decisiones 🔲).
2. Generar las imágenes con los prompts de `assets/img/**/*.txt`; para los seis
   mapas seguir el pipeline de `docs/BOARD_ENGINE_V2.md`.
3. Abrir el proyecto con Claude Code; seguir `CLAUDE.md` y `ROADMAP.md`.

## Estado

- ✅ Estructura de assets + 65 prompts listos.
- ✅ Prompt de tablero (campaña de ~68 nodos en 4 capítulos).
- ✅ Documentos de diseño/arquitectura/esquema/roadmap.
- ✅ Cuestionario de definiciones.
- 🔲 Decisiones pendientes (cuestionario) → luego, código (Claude Code).
