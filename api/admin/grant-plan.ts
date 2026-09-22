import { FieldValue } from 'firebase-admin/firestore'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdminDb } from '../_lib/firebaseAdmin.js'
import { ApiError } from '../_lib/requireCompanyAdmin.js'
import { requirePlatformAdmin } from '../_lib/requirePlatformAdmin.js'

const VALID_PLANS = ['basico', 'flota', 'empresa', 'flota_plus']

/** Lets the platform admin comp a company a plan without it ever touching
 * Stripe (`plan: null` in the body revokes it back to trial rules instead).
 * Writes the exact same fields the Stripe webhook would, so every other
 * part of the app (trial gating, BillingPage, team seat limits) treats a
 * comped company identically to a paying one — it just has no
 * `stripeSubscriptionId`. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email } = await requirePlatformAdmin(req)

    const companyId = req.body?.companyId as string | undefined
    const plan = req.body?.plan as string | null | undefined
    if (!companyId) return res.status(400).json({ error: 'Falta companyId' })
    if (plan !== null && !VALID_PLANS.includes(plan ?? '')) {
      return res.status(400).json({ error: 'Plan inválido' })
    }

    const adminDb = await getAdminDb()
    const companyRef = adminDb.collection('companies').doc(companyId)
    const snap = await companyRef.get()
    if (!snap.exists) return res.status(404).json({ error: 'No se encontró la empresa' })

    if (plan === null) {
      await companyRef.update({
        plan: FieldValue.delete(),
        subscriptionStatus: FieldValue.delete(),
        comped: FieldValue.delete(),
        compedBy: FieldValue.delete(),
        compedAt: FieldValue.delete(),
      })
    } else {
      await companyRef.update({
        plan,
        subscriptionStatus: 'active',
        comped: true,
        compedBy: email,
        compedAt: new Date().toISOString(),
      })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('admin/grant-plan error', err)
    return res.status(500).json({ error: 'No se pudo actualizar el plan' })
  }
}
