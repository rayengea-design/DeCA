import type { VercelRequest } from '@vercel/node'
import { adminAuth, adminDb } from './firebaseAdmin'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Verifies the caller's Firebase ID token (Authorization: Bearer <token>)
 * and that they're the admin of an existing company — every billing action
 * (starting a checkout, opening the billing portal) is company-wide, so only
 * the admin should be able to trigger it, mirroring who sees "Facturación"
 * in the app itself. */
export async function requireCompanyAdmin(req: VercelRequest) {
  const authHeader = req.headers.authorization
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
  if (!idToken) throw new ApiError(401, 'Falta el token de autenticación')

  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null)
  if (!decoded) throw new ApiError(401, 'Token inválido o caducado')

  const profileSnap = await adminDb.collection('users').doc(decoded.uid).get()
  const profile = profileSnap.data()
  if (!profile) throw new ApiError(403, 'No se encontró el perfil del usuario')
  if (profile.role !== 'admin') throw new ApiError(403, 'Solo el administrador de la empresa puede gestionar la facturación')
  if (profile.disabled) throw new ApiError(403, 'Cuenta desactivada')

  const companyRef = adminDb.collection('companies').doc(profile.companyId)
  const companySnap = await companyRef.get()
  if (!companySnap.exists) throw new ApiError(404, 'No se encontró la empresa')

  return { uid: decoded.uid, email: decoded.email ?? profile.email, companyRef, company: companySnap.data()! }
}
