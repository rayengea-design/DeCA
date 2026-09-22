import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { SavedTrip } from '@/types/deca'

function savedTripsCollection(companyId: string) {
  return collection(db, 'companies', companyId, 'savedTrips')
}

export async function listSavedTrips(companyId: string): Promise<SavedTrip[]> {
  const snap = await getDocs(query(savedTripsCollection(companyId), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => d.data() as SavedTrip)
}

export async function createSavedTrip(companyId: string, trip: Omit<SavedTrip, 'id' | 'createdAt'>): Promise<SavedTrip> {
  const id = crypto.randomUUID()
  const record: SavedTrip = { ...trip, id, createdAt: new Date().toISOString() }
  await setDoc(doc(savedTripsCollection(companyId), id), record)
  return record
}

export async function updateSavedTrip(
  companyId: string,
  id: string,
  trip: Omit<SavedTrip, 'id' | 'createdAt'>,
): Promise<void> {
  await updateDoc(doc(savedTripsCollection(companyId), id), { ...trip })
}

export async function deleteSavedTrip(companyId: string, id: string): Promise<void> {
  await deleteDoc(doc(savedTripsCollection(companyId), id))
}
