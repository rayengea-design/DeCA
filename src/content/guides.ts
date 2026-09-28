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

// Marketing/SEO content. Each guide is a data object so adding a new article
// is just another entry here — no new component or route needed. The bodies
// deliberately reuse the same facts (Orden FOM/2861/2012, Resolución de 5 de
// junio de 2026, obligatorio el 5 de octubre de 2026, sanción 401€–20.000€)
// that the landing page and the legal pages already state, so the whole site
// tells one consistent story to both Google and the AI assistants.
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
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
