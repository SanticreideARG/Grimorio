# GRIMORIO — Prompts de sonidos

Coloca aquí archivos `.ogg` o `.mp3` con exactamente estos nombres.
El sistema de audio los detecta automáticamente (Vite `import.meta.glob`).
Si un archivo falta, ese sonido se omite silenciosamente.

Paleta sonora: dark fantasy medieval. Sin música occidental moderna.
Instrumentos referencia: cuerno de hueso, laúd apagado, percusión grave,
cuerdas tensas, coros en modo frigio o dórico. Sin sintetizadores pop.

---

## dice_roll.ogg
Tirada de dados en combate. 2-4 dados de hueso o piedra cayendo sobre una
superficie de madera oscura. Rattle corto (0.4s), sin reverb excesivo.
Frecuencia dominante media-alta. Sensación táctil e inmediata.

## attack.ogg
Ataque de espada del héroe. Silbido metálico de hoja + impacto sordo (carne o
armadura). Dos transientes: el swing (agudo) seguido del golpe (medio-bajo).
Duración: 0.5s.

## spell_cast.ogg
Lanzamiento de hechizo ofensivo (bola de fuego, relámpago, etc.). Acumulación
rápida de energía (500ms) + estallido mágico. Componentes: armónicos agudos
ascendentes + detonación grave. Duración total: 0.8s.

## heal.ogg
Curación / hechizo de apoyo. Arpeggio ascendente suave (3-4 notas, intervalo de
tercera). Timbre etéreo tipo cítara o campana de agua. Sin agresividad.
Duración: 0.7s.

## potion.ogg
Uso de poción. Glug líquido (efecto de burbuja-trago) seguido de un tintineo
cristalino suave. Duración: 0.5s. Carácter: alquímico, leve.

## enemy_attack.ogg
Ataque enemigo al héroe. Más grave y brutal que `attack.ogg`. Impacto pesado
como un mazo o garra contra armadura. Sin el silbido de hoja, solo impacto.
Duración: 0.4s.

## boss_enter.ogg
Aparición del jefe. Sting dramático: cuerno grave de ataque + coro breve en
modo menor + golpe de percusión profundo. Duración: 1.5s-2s. Debe sentirse
amenazante y definitivo.

## combat_victory.ogg
Victoria en combate normal. Fanfarria corta y satisfactoria (2-3 notas
ascendentes en Do mayor o Sol mayor). Laúd o cuerda punteada, no orquestal
épico. Duración: 1.2s.

## chapter_clear.ogg
Capítulo completado. Más largo y emotivo que `combat_victory.ogg`. Progresión
de acordes (tónica → subdominante → tónica) con cuerdas y coro suave.
Duración: 2.5s.

## doom_up.ogg
Perdición aumenta. Golpe de tambor grave + tono descendente amenazante (como
una cuenta regresiva). Debe generar ansiedad leve. Duración: 0.6s.

## doom_down.ogg
Perdición disminuye. Contrario a `doom_up`: tono suavemente ascendente, campana
pequeña o arpa. Alivio. Duración: 0.5s.

## rest.ogg
Nodo de descanso / campamento. Sonido ambiental breve: chisporroteo de hoguera
(1s) con un acorde de cuerda grave de fondo. Calmado, no dramático.
Duración: 1.5s.

## shop_open.ogg
Tienda se abre. Tintineo de monedas + chirrido suave de madera (como una puerta
de taberna). Carácter: mundano, levemente picaresco. Duración: 0.5s.

## event_draw.ogg
Carta de evento robada. Susurro de pergamino desplegándose + tono misterioso
suave. Sensación de algo revelándose. Duración: 0.6s.
