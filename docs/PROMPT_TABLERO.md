# Prompt del Tablero — para Claude Design

## Decisión de estructura: campaña larga por capítulos

10 nodos es muy poco. La estructura propuesta es una **campaña lineal dividida en
4 capítulos (regiones)**, cada uno con su propio mapa-segmento. La party avanza
siempre hacia adelante; entre capítulos hay un punto de guardado y un "campamento".

- **Capítulo 1 — El Valle Quemado** (~16 nodos) · jefe: GULRATH
- **Capítulo 2 — La Marisma de Telarañas** (~18 nodos) · jefe: La Tejedora
- **Capítulo 3 — La Ciudadela de Ceniza** (~20 nodos) · jefe: El Rey Ceniza
- **Capítulo 4 — La Grieta** (~14 nodos) · jefe final: El Devorado

Total ≈ **68 nodos**. Cada capítulo intercala: combates normales, combates de
élite, eventos, descansos/campamentos, tiendas y, al final, el casillero de jefe.
Recomendación: **un mapa por capítulo** (4 imágenes), más fácil de generar y de
renderizar que un mapa gigante único.

---

## Prompt maestro (pedírselo a Claude Design, una vez por capítulo)

> Diseñá un **mapa de tablero de juego de mesa estilo pergamino antiguo y dark
> fantasy** para la región "[NOMBRE DEL CAPÍTULO]". Debe mostrar un **camino
> sinuoso pero estrictamente lineal** (sin ramificaciones) que conecta **[N]
> nodos numerados del 1 al [N]**, leyéndose de izquierda a derecha y de arriba
> hacia abajo como una serpiente.
>
> Cada nodo es un círculo/medallón con un **ícono pequeño** según su tipo:
> ⚔️ combate · ☠️ combate de élite · 🃏 evento · 🛏️ descanso/campamento ·
> 🪙 tienda · 👑 jefe (el último nodo, más grande y ominoso).
>
> Ambientación visual de la región: [DESCRIPCIÓN DEL BIOMA].
> Paleta: ámbar/sepia/carmesí sobre pergamino quemado, con manchas de tinta,
> bordes chamuscados y una rosa de los vientos decorativa en una esquina.
> Ilustraciones ambientales pequeñas a los lados del camino (árboles, ruinas,
> montañas) sin tapar los nodos. Sin texto narrativo, solo los números de nodo.
>
> Formato apaisado 16:9, alta resolución, pensado como **fondo** sobre el que
> luego se posiciona el peón de la party.

### Variables por capítulo (reemplazar en el prompt)
- **Cap. 1 — El Valle Quemado** · N=16 · bioma: "un valle con aldeas incendiadas, campos calcinados, humo y cuervos".
- **Cap. 2 — La Marisma de Telarañas** · N=18 · bioma: "un pantano brumoso con árboles muertos cubiertos de telarañas violáceas y agua estancada".
- **Cap. 3 — La Ciudadela de Ceniza** · N=20 · bioma: "una ciudad fortaleza en ruinas cubierta de ceniza, murallas derruidas y braseros apagados".
- **Cap. 4 — La Grieta** · N=14 · bioma: "un paisaje irreal y abismal, una grieta cósmica en la realidad, geometría imposible y luz violácea".

---

## Cómo se integra con el juego

El motor renderiza el mapa como **imagen de fondo del contenedor del tablero** y
dibuja por encima los **nodos clicables** y el **peón de la party** usando
coordenadas (x,y en %) definidas en los datos del capítulo. Así el arte y la
lógica quedan desacoplados: si cambiás el mapa, solo reajustás coordenadas.

> Pedile a Claude Design que, además del mapa, te exporte (o te indique) las
> coordenadas aproximadas de cada nodo, o ubicalas vos una vez y guardalas en
> `data/chapters/cap1.js` (ver CONTENT_SCHEMA.md → `boardNode.pos`).
