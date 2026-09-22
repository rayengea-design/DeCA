import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { collection, doc, getDocs, increment, query, updateDoc, where, writeBatch } from 'firebase/firestore'
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
    // Written via the MAIN app's Firestore instance (batched with the
    // company's seat counter), so this request is authenticated as the
    // admin, not the new teammate — that's what lets it satisfy both the
    // isAdmin() check and the seat-limit check in firestore.rules.
    const batch = writeBatch(db)
    batch.set(doc(db, 'users', credential.user.uid), profile)
    batch.update(doc(db, 'companies', companyId), { memberCount: increment(1) })
    await batch.commit()
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

/** Disabling frees up a seat, reactivating uses one again (and is rejected
 * by firestore.rules if the company is already at its plan's seat limit) —
 * batched with the profile update so the counter never drifts out of sync
 * with reality. */
export async function setTeamMemberDisabled(companyId: string, uid: string, disabled: boolean) {
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', uid), { disabled })
  batch.update(doc(db, 'companies', companyId), { memberCount: increment(disabled ? -1 : 1) })
  await batch.commit()
}

/** Promotes a driver to admin (full access) or demotes an admin back to
 * driver-only access. Doesn't touch the seat counter — either way it's
 * still one active account. firestore.rules blocks an admin from changing
 * their own role, so there's always at least one admin left standing. */
export async function setTeamMemberRole(uid: string, role: 'admin' | 'member') {
  await updateDoc(doc(db, 'users', uid), { role })
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
