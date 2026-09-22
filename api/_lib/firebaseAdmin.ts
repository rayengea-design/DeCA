import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/** `FIREBASE_SERVICE_ACCOUNT` is the project's service-account JSON,
 * base64-encoded (Vercel env vars are plain strings, and the JSON contains
 * newlines/quotes that are easy to mangle when pasted raw). Generate it from
 * the Firebase Console → Project Settings → Service accounts → "Generate
 * new private key", then base64-encode the downloaded file.
 *
 * Lazy, not module-level: throwing at import time crashes the whole
 * serverless function before any handler's try/catch runs, which Vercel
 * then reports as an opaque "FUNCTION_INVOCATION_FAILED" with no detail.
 * Calling this from inside a handler instead surfaces a real error message
 * (missing var, bad base64, invalid JSON, cert() rejecting the shape...). */
function getAdminApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT en las variables de entorno')

  let serviceAccount: unknown
  try {
    serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT no es un JSON válido en base64 — revisa que se haya copiado entero')
  }

  return initializeApp({ credential: cert(serviceAccount as object) })
}

export function getAdminAuth() {
  return getAuth(getAdminApp())
}

export function getAdminDb() {
  return getFirestore(getAdminApp())
}
