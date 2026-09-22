import type { VercelRequest } from '@vercel/node'
import { getAdminAuth } from './firebaseAdmin'
import { ApiError } from './requireCompanyAdmin'

/** Platform-level admin (you, running DeCA as a business) — completely
 * separate from a company's own `role: 'admin'`. Allowlisted by email via
 * an env var rather than a Firestore collection: it's simpler, needs no
 * seeding step, and every request here already goes through the backend
 * (never client Firestore rules), so there's no separate attack surface to
 * worry about from keeping it out of the database. */
export async function requirePlatformAdmin(req: VercelRequest) {
  const authHeader = req.headers.authorization
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
  if (!idToken) throw new ApiError(401, 'Falta el token de autenticación')

  const adminAuth = await getAdminAuth()
  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null)
  if (!decoded || !decoded.email) throw new ApiError(401, 'Token inválido o caducado')

  const allowlist = (process.env.PLATFORM_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  if (!allowlist.includes(decoded.email.toLowerCase())) {
    throw new ApiError(403, 'No tienes acceso al panel de administración')
  }

  return { email: decoded.email }
}
