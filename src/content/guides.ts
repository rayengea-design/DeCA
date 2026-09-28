export interface GuideSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface Guide {
  slug: string
  metaTitle: string
  h1: string
  description: string
  datePublished: string
  dateModified: string
  readingMinutes: number
  intro: string
  sections: GuideSection[]
  faqs?: { q: string; a: string }[]
}

export const GUIDES_ORG = 'Grupo Noveldi SL'

// Marketing/SEO content. Each guide is a data object, so adding a new article
// is just another entry here — no new component or route needed. Every body
// reuses the same facts (Orden FOM/2861/2012, Resolución de 5 de junio de 2026
// de la DGTCF, obligatorio el 5 de octubre de 2026, sanción 401€–20.000€, QR
// de verificación, conservación 1 año, datos: cargador/transportista/
// mercancía/origen-destino/matrículas) que ya afirman la landing y las páginas
// legales, para que todo el sitio cuente una sola historia coherente a Google
// y a los asistentes de IA.
export const GUIDES: Guide[] = [
  {
    slug: 'que-es-el-deca',
    metaTitle:
      '¿Qué es el DeCA? Guía completa del Documento electrónico de Control Administrativo (2026)',
    h1: '¿Qué es el DeCA y por qué es obligatorio desde el 5 de octubre de 2026?',
    description:
      'Qué es el DeCA (Documento electrónico de Control Administrativo), quién está obligado, qué datos lleva, desde cuándo es obligatorio y cómo generarlo en menos de un minuto. Guía actualizada 2026.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 6,
    intro:
      'El DeCA es el nuevo documento obligatorio para el transporte nacional de mercancías por carretera en España. Desde el 5 de octubre de 2026 hay que llevarlo en cada porte, y no llevarlo puede costar entre 401 € y 20.000 €. En esta guía te explicamos, en lenguaje claro, qué es, quién está obligado, qué datos incluye y cómo generarlo sin pelearte con formularios.',
    sections: [
      {
        heading: 'Qué es el DeCA',
        paragraphs: [
          'El DeCA (Documento electrónico de Control Administrativo) es el documento que acredita, ante una inspección en carretera, los datos esenciales de un transporte nacional de mercancías: quién es el cargador, quién es el transportista, qué mercancía se transporta, el origen y el destino y las matrículas del vehículo.',
          'Cada DeCA incluye un código QR de verificación que el agente puede escanear para comprobar que el documento es válido y está correctamente cumplimentado.',
        ],
      },
      {
        heading: 'Desde cuándo es obligatorio',
        paragraphs: [
          'El DeCA es obligatorio desde el 5 de octubre de 2026. Su base normativa está en la Orden FOM/2861/2012 y en la Resolución de 5 de junio de 2026 de la Dirección General de Transporte por Carretera y Ferrocarril (DGTCF).',
          'A partir de esa fecha, el conductor debe poder mostrar el DeCA de cada porte durante el transporte, ya sea en formato digital en el móvil o impreso.',
        ],
      },
      {
        heading: 'Quién está obligado a llevarlo',
        bullets: [
          'Autónomos del transporte con vehículo propio.',
          'Empresas de transporte de mercancías por carretera, de cualquier tamaño de flota.',
          'Cargadores y operadores logísticos que intervienen en el porte, en la parte que les corresponde.',
        ],
        paragraphs: [
          'En resumen: si realizas transporte nacional de mercancías por carretera sujeto a la normativa, necesitas emitir y llevar el DeCA correspondiente a cada porte.',
        ],
      },
      {
        heading: 'Qué datos incluye un DeCA',
        bullets: [
          'Datos del cargador y del transportista.',
          'Descripción de la mercancía transportada.',
          'Origen y destino del transporte.',
          'Matrículas del vehículo y, en su caso, del remolque.',
          'Código QR de verificación exigido por la normativa.',
        ],
      },
      {
        heading: 'Qué pasa si no lo llevas',
        paragraphs: [
          'No llevar el DeCA, o llevarlo mal cumplimentado, puede suponer una sanción de entre 401 € y 20.000 € según la gravedad de la infracción. Por eso es tan importante que el documento esté completo y sea válido: un DeCA con campos vacíos o erróneos expone a la misma sanción que no llevarlo.',
        ],
      },
      {
        heading: 'Cómo generar el DeCA en menos de un minuto',
        paragraphs: [
          'La web «SIMPLE» del Ministerio permite generarlo, pero obliga a rellenar formularios largos cada vez, no guarda un historial ordenado por empresa y no está pensada para usarse desde el móvil en el momento de cargar.',
          'Con DeCA de kreanex rellenas el porte una vez, guardas tus rutas y contrapartes habituales y generas el PDF oficial con su QR al instante, desde el móvil, incluso sin cobertura. Cada conductor tiene su acceso y el gestor de flota ve todos los documentos desde un panel.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿El DeCA se puede llevar en el móvil?',
        a: 'Sí. El DeCA es un documento electrónico: puede mostrarse en formato digital desde el móvil o llevarse impreso. La app de DeCA funciona como PWA y sigue disponible aunque falle la cobertura.',
      },
      {
        q: '¿Cuánto tiempo hay que conservar cada DeCA?',
        a: 'Existe una obligación legal de conservación de 1 año. En DeCA los documentos generados se conservan y siguen siendo descargables durante ese plazo, incluso si cancelas la suscripción.',
      },
    ],
  },
  {
    slug: 'sanciones-deca',
    metaTitle: 'Sanciones por no llevar el DeCA: multas de 401 € a 20.000 € (2026)',
    h1: 'Sanciones por no llevar el DeCA en regla',
    description:
      'Cuánto cuesta no llevar el DeCA o llevarlo mal cumplimentado: multas de entre 401 € y 20.000 €. Qué infracciones existen y cómo evitarlas desde el 5 de octubre de 2026.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 4,
    intro:
      'Desde el 5 de octubre de 2026, circular sin el DeCA o con un DeCA incorrecto expone a sanciones que van de 401 € a 20.000 €. Te explicamos qué se sanciona y cómo asegurarte de que cada porte va cubierto.',
    sections: [
      {
        heading: 'Cuánto es la multa por no llevar el DeCA',
        paragraphs: [
          'La sanción por no llevar el DeCA, o por llevarlo mal cumplimentado, va de 401 € a 20.000 € según la gravedad de la infracción. La horquilla es amplia porque depende del tipo de incumplimiento y de las circunstancias.',
        ],
      },
      {
        heading: 'Qué se considera una infracción',
        bullets: [
          'Circular sin el DeCA correspondiente al porte.',
          'Llevar un DeCA con campos obligatorios vacíos o con datos erróneos.',
          'No poder mostrar el documento durante una inspección en carretera.',
        ],
      },
      {
        heading: 'Cómo evitar la sanción',
        paragraphs: [
          'La forma más segura de evitar una multa es asegurarte de que cada DeCA está completo y es válido antes de salir. Con DeCA de kreanex no se puede generar un documento incompleto: cada campo obligatorio de la normativa está en el formulario, y el PDF sale con su código QR de verificación listo para inspección.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Me pueden multar si el DeCA está incompleto?',
        a: 'Sí. Un DeCA con campos obligatorios vacíos o erróneos puede sancionarse igual que no llevarlo, dentro de la horquilla de 401 € a 20.000 €.',
      },
    ],
  },
  {
    slug: 'como-rellenar-el-deca',
    metaTitle: 'Cómo rellenar el DeCA paso a paso (guía práctica 2026)',
    h1: 'Cómo rellenar el DeCA paso a paso',
    description:
      'Guía práctica para rellenar el DeCA sin errores: qué datos necesitas antes de empezar, cómo completar cada campo y cómo generar el PDF con QR en menos de un minuto.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 5,
    intro:
      'Rellenar el DeCA no tiene por qué ser un trámite lento. Si tienes los datos a mano, se completa en un par de minutos. Aquí tienes el paso a paso para hacerlo bien a la primera y evitar los errores que exponen a sanción.',
    sections: [
      {
        heading: 'Antes de empezar: qué datos necesitas',
        bullets: [
          'Datos del cargador (quién encarga el transporte).',
          'Datos del transportista (quién lo realiza).',
          'Descripción de la mercancía.',
          'Origen y destino del porte.',
          'Matrículas del vehículo y del remolque, si lo hay.',
        ],
      },
      {
        heading: 'Paso 1: identifica el cargador y el transportista',
        paragraphs: [
          'Introduce los datos identificativos de ambas partes. Si trabajas siempre con los mismos cargadores, guárdalos como contrapartes para no volver a teclearlos en cada porte.',
        ],
      },
      {
        heading: 'Paso 2: describe la mercancía y la ruta',
        paragraphs: [
          'Indica qué se transporta y el origen y destino del transporte. Las rutas habituales se pueden guardar para reutilizarlas y rellenar el siguiente porte en segundos.',
        ],
      },
      {
        heading: 'Paso 3: matrículas del vehículo',
        paragraphs: [
          'Añade la matrícula del vehículo tractor y, si procede, la del remolque. Revisa que estén correctas: un error en la matrícula es uno de los fallos más habituales.',
        ],
      },
      {
        heading: 'Paso 4: genera el PDF con QR',
        paragraphs: [
          'Al confirmar, el DeCA se genera como PDF oficial con su código QR de verificación, listo para descargar, enviar por WhatsApp o mostrar en una inspección desde el móvil.',
        ],
      },
      {
        heading: 'Errores frecuentes al rellenar el DeCA',
        bullets: [
          'Dejar campos obligatorios vacíos (expone a la misma sanción que no llevarlo).',
          'Equivocarse en la matrícula o en los datos del cargador.',
          'Generar el documento después de iniciar el transporte en lugar de antes.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Cuánto se tarda en rellenar un DeCA?',
        a: 'Con los datos a mano, un par de minutos. Si guardas rutas y contrapartes habituales, el siguiente porte se rellena en segundos.',
      },
      {
        q: '¿Puedo reutilizar los datos de un porte anterior?',
        a: 'Sí. En DeCA puedes guardar rutas y contrapartes y volver a usarlas, de modo que solo cambias lo que varía en cada porte.',
      },
    ],
  },
  {
    slug: 'deca-para-autonomos',
    metaTitle: 'DeCA para autónomos del transporte: qué necesitas y cómo cumplir (2026)',
    h1: 'DeCA para autónomos del transporte',
    description:
      'Si eres autónomo del transporte con vehículo propio, el DeCA es obligatorio desde el 5 de octubre de 2026. Te explicamos cómo afecta a los autónomos y cómo cumplir desde el móvil.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 4,
    intro:
      'Los autónomos del transporte también están obligados a llevar el DeCA en cada porte desde el 5 de octubre de 2026. La buena noticia: no necesitas una oficina ni un ordenador para cumplir, basta con el móvil.',
    sections: [
      {
        heading: '¿Los autónomos están obligados al DeCA?',
        paragraphs: [
          'Sí. Si realizas transporte nacional de mercancías por carretera con tu propio vehículo, estás obligado a emitir y llevar el DeCA de cada porte, igual que las empresas de transporte.',
        ],
      },
      {
        heading: 'Cómo cumplir sin complicarte',
        paragraphs: [
          'No hace falta depender de la oficina ni de un ordenador. Con DeCA generas el documento desde el móvil, antes de cada porte, en menos de un minuto, y lo llevas contigo en formato digital.',
          'Al guardar tus rutas y cargadores habituales, cada nuevo DeCA es cuestión de segundos.',
        ],
      },
      {
        heading: 'Qué plan encaja para un autónomo',
        paragraphs: [
          'Para un autónomo con vehículo propio, el plan Básico (hasta 3 conductores, DeCA ilimitados, historial y exportación CSV, envío por WhatsApp) es suficiente. Puedes empezar con 10 DeCA o 5 días gratis, sin tarjeta de crédito.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Necesito un ordenador para generar el DeCA?',
        a: 'No. Puedes generarlo íntegramente desde el móvil, y la app funciona incluso sin cobertura una vez instalada como PWA.',
      },
      {
        q: '¿Cuánto cuesta el DeCA para un autónomo?',
        a: 'El plan Básico parte de 5 €/mes (sin IVA), con DeCA ilimitados. Hay prueba gratis de 10 documentos o 5 días sin tarjeta.',
      },
    ],
  },
  {
    slug: 'deca-vs-simple-ministerio',
    metaTitle: 'DeCA vs. la web SIMPLE del Ministerio: diferencias y cuál conviene',
    h1: 'DeCA vs. la web SIMPLE del Ministerio',
    description:
      'Puedes generar el DeCA en la web SIMPLE del Ministerio o con una herramienta como DeCA de kreanex. Comparamos ambas opciones en tiempo, historial, uso móvil y gestión de flota.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 4,
    intro:
      'El DeCA se puede generar en la web «SIMPLE» del Ministerio de forma gratuita, o con una herramienta pensada para el día a día del transporte. La diferencia no está en la validez del documento, sino en el tiempo y la comodidad. Aquí van las diferencias reales.',
    sections: [
      {
        heading: 'La web SIMPLE del Ministerio',
        paragraphs: [
          'La herramienta oficial permite generar el DeCA, pero obliga a rellenar formularios largos cada vez, no guarda un historial ordenado por empresa y no está pensada para que un conductor la use desde el móvil en el momento de cargar.',
        ],
      },
      {
        heading: 'Qué aporta una herramienta como DeCA',
        bullets: [
          'Rellenas el porte en menos de un minuto reutilizando rutas y contrapartes.',
          'Historial buscable por matrícula o fecha y exportable a CSV.',
          'Un acceso por conductor y un panel donde el gestor ve todos los DeCA.',
          'Corrección enlazada al documento original, sin perder trazabilidad.',
          'Envío por WhatsApp y funcionamiento en el móvil sin cobertura.',
        ],
      },
      {
        heading: '¿Cuál te conviene?',
        paragraphs: [
          'Si generas un DeCA muy de vez en cuando, la web del Ministerio puede bastarte. Si emites portes con frecuencia, tienes varios conductores o quieres un historial ordenado para tu gestoría o una inspección, una herramienta dedicada te ahorra mucho tiempo y reduce el riesgo de errores.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿El DeCA generado con kreanex es igual de válido que el de la web del Ministerio?',
        a: 'Sí. Es el documento oficial con todos los campos obligatorios y su código QR de verificación exigido por la normativa. La diferencia está en la rapidez y la gestión, no en la validez.',
      },
    ],
  },
  {
    slug: 'deca-obligatorio-2026',
    metaTitle: 'DeCA obligatorio desde el 5 de octubre de 2026: fechas y qué hacer',
    h1: 'DeCA obligatorio desde el 5 de octubre de 2026',
    description:
      'El DeCA es obligatorio en cada porte de transporte nacional de mercancías desde el 5 de octubre de 2026. Fechas, normativa aplicable y qué debes tener listo antes.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 3,
    intro:
      'La fecha clave es el 5 de octubre de 2026: desde ese día, el DeCA es obligatorio en cada porte de transporte nacional de mercancías por carretera. Esto es lo que necesitas saber para llegar a tiempo.',
    sections: [
      {
        heading: 'La fecha: 5 de octubre de 2026',
        paragraphs: [
          'A partir del 5 de octubre de 2026, todo transporte nacional de mercancías por carretera sujeto a la normativa debe llevar su DeCA. No es una recomendación: es una obligación cuya ausencia se sanciona.',
        ],
      },
      {
        heading: 'La normativa que lo regula',
        paragraphs: [
          'El DeCA se apoya en la Orden FOM/2861/2012 y en la Resolución de 5 de junio de 2026 de la Dirección General de Transporte por Carretera y Ferrocarril (DGTCF).',
        ],
      },
      {
        heading: 'Qué tener listo antes de la fecha',
        bullets: [
          'Una forma de generar el DeCA de cada porte (web del Ministerio o una app como DeCA).',
          'Si tienes conductores, un acceso para cada uno.',
          'Los datos habituales de cargadores y rutas preparados para no perder tiempo.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Qué pasa si el 5 de octubre no tengo forma de generar el DeCA?',
        a: 'Circular sin el DeCA a partir de esa fecha expone a sanciones de entre 401 € y 20.000 €. Conviene tener la solución preparada antes. En DeCA puedes darte de alta en menos de dos minutos y probar gratis.',
      },
    ],
  },
  {
    slug: 'que-datos-lleva-el-deca',
    metaTitle: 'Qué datos lleva el DeCA: campos obligatorios del documento (2026)',
    h1: 'Qué datos lleva el DeCA',
    description:
      'Todos los campos obligatorios del DeCA: cargador, transportista, mercancía, origen y destino, matrículas y el código QR de verificación. Qué no puede faltar para que sea válido.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 3,
    intro:
      'Un DeCA solo es válido si está completo. Estos son los datos que debe incluir y por qué es importante que ninguno falte: un documento incompleto expone a la misma sanción que no llevarlo.',
    sections: [
      {
        heading: 'Campos obligatorios del DeCA',
        bullets: [
          'Datos del cargador: quién encarga el transporte.',
          'Datos del transportista: quién realiza el transporte.',
          'Descripción de la mercancía transportada.',
          'Origen y destino del porte.',
          'Matrículas del vehículo y, en su caso, del remolque.',
          'Código QR de verificación.',
        ],
      },
      {
        heading: 'Por qué no puede faltar ningún dato',
        paragraphs: [
          'La normativa exige que el DeCA esté correctamente cumplimentado. Un campo vacío o un dato erróneo puede sancionarse igual que no llevar el documento. Por eso conviene una herramienta que impida generar un DeCA incompleto.',
        ],
      },
      {
        heading: 'El código QR de verificación',
        paragraphs: [
          'Cada DeCA incluye un código QR que permite al agente comprobar en el momento que el documento es válido y está completo. Es un elemento clave del documento, no un extra opcional.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Qué pasa si falta un dato en el DeCA?',
        a: 'Un DeCA con campos obligatorios vacíos o erróneos puede sancionarse igual que no llevarlo. En DeCA no se puede generar un documento incompleto: todos los campos obligatorios están en el formulario.',
      },
    ],
  },
  {
    slug: 'deca-en-el-movil',
    metaTitle: 'Cómo llevar el DeCA en el móvil (con y sin cobertura) — 2026',
    h1: 'Cómo llevar el DeCA en el móvil',
    description:
      'El DeCA es un documento electrónico: puede llevarse en el móvil. Te explicamos cómo generarlo y mostrarlo desde el teléfono, incluso sin cobertura, en una inspección.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 3,
    intro:
      'El DeCA es electrónico, así que no necesitas papel: puedes generarlo y mostrarlo desde el móvil. Y con una app que funcione sin conexión, tampoco dependes de la cobertura en carretera.',
    sections: [
      {
        heading: '¿Se puede llevar el DeCA solo en el móvil?',
        paragraphs: [
          'Sí. Al ser un documento electrónico, el DeCA puede mostrarse en formato digital desde el móvil durante una inspección, sin necesidad de imprimirlo (aunque también puedes llevarlo impreso si lo prefieres).',
        ],
      },
      {
        heading: 'Funciona aunque falle la cobertura',
        paragraphs: [
          'DeCA se instala como una app (PWA) y sigue funcionando aunque la conexión falle en carretera. Puedes abrir la app y mostrar el PDF del porte incluso en zonas sin señal.',
        ],
      },
      {
        heading: 'Compartir el DeCA por WhatsApp',
        paragraphs: [
          'Además de mostrarlo, puedes enviar el PDF real al conductor o al cargador por WhatsApp con un solo toque, sin descargarlo a mano.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Y si no tengo cobertura cuando me paran?',
        a: 'La app de DeCA funciona sin conexión una vez instalada: puedes abrir y mostrar el DeCA del porte aunque no tengas señal.',
      },
      {
        q: '¿Tengo que imprimir el DeCA?',
        a: 'No es obligatorio: al ser electrónico, puedes mostrarlo desde el móvil. Imprimirlo es opcional.',
      },
    ],
  },
  {
    slug: 'deca-para-flotas',
    metaTitle: 'DeCA para empresas y flotas de transporte: gestión de varios conductores',
    h1: 'DeCA para empresas y flotas de transporte',
    description:
      'Cómo gestionar el DeCA en una empresa con varios conductores: un acceso por conductor, un panel para el gestor de flota y control de qué documentos emite cada uno.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 4,
    intro:
      'Cuando tienes varios conductores en ruta, el reto no es solo generar el DeCA: es controlar que todos lo hacen y tener sus documentos ordenados. Así se gestiona el DeCA en una flota.',
    sections: [
      {
        heading: 'Un acceso por conductor',
        paragraphs: [
          'Cada conductor tiene su propio acceso: genera y ve solo sus propios DeCA. Esto evita el lío de una sola sesión compartida y da trazabilidad de quién ha emitido cada documento.',
        ],
      },
      {
        heading: 'Un panel para el gestor de flota',
        paragraphs: [
          'Como responsable, ves todos los DeCA de la empresa desde un único panel, puedes buscar por matrícula o fecha y exportar el histórico completo para tu gestoría o una inspección.',
        ],
      },
      {
        heading: 'Datos aislados por empresa',
        paragraphs: [
          'Los datos de cada empresa cliente están aislados a nivel de base de datos: ni otras empresas ni conductores de otras cuentas pueden acceder a ellos.',
        ],
      },
      {
        heading: 'Qué plan encaja según el tamaño de la flota',
        bullets: [
          'Plan Flota: hasta 10 conductores, con corrección de documentos y soporte prioritario.',
          'Plan Empresa: hasta 50 conductores.',
          'Plan Flota+: conductores ilimitados y condiciones a medida para grupos logísticos.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Cada conductor necesita su propia cuenta?',
        a: 'Sí, y es lo recomendable: das de alta a cada conductor con su acceso, cada uno genera y ve solo sus DeCA, y tú ves los de toda la empresa desde el panel.',
      },
      {
        q: '¿Puedo exportar todos los DeCA de la empresa?',
        a: 'Sí. El historial es buscable por matrícula o fecha y exportable a CSV, útil para la gestoría o una inspección.',
      },
    ],
  },
  {
    slug: 'como-corregir-un-deca',
    metaTitle: 'Cómo corregir un DeCA con error sin perder trazabilidad (2026)',
    h1: 'Cómo corregir un DeCA con un error',
    description:
      'Si un dato del DeCA cambia o está mal, hay que corregirlo sin perder la trazabilidad con el documento original. Te explicamos cómo hacerlo correctamente.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 3,
    intro:
      'A veces un dato cambia o se detecta un error después de generar el DeCA. No se trata de borrarlo y hacer otro: la corrección debe quedar enlazada al documento original para mantener la trazabilidad.',
    sections: [
      {
        heading: 'Por qué no basta con generar uno nuevo',
        paragraphs: [
          'Si simplemente creas otro DeCA, pierdes el rastro entre el documento erróneo y el corregido. La normativa busca trazabilidad: debe poder verse que un documento corrige a otro.',
        ],
      },
      {
        heading: 'Cómo se corrige en DeCA',
        paragraphs: [
          'En DeCA emites una corrección enlazada al documento original con un clic. El nuevo documento queda vinculado al anterior, de modo que la trazabilidad se mantiene tal y como exige la normativa.',
        ],
      },
      {
        heading: 'Qué queda en el historial',
        paragraphs: [
          'Tanto el DeCA original como su corrección quedan en el historial, buscables y descargables, para que puedas justificar cualquier cambio ante una inspección o tu gestoría.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Puedo borrar un DeCA con error?',
        a: 'Lo correcto no es borrarlo, sino emitir una corrección enlazada al original para mantener la trazabilidad. En DeCA se hace con un clic.',
      },
    ],
  },
  {
    slug: 'normativa-deca',
    metaTitle: 'Normativa del DeCA: Orden FOM/2861/2012 y Resolución de 2026',
    h1: 'La normativa del DeCA, explicada sencilla',
    description:
      'Qué normativa regula el DeCA: la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026 de la DGTCF. Qué implican en la práctica para transportistas y empresas.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 3,
    intro:
      'Detrás del DeCA hay dos referencias normativas que conviene conocer, aunque sea por encima. Te las explicamos sin jerga y, sobre todo, qué significan para tu día a día.',
    sections: [
      {
        heading: 'Orden FOM/2861/2012',
        paragraphs: [
          'Es la base sobre la que se articula el documento de control administrativo del transporte de mercancías por carretera. Establece el marco de lo que debe documentarse en cada porte.',
        ],
      },
      {
        heading: 'Resolución de 5 de junio de 2026 de la DGTCF',
        paragraphs: [
          'La Resolución de 5 de junio de 2026 de la Dirección General de Transporte por Carretera y Ferrocarril concreta el DeCA y fija su obligatoriedad a partir del 5 de octubre de 2026.',
        ],
      },
      {
        heading: 'Qué significa en la práctica',
        bullets: [
          'Desde el 5 de octubre de 2026 hay que llevar el DeCA en cada porte nacional de mercancías.',
          'El documento debe estar completo y ser verificable (incluye código QR).',
          'No llevarlo o llevarlo mal expone a sanciones de 401 € a 20.000 €.',
          'Cada DeCA debe conservarse durante 1 año.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Dónde se regula exactamente el DeCA?',
        a: 'En la Orden FOM/2861/2012 y en la Resolución de 5 de junio de 2026 de la DGTCF, que fija su obligatoriedad desde el 5 de octubre de 2026.',
      },
    ],
  },
  {
    slug: 'codigo-qr-deca',
    metaTitle: 'El código QR del DeCA: qué es y cómo lo verifica un inspector',
    h1: 'El código QR del DeCA',
    description:
      'Cada DeCA lleva un código QR de verificación. Te explicamos para qué sirve, qué comprueba un inspector al escanearlo y por qué es una parte esencial del documento.',
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    readingMinutes: 3,
    intro:
      'El código QR no es un adorno del DeCA: es la pieza que permite verificar el documento en el momento de una inspección. Esto es lo que hace y por qué importa que sea correcto.',
    sections: [
      {
        heading: 'Para qué sirve el QR del DeCA',
        paragraphs: [
          'El código QR permite al agente comprobar, escaneándolo, que el DeCA es válido y está correctamente cumplimentado. Es el mecanismo de verificación previsto por la normativa.',
        ],
      },
      {
        heading: 'Qué comprueba un inspector',
        paragraphs: [
          'Al escanear el QR, el agente puede verificar el documento del porte y sus datos. Por eso un DeCA sin QR válido, o con datos incompletos, no cumple.',
        ],
      },
      {
        heading: 'El QR que genera DeCA',
        paragraphs: [
          'El PDF que genera DeCA de kreanex incluye el código QR de verificación exigido por la normativa, con todos los campos obligatorios cumplimentados, listo para inspección desde el móvil o impreso.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿El QR del DeCA es el mismo que pide un inspector?',
        a: 'Sí. El PDF que genera DeCA incluye el código QR de verificación exigido por la normativa, con todos los campos obligatorios cumplimentados.',
      },
    ],
  },
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
