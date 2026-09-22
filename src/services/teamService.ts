import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { auth, db, firebaseConfig } from '@/config/firebase'
import type { UserProfile } from '@/types/deca'

/**
 * Creates a Firebase Auth account for a teammate (driver) and their Firestore
 * profile, WITHOUT signing the admin out of their own session.
 *
 * The Firebase client Auth SDK has no "create a user but don't sign in as
 * them" call — createUserWithEmailAndPassword always authenticates as the
 * new user on whatever Auth instance you call it on. The workaround (no
 * backend needed) is to spin up a second, throwaway Firebase App instance
 * just for that one call, then tear it down immediately — the admin's
 * session on the main app/auth instance is never touched.
 */
export async function createTeamMember(
  companyId: string,
  nombre: string,
  email: string,
  password: string,
): Promise<UserProfile> {
  const secondaryApp = initializeApp(firebaseConfig, `team-create-${Date.now()}`)
  try {
    const secondaryAuth = getAuth(secondaryApp)
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    const profile: UserProfile = {
      uid: credential.user.uid,
      email,
      ...(nombre ? { nombre } : {}),
      companyId,
      role: 'member',
    }
    // Written via the MAIN app's Firestore instance, so this request is
    // authenticated as the admin (not the new teammate) — that's what lets
    // it satisfy the isAdmin() check in firestore.rules.
    await setDoc(doc(db, 'users', credential.user.uid), profile)
    await signOut(secondaryAuth)
    return profile
  } finally {
    await deleteApp(secondaryApp)
  }
}

export async function listCompanyUsers(companyId: string): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), where('companyId', '==', companyId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as UserProfile)
}

export async function setTeamMemberDisabled(uid: string, disabled: boolean) {
  await updateDoc(doc(db, 'users', uid), { disabled })
}

/**
 * Firebase never stores or returns a user's actual password — not even to an
 * admin — so there is no secure way to "show" a teammate's password later.
 * The standard, backend-free way to hand them a way back in is a password
 * reset email: they get a link, set a new password themselves, and no one
 * else ever has to know or store it.
 */
export async function sendTeamMemberPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email)
}
