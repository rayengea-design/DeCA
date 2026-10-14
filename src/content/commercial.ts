/** Top-level commercial / transactional landing pages, targeting buyer-intent
 * searches ("generar DeCA", "programa DeCA", "alternativa a SIMPLE del
 * Ministerio") that the informational /guias don't cover. Same data-driven
 * pattern as the guides: both the React `CommercialPage` and the build-time
 * prerender in vite.config.ts read from here, so crawlers get full static HTML.
 *
 * Self-contained (no imports) on purpose so the Node build config can import it
 * without the '@' path alias. Claims here stay aligned with the real product
 * and the facts already used site-wide (Orden FOM/2861/2012, Resolución de 5 de
 * junio de 2026, obligatorio el 5 de octubre de 2026, QR de verificación,
 * conservación 1 año) — never overstating what DeCA is. */

export interface CommercialSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface CommercialPage {
  slug: string
  metaTitle: string
  h1: string
  /** Short anchor text used when linking between commercial pages. */
  navLabel: string
  description: string
  datePublished: string
  dateModified: string
  /** Short line under the H1 in the hero. */
  intro: string
  sections: CommercialSection[]
  faqs?: { q: string; a: string }[]
}

export const COMMERCIAL_PAGES: CommercialPage[] = [
  {
    slug: 'generar-deca',
    metaTitle: 'Generar el DeCA online | Documento oficial con QR en 1 minuto',
    h1: 'Generar el DeCA online en menos de un minuto',
    navLabel: 'Generar el DeCA online',
    description:
      'Genera el DeCA (Documento electrónico de Control Administrativo) oficial, con código QR de verificación, desde el móvil o el ordenador. Prueba gratis, sin tarjeta.',
    datePublished: '2026-10-14',
    dateModified: '2026-10-14',
    intro:
      'Generar el DeCA ya no significa pelearte con formularios largos. Rellenas los datos del porte una vez y descargas el documento oficial, con su código QR de verificación, en menos de un minuto.',
    sections: [
      {
        heading: 'Cómo generar el DeCA, paso a paso',
        paragraphs: ['Desde cero a tu primer documento en menos de dos minutos:'],
        bullets: [
          'Rellena el porte: origen, destino, mercancía, matrículas, cargador y transportista.',
          'Pulsa generar: el PDF oficial con el código QR de verificación se crea al instante.',
          'Descárgalo o compártelo por WhatsApp con el conductor o el cargador en un toque.',
          'Si es una ruta habitual, guárdala y rellena el siguiente DeCA en segundos.',
        ],
      },
      {
        heading: 'Qué incluye el DeCA que generas',
        paragraphs: [
          'El documento cumple con la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026 de la DGTCF: incorpora todos los campos obligatorios y el código QR de verificación que se exige en inspección, sin dejar huecos.',
          'Cada DeCA generado queda guardado en tu historial y se conserva durante el plazo legal de 1 año, incluso si cambias de plan.',
        ],
      },
      {
        heading: 'Por qué generarlo aquí y no en la web del Ministerio',
        bullets: [
          'En menos de un minuto por documento, sin rellenar un formulario largo cada vez.',
          'Con historial por empresa, buscable y exportable a CSV para tu gestoría o una inspección.',
          'Pensado para el móvil: funciona desde el navegador y sigue funcionando sin cobertura (PWA).',
          'Con un acceso por conductor, en lugar de una sola sesión compartida.',
        ],
      },
      {
        heading: 'Genera DeCA para toda tu flota',
        paragraphs: [
          'Cada conductor genera y ve solo sus propios DeCA desde su móvil; tú, como gestor de flota, los ves todos desde un único panel y corriges lo que haga falta sin perder la trazabilidad del documento original.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Cuánto cuesta generar un DeCA?',
        a: 'Puedes empezar gratis con 10 DeCA o 5 días de prueba, sin tarjeta de crédito. Después, los planes incluyen DeCA ilimitados desde 5 €/mes.',
      },
      {
        q: '¿El DeCA que genero es válido legalmente?',
        a: 'Sí. El PDF incluye el código QR de verificación exigido por la normativa y todos los campos obligatorios cumplimentados, conforme a la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026.',
      },
      {
        q: '¿Puedo generarlo desde el móvil sin cobertura?',
        a: 'Sí. DeCA se instala como una app (PWA) y sigue funcionando aunque la conexión falle en carretera.',
      },
      {
        q: '¿Cuántos DeCA puedo generar?',
        a: 'Los que necesites: todos los planes incluyen DeCA ilimitados.',
      },
    ],
  },
  {
    slug: 'programa-deca',
    metaTitle: 'Programa para el DeCA | Software del Documento de Control Administrativo',
    h1: 'El programa para generar el DeCA de tu empresa de transporte',
    navLabel: 'Programa para el DeCA',
    description:
      'Software específico para el DeCA: genera, corrige, guarda y comparte el Documento electrónico de Control Administrativo sin instalar nada. Prueba gratis.',
    datePublished: '2026-10-14',
    dateModified: '2026-10-14',
    intro:
      'Un programa pensado solo para el DeCA, para empresas de transporte y autónomos: genera, corrige, guarda y comparte cada Documento electrónico de Control Administrativo sin instalar nada.',
    sections: [
      {
        heading: 'Un software hecho para el DeCA, no un formulario genérico',
        paragraphs: [
          'A diferencia de rellenar a mano la herramienta oficial, DeCA está construido alrededor de un único trabajo: que generes el documento correcto, con su QR, en el momento de cargar, y que no tengas que empezar de cero en cada porte.',
        ],
      },
      {
        heading: 'Todo lo que hace el programa',
        bullets: [
          'PDF oficial con código QR de verificación en segundos.',
          'Cumplimiento verificado de cada campo exigido por la normativa vigente.',
          'Un acceso por conductor y un panel único para el gestor de flota.',
          'Corrección de documentos enlazada al original, sin perder la trazabilidad que exige la ley.',
          'Rutas y contrapartes guardadas para rellenar el siguiente porte en segundos.',
          'Historial buscable por matrícula o fecha y exportación a CSV.',
          'Envío por WhatsApp del PDF real con un solo toque.',
          'Factura automática con IVA desglosado en cada cobro, enviada a tu email.',
        ],
      },
      {
        heading: 'Sin instalar nada: funciona en el navegador y en el móvil',
        paragraphs: [
          'No hay que descargar ni actualizar ningún programa. Funciona desde el navegador del ordenador o del móvil y se puede añadir a la pantalla de inicio como una app (PWA) que sigue funcionando sin cobertura.',
        ],
      },
      {
        heading: 'Para autónomos, flotas y grupos logísticos',
        paragraphs: [
          'Desde el autónomo con un vehículo propio hasta grupos con decenas de conductores: eliges el plan por número de conductores y cambias cuando quieras, sin permanencia.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Hay que instalar o descargar algo?',
        a: 'No. DeCA funciona en el navegador y se puede instalar como app (PWA) en el móvil, sin descargas ni actualizaciones manuales.',
      },
      {
        q: '¿Cuánto cuesta el programa?',
        a: 'Desde 5 €/mes, con DeCA ilimitados. Puedes probarlo gratis con 10 DeCA o 5 días, sin tarjeta de crédito.',
      },
      {
        q: '¿Se puede usar con varios conductores?',
        a: 'Sí. Cada conductor tiene su propio acceso y genera solo sus DeCA; el administrador los ve todos desde un panel. Los planes escalan hasta 50 conductores, o más con Flota+.',
      },
      {
        q: '¿Funciona en el móvil?',
        a: 'Sí, está pensado para usarse desde el móvil en el momento de cargar, incluso sin cobertura.',
      },
    ],
  },
  {
    slug: 'alternativa-simple-ministerio',
    metaTitle: 'Alternativa a SIMPLE del Ministerio para el DeCA | DeCA',
    h1: 'La alternativa a SIMPLE, la herramienta del Ministerio, para tu DeCA',
    navLabel: 'Alternativa a SIMPLE del Ministerio',
    description:
      'Si la herramienta SIMPLE del Ministerio se te hace lenta, DeCA genera el mismo documento oficial con QR en menos de un minuto, con historial y pensado para el móvil.',
    datePublished: '2026-10-14',
    dateModified: '2026-10-14',
    intro:
      'Si rellenar la herramienta SIMPLE del Ministerio en cada porte se te hace lento y repetitivo, DeCA genera el mismo documento oficial en menos de un minuto, con historial por empresa y pensado para el móvil.',
    sections: [
      {
        heading: 'Qué se le hace cuesta arriba a SIMPLE en el día a día',
        bullets: [
          'Hay que rellenar un formulario largo cada vez, sin reaprovechar los datos de portes anteriores.',
          'No guarda un historial ordenado por empresa, buscable y exportable.',
          'No está pensado para que un conductor lo use desde el móvil en el momento de cargar.',
          'Una sola sesión para todos, en lugar de un acceso por conductor.',
        ],
      },
      {
        heading: 'Cómo lo resuelve DeCA',
        bullets: [
          'Genera el DeCA en menos de un minuto y guarda rutas y contrapartes habituales.',
          'Historial completo por empresa, buscable por matrícula o fecha y exportable a CSV.',
          'Funciona desde el móvil y sigue funcionando sin cobertura (PWA).',
          'Un acceso individual por conductor y un panel único para el gestor.',
        ],
      },
      {
        heading: 'El mismo documento oficial, válido en inspección',
        paragraphs: [
          'El DeCA que generas cumple la misma normativa (Orden FOM/2861/2012 y Resolución de 5 de junio de 2026) e incluye el mismo código QR de verificación que se pide en una inspección. DeCA no elimina la obligación legal: la hace más rápida y ordenada.',
        ],
      },
      {
        heading: 'Pruébalo con tus propios portes',
        paragraphs: [
          'Empieza gratis con 10 DeCA o 5 días, sin tarjeta de crédito, y compara tú mismo el tiempo que te lleva cada documento.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿DeCA es la herramienta oficial del Ministerio?',
        a: 'No. DeCA es una herramienta privada e independiente que genera el Documento electrónico de Control Administrativo conforme a la normativa, con su código QR de verificación. No es un sitio del Ministerio ni está afiliado a él.',
      },
      {
        q: '¿El documento vale en una inspección igual que el de SIMPLE?',
        a: 'Sí. Incluye el código QR de verificación y todos los campos obligatorios exigidos por la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026.',
      },
      {
        q: '¿Puedo dejar de usar SIMPLE?',
        a: 'Puedes generar y llevar tu DeCA con DeCA cumpliendo la normativa. La obligación de llevar el documento sigue siendo tuya; lo que cambia es la rapidez y el orden con que lo generas.',
      },
    ],
  },
  {
    slug: 'deca-precio',
    metaTitle: 'Precio del DeCA | Cuánto cuesta generar el Documento de Control Administrativo',
    h1: '¿Cuánto cuesta el DeCA? Precios y planes',
    navLabel: 'Precio del DeCA',
    description:
      'Precios de DeCA para generar el Documento electrónico de Control Administrativo: planes desde 5 €/mes con DeCA ilimitados, sin permanencia y con prueba gratis sin tarjeta.',
    datePublished: '2026-10-14',
    dateModified: '2026-10-14',
    intro:
      'Generar el DeCA cuesta desde 5 €/mes con documentos ilimitados, y puedes probarlo gratis antes de pagar. Sin permanencia y cambiando de plan cuando quieras.',
    sections: [
      {
        heading: 'Planes y precios',
        paragraphs: ['Eliges el plan por el número de conductores de tu empresa (precios sin IVA):'],
        bullets: [
          'Básico — 5 €/mes: hasta 3 conductores, DeCA ilimitados, historial y exportación CSV.',
          'Flota — 25 €/mes: hasta 10 conductores, corrección de documentos y soporte prioritario.',
          'Empresa — 75 €/mes: hasta 50 conductores, con todo lo del plan Flota.',
          'Flota+ — a medida: más de 50 conductores, facturación y alta del equipo a medida.',
        ],
      },
      {
        heading: 'Qué incluye cualquier plan',
        paragraphs: [
          'Todos los planes incluyen DeCA ilimitados, el PDF oficial con código QR de verificación, historial buscable y exportable a CSV, envío por WhatsApp, funcionamiento en el móvil sin cobertura (PWA) y factura automática con el IVA desglosado en cada cobro.',
        ],
      },
      {
        heading: 'Prueba gratis antes de pagar',
        paragraphs: [
          'Puedes generar hasta 10 DeCA o usarlo durante 5 días —lo que llegue antes— sin introducir ninguna tarjeta de crédito. Así compruebas con tus propios portes si te encaja antes de elegir plan.',
        ],
      },
      {
        heading: 'Sin permanencia y con factura',
        paragraphs: [
          'Cambias de plan o cancelas cuando quieras desde tu panel, sin llamadas ni permanencia. Si cambias de plan, el nuevo precio se aplica en tu siguiente renovación, sin cobros sorpresa a mitad de mes.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Cuánto cuesta el DeCA más barato?',
        a: 'El plan Básico cuesta 5 €/mes (sin IVA) e incluye DeCA ilimitados para hasta 3 conductores.',
      },
      {
        q: '¿El precio incluye IVA?',
        a: 'No. El precio de cada plan no incluye IVA; se calcula y se muestra desglosado (21 %) en el momento del pago, y cada cobro genera su factura.',
      },
      { q: '¿Hay permanencia?', a: 'No. Puedes cancelar o cambiar de plan cuando quieras desde tu panel.' },
      {
        q: '¿Puedo probarlo gratis?',
        a: 'Sí: 10 DeCA o 5 días de prueba, sin tarjeta de crédito.',
      },
    ],
  },
  {
    slug: 'deca-gratis',
    metaTitle: 'Generar el DeCA gratis | Prueba 10 DeCA o 5 días sin tarjeta',
    h1: 'Generar el DeCA gratis: prueba sin tarjeta',
    navLabel: 'Probar el DeCA gratis',
    description:
      'Prueba DeCA gratis: genera hasta 10 DeCA o durante 5 días sin tarjeta de crédito. Después, planes con documentos ilimitados desde 5 €/mes.',
    datePublished: '2026-10-14',
    dateModified: '2026-10-14',
    intro:
      'Puedes empezar a generar tus DeCA gratis: 10 documentos o 5 días de prueba, lo que llegue antes, sin introducir ninguna tarjeta de crédito.',
    sections: [
      {
        heading: 'Qué incluye la prueba gratis',
        bullets: [
          '10 DeCA o 5 días de uso, lo que ocurra primero.',
          'Sin tarjeta de crédito y sin compromiso.',
          'Todas las funciones: PDF con QR, historial, WhatsApp y uso en el móvil.',
          'Los DeCA que generes durante la prueba se conservan.',
        ],
      },
      {
        heading: 'Qué pasa cuando termina la prueba',
        paragraphs: [
          'Para seguir generando DeCA nuevos, eliges un plan desde 5 €/mes con documentos ilimitados. Los DeCA que ya hayas generado se conservan y siguen siendo descargables durante el plazo legal de 1 año, aunque no continúes con un plan.',
        ],
      },
      {
        heading: 'Por qué la prueba es gratis pero el servicio no es gratis para siempre',
        paragraphs: [
          'Mantener un servicio que genera documentos oficiales con cumplimiento verificado, almacenamiento y soporte tiene un coste, por eso el plan más barato son 5 €/mes. Pero la prueba es real: sin tarjeta y con todas las funciones, para que decidas con tus propios portes.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Es gratis de verdad?',
        a: 'La prueba sí: 10 DeCA o 5 días sin tarjeta de crédito. Para seguir generando documentos después, hay planes desde 5 €/mes.',
      },
      { q: '¿Necesito tarjeta para la prueba?', a: 'No. La prueba no pide ningún dato de pago.' },
      {
        q: '¿Qué pasa con mis DeCA si no continúo?',
        a: 'Se conservan y se pueden descargar durante el plazo legal de 1 año. Lo que se detiene es poder generar DeCA nuevos.',
      },
      { q: '¿Cuánto dura la prueba?', a: '10 DeCA o 5 días, lo que llegue antes.' },
    ],
  },
  {
    slug: 'deca-paqueteria',
    metaTitle: 'DeCA para paquetería, reparto y última milla | DeCA',
    h1: 'El DeCA para paquetería, reparto y última milla',
    navLabel: 'DeCA para paquetería',
    description:
      'Genera el DeCA para transporte de paquetería y reparto de última milla: documento oficial con QR en menos de un minuto, desde el móvil del repartidor.',
    datePublished: '2026-10-14',
    dateModified: '2026-10-14',
    intro:
      'En paquetería y última milla se hacen muchos portes al día. DeCA genera cada Documento electrónico de Control Administrativo en menos de un minuto, desde el móvil, reutilizando las rutas habituales.',
    sections: [
      {
        heading: 'Pensado para el ritmo de la última milla',
        bullets: [
          'Menos de un minuto por documento, para no frenar el reparto.',
          'Rutas y contrapartes habituales guardadas: el siguiente DeCA se rellena en segundos.',
          'Desde el móvil del repartidor, sin depender de un ordenador en la nave.',
          'Sigue funcionando sin cobertura (PWA) y envías el PDF por WhatsApp en un toque.',
        ],
      },
      {
        heading: 'Varios repartidores, un solo panel',
        paragraphs: [
          'Cada repartidor tiene su propio acceso y genera solo sus DeCA; el responsable los ve todos desde un único panel y puede corregir cualquiera sin perder la trazabilidad del documento original.',
        ],
      },
      {
        heading: '¿El DeCA aplica a la paquetería?',
        paragraphs: [
          'El DeCA es el documento de control del transporte de mercancías por carretera. Si tu actividad de paquetería o reparto está sujeta a esa obligación según la normativa, DeCA te genera el documento conforme a la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026, con su código QR de verificación. Ante dudas sobre si un porte concreto está obligado, consulta la normativa o a tu gestoría.',
        ],
      },
    ],
    faqs: [
      {
        q: '¿Sirve para reparto de última milla?',
        a: 'Sí: si tu transporte está sujeto a la obligación del DeCA, la herramienta te genera el documento oficial para cada porte, pensada para hacerlo rápido y desde el móvil.',
      },
      { q: '¿Puedo usarlo con varios repartidores?', a: 'Sí. Cada repartidor tiene su acceso y el responsable los ve todos.' },
      { q: '¿Funciona sin cobertura?', a: 'Sí. Se instala como app (PWA) y sigue funcionando aunque falle la conexión.' },
    ],
  },
]

export function getCommercialPage(slug: string): CommercialPage | undefined {
  return COMMERCIAL_PAGES.find((p) => p.slug === slug)
}
