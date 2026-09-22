export type PartyRole = 'cargador' | 'transportista'

/** 'basico' | 'flota' | 'empresa' are self-serve, bought through Stripe
 * Checkout. 'flota_plus' is sales-assisted/custom — never sold through
 * Checkout, only ever set by the platform admin panel (comped or manually
 * arranged), for companies past the 50-driver self-serve ceiling. */
export type SelfServePlanId = 'basico' | 'flota' | 'empresa'
export type PlanId = SelfServePlanId | 'flota_plus'

export interface PartyInfo {
  nombre: string
  nif: string
  domicilio?: string
}

export interface Company {
  id: string
  /** Display name only — used for the tenant header and the role-selector
   * labels ("Mi Empresa realiza el transporte"). NIF/domicilio are NOT
   * stored here: which legal entity/address is actually operating varies
   * per shipment, so those are entered fresh on every DeCA instead of being
   * fixed once in a settings screen that would inevitably go stale. */
  nombre: string
  createdAt: string
  /** Identidad fiscal fija del cliente, usada para facturación — distinta
   * del NIF de cargador/transportista que se rellena en cada DeCA (ese sí
   * puede variar por porte). Opcional por compatibilidad con empresas dadas
   * de alta antes de que el alta pidiera estos datos (p. ej. desde la
   * consola de Firebase). */
  nif?: string
  domicilio?: string
  /** Total de DeCA generados históricamente por la empresa (incluye
   * correcciones). Se incrementa atómicamente junto con cada nuevo
   * documento y es lo que hace cumplible el límite de 10 DeCA de la prueba
   * gratuita a nivel de firestore.rules, no solo en la interfaz. */
  decaCount?: number
  /** Nº de cuentas de equipo activas (admin + conductores no desactivados).
   * Igual que `decaCount`, se mantiene por código (no por Firestore) y es lo
   * que firestore.rules compara contra el límite del plan al crear o
   * reactivar una cuenta — empieza en 1 (el propio admin) al dar de alta la
   * empresa. */
  memberCount?: number
  /** Plan de pago contratado — solo lo escribe el backend (funciones de
   * Vercel a partir de los webhooks de Stripe, o el panel de administración
   * de la plataforma al regalar un plan), nunca el cliente directamente. */
  plan?: PlanId
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid'
  /** Cuándo se cobra/renueva el siguiente periodo — o, si `cancelAtPeriodEnd`
   * es true, cuándo deja de tener acceso (canceló pero Stripe no revoca el
   * acceso hasta que el periodo ya pagado termina). */
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  /** true cuando el plan se lo ha regalado el administrador de la
   * plataforma desde el panel de administración, sin pasar por Stripe
   * (`stripeSubscriptionId` queda vacío en ese caso). */
  comped?: boolean
}

/** Una combinación guardada de contraparte + mercancía + ruta para no tener
 * que volver a teclearla en cada porte habitual. Conveniencia pura — no es
 * un documento legal, así que (a diferencia de DecaRecord) sí se puede
 * editar o borrar libremente. */
export interface SavedTrip {
  id: string
  /** Etiqueta elegida por el usuario, p. ej. "Murcia → Madrid, Cliente X". */
  nombre: string
  counterpartNombre: string
  counterpartNif: string
  counterpartDomicilio?: string
  origen: string
  destino: string
  naturalezaMercancia: string
  peso?: string
  createdAt: string
}

export interface UserProfile {
  uid: string
  email: string
  nombre?: string
  companyId: string
  role: 'admin' | 'member'
  /** Set to revoke this person's access without deleting their Firebase Auth
   * account. Checked both by a real-time listener on the client (forces an
   * immediate sign-out on every open tab, in seconds) and by Firestore rules
   * (denies reads/writes even from a session that somehow missed the
   * listener) — deleting the Auth account alone leaves an already-issued ID
   * token usable for up to an hour, so this is the actual kill switch. */
  disabled?: boolean
}

export interface DecaRecord {
  id: string
  createdAt: string
  createdBy: string
  /** Denormalized at creation time so the history view can show "creado
   * por" without an extra lookup per row — the admin needs to see who on
   * the team made each document, not just be able to. */
  createdByEmail: string
  createdByName?: string
  ownRole: PartyRole

  cargador: PartyInfo
  transportista: PartyInfo

  origen: string
  destino: string

  naturalezaMercancia: string
  bultos?: string
  peso: string

  fechaTransporte: string
  matriculaTractora: string
  matriculaRemolque?: string
  cambioVehiculo?: string

  autorizacionEspecial?: string
  observacionesCargador?: string
  observacionesTransportista?: string

  storagePath: string
  publicUrl: string

  status: 'active' | 'superseded'
  /** id of the DeCA this one replaces (Resolución 5 junio 2026, apartado
   * Quinto — "generación de un nuevo fichero electrónico"). */
  supersedes?: string
  /** id of the DeCA that replaced this one — set on the OLD record so the
   * history view can link forward to the corrected version. */
  supersededBy?: string
  /** Why this document was generated to replace a previous one. Only set
   * when `supersedes` is set. */
  correctionReason?: string

  /** UI-only convenience flag — hides the record from the default history
   * view without touching `status` or deleting anything. The document and
   * its PDF remain fully intact and recoverable, since the DeCA must stay
   * retrievable for the legally required 1-year retention period. */
  hidden?: boolean
}

export type DecaFormValues = Omit<
  DecaRecord,
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'createdByEmail'
  | 'createdByName'
  | 'storagePath'
  | 'publicUrl'
  | 'status'
  | 'supersedes'
  | 'supersededBy'
  | 'correctionReason'
  | 'hidden'
>
