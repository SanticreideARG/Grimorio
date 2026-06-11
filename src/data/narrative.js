// narrative.js — Capa narrativa por nodo (CONTENIDO puro, sin lógica de motor).
// Tres voces que se muestran en el panel del nodo al pisarlo (MapScreen):
//   place → narración del Maestro de Ceremonias: qué era este sitio ANTES de la
//           guerra y qué queda ahora. Tono oscuro con humor ácido puntual.
//   bark  → comentario PERSONALIZADO de un héroe, solo si está en la party.
//           Refleja su personalidad (ver barks.js) y su pérdida personal.
//   lore  → goteo del trasfondo del Rey Ceniza / El Devorado en nodos clave.
//
// CANON (definido con el usuario):
//   El Rey Ceniza perdió su reino en la guerra; en su duelo decidió que el mundo
//   ardiera con él. Invocó a El Devorado (arma del Vacío) y no pudo controlarlo:
//   ahora la Grieta consume todo. Los héroes son sobrevivientes con cuentas
//   pendientes. El Caballero Oscuro fue caballero del propio Rey antes de la caída.
//
// Reglas anti-fatiga: en un recorrido lineal cada nodo se pisa una sola vez, así
// que la narración aparece naturalmente una única vez. Un bark por nodo como mucho.
//
// Campaña narrada completa: 68 nodos (caps 1-4). Ver docs/STORY_BIBLE.md.

// ───────────────────────── Capítulo 1: El Valle Quemado ─────────────────────────
// Gulrath (Devorador de Aldeas): no sirve al Rey; es la carroña que sigue al fuego.

const cap1 = {
  c1n01: {
    place:
      'Antes, este valle alimentaba a tres comarcas: el trigo llegaba hasta el ' +
      'horizonte. Ahora el horizonte llega hasta aquí, y es del color del carbón.',
    heroBarks: {
      picara: ['Encantador. ¿Quién quiere mudarse?'],
      guerrera: ['Conozco este olor. Es el de después de una batalla perdida.'],
    },
  },
  c1n02: {
    place:
      'El camino real unía el valle con la capital. Los postes de millas siguen ' +
      'en pie, contando distancias a ciudades que ya no existen.',
    heroBarks: {
      cazador: ['Huellas frescas sobre la ceniza. No somos los únicos aquí.'],
    },
  },
  c1n03: {
    place:
      'Cuatro caminos, cuatro destinos, todos terminan igual. Un viajero clavó ' +
      'aquí su bastón y no eligió ninguno. Fue, quizá, el más sabio.',
    heroBarks: {
      paladin: [
        'Mi orden juró proteger estos cruces. Mi orden ya no existe. El juramento, al parecer, sí.',
      ],
    },
  },
  c1n04: {
    place:
      'Aquí ondeaba la cebada. Cuando sopla el viento, la ceniza todavía imita el ' +
      'vaivén de las espigas. Es casi hermoso. Casi.',
  },
  c1n05: {
    place:
      'Donde hay catástrofe, hay quien venda paraguas. Este hombre sobrevivió al ' +
      'fin del mundo con su inventario intacto. Nadie pregunta cómo.',
    heroBarks: {
      picara: ['Me cae bien. Roba, pero con recibo.'],
      mago: ['Precios de saqueador. En fin: el oro no abriga.'],
    },
  },
  c1n06: {
    place:
      'Fue una posada: "El Buen Reposo". El cartel aún cuelga, chamuscado. Al ' +
      'menos cumple la mitad de su promesa.',
    heroBarks: {
      sanadora: ['Descansad. Los muertos no tienen prisa, y nosotros aún no somos de los suyos.'],
    },
  },
  c1n07: {
    place:
      'Aquí vivían doscientas almas. Celebraban la feria de la cosecha cada otoño. ' +
      'Este otoño, los espantapájaros son de verdad.',
    heroBarks: {
      guerrera: ['Bailé en una feria como esta. Una vez. No se me da bien recordarlo.'],
    },
  },
  c1n08: {
    place:
      'Las bestias no provocaron la guerra. Solo aprendieron que, después de una, ' +
      'siempre hay banquete.',
    heroBarks: {
      picara: ['Genial. La cadena alimenticia acaba de ascender de puesto.'],
    },
  },
  c1n09: {
    place:
      'El pozo del pueblo. Dicen que una moneda al fondo concede un deseo. El fondo ' +
      'está cubierto de monedas. Ninguno se cumplió.',
    heroBarks: {
      mago: ['Pide agua. Es lo único realista que queda por pedir.'],
    },
  },
  c1n10: {
    place:
      'La niebla del valle era célebre por su calma al alba. Ahora oculta cosas que ' +
      'prefieren no ser vistas hasta el momento exacto en que muerden.',
  },
  c1n11: {
    place:
      'Un claro con un árbol solitario, intacto entre tanta ruina. Hasta el fuego, ' +
      'parece, tuvo un instante de duda.',
    heroBarks: {
      sanadora: ['Un árbol vivo. Lo tomaré como una señal. Necesito creer en señales.'],
      caballero_oscuro: ['El fuego no dudó. Simplemente no terminó. Volverá.'],
    },
  },
  c1n12: {
    place:
      'Portó los colores de un rey que ya no reina. Murió defendiendo un muro que ya ' +
      'no existe. Y, aun así, no ha dejado de defenderlo.',
    lore:
      'El Caballero Oscuro reconoce el blasón: una corona partida sobre fondo de ceniza. ' +
      'El emblema del Rey, de cuando todavía era un hombre con un trono que perder.',
    heroBarks: {
      caballero_oscuro: ['Conozco esa armadura. Vestí una igual. Antes de… todo esto.'],
      paladin: ['Que los caídos descansen. Aunque este insista en lo contrario.'],
    },
  },
  c1n13: {
    place:
      'El gran bazar del valle. Se comerciaba con seda, especias y secretos. Hoy se ' +
      'comercia con lo que no ardió: poco, y caro.',
    heroBarks: {
      picara: ['Mi tipo de lugar. O lo era, cuando aún tenía techo.'],
    },
  },
  c1n14: {
    place:
      'Un altar a los Tres Hermanos: dioses de la cosecha, la lluvia y el descanso. ' +
      'Alguien talló encima un cuarto símbolo. A ese no le recéis.',
    lore:
      'El cuarto signo es una espiral que se devora a sí misma. No es un dios viejo: ' +
      'es algo que el Rey llamó desde más allá, y que ahora tiene más hambre que él.',
    heroBarks: {
      paladin: ['Profanaron lo sagrado. Mi fe vacila. Mi espada, no.'],
      mago: ['Cuatro dioses, ahora. El nuevo se ve… hambriento.'],
    },
  },
  c1n15: {
    place:
      'La última hoguera amistosa antes de las tierras de Gulrath. Disfrutad del calor: ' +
      'es lo último cálido que la bestia os dejará sentir.',
    heroBarks: {
      guerrera: ['Comed. Afilad. Rezad si os sirve. Mañana rompemos algo grande.'],
      picara: ['¿Un brindis por los que no llegamos hasta acá? No. Demasiado largo.'],
    },
  },
  c1n16: {
    place:
      'Gulrath no sirve al Rey Ceniza. Es lo que viene DESPUÉS del Rey: las fauces que ' +
      'limpian lo que el fuego deja. Donde pasa, ni la ceniza sobrevive.',
    lore:
      'Criaturas como esta no existían antes. La devastación del Rey las atrajo desde los ' +
      'rincones del mundo, como moscas a una herida que no cierra.',
    heroBarks: {
      caballero_oscuro: ['El Rey quemó el valle. Esta cosa vino a lamer el plato. Así de bajo hemos caído.'],
      guerrera: ['Grande, feo y hambriento. Mi especialidad.'],
    },
  },
};

// ──────────────────── Capítulo 2: La Marisma de Telarañas ────────────────────
// Fue el Bosque de los Mil Años: un templo vivo de árboles-altar. El fuego del Rey
// pudrió sus raíces en ciénaga. La Tejedora era su guardiana mayor, corrompida.

const cap2 = {
  c2n01: {
    place:
      'Aquí empezaba el Bosque de los Mil Años, un templo vivo de árboles más viejos ' +
      'que los reinos. Hoy el linde es una boca de fango que traga las botas y no devuelve nada.',
    heroBarks: {
      cazador: ['Un bosque tarda mil años en crecer y una noche en arder. Lo aprendí por las malas.'],
      mago: ['Yo manejo el fuego. Lo que pasó aquí no fue fuego: fue rencor.'],
    },
  },
  c2n02: {
    place:
      'Los peregrinos seguían estas sendas hasta los árboles-altar, descalzos, en señal ' +
      'de respeto. Ahora cada paso descalzo es una invitación a las sanguijuelas.',
    heroBarks: {
      picara: ['Descalzos. Qué tierno. Yo me quedo con las botas, gracias.'],
    },
  },
  c2n03: {
    place:
      'De las ramas cuelgan capullos del tamaño de un hombre. Algunos susurran. Es mejor ' +
      'no averiguar en qué idioma.',
  },
  c2n04: {
    place:
      'Aquí los druidas tejían cestos con juncos sagrados. La Tejedora aprendió el oficio. ' +
      'Cambió los juncos por tendones.',
    heroBarks: {
      sanadora: ['Estas manos sanaron en lugares así. Hoy solo encuentran telarañas donde hubo plegarias.'],
    },
  },
  c2n05: {
    place:
      'Una mujer vende baratijas sobre una balsa. Jura que todo es "reliquia bendita del ' +
      'bosque". La mitad son huesos pintados. La otra mitad, también.',
    heroBarks: {
      picara: ['Respeto a una colega. Mentir con una sonrisa es un arte.'],
      mago: ['Reliquias benditas. Ya. Y yo soy la reina del verano.'],
    },
  },
  c2n06: {
    place:
      'Un pedazo de tierra firme entre el fango, con un solo árbol que aún respira. Bajo él ' +
      'los druidas enterraban a sus muertos. Hoy es el único sitio donde uno puede tumbarse sin hundirse.',
    heroBarks: {
      paladin: ['Tierra consagrada, todavía. Lo noto. Descansemos donde algo sagrado aún resista.'],
    },
  },
  c2n07: {
    place:
      'El río bajaba claro desde las montañas. Algo, río arriba, lo tiñó de rojo y nunca ' +
      'volvió a aclararse. No conviene pensar en qué fue.',
  },
  c2n08: {
    place:
      'Los árboles tenían guardianes: espíritus de corteza y musgo que velaban el sueño del ' +
      'bosque. Este aún vela. Solo que ya no sueña con bosques.',
    lore:
      'La maldición del Rey no quema solo madera: pudre por dentro lo que toca. Hasta los ' +
      'guardianes sagrados se volvieron carceleros de su propia ruina.',
    heroBarks: {
      cazador: ['Vi a uno de estos sano, de niño. Me dejó pasar. Este no nos dejará.'],
    },
  },
  c2n09: {
    place:
      'Un nido de crías vacío, las cáscaras aún tibias. Algo eclosionó hace poco. Algo que ' +
      'ahora tiene hambre y patas de sobra.',
  },
  c2n10: {
    place:
      'El santuario interior, donde solo entraban los druidas mayores. La viuda lo eligió como ' +
      'guarida. Buen gusto para los nidos, hay que reconocerlo.',
    heroBarks: {
      picara: ['Decoración: telarañas. Inquilina: pesadilla. Me ahorro la reseña.'],
    },
  },
  c2n11: {
    place:
      'Las raíces de un árbol-altar caído forman una bóveda seca. Huele a savia vieja y a algo ' +
      'dulce que es mejor no identificar.',
    heroBarks: {
      sanadora: ['Cierra los ojos. Imagina que las raíces aún sostienen algo vivo. A veces fingir basta para seguir.'],
    },
  },
  c2n12: {
    place:
      'Aquí florecía el lirio de plata, que solo crece en agua pura. La última vez que floreció, ' +
      'el reino aún tenía rey y el rey aún tenía corazón.',
    lore:
      'Dicen que el Rey trajo lirios de plata de este pantano para su esposa. Antes. Cuando todavía ' +
      'había alguien a quien traerle flores.',
    heroBarks: {
      caballero_oscuro: ['Conozco esa flor. La vi en el tocador de la reina. La reina ya no está. El Rey, tampoco… no del todo.'],
    },
  },
  c2n13: {
    place:
      'Una ofrenda envuelta en seda, dispuesta con esmero macabro. Alguien —o algo— sigue ' +
      'celebrando ritos aquí. Solo que el dios cambió.',
  },
  c2n14: {
    place:
      'Lo que cuelga de esta arboleda no caza por hambre. Caza porque la maldición que lo hizo ' +
      'no le dejó otra cosa que el acto de matar.',
    heroBarks: {
      guerrera: ['Ocho patas, mil dientes. Más superficie para romper.'],
    },
  },
  c2n15: {
    place:
      'Un convoy de refugiados quedó atrapado en el fango. No llegaron. Sus cosas, sí. Un ' +
      'superviviente las vende ahora; dice que "a ellos ya no les sirven".',
    heroBarks: {
      picara: ['Comprarle a los muertos. Bueno. Tampoco van a quejarse del precio.'],
      paladin: ['Compremos. Y recemos por ellos. Es lo único que aún podemos pagarles.'],
    },
  },
  c2n16: {
    place:
      'Una antorcha clavada en lo alto de un mástil, encendida por manos desconocidas. Señal de ' +
      'que alguien, en algún momento, todavía creyó que valía la pena avisar.',
    heroBarks: {
      sanadora: ['Alguien encendió esto por nosotros, sin conocernos. Aún hay de eso en el mundo. Aférrate a ello.'],
    },
  },
  c2n17: {
    place:
      'El umbral del corazón del bosque, cubierto por una cortina de seda tan densa que apaga la ' +
      'luz. Detrás, los árboles-altar. Detrás, ella.',
  },
  c2n18: {
    place:
      'La Tejedora fue la guardiana mayor de este bosque: un espíritu que protegía mil años de ' +
      'vida. La maldición del Rey no la mató. Hizo algo peor: la dejó viva, y le dio un nuevo oficio.',
    lore:
      'No nació monstruo. Fue el primer ser que el Rey corrompió a propósito, para probar si su ' +
      'maldición podía doblegar incluso a lo sagrado. Funcionó. Y él siguió adelante.',
    heroBarks: {
      sanadora: ['Esto fue algo bueno, una vez. Eso es lo más triste. Acabemos con su dolor.'],
      caballero_oscuro: ['El Rey la usó como ensayo. Si pudo con ella… entendéis lo que nos espera.'],
    },
  },
};

// ──────────────────── Capítulo 3: La Ciudadela de Ceniza ────────────────────
// Fue la capital del reino del Rey Ceniza: su trono, su corte, su hogar. El Rey
// la quemó con su gente dentro. Clímax emocional; el Caballero Oscuro está "en casa".

const cap3 = {
  c3n01: {
    place:
      'Las puertas de la capital, altas como torres, recibían embajadores de cien reinos. Hoy ' +
      'reciben al viento y a nosotros. Las bisagras aún guardan el escudo real: una corona, partida.',
    heroBarks: {
      caballero_oscuro: ['Crucé estas puertas mil veces, con el estandarte en alto. Hoy entro como un ladrón a mi propia casa.'],
      guerrera: ['Bonita ciudad, para estar tan muerta.'],
    },
  },
  c3n02: {
    place:
      'El patio de armas, donde entrenaba la guardia real. El polvo que pisáis no es polvo: es lo ' +
      'que queda de quienes juraron defender estas piedras.',
    heroBarks: {
      paladin: ['Guardias que cumplieron su juramento hasta el final. Más de lo que muchos podemos decir.'],
    },
  },
  c3n03: {
    place:
      'El brasero del salón real ardía sin apagarse desde la fundación del reino, símbolo de su ' +
      'luz perpetua. Sigue ardiendo. El fuego conserva la ironía mejor que a la gente.',
  },
  c3n04: {
    place:
      'La capilla real, donde la familia del Rey rezaba al amanecer. Aquí bautizaron a su hija. ' +
      'Aquí, después, la lloraron.',
    lore:
      'El Rey tuvo una hija. Murió en la guerra, joven, antes de reinar. Dicen que el Rey no derramó ' +
      'una lágrima en el funeral. Las guardó todas para el mundo.',
    heroBarks: {
      sanadora: ['Recemos rápido y bajo. No vaya a ser que alguien escuche… y recuerde.'],
    },
  },
  c3n05: {
    place:
      'Un hombre desvalija la ciudad muerta pieza por pieza. Vende coronas menores como chatarra y ' +
      'chatarra como reliquias. En su defensa: ya nadie nota la diferencia.',
    heroBarks: {
      picara: ['Profana tumbas reales y duerme tranquilo. Mi tipo de filósofo.'],
      mago: ['Vende la historia al peso. Triste. Eficiente, pero triste.'],
    },
  },
  c3n06: {
    place:
      'Un rincón de la muralla resguardado del viento. Aquí los soldados fumaban a escondidas entre ' +
      'guardias. La costumbre más humana en el lugar menos humano que queda.',
    heroBarks: {
      guerrera: ['Buen sitio para respirar. Lo usé igual, en otra guerra, en otra muralla.'],
    },
  },
  c3n07: {
    place:
      'La muralla resistió mil asedios. No cayó por la fuerza: cayó cuando su propio rey ordenó abrir ' +
      'las puertas y dejar entrar el fuego. El suyo.',
    lore:
      'La capital no fue conquistada. El Rey la quemó él mismo, con su gente dentro, el día que decidió ' +
      'que nada merecía sobrevivir a su pérdida.',
    heroBarks: {
      caballero_oscuro: ['Yo estaba en este muro esa noche. Recibí la orden de abrir. La obedecí. Por eso soy lo que soy.'],
    },
  },
  c3n08: {
    place:
      'Erigieron esta estatua para honrar al Rey en vida. La maldición le dio movimiento y le quitó el ' +
      'rostro. Un monumento que ahora aplasta a quienes vienen a recordar.',
    heroBarks: {
      mago: ['Un ego tan grande que hasta su estatua quiere matarnos. Cómo no.'],
    },
  },
  c3n09: {
    place:
      'La cripta real, abierta de par en par. Los sarcófagos están vacíos. No fueron saqueados: fueron ' +
      'vaciados desde dentro. El Rey no soportó dejar a nadie en paz, ni a sus muertos.',
  },
  c3n10: {
    place:
      'Bajo la ciudad descansaban veinte generaciones de reyes. El nigromante los despertó a todos. ' +
      'Veinte coronas, ni una sola con la cabeza fría.',
    heroBarks: {
      picara: ['Realeza muerta caminando. Y yo que creía que la nobleza ya era insoportable viva.'],
    },
  },
  c3n11: {
    place:
      'La forja real, donde se templó la espada de cada rey. El yunque sigue tibio, como si alguien ' +
      'acabara de irse. No lo hizo. Hace años que aquí solo se forja silencio.',
    heroBarks: {
      guerrera: ['Afila tu acero aquí. Que las viejas piedras sirvan para algo decente una última vez.'],
      cazador: ['Mi arco lleva una punta forjada en esta forja. Qué pequeño es el mundo que arde.'],
    },
  },
  c3n12: {
    place:
      'La galería de retratos reales, kilómetros de rostros pintados. El fuego los borró a todos menos ' +
      'uno: el del Rey, al fondo, intacto. Hasta las llamas saben a quién temer.',
  },
  c3n13: {
    place:
      'Un círculo ritual grabado en el suelo del salón, fresco entre tanta ruina. Aquí alguien sigue ' +
      'negociando con lo que el Rey despertó. Los términos siguen siendo terribles.',
    lore:
      'Aquí el Rey trazó el primer pacto. Quería un arma capaz de borrarlo todo. La Grieta le respondió, ' +
      'y de ella salió algo que aceptó el trato… y luego cambió las condiciones.',
  },
  c3n14: {
    place:
      'El trono sigue ahí, intacto, en lo alto de la escalinata. Vacío. El Rey ya no se sienta: deambula ' +
      'por lo que queda, demasiado roto para descansar, demasiado orgulloso para caer.',
    heroBarks: {
      caballero_oscuro: ['Me arrodillé ante ese trono. Juré protegerlo. Mirad de qué sirvió.'],
    },
  },
  c3n15: {
    place:
      'Otro carroñero del fin del mundo, con mejor mercancía que escrúpulos. Vende armas de la guardia ' +
      'caída. Aún tienen los nombres de sus dueños grabados. Él no los lee.',
    heroBarks: {
      paladin: ['Empuñad sus armas con honor. Es el único epitafio que les queda.'],
    },
  },
  c3n16: {
    place:
      'Un último fuego en el corazón de la ciudad muerta, antes de la sala del trono. El calor casi ' +
      'se siente como hogar. Casi. No os acostumbréis.',
    heroBarks: {
      sanadora: ['Descansad. Lo que sigue no es un enemigo: es un duelo con forma de rey. Llegad enteros.'],
    },
  },
  c3n17: {
    place:
      'El heraldo real anunciaba decretos desde este balcón. Su última proclama fue la orden de quemarlo ' +
      'todo. La sigue repitiendo, sin voz, a una ciudad que ya obedeció.',
    heroBarks: {
      mago: ['Un funcionario tan leal que ni la muerte lo jubiló. Admirable. Patético.'],
    },
  },
  c3n18: {
    place:
      'Un gran espejo de la corte, cubierto de hollín. Si lo limpias, no reflejas tu cara: reflejas la ' +
      'de quien fuiste antes de toda esta ruina. Pocos resisten mirarse.',
    lore:
      'Dicen que el Rey rompió todos los espejos del palacio menos este. Que venía a mirarse y a recordar ' +
      'al hombre que fue. Hasta que un día dejó de reconocerlo.',
  },
  c3n19: {
    place:
      'La antesala del trono, donde los suplicantes esperaban audiencia con esperanza. Hoy solo esperan ' +
      'los muertos del Rey, y el Rey ya no concede audiencias: solo finales.',
    heroBarks: {
      caballero_oscuro: ['Un paso más. Tras esa puerta está. Dejadme… dejadme ser yo quien le hable primero.'],
    },
  },
  c3n20: {
    place:
      'Aquí está. No un monstruo: un hombre que lo tuvo todo, lo perdió todo, y decidió que el mundo no ' +
      'merecía conservar lo que a él le arrebataron. Comprenderlo no es perdonarlo. Pero ayuda a entender por qué debe terminar.',
    lore:
      'El Rey no quiere ganar. Hace tiempo que no quiere nada. Solo quiere que se acabe: él, vosotros, el ' +
      'mundo, el dolor. Detenedlo, y quizá le deis lo único que de verdad busca: descanso.',
    heroBarks: {
      caballero_oscuro: ['Mi Rey. Vine a liberaros del trono que os pudre. Perdonadme… o no. Ya da igual.'],
      paladin: ['Que los dioses se apiaden de él. Nosotros ya no podemos.'],
      sanadora: ['No es odio lo que siento. Es lástima. Acabemos con esto por él, también.'],
    },
  },
};

// ──────────────────────── Capítulo 4: La Grieta ────────────────────────
// No hay "antes": el Rey abrió esta herida al invocar al Devorado. El Devorado es
// su duelo hecho infinito — la idea de que, si algo duele bastante, todo debe desaparecer.

const cap4 = {
  c4n01: {
    place:
      'Aquí termina el mundo y empieza la herida. No hay nombres antiguos para este lugar: antes no ' +
      'existía. Lo abrió el Rey, y por él se escapa la realidad como sangre de un corte.',
    heroBarks: {
      mago: ['He estudiado todos los planos del saber. Ninguno menciona esto. Esto no debería poder estudiarse.'],
      picara: ['Genial. Nos caímos del mapa. Literalmente.'],
    },
  },
  c4n02: {
    place:
      'El suelo es una sugerencia y la gravedad, una opinión. Algo cae eternamente aquí, y a veces ese ' +
      'algo eres tú sin haberte movido.',
    heroBarks: {
      cazador: ['No hay viento, ni ángulo, ni distancia. Aquí mi arco y yo somos igual de ciegos.'],
    },
  },
  c4n03: {
    place:
      'La Grieta devuelve voces: las de los que perdiste. No son reales. Lo sabes. Y aun así te detienes ' +
      'a escuchar, porque hace tanto que no las oías.',
    heroBarks: {
      guerrera: ['Oigo a mi compañía. A todos, llamándome. No. No es real. Sigamos. SIGAMOS.'],
    },
  },
  c4n04: {
    place:
      'Mil gargantas que no existen cantan una nota que no debería sonar. El Devorado no tiene voz: tiene ' +
      'coro, hecho de todo lo que ya se tragó.',
  },
  c4n05: {
    place:
      'El vacío aprende. Toma una forma para que puedas entenderla y, sobre todo, para que puedas temerla. ' +
      'Esta forma fue elegida solo para vosotros.',
    lore:
      'El Devorado no es una criatura: es un apetito. Cada cosa que consume le enseña una manera nueva de ' +
      'consumir la siguiente.',
  },
  c4n06: {
    place:
      'Las sombras aquí tienen marea, suben y bajan como un mar negro. Lo que arrastran al retirarse no ' +
      'vuelve a aparecer en ningún lugar del mundo.',
    heroBarks: {
      picara: ['Si salimos de esta, me retiro. En serio, esta vez.'],
    },
  },
  c4n07: {
    place:
      'Un pliegue en la nada donde, por algún error del horror, el tiempo casi se detiene. El único descanso ' +
      'posible es este: el ojo de una tormenta que se traga galaxias.',
    heroBarks: {
      sanadora: ['Respirad. Aquí, donde nada debería respirar, lo hacemos. Eso ya es desafío suficiente por hoy.'],
    },
  },
  c4n08: {
    place:
      'Hay un punto en la oscuridad que te devuelve la mirada. No parpadea. Lleva mirándote desde antes de ' +
      'que entraras. Quizá desde antes de que nacieras.',
    heroBarks: {
      caballero_oscuro: ['Esa mirada la vi en los ojos del Rey, al final. La de quien ya decidió tu destino.'],
    },
  },
  c4n09: {
    place:
      'El Devorado ofrece un trato, con la voz de quien más amaste: deja de luchar y te devuelvo lo que ' +
      'perdiste. Es mentira. Es obvio que es mentira. Y duele exactamente igual.',
    lore:
      'Esta es la voz que el Rey escuchó. Esta es la promesa que aceptó. Mirad a dónde lo trajo, y entended ' +
      'por qué hay que decir que no.',
    heroBarks: {
      mago: ['Me ofrece mi torre. Mis libros. Todo lo que ardió. Sé que miente. Pero por un segundo… no. No.'],
      guerrera: ['Me ofrece traerlos de vuelta. Una palabra y vuelven. … Que se pudra. Mis muertos no se negocian.'],
    },
  },
  c4n10: {
    place:
      'Aquí la realidad está literalmente rasgada, y por el corte entra algo que no tiene nombre, porque ' +
      'nombrar es un acto del mundo, y esto está fuera del mundo.',
  },
  c4n11: {
    place:
      'El punto donde la Grieta es más profunda. Si el Devorado tiene algo parecido a una mente, late aquí: ' +
      'despacio, seguro, como quien sabe que tiene todo el tiempo del universo.',
    heroBarks: {
      cazador: ['Si esa cosa es un ojo, tiene un centro. Y si tiene centro, tiene blanco. Dadme el tiro.'],
    },
  },
  c4n12: {
    place:
      'El último escalón antes del fondo. Más allá no hay "más allá". Lo que peleéis aquí, lo peleáis al filo ' +
      'de dejar de existir por completo.',
    heroBarks: {
      paladin: ['Al borde de la nada, mi fe es lo único que pesa. Que baste. Que por una vez baste.'],
    },
  },
  c4n13: {
    place:
      'El último silencio antes del fin. No es paz: es la quietud de la sala de espera del mundo. Tomad aire. ' +
      'Miraos. Es posible que sea la última vez.',
    heroBarks: {
      sanadora: ['Si no volvemos… fue un honor sangrar a vuestro lado. Ahora en pie: mientras el mundo respire, peleamos.'],
      caballero_oscuro: ['Detuvimos al Rey. Queda su pecado. Terminemos lo que él empezó y no supo parar.'],
    },
  },
  c4n15: {
    place:
      'Un mercader solitario ha llegado hasta aquí. No hay nada heroico en ello, dice: solo un hombre que apostó ' +
      'por vosotros con todo lo que tenía. Su carreta huele a aceite de lámpara y cera. Una normalidad extraña al borde del fin.',
    heroBarks: {
      picara: ['¿Cómo diablos llegaste aquí antes que nosotros? Y… ¿me cobras igual que siempre?'],
      guerrera: ['Guardaste tu puesto hasta el último momento. Eso es más valor del que tienen muchos soldados.'],
    },
  },
  c4n14: {
    place:
      'Aquí está el final de todo: el arma que el Rey forjó con su dolor y no supo enfundar. No odia, no piensa. ' +
      'Solo devora; y cuando acabe con el mundo, se devorará a sí mismo.',
    lore:
      'El Devorado es el duelo del Rey hecho infinito: la idea de que, si algo duele lo suficiente, todo merece ' +
      'desaparecer. Vencerlo no es solo salvar el mundo: es decir, por fin, que el dolor no tiene derecho a llevárselo todo.',
    heroBarks: {
      guerrera: ['Lo más grande que romperé en mi vida. Acabemos.'],
      paladin: ['Por los caídos. Por el refugio. Por el Rey, incluso. ¡Por todos! ¡Adelante!'],
    },
  },
};

// Registro completo de la campaña (caps 1-4).
export const narrative = {
  ...cap1,
  ...cap2,
  ...cap3,
  ...cap4,
};

// ───────────────────────── Selector (puro) ─────────────────────────

// Hash determinista de una cadena (para elegir bark sin estado ni flicker).
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Narración de un nodo para la party actual.
 * @param {string} nodeId
 * @param {string[]} party  ids de héroes en el grupo
 * @returns {{ place: string|null, lore: string|null, bark: {heroId,line}|null } | null}
 */
export function getNodeNarration(nodeId, party = []) {
  const entry = narrative[nodeId];
  if (!entry) return null;

  let bark = null;
  if (entry.heroBarks) {
    // Héroes presentes que tienen algo que decir aquí.
    const candidates = party.filter((id) => entry.heroBarks[id]?.length);
    if (candidates.length) {
      const heroId = candidates[hashStr(nodeId) % candidates.length];
      const lines = entry.heroBarks[heroId];
      const line = lines[hashStr(nodeId + heroId) % lines.length];
      bark = { heroId, line };
    }
  }

  return { place: entry.place ?? null, lore: entry.lore ?? null, bark };
}
