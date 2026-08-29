# GRIMORIO — Expansión «Ecos del Vacío»

Plan de contenido e integración para dos escenarios posteriores a **La Grieta**.
Este documento define el canon, los IDs y el alcance antes de implementar datos o
lógica. Los prompts visuales asociados viven en `assets/img/<categoria>/<id>.txt`.

## 1. Decisión de producto

Los escenarios funcionan como una **expansión opcional postcampaña**, no como un
reemplazo del final actual:

- El capítulo 4 conserva su final bueno, agridulce o malo y sigue siendo una
  campaña completa.
- Desde la pantalla de final aparece `Continuar: Ecos del Vacío`.
- Al continuar se guarda el resultado anterior en `baseEnding`; la party, el oro,
  los ítems, las mascotas y las decisiones permanecen.
- La expansión añade los capítulos 5 y 6 y calcula un epílogo propio en
  `expansionEnding`.
- La premisa no resucita al Devorado: al cerrarse la Grieta devuelve dos lugares
  que había consumido. El nuevo conflicto nace de las secuelas, no invalida la
  victoria original.

Nombre de campaña: **Ecos del Vacío**.

Tema dramático: después de sobrevivir al dolor hay que decidir qué hacer con lo
que vuelve. El Rey quiso borrar su pérdida; la expansión pregunta si recordar
significa conservar, soltar o repetirla para siempre.

## 2. Escenario I — Las Costas de Sal Negra

### Identidad

| Campo | Definición |
|---|---|
| ID | `cap5` |
| Título | Las Costas de Sal Negra |
| Subtítulo | Capítulo V — Lo que el mar devolvió |
| Extensión | 18 nodos lineales |
| Doom máximo | 20 |
| Pool de eventos | `eventos_cap5` |
| Jefe | `leviatan_sal_negra` |
| Paleta | negro húmedo, nácar pálido, verde petróleo, faros ámbar |
| Silueta del mapa | costa quebrada en forma de media luna, puerto hundido y faro invertido |

### Canon

Puerto Albor fue tragado entero durante la primera expansión de la Grieta. Al
morir el Devorado, la ciudad reaparece en la costa, pero pasó décadas subjetivas
bajo un mar sin cielo. Sus habitantes regresan como ecos salinizados y la marea
sube hacia las nubes. En el fondo despierta el **Leviatán de Sal Negra**, antiguo
guardián marino fusionado con las memorias de todos los ahogados.

El Leviatán no busca destruir: intenta devolver cada ser vivo al mar inmóvil donde
nada vuelve a perderse. Su corazón contiene un fragmento orientador, el
`astrolabio_negro`, que señala la fuente del eclipse del capítulo 6.

### Ritmo y nodos

| Nodo | Tipo | Nombre | Encuentro / función |
|---|---|---|---|
| `c5n01` | start | La Costa que Regresó | Entrada y revelación del puerto devuelto |
| `c5n02` | combat | Playa de los Sin Nombre | 2 `ahogado_sal` + `gaviota_osaria` |
| `c5n03` | event | La Carta en la Botella | `carta_en_botella` |
| `c5n04` | combat | Rompeolas de Vidrio | `corsario_hueco` + 2 `ahogado_sal` |
| `c5n05` | shop | El Bazar Flotante | Primera tienda; incorpora equipo de expansión |
| `c5n06` | rest | Fogata Bajo la Lluvia | Descanso y bark de Mara si fue desbloqueada |
| `c5n07` | combat | Las Calles Sumergidas | `cantor_marea` + 2 `ahogado_sal` |
| `c5n08` | event | Mercado de Fantasmas | `mercado_fantasmas` |
| `c5n09` | elite | El Capitán sin Pulso | `capitan_sin_pulso` + `gaviota_osaria` |
| `c5n10` | combat | Jardines de Coral | `recolector_nacar` + `corsario_hueco` |
| `c5n11` | event | El Jardín que Recuerda | `jardin_corales` |
| `c5n12` | combat | Marea Ascendente | 2 `gaviota_osaria` + `cantor_marea` |
| `c5n13` | rest | La Casa del Vigía | Segundo descanso; lore del farero |
| `c5n14` | event | El Faro Invertido | `faro_invertido` |
| `c5n15` | elite | El Oráculo de Salmuera | `oraculo_salmuera` + 2 `ahogado_sal` |
| `c5n16` | shop | La Última Lonja | Tienda de preparación final |
| `c5n17` | event | La Campana Sumergida | `campana_sumergida` |
| `c5n18` | boss | EL LEVIATÁN DE SAL NEGRA | Boss + `recolector_nacar` |

### Hitos narrativos

- `c5n03`: una carta escrita después de la desaparición de Puerto Albor prueba que
  dentro de la Grieta el tiempo siguió transcurriendo.
- `c5n08`: los fantasmas comercian recuerdos; elegir olvidar da poder inmediato
  pero afecta el epílogo.
- `c5n14`: el faro proyecta oscuridad hacia el Monasterio del Eclipse.
- `c5n17`: hacer sonar la campana libera a los ahogados; quebrarla conserva sus
  voces dentro del Leviatán.
- `c5n18`: al caer el jefe, el `astrolabio_negro` apunta hacia una montaña donde
  el sol no termina de ponerse.

## 3. Escenario II — El Monasterio del Eclipse

### Identidad

| Campo | Definición |
|---|---|
| ID | `cap6` |
| Título | El Monasterio del Eclipse |
| Subtítulo | Capítulo VI — La novena campanada |
| Extensión | 20 nodos lineales |
| Doom máximo | 22 |
| Pool de eventos | `eventos_cap6` |
| Jefe | `abadesa_serath` |
| Paleta | piedra azul noche, oro viejo, rojo eclipse, blanco lunar |
| Silueta del mapa | ascenso espiral por montaña, claustro, observatorio y campanario |

### Canon

El Monasterio de las Ocho Horas custodiaba calendarios, nacimientos y funerales.
Cuando la Grieta lo consumió, la abadesa Serath mantuvo a sus monjes dentro del
mismo día para impedir que murieran. Tras el cierre de la Grieta, el monasterio
regresa atrapado en un eclipse y su campana intenta dar un noveno toque que nunca
existió.

Serath descubre una **semilla del Vacío**, residuo sin voluntad del Devorado. No
quiere destruir el mundo: quiere rebobinarlo hasta antes de la guerra. Cada intento
borra un futuro posible. Es el espejo final del Rey Ceniza: otra persona quebrada
que cree que el amor justifica imponer su duelo al resto.

### Ritmo y nodos

| Nodo | Tipo | Nombre | Encuentro / función |
|---|---|---|---|
| `c6n01` | start | El Camino sin Amanecer | Entrada al eclipse inmóvil |
| `c6n02` | combat | Peregrinos de la Octava Hora | 2 `penitente_ciego` + `arquero_meridiano` |
| `c6n03` | event | El Reloj sin Sombra | `reloj_sin_sombra` |
| `c6n04` | combat | Escalera de los Rezos | `monje_campana` + 2 `penitente_ciego` |
| `c6n05` | shop | Puesto del Peregrino | Primera tienda del capítulo |
| `c6n06` | rest | Hospicio Detenido | Descanso; nadie envejece mientras duerme |
| `c6n07` | combat | Galería del Mediodía | 2 `arquero_meridiano` + `cantor_nona` |
| `c6n08` | event | El Confesionario Vacío | `confesionario_vacio` |
| `c6n09` | elite | El Caballero del Eclipse | `caballero_eclipse` + `penitente_ciego` |
| `c6n10` | combat | Claustro de las Ocho Vueltas | `sacristan_reloj` + `monje_campana` |
| `c6n11` | event | Biblioteca de Mañanas | `biblioteca_mananas` |
| `c6n12` | combat | Coro de la Hora Nona | `cantor_nona` + 2 `penitente_ciego` |
| `c6n13` | rest | Jardín de Estatuas Vivas | Último descanso seguro |
| `c6n14` | elite | El Ángel de las Horas Rotas | `angel_horas_rotas` + `arquero_meridiano` |
| `c6n15` | event | El Coro Detenido | `coro_detenido` |
| `c6n16` | combat | Observatorio Partido | `sacristan_reloj` + `cantor_nona` + `monje_campana` |
| `c6n17` | shop | La Sacristía Final | Última tienda de la expansión |
| `c6n18` | event | La Semilla del Vacío | `semilla_vacio` y decisión decisiva |
| `c6n19` | combat | Las Ocho Campanas | `caballero_eclipse` + 2 `penitente_ciego` |
| `c6n20` | boss | SERATH, ABADESA DEL NOVENO TOQUE | Boss + `angel_horas_rotas` |

### Hitos narrativos

- `c6n03`: el reloj muestra qué habría sido de cada héroe sin la guerra.
- `c6n08`: confesar una culpa reduce Perdición; mentir entrega oro y planta una
  bandera negativa.
- `c6n11`: la biblioteca contiene futuros que dejaron de existir.
- `c6n15`: liberar al coro permite que los monjes envejezcan y mueran en paz.
- `c6n18`: destruir, conservar o usar la semilla define el epílogo.
- `c6n20`: Serath debe ser detenida, pero el desenlace distingue entre matarla,
  perdonarla o quedar atrapados en su repetición.

## 4. Enemigos

Todos usan comportamientos actuales del motor; no requieren IA nueva para la
primera versión.

| ID | Nombre | Cap. | HP | Daño | Fila | Comportamiento | Rasgo narrativo |
|---|---|---:|---:|---:|---|---|---|
| `ahogado_sal` | Ahogado de Sal | 5 | 10 | 4 | front | swarm | Marineros cristalizados que avanzan en grupo |
| `gaviota_osaria` | Gaviota Osaria | 5 | 8 | 5 | back | weakest | Ave hecha de huesos y anzuelos; caza heridos |
| `corsario_hueco` | Corsario Hueco | 5 | 14 | 5 | front | tank | Armadura naval llena de agua negra |
| `cantor_marea` | Cantor de la Marea | 5 | 11 | 3 | back | curse | Aplica `mareo_abismo` con cantos submarinos |
| `recolector_nacar` | Recolector de Nácar | 5 | 12 | 2 | back | summon | Invoca `ahogado_sal` desde conchas funerarias |
| `capitan_sin_pulso` | Capitán sin Pulso | 5 | 25 | 7 | front | tank | Élite; timonel encadenado a su ancla |
| `oraculo_salmuera` | Oráculo de Salmuera | 5 | 21 | 5 | back | curse | Élite; aplica `petrificacion_sal` |
| `penitente_ciego` | Penitente Ciego | 6 | 11 | 4 | front | swarm | Monje con cera sobre los ojos, repite su paso |
| `monje_campana` | Monje Campana | 6 | 16 | 6 | front | tank | Su torso es una campana agrietada |
| `arquero_meridiano` | Arquero del Meridiano | 6 | 10 | 6 | back | weakest | Dispara flechas de luz detenida |
| `cantor_nona` | Cantor de la Nona | 6 | 13 | 4 | back | curse | Aplica `eclipse_interior` |
| `sacristan_reloj` | Sacristán del Reloj | 6 | 14 | 3 | back | summon | Invoca `penitente_ciego` desde minutos descartados |
| `caballero_eclipse` | Caballero del Eclipse | 6 | 28 | 8 | front | tank | Élite de armadura mitad solar, mitad lunar |
| `angel_horas_rotas` | Ángel de las Horas Rotas | 6 | 24 | 6 | back | curse | Élite; aplica `tic_sangriento` |

## 5. Jefes

### `leviatan_sal_negra`

- Nombre: **El Leviatán de Sal Negra**.
- Estadísticas objetivo: 92 HP, 8 daño, fila frontal.
- Silueta: ballena-serpiente abisal, costillas de naufragios, grietas de nácar y
  faros muertos colgando como señuelos.
- Diálogo final: no habla; expulsa cientos de voces ahogadas al quebrarse.
- Mazo compatible con efectos existentes:

| Carta | Peso | Efecto |
|---|---:|---|
| `mordida_bajamar` | 3 | attack tank ×2 |
| `vomito_naufragios` | 2 | summon 2 `ahogado_sal`, +1 doom |
| `canto_profundidad` | 2 | curse_all `mareo_abismo` |
| `costra_salina` | 2 | curse_all `petrificacion_sal` |
| `coletazo_rompepuertos` | 3 | attack weakest; +2 doom al caer |
| `beber_la_marea` | 1 | healSelf 12, +2 doom |

### `abadesa_serath`

- Nombre: **Serath, Abadesa del Noveno Toque**.
- Estadísticas objetivo: 108 HP, 8 daño, fila trasera.
- Silueta: abadesa anciana suspendida dentro de un astrolabio de campanas,
  vestiduras blancas y negras, halo de eclipse fracturado.
- Motivación: repetir el último día anterior a la guerra, aunque cada repetición
  borre millones de futuros.
- Mazo compatible con efectos existentes:

| Carta | Peso | Efecto |
|---|---:|---|
| `aguja_del_mediodia` | 3 | attack weakest ×2 |
| `procesion_repetida` | 2 | summon 2 `penitente_ciego`, +1 doom |
| `noveno_toque` | 2 | curse_all `eclipse_interior` |
| `minuto_de_sangre` | 2 | curse_all `tic_sangriento` |
| `futuro_cancelado` | 3 | attack tank; +3 doom al caer |
| `volver_atras` | 1 | healSelf 14, +2 doom |

Assets de bosses previstos:

- `bosses/leviatan_sal_negra` y `bosses/leviatan_sal_negra_defeat`.
- `bosses/abadesa_serath` y `bosses/abadesa_serath_defeat`.

## 6. Héroes desbloqueables

### `mara_salobre` — Mara, la Corsaria Salobre

- Desbloqueo: completar `mercado_fantasmas` sin vender un recuerdo.
- Rol: DPS frontal / bloqueo, 12 HP, 4 dados, fila frontal.
- Voz: pragmática, supersticiosa y seca; fue capitana de Puerto Albor y perdió a
  su tripulación dos veces: al hundirse y al regresar sin ellos.
- Hechizos: `corte_resaca`, `marea_cuchillas`, `ancla_espectral`.
- Pasiva planificada: `pie_de_cubierta`, +1 bloqueo al terminar un turno con al
  menos una espada sin gastar. Requiere hook nuevo; para MVP puede ser descriptiva.

### `elian_relojero` — Elian del Último Reloj

- Desbloqueo: liberar el `coro_detenido`.
- Rol: soporte arcano de retaguardia, 9 HP, 3 dados.
- Voz: preciso, amable y obsesionado con contar segundos; fue novicio de Serath y
  el único que recuerda todos los ciclos.
- Hechizos: `luz_meridiana`, `plegaria_novena`, `segundo_prestado`.
- Pasiva planificada: `un_instante_mas`, una vez por combate evita que un aliado
  caiga y lo deja a 1 HP. Requiere hook nuevo; para MVP puede quedar desactivada.

## 7. Equipo, magias, pociones, maldiciones y mascotas

### Ítems

| ID | Nombre | Precio | Mod compatible con el motor |
|---|---|---:|---|
| `sable_nacar` | Sable de Nácar | 92 | blanco → espada 1 |
| `broquel_marea` | Broquel de Marea | 84 | blanco → escudo 1 |
| `lente_eclipse` | Lente del Eclipse | 108 | espada 1 → estrella 1 |
| `corazon_leviatan` | Corazón del Leviatán | 128 | +5 HP máximo |
| `rosario_novena` | Rosario de la Novena | 156 | +1 dado, +3 HP máximo |
| `astrolabio_negro` | Astrolabio Negro | recompensa | +2 dados; único, no aparece en tienda |

### Magias

| ID | Nombre | Coste | Efecto ya soportado |
|---|---|---:|---|
| `corte_resaca` | Corte de Resaca | 2 | 5 daño a enemigo, melé |
| `marea_cuchillas` | Marea de Cuchillas | 3 | 3 daño a todos, `school: blade` |
| `ancla_espectral` | Ancla Espectral | 1 | +4 bloqueo a un aliado |
| `luz_meridiana` | Luz Meridiana | 2 | 5 daño, ignora fila, `school: holy` |
| `plegaria_novena` | Plegaria de la Nona | 3 | cura 4 a toda la party |
| `segundo_prestado` | Segundo Prestado | 1 | +4 bloqueo a un aliado |

### Pociones

| ID | Nombre | Tipo | Potencia | Precio |
|---|---|---|---:|---:|
| `salmuera_roja` | Salmuera Roja | heal | 9 | 16 |
| `esencia_marea` | Esencia de Marea | energy | 2 | 18 |
| `lagrima_nacar` | Lágrima de Nácar | cleanse | — | 16 |
| `infusion_novena` | Infusión de la Nona | heal | 13 | 24 |

### Maldiciones

| ID | Nombre | Hook actual | Duración | Potencia |
|---|---|---|---:|---:|
| `mareo_abismo` | Mareo del Abismo | reduceSword | 3 | 1 |
| `petrificacion_sal` | Petrificación Salina | reduceShield | 3 | 1 |
| `eclipse_interior` | Eclipse Interior | reduceStar | 3 | 1 |
| `tic_sangriento` | Tic Sangriento | dotDamage | 3 | 2 |

### Mascotas

| ID | Nombre | Hook actual | Potencia | Obtención |
|---|---|---|---:|---|
| `cangrejo_farol` | Cangrejo Farol | diceBonus | 1 | `jardin_corales` |
| `polilla_reloj` | Polilla del Reloj | onDoomReduce | 1 | `biblioteca_mananas` |

## 8. Eventos y decisiones

### `eventos_cap5`

| ID | Decisión positiva | Riesgo / contraparte | Flag principal |
|---|---|---|---|
| `carta_en_botella` | Entregar la carta a su destinataria | Abrirla y vender el secreto | `cap5_letterDelivered` |
| `mercado_fantasmas` | Conservar todos los recuerdos | Vender uno por oro y curación | `cap5_memoryKept` |
| `jardin_corales` | Liberar al cangrejo farol | Extraer perlas del jardín | `cap5_gardenFreed` |
| `faro_invertido` | Reorientar el haz hacia el monasterio | Apagarlo para reducir el peligro inmediato | `cap5_beaconAligned` |
| `campana_sumergida` | Hacerla sonar y liberar a los ahogados | Romperla y saquear el bronce | `cap5_deadReleased` |

### `eventos_cap6`

| ID | Decisión positiva | Riesgo / contraparte | Flag principal |
|---|---|---|---|
| `reloj_sin_sombra` | Aceptar el futuro perdido y seguir | Intentar entrar en él | `cap6_futureAccepted` |
| `confesionario_vacio` | Confesar una culpa verdadera | Mentir para obtener absolución | `cap6_truthConfessed` |
| `biblioteca_mananas` | Salvar un futuro ajeno | Leer el propio y alterarlo | `cap6_futureSaved` |
| `coro_detenido` | Liberar a los monjes del ciclo | Mantenerlos cantando como protección | `cap6_chorusFreed` |
| `semilla_vacio` | Destruir la semilla | Guardarla o usarla para rebobinar | `cap6_seedDestroyed` |

## 9. Epílogos de expansión

`computeExpansionEnding(state)` devuelve:

- `dawn`: semilla destruida, al menos 6 decisiones positivas entre caps. 5–6,
  Perdición combinada de expansión menor a 24.
- `tide`: victoria con coste; semilla destruida o sellada, pero faltan decisiones
  positivas o la Perdición está entre 24 y 39.
- `loop`: semilla usada, Serath aceptada como guía, Perdición ≥ 40 o más de la
  mitad de la party termina caída.

El `baseEnding` modifica una frase del epílogo, no bloquea resultados. Una campaña
que tuvo final malo todavía puede alcanzar `dawn`; la expansión trata precisamente
de qué se hace después del daño.

## 10. Integración técnica

### Datos

1. Crear `src/data/chapters/cap5.js` y `cap6.js`; registrarlos en
   `src/data/chapters/index.js`.
2. Añadir enemigos y jefes a sus bancos actuales usando exactamente los IDs de
   este documento.
3. Añadir `eventos_cap5` y `eventos_cap6` a `src/data/decks/index.js`.
4. Añadir narración por nodo y barks en `src/data/narrative.js`; actualizar
   `docs/STORY_BIBLE.md` solo cuando el canon sea aprobado.
5. Registrar `cap5: map5` y `cap6: map6` en `src/data/mapImages.js`.

### Límite entre campaña base y expansión

No se debe confiar únicamente en `hasNextChapter`, porque al registrar cap5 el
cap4 dejaría de parecer final. Añadir al schema de capítulo:

```js
arcEnd: 'base' | 'expansion' | null
```

- `cap4.arcEnd = 'base'` muestra el final actual y el botón de continuación.
- `startExpansion()` copia `ending` a `baseEnding`, limpia `ending`, avanza a
  cap5, cura la party y reinicia la Perdición del capítulo.
- `cap6.arcEnd = 'expansion'` calcula `expansionEnding`.
- `MapScreen` elige `EndingOverlay` o `ExpansionEndingOverlay` según `arcEnd`.

### Saves

Subir `SAVE_VERSION` a 8 y agregar defaults:

```js
baseEnding: null,
expansionEnding: null,
expansionStarted: false,
expansionDoom: 0
```

Los saves existentes con `chapterIndex === 3 && ending` conservan ese final. No
se migran automáticamente a cap5: el jugador decide continuar desde el overlay.

### Balance y tienda

- Caps. 5–6 asumen party con 2–5 mejoras acumuladas; los HP propuestos parten de
  esa curva.
- La tienda debe filtrar por `availableFromChapter` para no mostrar equipo de la
  expansión antes de cap5. Si no se implementa el filtro en el MVP, los seis
  ítems se agregan solo al pool de tiendas de caps. 5–6.
- `astrolabio_negro` es recompensa fija tras el boss de cap5, no compra.

### Mejoras opcionales del motor (no bloquean el MVP)

- Hooks reales para las pasivas de Mara y Elian.
- Una fase 2 visual de cada boss al 50% de HP; las estadísticas no cambian.
- Música propia (`costa`, `monasterio`) y dos cardbacks de eventos. Mientras
  tanto se reutilizan `mapa`, `combate`, `jefe` y `eventos`.
- Recompensas específicas por boss en lugar de resolverlas desde la store.

## 11. Orden de implementación

1. Schema `arcEnd`, migración v8 y flujo `startExpansion`.
2. Datos de capítulos, enemigos, bosses, eventos y validadores de integridad.
3. Registro de mapas y assets; fallback visual mientras se generan WebP.
4. Ítems, magias, pociones, maldiciones y mascotas; pruebas de hooks existentes.
5. Héroes desbloqueables y sus barks.
6. Narrativa completa, epílogos y balance automático de combates.
7. QA visual móvil/escritorio, audio y ajuste final.

## 12. Criterios de aceptación

- La campaña original aún termina correctamente en cap4.
- Un save terminado puede iniciar cap5 sin perder inventario ni final base.
- Los 38 nodos nuevos tienen IDs únicos, narración y referencias válidas.
- Todos los enemigos invocados existen y todos los bosses terminan en simulación.
- Los dos pools de eventos tienen cinco cartas y todas sus banderas se evalúan.
- Ningún asset nuevo depende de `.png`: el registro por glob acepta WebP.
- Build de producción limpio y suite headless completa.
