import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
// Persistent local cache (IndexedDB): the Historial a driver already loaded
// stays visible if connectivity drops afterwards, and Firestore syncs
// automatically once back online. `persistentMultipleTabManager` lets more
// than one open tab share that cache instead of one tab locking it.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
export const storage = getStorage(app)
export const storageBucket = firebaseConfig.storageBucket as string

/** Re-exported so a second, isolated Firebase App instance can be spun up
 * for admin-creates-teammate flows (see services/teamService.ts) — the
 * client Auth SDK has no "create a user without signing in as them" call, so
 * that trick is the only way to do it without a backend. */
export { firebaseConfig }
