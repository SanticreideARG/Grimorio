# GRIMORIO — Pipeline de Assets

## Convención

- Cada imagen tiene su prompt en `assets/img/<categoria>/<id>.txt` (ya generados).
- El PNG final va en la **misma ruta con extensión .png**: `<id>.txt` → `<id>.png`.
- El `id` del archivo **coincide** con el `id` del contenido en `data/`
  (ej: enemigo `esbirro` → `enemies/esbirro.png`, referido como `art` en datos).
- Ancla de estilo compartida en `assets/img/_STYLE.txt` (mantener idéntica).
  El tablero V2 constituye una familia cartográfica deliberadamente separada:
  usa `mapbackground/_STYLE_BOARD.txt` para fondos y
  `nodes/_STYLE_BOARD.txt` para iconografía.

## Categorías y formatos

| Carpeta | Contenido | Ratio | Resolución sugerida |
|---------|-----------|-------|---------------------|
| heroes/ | retratos de party | 3:4 | 768×1024 |
| enemies/ | enemigos | 4:3 | 1024×768 |
| bosses/ | jefes (1 por capítulo) | 4:3 | 1024×768 |
| events/ | escenas de evento | 16:9 | 1280×720 |
| cardbacks/ | dorsos de mazo | 3:4 | 768×1024 |
| ui/ | dados, iconos | 1:1 | 512×512 (transparente) |
| items,spells,potions,curses,pets/ | iconos | 1:1 | 512×512 (transparente) |
| board/ | mapas de capítulo | 16:9 | ver PROMPT_TABLERO.md (Claude Design) |

## Flujo de trabajo

1. Generar la imagen con el prompt del `.txt` en tu motor de imágenes.
2. Guardarla como `<id>.png` en la misma carpeta.
3. Referenciarla en `data/` por su ruta relativa a `assets/img/`.
4. Para contenido nuevo: copiar el `_TEMPLATE.txt` de la carpeta, renombrar, completar.

## Estado actual

El inventario se valida con `npm run audit:assets`. La auditoría recorre el
contenido activo, referencias dinámicas conocidas, mapas, dorsos y UI; termina
con error si una referencia jugable no tiene una imagen homónima publicada.

A agosto de 2026 no hay referencias jugables rotas. La producción pendiente es
de aprobación e integración visual, no de placeholders de contenido.

## Faltante de assets a medida que crezca el contenido

Al sumar enemigos/eventos/etc. de los capítulos 2–4, crear su `.txt` (desde el
template) y luego su `.png`. Mantener un inventario en este archivo o en los datos.

## Expansión «Ecos del Vacío»

Los prompts definidos en `docs/EXPANSION_ECOS_DEL_VACIO.md` ya están creados:

| Categoría | Prompts nuevos |
|---|---:|
| Mapas de fondo | 2 |
| Héroes | 2 |
| Enemigos | 14 |
| Bosses y derrotas | 4 |
| Eventos | 10 |
| Ítems | 6 |
| Magias | 6 |
| Pociones | 4 |
| Maldiciones | 4 |
| Mascotas | 2 |
| **Total** | **54** |

Todos usan el ancla correspondiente a su familia visual y el nombre de archivo
coincide con el ID planificado. Los mapas 5–6 usan el ancla cartográfica del
tablero V2; el resto conserva la ancla dark-fantasy general.

Estado de producción visual: **54 de 54 assets generados**. Están publicados los
mapas 5–6, héroes, enemigos, bosses/derrotas, magias, los diez eventos, los seis
ítems, las cuatro pociones, las cuatro maldiciones y las dos mascotas de los
capítulos V–VI. La familia visual de la expansión queda completa; resta el lote
separado de producción del tablero V2 compartido con los capítulos base.

## Carrusel promocional del menú principal

La cola de producción está documentada en `docs/MENU_CAROUSEL_PLAN.md`. Incluye
12 prompts autocontenidos y las 12 imágenes finales `menu_01.webp` a
`menu_12.webp` en `assets/img/menu/`, con estado **GENERADO**. El lote se
publicó a 2560×1440 y se validó en paisaje y recorte vertical 9:16, con el
tercio izquierdo libre para título/menú y margen para una ampliación Ken Burns
del 8%. Resta integrar la rotación y sus transiciones en la interfaz.

## Tablero V2

El plan completo vive en `docs/BOARD_ENGINE_V2.md`. Ya existen prompts de
producción coherentes para:

- los seis fondos `map1.txt` a `map6.txt`;
- los siete símbolos de `nodes/`;
- `ui/party_pawn.txt` y `ui/compass_rose.txt`.

Los prompts producen **candidatos**, no reemplazos automáticos. Los seis fondos
V2 y los siete símbolos se aprobaron mediante hojas de contacto y composites
reales en escritorio y móvil; los fondos e iconos anteriores se conservan en
`assets/candidates/optimized-sources/` para rollback.

`party_pawn.webp` y `compass_rose.webp` también están publicados e integrados.
Sus másteres viven en `assets/candidates/ui/`. El lote de producción del Tablero
V2 queda completo; resta QA de recorrido en capítulos 2–6 y ajuste fino de
coordenadas si algún landmark compite con la ruta real.

## Presupuesto y fuentes maestras

- Los iconos finales de hechizo se publican a 512×512.
- Los eventos finales se publican a 1280×720.
- Fuentes PNG grandes que no deben entrar al bundle viven en
  `assets/candidates/optimized-sources/`.
- `assets/img/` contiene sólo archivos que el juego puede publicar; variantes de
  evaluación se excluyen explícitamente desde `src/ui/assets.js`.
