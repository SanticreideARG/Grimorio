# GRIMORIO — Arquitectura técnica

> Define **cómo** se construye la versión madura. El prototipo validó los patrones;
> esto los formaliza para una base sólida y extensible.

## 1. Stack

- **Cliente:** HTML + CSS + JavaScript. 🔲 Q-STACK: ¿**Vanilla JS** (sin build,
  máxima portabilidad, como el prototipo) o **framework ligero** (Vite + un view
  layer) para escalar la UI?
  - *Recomendación:* Vanilla JS + ES Modules + un bundler mínimo (Vite) para
    desarrollo cómodo, build estático que sigue corriendo offline.
- **Sin dependencias de runtime obligatorias.** Estilos propios (el dev domina
  Tailwind; se puede adoptar, pero no es requisito para que el juego corra).
- **Persistencia:** `localStorage` (client-side). Sin backend en v1.

## 2. Estructura de carpetas propuesta

```
grimorio/
  index.html
  src/
    main.js                 arranque
    core/
      state.js              estado central + (de)serialización
      save.js               persistencia localStorage (slots, export/import)
      rng.js                aleatoriedad con semilla (partidas reproducibles)
      events.js             bus de eventos interno
    systems/
      board.js              avance por nodos, resolución de nodo
      combat.js             motor de combate por turnos
      enemyAI.js            comportamientos de enemigos y jefes
      decks.js              robo/descarte/reciclado de mazos
      curses.js             aplicación y limpieza de maldiciones
      pets.js               compañeros
      doom.js               track de perdición
      progression.js        nivel / dice-building / equipo
      turn.js               orden de turnos (single y hotseat)
    ui/
      render.js             render desde estado (vistas: title/map/event/combat/...)
      components/           tarjetas de héroe, enemigo, carta, dado, hud...
    data/                   ◄── CONTENIDO (no lógica)
      heroes.js
      enemies.js
      bosses.js
      spells.js  items.js  potions.js  curses.js  pets.js
      decks/ (eventos.js, botin.js, ...)
      chapters/ (cap1.js, cap2.js, cap3.js, cap4.js)
      script.js             textos del MC
  assets/img/...            (ver ASSETS.md)
  docs/...
```

## 3. Principio rector: motor vs contenido

El **motor** (`core/` + `systems/`) **no conoce la historia**. Todo el contenido
vive en `data/` con esquemas estables (ver CONTENT_SCHEMA.md). Agregar capítulos,
enemigos, cartas o héroes = editar datos, nunca lógica.

## 4. Estado y persistencia

- **Estado central serializable** (objeto plano JSON). Toda mutación pasa por
  funciones del motor para mantener consistencia y poder guardar tras cada acción.
- **RNG con semilla** (`rng.js`): guardar la semilla permite partidas reproducibles
  y depuración. Importante para multiplayer hotseat (mismo resultado para todos).
- **Save:** múltiples slots, autosave por acción, y 🔲 Q-SAVE: ¿export/import de
  partidas (JSON), varios slots, un solo save?
- **Versionado de save:** campo `version` + migraciones simples al cargar.

## 5. Turnos (single y hotseat)

Abstraer el concepto de **"controlador activo"**:
- En single-player, un único controlador maneja a todos los héroes.
- En hotseat, cada héroe tiene un `ownerId`; la UI indica de quién es el turno y
  bloquea acciones de héroes ajenos hasta que ese jugador actúe.
- El motor de turnos es el mismo; solo cambia quién tiene permiso de input.

## 6. Multiplayer (decisión arquitectónica)

🔲 **Q-MODO** define esto y es estructural:
- **Hotseat (recomendado para v1):** mismo dispositivo, sin red, encaja perfecto
  con browser + localStorage. Costo: bajo.
- **Online:** requiere **estado autoritativo en servidor** (o P2P con árbitro),
  sincronización de turnos, manejo de desconexiones. El stack TALL/Laravel del dev
  podría servir un backend (WebSockets vía Reverb/Echo), pero esto **rompe el
  modelo offline/localStorage** y debe planificarse como proyecto aparte/fase 2.

> No mezclar ambos en v1. Definir Q-MODO antes de escribir `turn.js`.

## 7. Renderizado

- **Render desde estado** (función pura `render(state)` por vista), como el
  prototipo. Vistas: título, mapa, evento, combate, campamento/tienda, fin.
- El **mapa** usa la imagen del capítulo como fondo + nodos posicionados por
  coordenadas (`boardNode.pos`), desacoplando arte y lógica.

## 8. Calidad

- 🔲 Q-TESTS: tests headless del motor (combate/avance) como el smoke test del
  prototipo; recomendado para no romper balance al agregar contenido.
- Linter/formatter (eslint + prettier) opcional pero recomendado.
