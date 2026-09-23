import type { App } from 'firebase-admin/app'

/** `FIREBASE_SERVICE_ACCOUNT` is the project's service-account JSON,
 * base64-encoded (Vercel env vars are plain strings, and the JSON contains
 * newlines/quotes that are easy to mangle when pasted raw). Generate it from
 * the Firebase Console → Project Settings → Service accounts → "Generate
 * new private key", then base64-encode the downloaded file.
 *
 * Async with a dynamic `import()`, not a static top-level one: a static
 * `import ... from 'firebase-admin/...'` gets bundled by Vercel's builder in
 * a way that crashes at load time with `ERR_REQUIRE_ESM` (one of
 * firebase-admin's own transitive deps only ships an ESM build) — before
 * any handler code, including try/catch, ever runs. A dynamic import
 * sidesteps that bundling path entirely and also means a bad/missing env
 * var surfaces as a normal caught error instead of an opaque
 * "FUNCTION_INVOCATION_FAILED". */
let cachedApp: App | null = null

async function getAdminApp(): Promise<App> {
  if (cachedApp) return cachedApp

  const { cert, getApps, initializeApp } = await import('firebase-admin/app')
  const existing = getApps()[0]
  if (existing) {
    cachedApp = existing
    return existing
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT en las variables de entorno')

  let serviceAccount: unknown
  try {
    serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT no es un JSON válido en base64 — revisa que se haya copiado entero')
  }

  cachedApp = initializeApp({ credential: cert(serviceAccount as object) })
  return cachedApp
}

export async function getAdminAuth() {
  const { getAuth } = await import('firebase-admin/auth')
  return getAuth(await getAdminApp())
}

export async function getAdminDb() {
  const { getFirestore } = await import('firebase-admin/firestore')
  return getFirestore(await getAdminApp())
}

// Fixed to this project's one Storage bucket — `getStorage(app).bucket()`
// with no args would instead guess `{project_id}.appspot.com`, which isn't
// this bucket's actual name (see VITE_FIREBASE_STORAGE_BUCKET in .env).
const STORAGE_BUCKET = 'deca-8da69.firebasestorage.app'

export async function getAdminStorage() {
  const { getStorage } = await import('firebase-admin/storage')
  return getStorage(await getAdminApp()).bucket(STORAGE_BUCKET)
}
