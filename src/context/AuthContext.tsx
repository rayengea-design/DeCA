import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, onSnapshot, runTransaction } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth, db } from '@/config/firebase'
import type { Company, UserProfile } from '@/types/deca'

interface CompanySetupInput {
  nombre: string
  nif: string
  domicilio: string
}

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  company: Company | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<User>
  logout: () => Promise<void>
  setupCompany: (input: CompanySetupInput) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        setProfile(null)
        setCompany(null)
        setLoading(false)
      }
    })
    return unsubAuth
  }, [])

  useEffect(() => {
    if (!user) return

    // Real-time listener (not a one-off getDoc): if an admin revokes access by
    // setting `disabled: true`, this fires within seconds on every open tab
    // and forces a sign-out. Deleting the Firebase Auth account alone does
    // NOT do this: an already-issued ID token stays technically valid for up
    // to an hour, so relying on that alone would leave a fired employee
    // logged in for a while.
    //
    // A MISSING profile doc is NOT the same thing as disabled — it's the
    // normal state for a brand-new Firebase Auth account the admin just
    // created for a new client, who hasn't done `/configurar-empresa` yet.
    // Signing those people out here (as an earlier version of this code did)
    // made it impossible for any new company to ever complete onboarding —
    // they'd log in, get bounced straight back out, and see what looks like
    // a broken login.
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), async (snap) => {
      if (snap.exists() && (snap.data() as UserProfile).disabled) {
        setProfile(null)
        setCompany(null)
        setLoading(false)
        await signOut(auth)
        return
      }
      if (!snap.exists()) {
        setProfile(null)
        setCompany(null)
        setLoading(false)
        return
      }
      const p = snap.data() as UserProfile
      setProfile(p)
      const companySnap = await getDoc(doc(db, 'companies', p.companyId))
      setCompany(companySnap.exists() ? (companySnap.data() as Company) : null)
      setLoading(false)
    })
    return unsubProfile
  }, [user])

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signup(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  // Works for both signup and login — Firebase treats a Google sign-in as
  // "the account already exists" if that Google email has signed in before,
  // or creates a brand-new Auth user otherwise. Either way the caller ends
  // up with no profile doc yet on a first-ever sign-in, which routes them
  // through `/configurar-empresa` exactly like a fresh email/password signup.
  async function loginWithGoogle() {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider())
    return credential.user
  }

  async function logout() {
    await signOut(auth)
  }

  async function setupCompany({ nombre, nif, domicilio }: CompanySetupInput) {
    if (!user) throw new Error('No hay ninguna sesión activa')
    const uid = user.uid
    const companyId = crypto.randomUUID()
    const newCompany: Company = {
      id: companyId,
      nombre,
      nif,
      domicilio,
      createdAt: new Date().toISOString(),
      decaCount: 0,
    }
    const newProfile: UserProfile = {
      uid,
      email: user.email ?? '',
      companyId,
      role: 'admin',
    }

    // A transaction, not two separate setDoc calls: if this runs twice in
    // quick succession for the same brand-new user (e.g. the auto-setup
    // effect firing more than once), the second attempt re-reads
    // `users/{uid}` inside the transaction, sees the first one already won,
    // and backs off instead of creating an orphaned duplicate company.
    const created = await runTransaction(db, async (tx) => {
      const userRef = doc(db, 'users', uid)
      const existing = await tx.get(userRef)
      if (existing.exists()) return false
      tx.set(doc(db, 'companies', companyId), newCompany)
      tx.set(userRef, newProfile)
      return true
    })

    if (created) {
      setProfile(newProfile)
      setCompany(newCompany)
    }
    // If not created, the profile already existed — the onSnapshot listener
    // above will pick up its (real) company on its own.
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, company, loading, login, signup, loginWithGoogle, logout, setupCompany }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
