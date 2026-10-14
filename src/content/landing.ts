/** Single source of truth for the marketing landing page's copy.
 *
 * Both the React `LandingPage` (client render) and the build-time prerender in
 * `vite.config.ts` (`homeBodyHtml`) read from here, so the static HTML that
 * crawlers and AI assistants see is always identical to what users see — no
 * drift, no cloaking. Keep it plain data (no React / lucide imports) so it can
 * be imported from the Node build config as well as the browser bundle. Icons
 * are referenced by name and resolved to components in LandingPage. */

export type IconName =
  | 'QrCode'
  | 'ShieldCheck'
  | 'Users'
  | 'History'
  | 'Bookmark'
  | 'Download'
  | 'MessageCircle'
  | 'Smartphone'
  | 'Lock'
  | 'CreditCard'
  | 'User'
  | 'Truck'
  | 'Building2'
  | 'Server'

export const DECA_MANDATORY_DATE = new Date('2026-10-05T00:00:00')

/** Days left until the DeCA becomes mandatory (0 once the date has passed). */
export function daysUntilMandatory(now: number = Date.now()): number {
  return Math.max(0, Math.ceil((DECA_MANDATORY_DATE.getTime() - now) / (24 * 60 * 60 * 1000)))
}

export function isMandatoryYet(now: number = Date.now()): boolean {
  return now >= DECA_MANDATORY_DATE.getTime()
}

/** The small badge over the hero — "already mandatory" / countdown / date. */
export function heroBadge(now: number = Date.now()): string {
  const days = daysUntilMandatory(now)
  if (isMandatoryYet(now)) return 'Ya es obligatorio desde el 5 de octubre de 2026'
  if (days <= 30) return `Obligatorio en ${days} ${days === 1 ? 'día' : 'días'} (5 de octubre de 2026)`
  return 'Obligatorio desde el 5 de octubre de 2026'
}

export const HERO = {
  h1: 'Genera el DeCA de cada porte en menos de un minuto',
  subtitle:
    'El Documento electrónico de Control Administrativo, sin rellenar formularios largos en la web del Ministerio. PDF oficial con QR, cumplimiento verificado y todo el equipo desde el móvil.',
  note: '10 DeCA o 5 días gratis · Sin tarjeta de crédito · Cancela cuando quieras',
}

export const TRUST_ITEMS: { icon: IconName; text: string }[] = [
  { icon: 'ShieldCheck', text: 'Conforme a la Orden FOM/2861/2012' },
  { icon: 'Lock', text: 'Datos de cada empresa aislados' },
  { icon: 'CreditCard', text: 'Pagos y factura vía Stripe' },
  { icon: 'Server', text: 'Alojado en Google Cloud' },
]

export const SANCTION_TEXT =
  'No llevar el DeCA en regla puede suponer una sanción de entre 401€ y 20.000€ por infracción.'

export const PROBLEM = {
  h2: 'Las herramientas oficiales no están pensadas para tu día a día',
  p: 'La web "SIMPLE" del Ministerio obliga a rellenar formularios largos cada vez, no guarda un historial ordenado por empresa y no está pensada para que la use un conductor desde el móvil en el momento de cargar.',
}

export const SOLUTION = {
  h2: 'DeCA hace el mismo trámite en un minuto',
  p: 'Genera el documento oficial, con su código QR de verificación, cumpliendo al 100% con la normativa vigente. Sin papeleo, sin dobles formularios, sin dudas de si está bien hecho.',
}

export const COMPARISON: { item: string; simple: string; deca: string }[] = [
  { item: 'Tiempo por documento', simple: 'Formulario largo cada vez', deca: 'Menos de un minuto' },
  { item: 'Historial por empresa', simple: 'No', deca: 'Sí, buscable y exportable' },
  { item: 'Pensado para el móvil', simple: 'No', deca: 'Sí, funciona sin cobertura' },
  { item: 'Varios conductores', simple: 'Una sesión para todos', deca: 'Acceso individual por conductor' },
  { item: 'Corrección de errores', simple: 'Manual, sin trazabilidad', deca: 'Un clic, enlazada al original' },
  { item: 'Envío al momento', simple: 'Descargar y adjuntar a mano', deca: 'Un toque por WhatsApp' },
]

export const FEATURES_HEADING = {
  h2: 'Todo lo que necesita tu flota',
  sub: 'Una sola herramienta para generar, corregir y compartir cada DeCA.',
}

export const FEATURES: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'QrCode',
    title: 'PDF con QR en segundos',
    description: 'Rellenas el porte y descargas el DeCA oficial con su código QR de verificación al instante.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Cumplimiento normativo verificado',
    description:
      'Cada campo exigido por la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026, sin dejar huecos.',
  },
  {
    icon: 'Users',
    title: 'Un acceso por conductor',
    description: 'Cada conductor genera y ve solo sus DeCA. Tú, como gestor de flota, los ves todos desde un panel.',
  },
  {
    icon: 'History',
    title: 'Corrección sin perder trazabilidad',
    description: 'Si un dato cambia, emites una corrección enlazada al documento original, tal y como exige la ley.',
  },
  {
    icon: 'Bookmark',
    title: 'Rutas y contrapartes guardadas',
    description:
      'Guarda las combinaciones habituales de cargador, mercancía y ruta y rellena el siguiente porte en segundos.',
  },
  {
    icon: 'Download',
    title: 'Historial y exportación a CSV',
    description: 'Busca por matrícula o fecha y exporta el histórico completo para tu gestoría o una inspección.',
  },
  {
    icon: 'MessageCircle',
    title: 'Envío por WhatsApp',
    description: 'Comparte el PDF real con el conductor o el cargador con un solo toque, sin descargar nada a mano.',
  },
  {
    icon: 'Smartphone',
    title: 'Funciona en el móvil, sin cobertura',
    description: 'Se instala como una app (PWA) y sigue funcionando aunque la conexión falle en carretera.',
  },
  {
    icon: 'Lock',
    title: 'Cada empresa, sus propios datos',
    description:
      'Aislamiento de datos por empresa a nivel de base de datos: ni conductores ni clientes de otras cuentas pueden verlos.',
  },
  {
    icon: 'CreditCard',
    title: 'Factura automática con IVA',
    description: 'Cada cobro genera su factura y se envía sola a tu email, con el IVA calculado y desglosado.',
  },
]

export const STEPS_HEADING = {
  h2: 'Cómo funciona',
  sub: 'De cero a tu primer DeCA en menos de dos minutos.',
}

export const STEPS: { step: string; title: string; body: string }[] = [
  {
    step: '1',
    title: 'Rellena el porte',
    body: 'Origen, destino, mercancía, matrículas, cargador y transportista. Si lo has hecho antes, usa una ruta o contraparte guardada.',
  },
  { step: '2', title: 'Genera el DeCA', body: 'El PDF oficial con QR se crea al instante, listo para descargar.' },
  {
    step: '3',
    title: 'Compártelo',
    body: 'Envíalo por WhatsApp o que el conductor lo lleve desde el móvil, con o sin cobertura.',
  },
]

export const USE_CASES_HEADING = {
  h2: 'Para quién es DeCA',
  sub: 'Del autónomo con una furgoneta al grupo logístico con varios equipos.',
}

export const USE_CASES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'User',
    title: 'Autónomo con vehículo propio',
    body: 'Generas tu DeCA desde el móvil antes de cada porte, sin depender de nadie ni de un ordenador en la oficina. Plan Básico.',
  },
  {
    icon: 'Truck',
    title: 'Flota pequeña o mediana',
    body: 'Cada conductor tiene su propio acceso, tú ves todos los documentos de la empresa desde un solo panel y corriges lo que haga falta. Plan Flota.',
  },
  {
    icon: 'Building2',
    title: 'Grupo logístico con varios equipos',
    body: 'Decenas de conductores, varios administradores, soporte prioritario y, a partir de 50 conductores, condiciones a medida. Plan Empresa o Flota+.',
  },
]

export const SECURITY = {
  h2: 'Tus datos, solo tuyos',
  p: 'Cada empresa cliente tiene sus datos completamente aislados: ni otros clientes de DeCA ni sus conductores pueden acceder a información que no sea la suya. Los pagos los procesa Stripe directamente con tu tarjeta — DeCA nunca almacena esos datos en sus propios sistemas.',
  bullets: [
    'Conservación de cada DeCA durante el plazo legal de 1 año, incluso si cancelas.',
    'Control de acceso por empresa a nivel de base de datos, no solo en la pantalla.',
    'Infraestructura sobre Google Cloud (Firebase) y Vercel.',
  ],
}

export const PRICING_HEADING = {
  h2: 'Precios simples, sin sorpresas',
  sub: '10 DeCA o 5 días de prueba gratis en cualquier plan. Sin tarjeta de crédito.',
  note: 'El IVA correspondiente se calcula y se muestra desglosado en el momento del pago.',
}

/** `hrefKind` keeps the actual URLs out of the data: LandingPage maps
 * 'registro' to the /registro route and 'whatsapp' to WHATSAPP_CONTACT_URL. */
export const PLANS_MARKETING: {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  hrefKind: 'registro' | 'whatsapp'
  highlighted?: boolean
}[] = [
  {
    name: 'Básico',
    price: '5€',
    period: '/mes',
    description: 'Para autónomos y flotas pequeñas que empiezan con el DeCA.',
    features: ['Hasta 3 conductores', 'DeCA ilimitados', 'Historial y exportación CSV', 'Envío por WhatsApp'],
    cta: 'Empezar prueba gratis',
    hrefKind: 'registro',
  },
  {
    name: 'Flota',
    price: '25€',
    period: '/mes',
    description: 'Para empresas de transporte con varios conductores en ruta.',
    features: ['Hasta 10 conductores', 'Todo lo del plan Básico', 'Corrección de documentos', 'Soporte prioritario'],
    cta: 'Empezar prueba gratis',
    hrefKind: 'registro',
    highlighted: true,
  },
  {
    name: 'Empresa',
    price: '75€',
    period: '/mes',
    description: 'Para grupos de transporte con varios equipos y muchos conductores.',
    features: ['Hasta 50 conductores', 'Todo lo del plan Flota', 'Soporte prioritario'],
    cta: 'Empezar prueba gratis',
    hrefKind: 'registro',
  },
  {
    name: 'Flota+',
    price: 'A medida',
    description: 'Para grupos logísticos con más de 50 conductores o necesidades propias.',
    features: ['Conductores ilimitados', 'Facturación a medida', 'Alta asistida del equipo', 'SLA dedicado'],
    cta: 'Hablar con nosotros',
    hrefKind: 'whatsapp',
  },
]

export const MID_CTA = {
  h2: '¿Aún rellenando el formulario del Ministerio a mano?',
  p: 'Prueba DeCA gratis con tus propios portes: 10 documentos o 5 días, sin tarjeta de crédito.',
  bullets: ['Alta en menos de 2 minutos', 'Sin tarjeta de crédito', 'Sin permanencia, cancela cuando quieras'],
}

export const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Qué es el DeCA y por qué es obligatorio?',
    a: 'El Documento electrónico de Control Administrativo (DeCA) es el documento que deben llevar los transportes nacionales de mercancías por carretera en España, según la Orden FOM/2861/2012 y la Resolución de 5 de junio de 2026. Desde el 5 de octubre de 2026 es obligatorio en cada porte.',
  },
  {
    q: '¿Qué pasa si no lo llevo?',
    a: 'No llevarlo, o llevarlo mal cumplimentado, puede suponer una sanción de entre 401€ y 20.000€ según la infracción.',
  },
  {
    q: '¿Cada conductor necesita su propia cuenta?',
    a: 'Sí, y es lo recomendable: das de alta a cada conductor con su acceso, cada uno genera y ve solo sus propios DeCA, y tú ves los de toda la empresa.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Gestionas tu suscripción, cambias de plan o cancelas desde tu propio panel, sin llamadas ni permanencia. Si cancelas, mantienes acceso hasta el final del periodo ya pagado.',
  },
  {
    q: '¿Necesito instalar algo?',
    a: 'No. Funciona desde el navegador del móvil o el ordenador, y se puede añadir a la pantalla de inicio como una app (PWA) que sigue funcionando sin cobertura.',
  },
  {
    q: '¿Puedo cambiar de plan más adelante?',
    a: 'Sí, en cualquier momento desde Facturación. El cambio se aplica al final de tu periodo actual: sigues en tu plan de ahora hasta entonces y solo se te cobra la nueva cuota cuando toca renovar.',
  },
  {
    q: '¿Qué pasa con mis DeCA si dejo de pagar?',
    a: 'Todos los documentos ya generados se conservan y siguen siendo descargables — es una obligación legal de conservación de 1 año, no depende de tu suscripción. Lo que se detiene es poder generar DeCA nuevos.',
  },
  {
    q: '¿Cómo se calcula y se cobra el IVA?',
    a: 'El precio de cada plan no incluye IVA — se calcula y se muestra desglosado en el momento del pago, y cada cobro genera automáticamente su factura, que recibes por email.',
  },
  {
    q: '¿Es seguro? ¿Quién ve mis datos?',
    a: 'Los datos de cada empresa están aislados a nivel de base de datos: nadie de otra empresa cliente puede acceder a ellos. Los pagos los procesa Stripe directamente — DeCA no almacena ni ve los datos de tu tarjeta.',
  },
  {
    q: '¿El QR del DeCA es el mismo que pide un inspector?',
    a: 'Sí. El PDF que genera DeCA incluye el código QR de verificación exigido por la normativa, con todos los campos obligatorios cumplimentados.',
  },
]

export const FINAL_CTA = {
  h2: 'Empieza a generar tus DeCA hoy',
  p: 'Da de alta tu empresa en menos de dos minutos y ten tu primer DeCA listo antes de terminar el café.',
  note: '10 DeCA o 5 días gratis · Sin tarjeta de crédito · Cancela cuando quieras',
}
