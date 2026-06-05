# GRIMORIO — Pipeline de Assets

## Convención

- Cada imagen tiene su prompt en `assets/img/<categoria>/<id>.txt` (ya generados).
- El PNG final va en la **misma ruta con extensión .png**: `<id>.txt` → `<id>.png`.
- El `id` del archivo **coincide** con el `id` del contenido en `data/`
  (ej: enemigo `esbirro` → `enemies/esbirro.png`, referido como `art` en datos).
- Ancla de estilo compartida en `assets/img/_STYLE.txt` (mantener idéntica).

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

Los `.txt` de prompts están listos para: 6 héroes, 8 enemigos, 4 jefes, 12 eventos,
7 dorsos, 7 elementos de UI, y ejemplos+template de items/magias/pociones/
maldiciones/mascotas. Los mapas de tablero se generan con Claude Design
(`PROMPT_TABLERO.md`). Faltan PNGs (se generan aparte).

## Faltante de assets a medida que crezca el contenido

Al sumar enemigos/eventos/etc. de los capítulos 2–4, crear su `.txt` (desde el
template) y luego su `.png`. Mantener un inventario en este archivo o en los datos.
