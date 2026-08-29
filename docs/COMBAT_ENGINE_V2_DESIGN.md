# Grimorio — Diseño del combate táctico V2

Estado: propuesta para validar. Este documento no modifica todavía las reglas ni
el balance del juego.

## Objetivos

1. Reducir resultados arbitrarios y hacer que una derrota pueda explicarse por
   decisiones observables.
2. Convertir formación, tipo de ataque y composición de la party en decisiones
   tácticas reales.
3. Mantener partidas ágiles: más profundidad por interacción, no por acumulación
   de estadísticas y porcentajes.
4. Preservar las identidades actuales: dados de símbolos, hechizos, filas,
   hotseat, intenciones enemigas y construcción progresiva de cada héroe.

## Cambio de balance ya acordado

- `Espada Oscura`, de Orphen, pasa de **1 a 2 de maná**.
- Se conserva provisionalmente en 4 de daño, cuerpo a cuerpo y sin ignorar fila.
- El aumento debe evaluarse junto con afinidades. Si el daño `shadow` obtiene una
  ventaja frecuente, coste 2 es correcto; si queda demasiado situacional, puede
  recibir `quiebra 1` o daño adicional contra enemigos protegidos en vez de más
  daño base.

## Nueva secuencia de ronda

Cada ronda se divide en cuatro ventanas fijas:

1. **Vanguardia aliada**: actúan todos los héroes vivos en fila frontal.
2. **Vanguardia enemiga**: actúan todos los enemigos vivos en fila frontal.
3. **Retaguardia aliada**: actúan todos los héroes vivos en fila trasera.
4. **Retaguardia enemiga**: actúan todos los enemigos vivos en fila trasera.

Dentro de una ventana aliada, el jugador elige el orden de sus héroes elegibles.
En hotseat se respeta la propiedad de héroes, pero ningún jugador puede adelantar
una unidad de una ventana posterior. Dentro de una ventana enemiga, el orden es
estable y visible desde el inicio de la ronda: jefe, élite y luego orden de
formación; no se sortea de nuevo.

Una unidad derrotada antes de su ventana no actúa. Esta es la recompensa central
por priorizar objetivos, pero exige que HP y daño se rebalanceen para evitar que
la vanguardia aliada anule sistemáticamente a toda la vanguardia enemiga.

### Estado de fase propuesto

El estado deja de alternar sólo entre `hero` y `enemy` y pasa a una cola explícita:

```text
ally_front → enemy_front → ally_back → enemy_back → round_end
```

Cada actor tiene `actedThisRound`; la ventana mantiene una cola de actores vivos.
Invocaciones entran en su fila, pero no actúan hasta la ronda siguiente. Cambiar
de fila durante una ventana nunca concede un segundo turno.

## Afinidades de ataque y defensas

Cada ataque declara un único **perfil de impacto**. La escuela mágica sigue
existiendo para efectos, animación y sinergias, pero no reemplaza el perfil.

| Perfil | Ejemplos | Defensa enfrentada |
| --- | --- | --- |
| `melee` | espada, martillo, embate | Armadura |
| `ranged` | arco, ballesta, arma arrojadiza | Cobertura |
| `arcane` | fuego, tiempo, vacío, luz | Guarda |
| `true` | efectos excepcionales y telegrafiados | Ninguna |

Cada unidad usa sólo tres grados legibles por perfil:

- **Resistente**: `-2` de daño.
- **Neutral**: sin modificación.
- **Vulnerable**: `+2` de daño.

El daño mínimo es 1, salvo inmunidades excepcionales de una fase de jefe. No se
usan porcentajes: hacen difícil anticipar el resultado y agregan redondeos poco
transparentes. El panel de objetivo muestra el daño final antes de confirmar.

Ejemplo solicitado: un guardián acorazado puede ser resistente a `melee`, neutral
a `arcane` y vulnerable a `ranged`. Así Brenna puede contenerlo, Corvin castigarlo
y Veyra ofrecer una alternativa estable. No todos los enemigos deben tener una
debilidad: los comunes pueden ser neutrales y las afinidades aparecer en unidades
que definan la táctica del encuentro.

### Reglas de alcance

- Un ataque `melee` sólo alcanza la primera fila enemiga mientras quede una
  vanguardia viva.
- `ranged` y `arcane` pueden elegir cualquier fila, salvo cobertura o una regla
  explícita del encuentro.
- Atacar desde retaguardia no convierte automáticamente un ataque en `ranged`:
  el perfil pertenece a la habilidad, no a la posición del actor.
- La escuela (`holy`, `shadow`, `fire`, `tide`, etc.) se reserva para sinergias y
  resistencias especiales poco frecuentes. Esto evita una matriz inmanejable.

## Reducción del azar

### Eliminar por completo

- Fallo físico del 2%.
- Crítico aleatorio del 2%.
- Selección aleatoria de objetivo para `swarm`.
- Probabilidades de aplicar maldición.
- Probabilidad de que un invocador invoque en lugar de atacar.

Los críticos se convierten en **Golpes precisos**: ocurren al explotar una
vulnerabilidad, romper Guardia o cumplir una condición escrita en la habilidad.
Las maldiciones e invocaciones se anuncian como intención y se ejecutan siempre,
salvo que el jugador interrumpa al enemigo.

### Conservar los dados, pero hacerlos gobernables

Los dados son parte de la identidad de Grimorio y del progreso ya construido. La
primera versión no debería eliminarlos, sino convertirlos en una **reserva
táctica previsible**:

1. Al inicio de la ronda se revelan los resultados de todos los héroes.
2. Antes de actuar, cada héroe puede elegir una postura: Ofensiva convierte un
   símbolo menor en espada; Guardia en escudo; Canalización en estrella.
3. Cada héroe dispone de una conversión por ronda. Los objetos pueden modificar
   esa conversión, no agregar rerolls ilimitados.
4. El historial de caras usa una bolsa sin reemplazo por héroe: una cara usada no
   vuelve hasta agotar las seis. Se muestran las próximas dos caras posibles.

Esto conserva variación y dice-building, pero impide rachas indefinidas y permite
planificar. Si durante pruebas aún se siente demasiado azaroso, la variante V2.1
es reemplazar la bolsa por una secuencia de seis caras ordenable fuera de combate.

## Intenciones enemigas

La estrategia necesita información suficiente. Al comenzar la ronda, cada
enemigo anuncia:

- ventana y posición en la cola;
- acción exacta (`atacar`, `maldecir`, `invocar`, `proteger`, `preparar`);
- objetivo o regla de selección;
- perfil de impacto y daño final estimado;
- estados que aplicará.

Los jefes pueden ocultar el detalle de una segunda etapa, pero nunca el efecto que
ocurrirá en la ventana actual. Una carta puede decir “patrón desconocido” en la
preview del mapa; una vez dentro del combate, su intención presente debe ser
legible.

## Mecánicas adicionales recomendadas

### 1. Guardia e intercepción

Los escudos dejan de ser sólo HP temporal. Un héroe frontal puede gastar 2
escudos para interceptar un ataque dirigido a la retaguardia y convertirse en su
objetivo. Crea decisiones defensivas sin añadir otra moneda.

### 2. Quiebra

Algunas habilidades aplican puntos de `quiebra`. Al alcanzar el umbral visible de
un enemigo, éste pierde su resistencia hasta el final de la ronda y su próximo
ataque causa menos daño. Es una vía para que un atacante desfavorable contribuya
a preparar el golpe decisivo de otro héroe.

### 3. Marcar y explotar

Arqueros, pícaros y ciertos objetos pueden `marcar` un objetivo. El siguiente
ataque de un perfil distinto consume la marca para `+2` de daño o un efecto de
control. Favorece parties mixtas y coordinación hotseat, sin combos largos.

### 4. Cambio de formación con coste

Una vez por ronda, antes de la primera ventana aliada, se puede intercambiar un
héroe frontal y uno trasero. Cuesta 1 recurso compartido de **Mando**, que se
recupera al inicio de cada encuentro. El cambio gratuito permanente haría que las
filas perdieran significado; el coste crea una decisión de emergencia.

### 5. Preparar

Un héroe puede renunciar a su ataque para preparar una reacción simple: contraatacar
el primer `melee`, cubrir al aliado marcado o interrumpir una invocación. Las
reacciones se resuelven automáticamente y siempre están visibles en la cola.

### 6. Terreno moderado

Cada encuentro puede tener una sola regla de terreno, mostrada antes de entrar:
niebla reduce ataques `ranged`, pasarela estrecha refuerza la primera vanguardia,
suelo rúnico potencia el primer `arcane`. Una regla por combate añade variedad sin
convertir la interfaz en un manual.

## Efectos sobre héroes actuales

- **Brenna / Aldric**: ganan valor mediante Guardia, intercepción y quiebra.
- **Caballero Oscuro / Mara / Orphen**: presión frontal antes de la respuesta
  enemiga; deben pagar ese privilegio con exposición a la ventana enemiga frontal.
- **Veyra / Maevis / Elian**: pueden responder al daño de la vanguardia enemiga
  antes de que actúe la retaguardia enemiga.
- **Nix / Corvin**: explotan objetivos y retaguardias con perfiles precisos; Nix
  necesita que sus habilidades declaren si son `melee` o `ranged`, no inferirlo
  de su fila.
- **Espada Oscura**: coste 2 evita que Orphen combine demasiado fácilmente daño
  frontal temprano con su reserva híbrida de estrellas.

## Riesgos y salvaguardas

- **Ventaja excesiva del primer golpe**: bajar daño explosivo frontal, subir HP o
  dar `brace` inicial a ciertos enemigos, nunca iniciativa aleatoria.
- **Party sin el perfil correcto**: todos los encuentros deben poder superarse en
  neutral; explotar debilidades acorta o controla el combate, no es una llave
  obligatoria.
- **Sobrecarga visual**: mostrar perfil, defensa e intención junto al objetivo;
  ocultar cálculos secundarios detrás del panel de detalle.
- **Hotseat lento**: elegir el orden sólo dentro de la ventana; las intenciones y
  resultados de dados se revelan una vez por ronda.
- **Jefes resueltos por una sola debilidad**: sus fases cambian afinidades de forma
  anunciada o exigen primero quiebra; no rotan resistencias al azar.

## Ruta de implementación futura

1. Congelar reglas y crear simulaciones de referencia para encounters comunes,
   élites y jefes actuales.
2. Introducir perfiles y cálculo de daño sin cambiar todavía el orden de turnos.
3. Sustituir procs aleatorios por intenciones deterministas.
4. Migrar a las cuatro ventanas y adaptar hotseat, invocaciones, DOT y final de
   ronda.
5. Añadir reserva táctica y postura; comparar varianza con el sistema actual.
6. Incorporar Guardia/Intercepción y Quiebra; dejar Marca, Mando, Preparar y
   Terreno para iteraciones separadas.
7. Rebalancear enemigo por enemigo y después los bosses.
8. Actualizar tutorial, preview, cola visual, accesibilidad y modo debug.

## Pruebas de aceptación futuras

- La cola siempre respeta `aliado frontal → enemigo frontal → aliado trasero →
  enemigo trasero` y omite caídos.
- Cambiar de fila o invocar no concede acciones extra.
- El mismo estado y las mismas decisiones producen el mismo resultado.
- La UI predice exactamente el daño final antes de confirmar.
- Cada encuentro tiene al menos una solución neutral para cualquier party válida.
- Las seis caras de cada bolsa aparecen antes de repetirse.
- Hotseat nunca permite actuar fuera de ventana o controlar héroes ajenos.
- Los bosses anuncian toda acción de la ventana actual y las transiciones de
  afinidad.

## Decisiones que conviene validar antes de implementar

1. Confirmar si la variación controlada de la bolsa de dados es deseable o si el
   objetivo final es eliminar también esa fuente de azar.
2. Confirmar si una unidad derrotada antes de su ventana pierde su acción; esta
   propuesta asume que sí.
3. Elegir qué mecánica adicional entra en la primera versión. Recomendación:
   **Guardia/Intercepción + Quiebra**; aportan profundidad inmediata y reutilizan
   símbolos y roles existentes.

