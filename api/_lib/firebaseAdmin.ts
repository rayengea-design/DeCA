import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/** `FIREBASE_SERVICE_ACCOUNT` is the project's service-account JSON,
 * base64-encoded (Vercel env vars are plain strings, and the JSON contains
 * newlines/quotes that are easy to mangle when pasted raw). Generate it from
 * the Firebase Console → Project Settings → Service accounts → "Generate
 * new private key", then base64-encode the downloaded file. */
function getAdminApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT en las variables de entorno')
  const serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))

  return initializeApp({ credential: cert(serviceAccount) })
}

export const adminAuth = getAuth(getAdminApp())
export const adminDb = getFirestore(getAdminApp())
