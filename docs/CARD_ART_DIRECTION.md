# Grimorio — Dirección artística de cartas

Estado: guía visual temporal. No incluye implementación de componentes.

## Principio rector

Las cartas deben parecer páginas arrancadas de un grimorio de campaña: oscuras,
táctiles y antiguas, pero con información moderna y legible. El arte nunca queda
encerrado en una miniatura: ocupa toda la superficie y la interfaz se superpone
como una capa editorial discreta.

## Card de selección de héroe

### Composición

- Retrato vertical `3:4` a sangre completa.
- Rostro entre el 22% y el 42% de la altura para sobrevivir recortes responsive.
- Arma, manos o foco mágico deben formar una segunda silueta reconocible.
- El 25% inferior se mantiene más oscuro y con menos detalle: allí viven nombre,
  rol, fila y estadísticas.
- Un degradado negro azulado asciende desde el borde inferior hasta un máximo del
  58% de la card; no debe ensuciar el rostro.
- Viñeta lateral suave para separar el personaje de cards vecinas.

### Marco

- Filete exterior de hierro ennegrecido, fino y ligeramente irregular.
- Segundo filete interior en bronce viejo con desgaste localizado, no uniforme.
- Esquinas recortadas con pequeños remaches; evitar filigranas barrocas grandes.
- El marco no debe competir con las siluetas de armas ni reducir el área útil.

### Jerarquía informativa

1. Nombre en Cinzel o Cinzel Decorative, marfil cálido.
2. Rol en versalitas, gris azulado.
3. Fila mediante un sello compacto: punta de lanza para vanguardia y ojo/flecha
   para retaguardia.
4. HP, dados y recurso en una franja de iconos pequeña, sin cajas independientes.

El texto se apoya sobre sombra difusa y degradado; no debe llevar contorno grueso.

### Estados

- **Reposo:** arte al 88% de luminosidad y marco de hierro.
- **Hover/foco:** leve recuperación de luz en rostro y arma, marco bronce visible.
- **Seleccionado:** halo interior ámbar, sello de cera oscuro con marca de party y
  elevación mínima; el arte no cambia de color.
- **No disponible por límite:** baja saturación y una trama diagonal tenue; nunca
  ocultar el nombre ni depender sólo del color.
- **Bloqueado:** silueta todavía identificable bajo pátina fría, cadena fina y
  sello central; mostrar condición de desbloqueo debajo, no sobre el rostro.
- **Caído/herido, cuando corresponda:** grieta carmesí localizada en el marco, no
  un filtro rojo sobre toda la ilustración.

## Firma cromática por héroe

La interfaz no recolorea el retrato; toma un acento de su propia ilustración:

| Héroe | Acento primario | Acento secundario |
| --- | --- | --- |
| Brenna | brasa apagada | nácar frío |
| Aldric | oro sagrado envejecido | azul eclipse |
| Caballero Oscuro | magenta oscuro | plata fría |
| Veyra | ámbar de fuego | azul de eclipse |
| Maevis | azul curativo | plata perlada |
| Nix | violeta humo | carmesí tenue |
| Corvin | bronce oscuro | verde musgo |
| Orphen | carmesí sombra | plata de eclipse |
| Mara | nácar salobre | ámbar de faro |
| Elian | oro de reloj | azul medianoche |

Los acentos se aplican sólo a foco, sello e iconos; el marco base sigue siendo
común para que el roster se perciba como una colección.

## Otras familias de cartas

- **Hechizos:** icono central dominante sobre pergamino oscuro; color de escuela
  en el resplandor, no en todo el fondo; coste en medallón superior izquierdo.
- **Objetos:** naturaleza muerta vertical con silueta limpia; rareza expresada por
  material del filete, nunca por arcoíris de color.
- **Enemigos:** ilustración a sangre y banda inferior más agresiva; fila, perfil y
  resistencia deben leerse antes que el lore.
- **Bosses:** marco más pesado y asimétrico, arte menos recortado, nombre integrado
  en una placa; evitar coronas y calaveras genéricas si no pertenecen al personaje.
- **Eventos:** composición narrativa más abierta, marco de página quemada y zona
  amplia para elección; no reutilizar el marco de combate.

## Reglas para futuros prompts

Todo prompt de retrato destinado a card debe incluir:

- `Asset type: evolved hero portrait and full-card background`;
- relación `3:4`;
- rostro en zona segura superior-media;
- segunda silueta de clase legible;
- cuarto inferior oscuro y poco detallado;
- margen seguro para recortes;
- prohibición de texto, UI, marco, logo y watermark.

El marco y la tipografía pertenecen a la UI. No deben hornearse dentro del arte,
porque impedirían adaptar la misma imagen a selección, combate y fichas.

## Revisión artística antes de integrar

1. Comparar V1 y V2 lado a lado al 100% y en miniatura de card.
2. Confirmar identidad, presentación, arma y paleta antes de evaluar detalle.
3. Probar recortes estrecho, normal y ancho sin cortar ojos ni foco de clase.
4. Superponer degradado y textos reales; no aprobar sobre una card vacía.
5. Verificar contraste, daltonismo y estados sin depender sólo del acento.
6. Conservar PNG maestro, WebP optimizado, prompt final y referencia original.
