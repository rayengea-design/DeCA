import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { SavedCounterparty } from '@/types/deca'

function savedCounterpartiesCollection(companyId: string) {
  return collection(db, 'companies', companyId, 'savedCounterparties')
}

export async function listSavedCounterparties(companyId: string): Promise<SavedCounterparty[]> {
  const snap = await getDocs(query(savedCounterpartiesCollection(companyId), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => d.data() as SavedCounterparty)
}

export async function createSavedCounterparty(
  companyId: string,
  party: Omit<SavedCounterparty, 'id' | 'createdAt'>,
): Promise<SavedCounterparty> {
  const id = crypto.randomUUID()
  const record: SavedCounterparty = { ...party, id, createdAt: new Date().toISOString() }
  await setDoc(doc(savedCounterpartiesCollection(companyId), id), record)
  return record
}

export async function updateSavedCounterparty(
  companyId: string,
  id: string,
  party: Omit<SavedCounterparty, 'id' | 'createdAt'>,
): Promise<void> {
  await updateDoc(doc(savedCounterpartiesCollection(companyId), id), { ...party })
}

export async function deleteSavedCounterparty(companyId: string, id: string): Promise<void> {
  await deleteDoc(doc(savedCounterpartiesCollection(companyId), id))
}
