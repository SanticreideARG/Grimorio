# Carrusel promocional del menú principal

Estado global: **GENERADO — 12/12 imágenes producidas y validadas**.

Esta cola reemplazará el fondo estático actual del menú por una secuencia de 12
ilustraciones promocionales. Los prompts autocontenidos están en
`assets/img/menu/` y usan la misma ancla visual que el resto del juego.

## Especificación compartida

- **Salida:** 2560×1440 px, paisaje 16:9, preferentemente WebP final.
- **Recorte vertical:** el motivo principal debe sobrevivir a un recorte 9:16
  centrado; ningún elemento narrativo imprescindible puede depender de las
  esquinas.
- **Zona de interfaz:** tercio izquierdo reservado por completo para título y
  menú. Debe ser oscuro, legible y sin personajes, enemigos, mascotas, armas,
  texto diegético ni objetos narrativos.
- **Aire para Ken Burns:** dejar margen real alrededor del sujeto y no cortar
  siluetas, manos, armas, alas ni efectos; el zoom previsto es del 8%.
- **Composición:** sujeto principal entre el 38% y 78% del ancho, con centro de
  masa dentro del 56% central para que funcione también en móvil. Mantener
  información crítica por encima del 82% de altura.
- **Estilo:** `assets/img/_STYLE.txt`: dark fantasy painterly, textura de óleo,
  claroscuro cinematográfico, acentos ámbar/brasas, sombras carmesí y teal-
  púrpura, paleta desaturada, sin texto, UI, logos, marcas de agua ni marcos.
- **Entrega por pieza:** generar primero un máster 2560×1440; después validar
  miniaturas 16:9 y 9:16 antes de publicarlo en el carrusel.

## Cola de producción

| # | Archivo previsto | Foco | Transición sugerida | Estado |
|---:|---|---|---|---|
| 01 | `menu_01.webp` | Compañía frente al refugio | Crossfade + zoom lento | GENERADO |
| 02 | `menu_02.webp` | Brenna y Gulrath | Disolución de brasas | GENERADO |
| 03 | `menu_03.webp` | Nix, Corvin y La Tejedora | Barrido de niebla | GENERADO |
| 04 | `menu_04.webp` | Caballero Oscuro y Rey Ceniza | Barrido de ceniza | GENERADO |
| 05 | `menu_05.webp` | Veyra contra El Devorado | Iris de vacío | GENERADO |
| 06 | `menu_06.webp` | Mara y el Leviatán de Sal Negra | Barrido de ola oscura | GENERADO |
| 07 | `menu_07.webp` | Elian, Maevis y Abadesa Serath | Pulso de eclipse | GENERADO |
| 08 | `menu_08.webp` | Mascotas y campamento | Crossfade cálido | GENERADO |
| 09 | `menu_09.webp` | Horda de enemigos | Parallax de sombras | GENERADO |
| 10 | `menu_10.webp` | Escenario y amenaza menor | Disolución espectral | GENERADO |
| 11 | `menu_11.webp` | Los diez héroes | Parallax de profundidad | GENERADO |
| 12 | `menu_12.webp` | Panorama de los seis reinos | Disolución de tinta (vuelve a 01) | GENERADO |

## Integración prevista (posterior)

Crear `src/data/menuSlides.js` con `id`, `art`, `focalDesktop`,
`focalMobile`, `transition` y `durationMs`. Cargar sólo la diapositiva actual
y la siguiente; mantener el fondo estático actual como fallback de error.
Usar 8–12 s por imagen, transición de 1.0–1.4 s, pausar cuando la pestaña no
esté visible y respetar `prefers-reduced-motion` (crossfade sin zoom ni
barridos). La CSS actual centra el menú; la integración debe mover título y
controles al tercio izquierdo sin perder legibilidad en móvil.

## Criterio de aprobación

Una imagen pasa a `LISTO` sólo cuando: (1) coincide con la identidad de las
referencias indicadas en su prompt, (2) el tercio izquierdo queda libre de
narrativa, (3) sobrevive el recorte 9:16, (4) el zoom del 8% no corta el sujeto,
(5) no contiene texto ni UI generados y (6) está optimizada sin halo ni marco.
