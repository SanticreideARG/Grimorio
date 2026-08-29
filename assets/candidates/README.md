# Candidatos visuales

Imágenes de evaluación generadas con ImageGen integrado. Esta carpeta queda fuera
de `assets/img/` para que Vite no las incluya en el precargado del juego antes de
su aprobación y optimización.

| Archivo | Fuente del prompt | Uso | Dimensiones | Alfa |
|---|---|---|---:|---|
| `board/map1-v2.png` | `assets/img/mapbackground/map1.txt` + `_STYLE_BOARD.txt` | Referencia cartográfica | 1672×941 | no requerido |
| `nodes/combat-v2.png` | `assets/img/nodes/combat.txt` + `_STYLE_BOARD.txt` | Referencia de iconografía | 1270×1239 | sí |
| `cap5/enemies/ahogado_sal.png` | `assets/img/enemies/ahogado_sal.txt` | Referencia regional Costa | 1448×1086 | no requerido |
| `cap5/bosses/leviatan_sal_negra.png` | `assets/img/bosses/leviatan_sal_negra.txt` + referencia regional | Referencia de jefe Costa | 1448×1086 | no requerido |
| `cap5/enemies/*.png` | prompt homónimo en `assets/img/enemies/` | Enemigos de las Costas | 1448×1086 | no requerido |
| `cap5/bosses/*.png` | prompt homónimo en `assets/img/bosses/` | Boss y derrota de cap. V | 1448×1086 | no requerido |
| `cap5/heroes/mara_salobre.png` | `assets/img/heroes/mara_salobre.txt` | Retrato desbloqueable | 1086×1448 | no requerido |
| `cap5/events/*.png` | prompt homónimo refinado en `assets/img/events/` + referencias de Costa | Cinco eventos narrativos de cap. V | 1672×941 | no requerido |
| `cap6/enemies/*.png` | prompt homónimo en `assets/img/enemies/` | Enemigos del Monasterio | 1448×1086 | no requerido |
| `cap6/bosses/*.png` | prompt homónimo en `assets/img/bosses/` | Serath y su derrota | 1448×1086 | no requerido |
| `cap6/heroes/elian_relojero.png` | `assets/img/heroes/elian_relojero.txt` | Retrato desbloqueable | 1086×1448 | no requerido |
| `cap6/events/*.png` | prompt homónimo refinado en `assets/img/events/` + referencias del Monasterio | Cinco eventos narrativos de cap. VI | 1672×941 | no requerido |
| `expansion/items/*.png` | prompt homónimo refinado en `assets/img/items/` | Seis ítems de Ecos del Vacío | 1254×1254 | sí |
| `expansion/potions/*.png` | prompt homónimo refinado en `assets/img/potions/` | Cuatro pociones de Ecos del Vacío | 1254×1254 | sí |
| `expansion/curses/*.png` | prompt homónimo refinado en `assets/img/curses/` | Cuatro maldiciones de Ecos del Vacío | 1254×1254 | sí |
| `expansion/pets/*.png` | prompt homónimo refinado en `assets/img/pets/` | Dos mascotas de Ecos del Vacío | 1254×1254 | sí |
| `board/map5-v2.png` | `assets/img/mapbackground/map5.txt` + `_STYLE_BOARD.txt` | Fondo sin ruta de cap. V | 1672×941 | no requerido |
| `board/map6-v2.png` | `assets/img/mapbackground/map6.txt` + `_STYLE_BOARD.txt` | Fondo sin ruta de cap. VI | 1672×941 | no requerido |
| `heroes-v2/guerrera-v2.png` | `assets/img/heroes/guerrera_v2.txt` + retrato original | Brenna evolucionada / fondo de card | 1086×1448 | no requerido |
| `heroes-v2/paladin-v2.png` | `assets/img/heroes/paladin_v2.txt` + retrato original | Aldric evolucionada / fondo de card | 1086×1448 | no requerido |
| `heroes-v2/caballero_oscuro-v2.png` | `assets/img/heroes/caballero_oscuro_v2.txt` + retrato original | Caballero evolucionado / fondo de card | 1086×1448 | no requerido |
| `heroes-v2/mago-v2.png` | `assets/img/heroes/mago_v2.txt` + retrato original | Veyra evolucionado / fondo de card | 1086×1448 | no requerido |
| `heroes-v2/sanadora-v2.png` | `assets/img/heroes/sanadora_v2.txt` + retrato original | Maevis evolucionada / fondo de card | 1086×1448 | no requerido |
| `heroes-v2/picara-v2.png` | `assets/img/heroes/picara_v2.txt` + retrato original | Nix evolucionada / fondo de card | 1086×1448 | no requerido |
| `heroes-v2/cazador-v2.png` | `assets/img/heroes/cazador_v2.txt` + retrato original | Corvin evolucionado / fondo de card | 1086×1448 | no requerido |
| `heroes-v2/orphen-v2.png` | `assets/img/heroes/orphen_v2.txt` + retrato original | Orphen evolucionado / fondo de card | 1086×1448 | no requerido |
| `spells/plegaria_novena.png` | `assets/img/spells/plegaria_novena.txt` + corrección de conteo | Icono final, nueve campanas | 1254×1254 | sí |
| `cards/hero-selection/brenna-rest.png` | `assets/img/ui/cards/hero_selection_rest.txt` + retrato V2 | Card maestra, estado reposo | 1086×1448 | no requerido |
| `cards/hero-selection/maevis-selected.png` | `assets/img/ui/cards/hero_selection_selected.txt` + retrato V2 | Card maestra, estado seleccionado | 1086×1448 | no requerido |
| `cards/hero-selection/dark-knight-locked.png` | `assets/img/ui/cards/hero_selection_locked.txt` + retrato V2 | Card maestra, estado bloqueado | 1086×1448 | no requerido |
| `cards/hero-selection/*-rest.png` | prompt individual `assets/img/ui/cards/hero_selection_*.txt` + retrato correspondiente | Roster de selección, estado reposo | 1086×1448 | no requerido |
| `cards/hero-selection/roster-contact-sheet.webp` | composición de los diez mockups | Control de coherencia del roster | 1200×640 | no requerido |
| `promo/grimorio2-launch-heroes-4x5-master.png` | `assets/img/promo/grimorio2_launch_heroes_4x5.txt` + Orphen, Mara y Elian | Máster promocional de héroes | 1024×1536 | no requerido |
| `promo/grimorio2-launch-heroes-feed-1080x1350.png` | derivado social del máster de héroes | Publicación de feed 4:5 | 1080×1350 | no requerido |
| `promo/grimorio2-launch-world-9x16-master.png` | `assets/img/promo/grimorio2_launch_world_9x16.txt` + Leviatán, Serath y mapas 5–6 | Máster promocional de mundo | 1024×1536 | no requerido |
| `promo/grimorio2-launch-world-story-1080x1920.png` | derivado social del máster de mundo | Historia/Reel cover 9:16 | 1080×1920 | no requerido |
| `ui/party_pawn-master.png` | `assets/img/ui/party_pawn.txt` | Máster del peón de party | 1280×1280 | sí |
| `ui/compass_rose-master.png` | `assets/img/ui/compass_rose.txt` | Máster de la rosa de los vientos | 1280×1280 | sí |

Modo de generación: ImageGen integrado. Las familias de personajes de cap. V y
VI y los mapas 5–6 fueron inspeccionados, convertidos a WebP (calidad 88) e
integrados en `assets/img/`. Los PNG de esta carpeta se conservan como fuentes
maestras y trazabilidad; los elementos que necesiten transparencia conservarán
PNG en su versión final.

Los retratos evolucionados se publicaron además como `*_v2.webp` en
`assets/img/heroes/` con calidad 88. Son variantes no destructivas: los originales
siguen siendo la referencia de identidad y no fueron reemplazados.

Las dos piezas promocionales de lanzamiento conservan los másteres generados y
añaden exportaciones con medidas exactas para redes. El encuadre social utiliza
extensión ambiental oscurecida para preservar íntegros el título, los personajes
y la fecha `NOVIEMBRE 2026`.

Los cinco eventos de las Costas se publicaron como WebP 1280×720, calidad 88,
después de revisar foco narrativo, conteos, anatomía, márgenes y coherencia de
paleta. Los PNG maestros permanecen en `cap5/events/`.

Los cinco eventos del Monasterio se publicaron con el mismo formato y criterio.
El `coro_detenido` recibió una corrección compositiva para conservar exactamente
siete monjes y ocho campanas. Los PNG maestros permanecen en `cap6/events/`.

Los seis ítems de la expansión se publicaron como PNG RGBA 512×512. El
`rosario_novena` recibió una corrección de conteo para mostrar exactamente ocho
cuentas pálidas y una cuenta negra. Los PNG maestros permanecen en
`expansion/items/`.

Las cuatro pociones de la expansión se publicaron como PNG RGBA 512×512, con
siluetas distintas por función y vidrio transparente legible a escala de carta.
Los PNG maestros permanecen en `expansion/potions/`.

Las cuatro maldiciones se publicaron como PNG RGBA 512×512 con lenguaje de
emblema y asociaciones visuales a sus hooks. El `tic_sangriento` conserva doce
marcas horarias contables. Los PNG maestros permanecen en `expansion/curses/`.

Las dos mascotas se publicaron como PNG RGBA 512×512, preservando anatomía,
carácter de compañero y relación visual con sus eventos de obtención. Los PNG
maestros permanecen en `expansion/pets/`.

Los PNG de alta resolución sustituidos por WebP optimizados se conservan en
`optimized-sources/`. No deben volver a `assets/img/`: esa carpeta se empaqueta
en la build de producción.

La familia del Tablero V2 quedó completada con `board/map2-v2.png` a
`board/map4-v2.png` y los siete símbolos `nodes/*-v2.png`. Las hojas
`board/contact-sheet-v2.webp` y `nodes/contact-sheet-v2.webp` documentan la
aprobación conjunta antes de publicar las versiones WebP finales.
