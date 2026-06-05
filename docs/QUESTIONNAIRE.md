# GRIMORIO — Cuestionario de definiciones
# ✅ COMPLETADO — 2026-06-05

---

## A. FUNDAMENTALES

**Q-MODO** — Single + **hotseat** (mismo dispositivo, por turnos).

**Q-PARTY-REPARTO** — 1 a 4 héroes en party. 1 a 4 jugadores en hotseat.
Party fija: se elige al inicio de la campaña del roster de 7 héroes y no cambia.

**Q-STACK** — **React 19 + Vite + Zustand**.
El motor de juego (`core/`, `systems/`) es JS puro. React solo consume el estado.
Zustand como store central (sin providers, muta directo).

**Q-TEMA** — Dark fantasy confirmado.

**Q-DURACION** — ~40 min por capítulo (~2h40 campaña completa).
Se juega por sesiones; guardado entre capítulos.

**Q-RAMIFICACION** — 100% lineal.
Solo ramifican las decisiones dentro de los eventos.

---

## B. SISTEMAS DE JUEGO

**Q-COMBATE-POS** — **Frente / Retaguardia** (2 filas).
Héroes y enemigos tienen `row: 'front' | 'back'`.
Retaguardia no puede ser atacada directamente mientras haya alguien en el frente.
Dados de símbolos (⚔️🛡️⭐) confirmados.

**Q-PROGRESION** — **Dice-building + equipo/ítems acumulables**.
Persiste entre capítulos: mejoras de dados, equipo equipado, mascotas.
HP se restaura parcialmente en campamento (requiere nodo de descanso o recursos).
Sin permadeath duro: héroe a 0 HP queda caído hasta fin de combate.
Si toda la party cae → consecuencia según dificultad:
  - Fácil: reintentar sin coste.
  - Normal: penalización de Perdición.
  - Difícil: Final Malo si ocurre en el jefe.

**Q-MAZOS** — eventos / botín / magias / pociones / maldiciones / mascotas / jefes.
Aliados/NPCs como efectos de eventos o ítems, no mazo propio (v1).

**Q-MALDICION** — Solo penalizan. Duran 1–3 turnos.

**Q-MASCOTAS** — Bono pasivo simple. No pueden caer.

**Q-DERROTA** — Sin permadeath ni roguelite.
Finales Buenos / Agridulces / Malos según decisiones acumuladas y track de Perdición.

**Q-DIFICULTAD** — 3 niveles: fácil / normal / difícil.

---

## C. CONTENIDO Y NARRATIVA

**Q-NARRATIVA** — Tono épico-serio. La CPU lee el guion en pantalla.

**Q-CAPITULOS** — Confirmado: 4 capítulos, ~68 nodos totales.

**Q-ROSTER** — 7 héroes: guerrera, mago, sanadora, pícara, cazador, paladín,
**caballero oscuro** (nuevo — pasivo: puede ocupar cualquier fila sin penalización).

**Q-EVENTOS** — Los eventos pueden pedir chequeos (tirada de dados + atributo).

---

## D. SECUNDARIAS / PRESENTACIÓN

**Q-ARTE** — Estética dark fantasy pictórica del `_STYLE.txt` confirmada.

**Q-AUDIO** — Música + SFX en v1.

**Q-IDIOMA** — Español.

**Q-PLATAFORMA** — Solo desktop.

**Q-A11Y** — Sin requisitos especiales en v1.

---

## E. TÉCNICAS / DISTRIBUCIÓN

**Q-SAVE** — 3 slots para 3 partidas simultáneas.

**Q-TESTS** — Tests headless del motor (combate, avance) antes de cerrar cada fase.

**Q-DISTRIBUCION** — GitHub Pages / repo propio.

**Q-LICENCIA** — Privado.
