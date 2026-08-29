# GRIMORIO — Motor de tablero V2 y pipeline visual

Plan técnico y artístico para unificar los tableros de los seis capítulos. Este
documento define la arquitectura antes de modificar `BoardMap.jsx` o regenerar
assets.

## 1. Diagnóstico del tablero actual

### Lo que conviene conservar

- Progreso lineal expresado por `chapterIndex`, `nodeIndex` y `visited`.
- Nodos data-driven con coordenadas porcentuales `pos: { x, y }`.
- Lógica pura en `src/systems/board.js` y resolución real en la store.
- Un fondo por capítulo registrado mediante `import.meta.glob`.
- Un único set de medallones reutilizable en todas las regiones.
- Panel lateral con narración, preview del encuentro y acción principal.

### Problemas detectados

- `BoardMap.jsx` no dibuja la ruta aunque el CSS aún contiene estilos
  `.board__svg` y `.board__road`.
- Los caminos están horneados dentro de los fondos y no coinciden de forma fiable
  con las coordenadas de los nodos.
- Los cuatro fondos existentes no forman una familia consistente. Mapas 3 y 4
  tampoco comunican con claridad Ciudadela de Ceniza y Grieta.
- Algunos fondos incluyen cofres, enemigos, tiendas o campamentos; al superponer
  medallones se duplica información y se contradice el tipo real del nodo.
- Los medallones actuales contienen marco propio y reciben otro marco por CSS.
- En móvil el mapa 16:9 se reduce completo; los nodos y su estado pierden
  legibilidad.
- El `role="img"` del tablero oculta su estructura de pasos a tecnologías de
  asistencia.
- La cartela dentro del mapa repite el título del HUD y ocupa una zona útil.

## 2. Principio rector

El fondo ilustra **el territorio**. El motor dibuja **el juego**.

Un mapa final nunca debe contener caminos de tablero, nodos, números, iconos de
tipo, enemigos, cofres, campamentos, tiendas, texto ni peones. Esas piezas son
capas de UI controladas por datos.

```text
┌─────────────────────────────────────────────┐
│ 6. feedback: tooltip, foco, panel de nodo   │
│ 5. peón de party + halo del nodo actual     │
│ 4. medallones, números y estados            │
│ 3. ruta SVG base + tramo recorrido          │
│ 2. viñeta y ajuste cromático regional       │
│ 1. fondo ambiental WebP del capítulo        │
└─────────────────────────────────────────────┘
```

Cada capa puede cambiar sin regenerar las demás.

## 3. Alcance funcional

El recorrido sigue siendo estrictamente lineal. V2 no introduce rutas
ramificadas ni cambia reglas de combate, eventos o guardado.

Sí incorpora:

- ruta vectorial calculada desde los nodos;
- estados visuales consistentes;
- inspección de pasos visitados y actual;
- cámara desplazable en móvil;
- validación de layouts;
- temas regionales por capítulo;
- una fuente única de especificaciones para generar assets.

## 4. Arquitectura propuesta

### 4.1 Motor de progreso

`src/systems/board.js` sigue siendo autoridad para:

- obtener capítulo, nodos y nodo actual;
- determinar visitado, actual, futuro y último;
- resolver y avanzar;
- detectar fin de capítulo y límites de arco (`arcEnd`).

Agregar selectores sin estado nuevo:

```js
getNodeState(state, index) // 'visited' | 'current' | 'future'
getChapterProgress(state)  // { current, total, ratio }
getArcBoundary(state)      // null | 'base' | 'expansion'
canInspectNode(state, index)
```

`canInspectNode` permite ver el nodo actual o uno visitado; nunca activa un nodo
futuro ni modifica el progreso.

### 4.2 Geometría pura

Crear `src/systems/boardGeometry.js`, sin React ni DOM.

Responsabilidades:

```js
toViewPoint(pos, width = 1000, height = 562.5)
buildRouteSegments(nodes, options)
validateBoardLayout(chapter)
getCameraTarget(nodes, currentIndex)
```

La geometría usa `viewBox="0 0 1000 562.5"`, equivalente a 16:9. Las posiciones
siguen guardándose en porcentaje para preservar compatibilidad.

### 4.3 Ruta

`buildRouteSegments` devuelve `nodes.length - 1` segmentos SVG. Cada segmento es
una curva cúbica derivada de Catmull–Rom centrípeto con tensión moderada
(`0.35`). Renderizar segmentos individuales simplifica marcar como recorrido todo
segmento cuyo destino sea `index <= currentIndex`.

Capas de la ruta:

1. `route-bed`: sombra ancha oscura para separar del fondo.
2. `route-line`: trazo de pergamino/bronce.
3. `route-dashes`: huellas o puntos discretos.
4. `route-progress`: brillo del tramo ya recorrido.

La ruta no recibe eventos de puntero y siempre queda detrás de los nodos.

Fallback: si hay menos de dos puntos no se dibuja; si una coordenada es inválida,
el validador falla en desarrollo y el componente usa líneas rectas seguras.

### 4.4 Componente visual

Dividir `BoardMap.jsx` en piezas pequeñas:

```text
BoardViewport
└── BoardCanvas
    ├── BoardBackground
    ├── BoardRoute
    ├── BoardNodeList
    │   └── BoardNode
    ├── PartyPawn
    └── BoardCompass
```

Contrato sugerido:

```jsx
<BoardMap
  chapter={chapter}
  currentIndex={game.nodeIndex}
  visited={game.visited}
  selectedIndex={selectedIndex}
  onSelectNode={setSelectedIndex}
/>
```

El fondo se resuelve desde `chapter.board.background`, no desde un mapa paralelo
hardcodeado. Durante la migración, `mapImages[chapter.id]` sigue siendo fallback.

### 4.5 Interacción

- Nodo actual: seleccionable, `aria-current="step"` y acción primaria en el panel.
- Nodo visitado: seleccionable para releer nombre, narración y resultado; no
  permite repetir recompensas.
- Nodo futuro: visible pero deshabilitado.
- Teclado: flechas recorren nodos inspeccionables; Enter selecciona; Escape vuelve
  al actual.
- Al avanzar, la selección y la cámara se mueven al nuevo nodo.
- La acción de juego permanece en el panel; el mapa no dispara combate con un
  toque accidental.

Usar `<nav aria-label="Recorrido de ...">` y una lista ordenada de botones en vez
de presentar todo el tablero como una sola imagen.

## 5. Modelo de datos

Extender `Chapter` de forma compatible:

```js
{
  id: 'cap5',
  // ...campos existentes
  arcEnd: null | 'base' | 'expansion',
  board: {
    background: 'map5',
    theme: 'black-salt',
    routeStyle: 'coast',
    focalPoint: { x: 50, y: 50 },
    mobileZoom: 1.65,
  }
}
```

Campos opcionales por nodo:

```js
{
  pos: { x: 31, y: 37 },
  labelSide: 'top' | 'right' | 'bottom' | 'left', // solo si se muestran labels
  cameraBias: { x: 0, y: -4 },                   // excepcional
}
```

No guardar geometría SVG ni píxeles en los datos. El motor siempre los deriva.

### Compatibilidad de saves

El tablero V2 no necesita migración propia: `chapterIndex`, `nodeIndex` y
`visited` no cambian. La migración v8 definida para «Ecos del Vacío» incorpora
los límites de arco, no la geometría.

## 6. Reglas de layout

### Zona segura

- Coordenadas normales: `x` entre 8 y 92; `y` entre 10 y 90.
- Boss: al menos 10% de margen respecto del borde.
- Distancia mínima entre centros: 13 unidades porcentuales.
- Distancia recomendada: 18–24 horizontal y 19–23 vertical.
- Ningún nodo tapa el landmark narrativo principal de otro nodo.
- Inicio y boss deben quedar en extremos visuales inequívocos.

### Plantillas por capítulo

| Cap. | Nodos | Retícula recomendada | Lectura |
|---|---:|---|---|
| 1 | 16 | 4 × 4 | serpiente horizontal |
| 2 | 18 | 5 + 5 + 5 + 3 | descenso hacia el corazón del bosque |
| 3 | 20 | 5 × 4 | ascenso por distritos de la ciudadela |
| 4 | 15 | 4 + 4 + 4 + 3 | caída hacia el centro de la Grieta |
| 5 | 18 | 5 + 4 + 5 + 4 | recorrido por costa y puerto |
| 6 | 20 | 5 × 4 | ascenso espiral al campanario |

Los mapas no deben representar estas retículas. Solo reservan zonas de detalle
bajo para que la ruta generada sea legible.

### Validaciones automáticas

`validateBoardLayout` devuelve errores y advertencias:

- ID de nodo duplicado;
- coordenada no finita o fuera de zona segura;
- menos de dos nodos;
- primer nodo distinto de `start`;
- último nodo distinto de `boss`;
- distancia insuficiente entre nodos;
- segmento de longitud excesiva;
- `eventPool` ausente en eventos;
- enemigos ausentes en nodos de combate.

Los errores rompen tests; las advertencias se imprimen solo en desarrollo.

## 7. Responsive y cámara móvil

### Escritorio

- Canvas completo 16:9.
- Medallón normal: `clamp(48px, 5vw, 76px)`.
- Boss: 1.3 veces el tamaño normal.
- Panel lateral de 320–360 px.
- Eliminar la cartela interna; el HUD ya identifica el capítulo.

### Móvil

No encoger todo el tablero hasta volverlo ilegible.

- `BoardViewport` mide el ancho disponible y tiene `overflow: auto`.
- `BoardCanvas` conserva un ancho interno aproximado de 760–860 px según
  `chapter.board.mobileZoom`.
- Al cargar o avanzar, desplaza suavemente el nodo actual hacia el centro.
- El usuario puede explorar con swipe; un botón `Centrar party` recupera la
  posición.
- El panel del nodo se muestra debajo como tarjeta; seleccionar un visitado
  desplaza hasta ella.
- Respetar `prefers-reduced-motion` usando desplazamiento inmediato.

No se guarda posición de cámara en el save.

## 8. Sistema visual unificado

### Lenguaje compartido

- Cartografía dark fantasy dibujada a tinta sobre pergamino antiguo.
- Vista cenital oblicua consistente, sin perspectiva cinematográfica extrema.
- Línea de tinta marrón-negra, acuarela desaturada y luces puntuales.
- Mismo borde de pergamino rasgado en los seis fondos.
- Densidad media en landmarks y densidad baja bajo el corredor del recorrido.
- Sin texto, brújula, caminos, nodos, números ni elementos de UI horneados.

### Paleta común

| Token | Color | Uso |
|---|---|---|
| `ink` | `#24170f` | contornos, ruta base |
| `parchment` | `#b98b52` | papel y ruta clara |
| `bronze` | `#b78a43` | marcos y nodos |
| `visited` | `#8f3428` | progreso recorrido |
| `current` | `#f0cf8b` | halo del nodo actual |
| `future` | `#55463b` | nodos futuros desaturados |

### Acentos regionales

| Cap. | Tema | Acento | Landmarks obligatorios |
|---|---|---|---|
| 1 | valle quemado | brasa `#b95132` | campos, aldea, bazar, altar, guarida de Gulrath |
| 2 | marisma sagrada | veneno `#77638d` | árboles-altar, seda, santuario, corazón del bosque |
| 3 | ciudadela caída | ceniza roja `#944537` | puertas, muralla, cripta, trono y palacio |
| 4 | herida cósmica | vacío `#70558f` | plataformas rotas, ojo, tentación, núcleo abisal |
| 5 | sal negra | petróleo `#4f8587` | puerto, mercado, coral, faro invertido, fosa marina |
| 6 | eclipse | oro viejo `#ac8745` | hospicio, claustro, biblioteca, observatorio, campanario |

El tinte regional se aplica también como overlay CSS muy sutil para absorber
diferencias entre generaciones sin destruir el pergamino común.

## 9. Inventario de assets del tablero

### Fondos opacos

Destino final:

```text
assets/img/mapbackground/map1.webp
assets/img/mapbackground/map2.webp
assets/img/mapbackground/map3.webp
assets/img/mapbackground/map4.webp
assets/img/mapbackground/map5.webp
assets/img/mapbackground/map6.webp
```

Especificación: 1920×1080, sRGB, WebP calidad 82–86, objetivo 350–750 KB.

Los seis deben regenerarse como una sola colección. Prioridad de aprobación:
cap1 como referencia de estilo, cap3 y cap4 por divergencia canónica, cap5 y cap6
por ser nuevos, cap2 al final.

### Medallones

Tipos: `start`, `combat`, `elite`, `event`, `rest`, `shop`, `boss`.

Especificación nueva: 512×512, fondo transparente, **símbolo central sin marco**,
silueta gruesa y legible a 48 px. El marco de bronce, estados y halos los dibuja
CSS. Esto evita el doble aro actual.

Destinos finales conservan los nombres actuales en `assets/img/nodes/`.

### UI reutilizable

| ID | Destino | Especificación |
|---|---|---|
| `party_pawn` | `assets/img/ui/party_pawn.webp` | 256×256 transparente; farol/estandarte de party |
| `compass_rose` | `assets/img/ui/compass_rose.webp` | 512×512 transparente; tinta y bronce |
| `route_footprint` | preferentemente SVG/CSS | marca repetible; no raster si CSS alcanza |

La cartela, viñeta, marcos y ruta se generan con CSS/SVG para no multiplicar
assets ni introducir escalado borroso.

## 10. Pipeline de generación

### Fase A — Layout antes que arte

1. Fijar coordenadas de todos los nodos.
2. Renderizar un blueprint 1920×1080 con ruta, nodos y círculos de exclusión.
3. Revisar que el recorrido tenga lectura inequívoca y ritmo visual.
4. Congelar las posiciones antes de producir el fondo definitivo.

El blueprint es una herramienta de QA, no un asset del juego.

### Fase B — Referencia maestra

1. Generar tres candidatos para `map1` con el prompt maestro.
2. Componer encima la ruta y los nodos reales.
3. Aprobar uno por legibilidad, no solo por belleza.
4. Usar ese candidato como referencia visual para generar mapas 2–6.

La referencia fija: papel, borde, grosor de tinta, vista, saturación y nivel de
detalle. Cada prompt regional solo cambia bioma y landmarks.

### Fase C — Fondos regionales

Para cada capítulo:

1. Generar fondo sin elementos de juego.
2. Convertir a WebP sin redimensionar.
3. Renderizar el composite real a 1440×900 y 390×844.
4. Verificar que ruta, nodos y peón contrasten.
5. Ajustar primero coordenadas; regenerar solo si un landmark esencial invade el
   corredor o el bioma es incorrecto.

### Fase D — Iconografía

1. Generar y aprobar `combat` como referencia de icono.
2. Usarlo como referencia para los otros seis símbolos.
3. Comprobar legibilidad a 76, 56 y 40 px sobre los seis mapas.
4. Generar peón y brújula usando el mismo bronce y línea.
5. Recortar transparencias, convertir a WebP y validar alpha.

### Fase E — Integración segura

- Los candidatos se guardan fuera de las rutas finales hasta aprobarse.
- Reemplazar un asset por vez y tomar captura comparativa.
- `mapImages.js` ya acepta WebP; añadir `cap5` y `cap6` al registro.
- Mantener fallback pergamino si una imagen falta.
- No borrar los fondos anteriores hasta aprobar los seis nuevos.

## 11. Prompt maestro de mapas

Ancla compartida, idéntica para los seis:

> Dark fantasy hand-inked cartographic illustration on aged parchment, consistent
> top-down oblique tabletop map, dark brown-black linework, restrained desaturated
> watercolor washes, dramatic but readable value grouping, medium environmental
> detail, sparse warm highlights, torn irregular parchment border of uniform
> thickness. The image is a background for a digital board-game overlay. Keep
> broad low-detail negative-space corridors across four horizontal bands for UI
> markers. No visible road or trail, no nodes, no circles, no numbers, no text, no
> labels, no compass rose, no characters, no enemies, no treasure chests, no
> camps, no shops, no UI, no watermark.

Variables regionales:

- `map1`: scorched agricultural valley, burned fields, ruined village, broken
  bazaar, profaned altar, enormous beast lair; ember red accents.
- `map2`: ancient sacred forest collapsed into marshland, altar trees, black
  water, restrained violet spider silk, drowned sanctuary; muted violet accents.
- `map3`: vast ruined royal capital, gates, military courtyard, breached walls,
  royal crypt, palace and throne keep; ash-red accents. No goblins.
- `map4`: cosmic wound with floating rock shelves, torn geometry, distant eyes,
  impossible chasms and a central void core; cold violet accents. No spiders,
  caves or ordinary roads.
- `map5`: crescent black-salt coast, returned drowned harbor, glass breakwaters,
  ghost market structures, coral district, upside-down lighthouse and sea trench;
  petroleum teal and pearl accents.
- `map6`: spiral mountain monastery under a fixed eclipse, hospice, eight-turn
  cloister, library, statue garden, split observatory and final bell tower; old
  gold and eclipse-red accents.

Formato común: 16:9, 1920×1080.

## 12. Prompts base de iconografía

Ancla compartida:

> Dark fantasy hand-inked emblem matching an antique parchment board game,
> centered bold silhouette, dark umber linework, aged bronze and muted bone
> colors with one restrained accent, painterly etched texture, highly legible at
> small size, isolated object, transparent background, no circular frame, no
> text, no number, no border, no UI, no watermark. Ratio 1:1.

Símbolos:

- `start`: torn expedition banner planted in cracked earth.
- `combat`: two crossed nicked swords.
- `elite`: horned beast skull with one dark red eye.
- `event`: open occult grimoire with one violet wisp.
- `rest`: iron cooking pot above a small amber campfire.
- `shop`: hooded merchant scales and coin pouch.
- `boss`: cracked horned crown above a skull.
- `party_pawn`: small expedition lantern fixed to a pointed banner pole, warm
  amber flame, recognizable from every direction.
- `compass_rose`: ornate but sparse eight-point compass in ink and old bronze.

## 13. QA y pruebas

### Headless

Agregar `tests/board-geometry.test.mjs`:

- genera exactamente N−1 segmentos;
- no produce `NaN` ni coordenadas fuera del viewBox;
- marca como recorridos los segmentos correctos;
- layouts de los seis capítulos pasan zona segura y distancia mínima;
- cámara devuelve un objetivo válido para primer, medio y último nodo;
- capítulos con un solo nodo no rompen.

Extender tests de contenido para validar `board.background`, `theme` y `arcEnd`.

### Visual

Capturas obligatorias:

- escritorio: 1440×900 y 1920×1080;
- móvil: 390×844 y 430×932;
- nodo inicial, nodo intermedio y boss;
- estado normal y `prefers-reduced-motion`;
- fondo ausente para probar fallback.

Checklist por captura:

- ruta inequívoca en menos de dos segundos;
- nodo actual domina sin tapar su icono;
- visitados y futuros se distinguen sin depender solo del color;
- ningún nodo queda debajo del HUD, borde o panel;
- texto y controles conservan contraste WCAG AA;
- no hay duplicación visual de caminos o encuentros;
- el swipe móvil no activa una acción accidental.

### Presupuesto

- JS de geometría: sin dependencias nuevas.
- Fondo individual: máximo recomendado 800 KB.
- Icono individual: máximo recomendado 120 KB.
- No precargar mapas de capítulos futuros: cargar mapa actual y anticipar solo el
  siguiente durante el campamento.

## 14. Orden de implementación

1. Crear geometría pura y validadores con tests.
2. Restaurar la ruta SVG y estados en `BoardMap` usando fondos actuales.
3. Añadir semántica e inspección sin cambiar la resolución de nodos.
4. Implementar viewport/cámara móvil.
5. Extender schema de capítulos y registrar cap5–6.
6. Generar y aprobar la familia completa de fondos.
7. Generar iconografía simplificada, peón y brújula.
8. Ajustar coordenadas por composite real.
9. Optimizar precarga y ejecutar QA visual final.

## 15. Criterios de aceptación

- Los seis tableros usan el mismo motor, marco, iconografía y gramática visual.
- Ningún fondo contiene elementos de juego horneados.
- La ruta nace únicamente de `nodes[].pos` y refleja el progreso guardado.
- Cambiar una coordenada mueve nodo, ruta y cámara sin editar imágenes.
- Una partida existente conserva exactamente su progreso.
- El mapa es legible y navegable con teclado y en móvil.
- Cada capítulo conserva identidad propia sin parecer de otro juego.
- Tests geométricos, tests de contenido, build y QA visual pasan antes de reemplazar
  definitivamente los assets anteriores.

