import { collection, doc, getCountFromServer, getDoc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'
import { db, storage, storageBucket } from '@/config/firebase'
import { buildDecaPdf, buildSupersededNoticePdf, decaFileName } from '@/services/pdfGenerator'
import type { DecaFormValues, DecaRecord } from '@/types/deca'

function decaCollection(companyId: string) {
  return collection(db, 'companies', companyId, 'decaDocs')
}

export function getPublicUrl(storagePath: string) {
  const encoded = encodeURIComponent(storagePath)
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encoded}?alt=media`
}

interface CorrectionInfo {
  originalDocId: string
  reason: string
}

export interface Creator {
  uid: string
  email: string
  nombre?: string
}

export async function createDecaDocument(
  companyId: string,
  values: DecaFormValues,
  creator: Creator,
  correctionInfo?: CorrectionInfo,
): Promise<DecaRecord> {
  const docId = crypto.randomUUID()
  const storagePath = `deca/${companyId}/${docId}.pdf`
  const publicUrl = getPublicUrl(storagePath)
  const createdAtIso = new Date().toISOString()

  const pdfBytes = await buildDecaPdf({
    docId,
    publicUrl,
    data: values,
    createdAtIso,
    correctionInfo,
  })

  const fileName = decaFileName(values.matriculaTractora, values.fechaTransporte)

  await uploadBytes(ref(storage, storagePath), pdfBytes, {
    contentType: 'application/pdf',
    contentDisposition: `inline; filename="${fileName}"`,
  })

  const record: DecaRecord = {
    ...values,
    id: docId,
    createdAt: createdAtIso,
    createdBy: creator.uid,
    createdByEmail: creator.email,
    ...(creator.nombre ? { createdByName: creator.nombre } : {}),
    storagePath,
    publicUrl,
    status: 'active',
    ...(correctionInfo
      ? { supersedes: correctionInfo.originalDocId, correctionReason: correctionInfo.reason }
      : {}),
  }

  await setDoc(doc(decaCollection(companyId), docId), record)

  return record
}

/** Implements the "generar un nuevo fichero electrónico" correction method
 * from the Resolución de 5 de junio de 2026 (apartado Quinto): issues a new
 * DeCA with the corrected data, marks the original as superseded, and
 * overwrites the ORIGINAL PDF (same URL/QR) with a short notice pointing to
 * the new one — so anyone who scans an old printed QR is redirected to the
 * valid document instead of silently reading outdated data. The original
 * record itself is never deleted or edited, only its `status` changes. */
export async function correctDecaDocument(
  companyId: string,
  original: DecaRecord,
  values: DecaFormValues,
  reason: string,
  updatedBy: Creator,
): Promise<DecaRecord> {
  const vehicleChanged =
    values.matriculaTractora !== original.matriculaTractora ||
    values.matriculaRemolque !== original.matriculaRemolque
  const valuesWithVehicleNote: DecaFormValues =
    vehicleChanged && !values.cambioVehiculo
      ? {
          ...values,
          cambioVehiculo: `Matrícula anterior: ${original.matriculaTractora}${
            original.matriculaRemolque ? ' / ' + original.matriculaRemolque : ''
          }`,
        }
      : values

  const newRecord = await createDecaDocument(companyId, valuesWithVehicleNote, updatedBy, {
    originalDocId: original.id,
    reason,
  })

  const supersededAtIso = new Date().toISOString()
  const noticeBytes = await buildSupersededNoticePdf({
    originalDocId: original.id,
    newDocId: newRecord.id,
    newPublicUrl: newRecord.publicUrl,
    reason,
    supersededAtIso,
  })
  const noticeFileName = decaFileName(original.matriculaTractora, original.fechaTransporte).replace(
    /\.pdf$/,
    '_SUSTITUIDO.pdf',
  )
  await uploadBytes(ref(storage, original.storagePath), noticeBytes, {
    contentType: 'application/pdf',
    contentDisposition: `inline; filename="${noticeFileName}"`,
  })

  await setDoc(
    doc(decaCollection(companyId), original.id),
    { status: 'superseded', supersededBy: newRecord.id },
    { merge: true },
  )

  return newRecord
}

/** Admins get every DeCA the company has ever issued; pass `createdBy` (a
 * driver's own uid) to scope the query to just their own documents — this
 * mirrors firestore.rules' read rule, which requires exactly this filter to
 * be present in the query for a non-admin to be allowed to list at all. */
export async function listDecaDocuments(companyId: string, createdBy?: string): Promise<DecaRecord[]> {
  const constraints = createdBy ? [where('createdBy', '==', createdBy)] : []
  const q = query(decaCollection(companyId), ...constraints, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as DecaRecord)
}

export async function getDecaDocument(companyId: string, id: string): Promise<DecaRecord | null> {
  const snap = await getDoc(doc(decaCollection(companyId), id))
  return snap.exists() ? (snap.data() as DecaRecord) : null
}

export async function setDecaHidden(companyId: string, docId: string, hidden: boolean) {
  await setDoc(doc(decaCollection(companyId), docId), { hidden }, { merge: true })
}

/** Total de DeCA generados históricamente por la empresa (incluye
 * correcciones, que también crean un documento nuevo) — usado para calcular
 * el consumo del periodo de prueba gratuita. */
export async function getDecaDocumentCount(companyId: string): Promise<number> {
  const snap = await getCountFromServer(decaCollection(companyId))
  return snap.data().count
}

export async function findActiveDecaByMatricula(companyId: string, matricula: string): Promise<DecaRecord[]> {
  const q = query(
    decaCollection(companyId),
    where('matriculaTractora', '==', matricula),
    where('status', '==', 'active'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as DecaRecord)
}
