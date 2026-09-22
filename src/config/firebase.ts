import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
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

// Opt-in anti-abuse gate for signup (unlimited free-trial companies could
// otherwise be spun up with throwaway emails, no rate limit): a no-op until
// VITE_RECAPTCHA_SITE_KEY is set, so it ships safely without requiring the
// reCAPTCHA/App Check console setup to happen first. To activate: create a
// reCAPTCHA v3 site key at google.com/recaptcha/admin, register it under
// Firebase Console → App Check → the web app, set VITE_RECAPTCHA_SITE_KEY in
// Vercel, and only THEN turn on App Check enforcement for Firestore/Storage
// in the console (enforcing before real traffic is confirmed to carry valid
// tokens would lock out real users, so verify in "unenforced" mode first).
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined
if (recaptchaSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  })
}

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
