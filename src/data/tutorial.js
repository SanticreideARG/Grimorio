// tutorial.js — Pasos del tutorial de primera vez (coach-marks).
// Cada paso apunta a una vista y, opcionalmente, ancla a un elemento del DOM
// (atributo data-tutorial="<anchor>"). El overlay (ui/components/TutorialCoach)
// muestra el primer paso ≥ al actual cuya `view` coincide con la vista activa;
// así el tutorial "espera" a que el jugador llegue a cada pantalla.

export const TUTORIAL_STEPS = [
  {
    view: 'party-select',
    anchor: 'party-confirm',
    title: 'Elegí tu party',
    text: 'Tocá las cartas de los héroes para sumarlos y confirmá para comenzar. Cada héroe tiene dados y hechizos distintos.',
  },
  {
    view: 'map',
    anchor: 'map-node',
    title: 'El mapa',
    text: 'Avanzás por nodos: combates, eventos, tiendas y descansos. Usá este botón para entrar al nodo y, una vez resuelto, para avanzar.',
  },
  {
    view: 'combat',
    anchor: 'roll',
    title: 'Tirá los dados',
    text: 'Tu turno empieza tirando dados: 🗡️ espadas atacan, 🛡️ escudos bloquean, ⭐ estrellas dan maná para tus magias.',
  },
  {
    view: 'combat',
    anchor: 'spells',
    title: 'Atacá y lanzá magias',
    text: 'Con espadas, tocá un enemigo para golpearlo. Con maná (⭐) lanzás hechizos desde esta barra; los que no te alcanzan se ven apagados.',
  },
  {
    view: 'combat',
    anchor: 'endturn',
    title: 'Terminá el turno',
    text: 'Cuando termines tus acciones, cerrá el turno: después actúan los enemigos. ¡Eso es todo, suerte!',
  },
];
