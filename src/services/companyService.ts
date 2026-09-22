import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'

interface CompanyInfoUpdate {
  nombre?: string
  nif?: string
  domicilio?: string
}

/** Lets a company admin fill in/edit their own billing identity (nombre/nif/
 * domicilio) after the company already exists — e.g. for companies
 * provisioned before signup asked for this, via the old Firebase-console
 * flow. `firestore.rules` restricts this update to exactly these fields and
 * to admins only. */
export async function updateCompanyInfo(companyId: string, update: CompanyInfoUpdate) {
  await setDoc(doc(db, 'companies', companyId), update, { merge: true })
}
