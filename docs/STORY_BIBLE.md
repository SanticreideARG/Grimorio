# GRIMORIO — Biblia narrativa

Referencia canónica para escribir diálogos y narración. Definida con el autor.

## Premisa central

El mundo fue arrasado por **la guerra de la ceniza**. Lo que queda son ruinas, carroña
y un puñado de sobrevivientes. Los héroes descienden por cuatro regiones cada vez más
oscuras hasta la fuente de todo: el Rey Ceniza, y lo que el Rey desató.

## El villano: el Rey Ceniza

- Fue un **rey** de verdad: tenía un reino, un trono, una familia.
- Lo perdió **todo** en la guerra.
- En su **duelo y negación** tomó una decisión monstruosa: si él debe sufrir, el mundo
  entero debe arder con él. No es ambición; es dolor convertido en aniquilación.
- Para lograr la destrucción total invocó algo más allá de lo mortal: **El Devorado**,
  un arma del Vacío. **No pudo controlarlo.**
- El Devorado abre ahora **la Grieta** y consume el mundo. El Rey es el **origen
  trágico**; el Devorado, **su pecado hecho carne** — la consecuencia que escapó.
- Emblema: **una corona partida sobre fondo de ceniza**.
- Símbolo del culto al Devorado: **una espiral que se devora a sí misma**.

> Arco emocional: el jugador debería llegar al Cap.3 **comprendiendo** al Rey aunque
> deba detenerlo. No es un mal caricaturesco: es un hombre roto que eligió mal.

## Los héroes: sobrevivientes con cuentas

No son elegidos ni paladines de una profecía. Son **sobrevivientes** y cada uno
**perdió algo** ante la ceniza del Rey. Luchan tanto por venganza como por salvación.

| Héroe | Voz | Pérdida / gancho |
|-------|-----|------------------|
| **Brenna** la Quebrantahuesos (guerrera) | Brutal, directa | Soldado; su compañía murió en una batalla perdida. |
| **Sir Aldric** (paladín) | Noble, devoto, irónico-amargo | Caballero de una orden que ya no existe; su juramento sobrevivió al reino que servía. |
| **El Caballero Oscuro** (caballero_oscuro) | Lúgubre, fatalista | **Fue caballero del propio Rey Ceniza** antes de la caída. Conoce su historia → **fuente de lore**. |
| **Veyra** de la Llama (mago) | Soberbia, sarcástica | Su torre/academia ardió; quien domina el fuego no pudo detener un incendio. |
| **Maevis** (sanadora) | Serena, compasiva, calma que corta | Se quedó sin gente a quien sanar. Culpa del superviviente. |
| **Nix** (pícara) | Sarcástica, ágil | Sobrevivió a una ciudad arrasada; perdió a su banda. El sarcasmo es su armadura. |
| **Corvin** (cazador) | Parco, certero | Guardabosques; sus bosques y los suyos son ceniza. |

## Tono

**Humor coral, oscuro.** Varios personajes sueltan ironía a su manera (Nix sarcástica,
Veyra soberbia, el Caballero Oscuro lúgubre). El chiste no rompe la oscuridad: la
subraya. Nunca chistes "modernos" ni rompimiento de la cuarta pared.

## Estructura de capítulos

| Cap | Región | Qué era antes | Jefe | Rol en la trama |
|-----|--------|---------------|------|-----------------|
| 1 | El Valle Quemado | Tres comarcas de cultivo | **Gulrath**, el Devorador de Aldeas | Carroña que sigue al fuego; NO sirve al Rey. Presenta el mundo arrasado. |
| 2 | La Marisma de Telarañas | (por definir) | **La Tejedora de Maldiciones** | (por definir) |
| 3 | La Ciudadela de Ceniza | El antiguo trono del Rey | **El Rey Ceniza** | El origen. Clímax emocional. |
| 4 | La Grieta | Nada — herida en el mundo | **El Devorado** | La consecuencia. El arma que el Rey no controló. |

## Sistema (cómo se entrega la narración)

`src/data/narrative.js` — una entrada por nodo:
- `place`: narración del lugar (qué fue antes / qué queda). Se muestra al llegar.
- `heroBarks`: `{ heroId: [líneas] }` — comentario solo si el héroe está en la party.
- `lore`: goteo del trasfondo del Rey/Devorado, en nodos clave.

Reglas: 1-2 frases por `place`, máximo 1 bark por nodo, todo breve. En recorrido
lineal cada nodo se pisa una vez, así que nada se repite ni satura.

## Estado

- [x] Cap.1 — completo (16 nodos)
- [ ] Cap.2 — pendiente
- [ ] Cap.3 — pendiente (clímax del Rey)
- [ ] Cap.4 — pendiente (final)
