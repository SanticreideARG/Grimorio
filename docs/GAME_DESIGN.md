# GRIMORIO — Game Design Document (GDD)

> Documento de **definiciones**. Las marcas 🔲 son decisiones pendientes que se
> resuelven en `QUESTIONNAIRE.md`. El prototipo previo (`/grimorio` original) es
> **modelo de contexto**, no el código final: aquí se define la versión madura.

---

## 1. Visión

Juego cooperativo **dark fantasy** por turnos en navegador. Una party de héroes
recorre una **campaña lineal por capítulos** enfrentando enemigos, eventos
aleatorios y jefes. El **Maestro de Ceremonias (MC) es siempre la CPU**: narra,
revela eventos y controla a los enemigos mediante IA. Los jugadores nunca controlan
al MC.

**Fantasía central:** "Sois lo único que se interpone entre la oscuridad y el
último refugio. El camino es uno solo, y no tiene vuelta atrás."

## 2. Pilares de diseño

1. **Cooperación táctica** — las decisiones de la party importan más que la suerte.
2. **Tensión creciente** — el track de Perdición y la escalada de capítulos.
3. **Identidad mecánica** — Maldiciones que transforman, Mascotas que crecen.
4. **Rejugabilidad** — mazos aleatorios, roster de héroes, eventos ramificados.
5. **Contenido data-driven** — todo el contenido se agrega como datos, no código.

## 3. Modos de juego

- **Un jugador (solitario):** un humano controla a toda la party; el MC es la CPU.
- **Multijugador por turnos:** varios humanos, **cada uno controla uno o más
  héroes**; el MC sigue siendo la CPU.
  - 🔲 **DECISIÓN CLAVE (Q-MODO):** ¿multijugador **hotseat** (mismo dispositivo,
    se pasan el turno) o **online** (dispositivos separados)?
    - *Hotseat* encaja con la arquitectura browser + localStorage (sin servidor).
    - *Online* requiere backend/netcode y un modelo de estado autoritativo →
      cambia radicalmente la arquitectura (ver ARCHITECTURE.md §Multiplayer).
  - 🔲 **Q-PARTY-REPARTO:** ¿los jugadores eligen héroes de un roster, o se
    reparten una party fija? ¿Cuántos jugadores (2–4)?

> **Recomendación inicial:** arrancar con **single-player + hotseat** (mismo
> motor, el "jugador activo" es una variable), y dejar el online como fase futura.

## 4. Estructura de la campaña (juego LARGO)

4 capítulos / regiones, ~68 nodos totales (ver `PROMPT_TABLERO.md`):

| Cap | Región | Nodos | Jefe |
|-----|--------|-------|------|
| 1 | El Valle Quemado | ~16 | GULRATH, el Devorador de Aldeas |
| 2 | La Marisma de Telarañas | ~18 | La Tejedora de Maldiciones |
| 3 | La Ciudadela de Ceniza | ~20 | El Rey Ceniza |
| 4 | La Grieta | ~14 | El Devorado (jefe final) |

- Avance **estrictamente lineal** dentro de cada capítulo (sin ramificación de
  ruta; sí ramifican las *decisiones* dentro de eventos). 🔲 Q-RAMIFICACION.
- Entre capítulos: **campamento** (gastar oro, subir de nivel, curar) y guardado.
- Tipos de nodo: inicio, combate, combate de élite, evento, descanso/campamento,
  tienda, jefe.

## 5. Bucle de juego (core loop)

```
[Mapa] elegir avanzar ▸ resolver nodo
        ├─ Combate  → rondas por turnos (party vs enemigos CPU) → botín
        ├─ Evento   → carta narrativa con elección(es) → efecto
        ├─ Descanso → curar / gestionar
        ├─ Tienda   → gastar oro
        └─ Jefe     → combate mayor → fin de capítulo
   ↑ repetir hasta el jefe final ↓
[Victoria] o [Derrota si la party cae o la Perdición se desborda]
```

## 6. Combate

- **Dados de símbolos** (base del prototipo, a madurar): 🗡️ daño · 🛡️ bloqueo ·
  ⭐ energía arcana. Cada héroe tira un pool de dados; los ítems/mascotas modifican
  el pool (dice-building ligero).
- **Por rondas:** fase de héroes (acciones: atacar, magia, poción, objeto, pasar) →
  fase de enemigos (IA por comportamiento).
- **IA enemiga por comportamiento** (sin que el MC decida a mano): atacar al más
  débil/fuerte, maldecir, invocar, etc. 🔲 Q-COMBATE-POS: ¿combate **abstracto**
  (sin posiciones, como el prototipo) o con **posicionamiento** (frente/retaguardia
  o grilla)?
- **Jefes:** además de más vida/daño, usan un **mazo de comportamiento** propio
  (cartas que escalan), inspirado en Aeon's End / Too Many Bones.

## 7. Sistemas de cartas (mazos)

Eventos · Botín · Magias · Pociones · Maldiciones · Mascotas · Comportamiento de
jefes. 🔲 Q-MAZOS: reglas de robo, descarte y reciclado por definir en detalle.

## 8. Subsistemas firma

- **Maldiciones:** debuffs persistentes que la CPU inflige. 🔲 Q-MALDICION: ¿solo
  penalizan o, al acumularse, **transforman** mecánicamente al héroe (gancho de
  originalidad)?
- **Mascotas/Compañeros:** dan bonos pasivos. 🔲 Q-MASCOTAS: ¿suben de nivel,
  pueden caer/sacrificarse, tienen arco propio?
- **Perdición:** reloj de tensión global; al desbordar, potencia al jefe o causa
  derrota.

## 9. Progresión

🔲 Q-PROGRESION: definir entre — (a) **leveling** con puntos, (b) **dice-building**
(mejorar caras/cantidad de dados), (c) **equipo** acumulable, o combinación. ¿Qué
persiste entre capítulos? ¿Hay permadeath o se revive en el campamento?

## 10. Condiciones de victoria / derrota

- **Victoria:** derrotar al jefe final del Capítulo 4.
- **Derrota:** toda la party cae en combate, **o** la Perdición llega al máximo
  en un momento crítico. 🔲 Q-DERROTA: ¿reintentar capítulo, o run única estilo
  roguelite?

## 11. Narrativa

- Guion escrito por nodo/capítulo, leído por la CPU (MC). 🔲 Q-NARRATIVA: ¿guion
  lineal o con ramas según decisiones/eventos? ¿Tono épico-serio o humor oscuro?

## 12. Alcance fuera de v1 (futuro)

Multiplayer online, editor de capítulos, audio/música, logros, más capítulos,
modo roguelite. (Ver ROADMAP.md.)
