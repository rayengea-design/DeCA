import type { VercelRequest } from '@vercel/node'
import { getAdminAuth, getAdminDb } from './firebaseAdmin.js'
import { ApiError } from './requireCompanyAdmin.js'

/** Like requireCompanyAdmin, but for actions any team member (driver or
 * admin) may perform — generating a DeCA is one of those: a driver creates
 * their own, so this must not be admin-only. Still verifies the Firebase ID
 * token, that the profile exists and isn't disabled, and that its company
 * exists. The caller only ever acts on their own company (returned here);
 * never a companyId taken from the request body. */
export async function requireCompanyMember(req: VercelRequest) {
  const authHeader = req.headers.authorization
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
  if (!idToken) throw new ApiError(401, 'Falta el token de autenticación')

  const adminAuth = await getAdminAuth()
  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null)
  if (!decoded) throw new ApiError(401, 'Token inválido o caducado')

  const adminDb = await getAdminDb()
  const profileSnap = await adminDb.collection('users').doc(decoded.uid).get()
  const profile = profileSnap.data()
  if (!profile) throw new ApiError(403, 'No se encontró el perfil del usuario')
  if (profile.disabled) throw new ApiError(403, 'Cuenta desactivada')
  if (!profile.companyId) throw new ApiError(403, 'El usuario no pertenece a ninguna empresa')

  const companyRef = adminDb.collection('companies').doc(profile.companyId)
  const companySnap = await companyRef.get()
  if (!companySnap.exists) throw new ApiError(404, 'No se encontró la empresa')

  return {
    uid: decoded.uid,
    email: decoded.email ?? (profile.email as string | undefined) ?? '',
    nombre: profile.nombre as string | undefined,
    companyRef,
    company: companySnap.data()!,
  }
}
