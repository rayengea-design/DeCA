import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ApiError } from '../_lib/requireCompanyAdmin.js'
import { requireCompanyMember } from '../_lib/requireCompanyMember.js'

// Kept in sync by hand with src/lib/trial.ts (TRIAL_DOC_LIMIT / TRIAL_DAY_LIMIT)
// — API code can't import from the client bundle. This endpoint is the real,
// server-authoritative enforcement point of the free-trial caps: the Firestore
// rules can't count a collection, and they can't force the client to increment
// a counter when it creates a decaDoc, so a client writing decaDocs directly
// could otherwise create unlimited free documents. With decaDoc creation moved
// here (rules now deny direct client create), the caps can't be bypassed.
const TRIAL_DOC_LIMIT = 10
const TRIAL_DAY_LIMIT = 5

function daysSince(iso: string, now: number): number {
  return Math.floor((now - new Date(iso).getTime()) / (24 * 60 * 60 * 1000))
}

/** Server-authoritative creation of a DeCA document. The PDF itself is still
 * generated and uploaded to Storage by the browser; this endpoint only does
 * the trust-sensitive part — checking the trial caps against the real state
 * and writing the Firestore record + bumping the company's decaCount with the
 * Admin SDK (which bypasses the security rules). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { uid, email, nombre, companyRef, company } = await requireCompanyMember(req)

    const record = req.body?.record as Record<string, unknown> | undefined
    if (!record || typeof record !== 'object') return res.status(400).json({ error: 'Falta el documento' })
    const docId = record.id
    const storagePath = record.storagePath
    if (typeof docId !== 'string' || !docId) return res.status(400).json({ error: 'Documento sin id válido' })
    // The PDF must live under this company's own Storage prefix — never let a
    // record point at another tenant's file.
    if (typeof storagePath !== 'string' || !storagePath.startsWith(`deca/${companyRef.id}/`)) {
      return res.status(400).json({ error: 'Ruta de almacenamiento inválida' })
    }

    // Trial-cap enforcement (waived for an active/grace subscription or a
    // comped company). The document count is read live from Firestore, so it
    // can't be faked by simply not incrementing a counter.
    const subscribed = company.subscriptionStatus === 'active' || company.subscriptionStatus === 'past_due'
    const comped = company.comped === true
    if (!subscribed && !comped) {
      const createdAt = company.createdAt as string | undefined
      if (createdAt && daysSince(createdAt, Date.now()) >= TRIAL_DAY_LIMIT) {
        return res.status(403).json({ error: 'Tu prueba gratuita ha caducado. Suscríbete para seguir generando DeCA.' })
      }
      const countSnap = await companyRef.collection('decaDocs').count().get()
      if (countSnap.data().count >= TRIAL_DOC_LIMIT) {
        return res.status(403).json({ error: 'Has alcanzado el límite de la prueba gratuita. Suscríbete para seguir generando DeCA.' })
      }
    }

    const { FieldValue } = await import('firebase-admin/firestore')

    // Store the record, overriding the identity/status fields with values the
    // server trusts rather than whatever the client sent, then bump decaCount.
    const stored = {
      ...record,
      createdBy: uid,
      createdByEmail: email,
      ...(nombre ? { createdByName: nombre } : {}),
      status: 'active',
    }

    const batch = companyRef.firestore.batch()
    batch.set(companyRef.collection('decaDocs').doc(docId), stored)
    batch.update(companyRef, { decaCount: FieldValue.increment(1) })
    await batch.commit()

    return res.status(200).json({ ok: true })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('deca/commit error', err)
    return res.status(500).json({ error: 'No se pudo guardar el DeCA' })
  }
}
