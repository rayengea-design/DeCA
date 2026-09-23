import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'
import { getStripe } from '../_lib/stripe.js'

/** Toggles cancel-at-period-end directly on the subscription — the
 * Netflix/Spotify pattern: cancel now, keep access through what's already
 * paid for, and undo it any time before the period actually ends, all
 * without leaving the app. `cancelAtPeriodEnd` is also written to Firestore
 * right here (not just left to the `customer.subscription.updated` webhook,
 * like every other subscription field): that webhook has shown intermittent
 * delivery failures in production, and this one field is a plain boolean we
 * already know for certain from the Stripe call above — no need to wait on
 * a webhook that might not arrive. The webhook still fires and writes the
 * same value, so this is a fast-path, not a replacement. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const cancel = req.body?.cancel
    if (typeof cancel !== 'boolean') return res.status(400).json({ error: 'Falta "cancel" (boolean)' })

    const { company, companyRef } = await requireCompanyAdmin(req)
    if (company.comped) {
      return res.status(400).json({ error: 'Este plan te lo ha regalado el equipo de DeCA — no hay nada que cancelar.' })
    }
    const subscriptionId = company.stripeSubscriptionId as string | undefined
    if (!subscriptionId) return res.status(400).json({ error: 'Esta empresa no tiene una suscripción activa' })

    const stripe = await getStripe()
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: cancel })
    await companyRef.update({ cancelAtPeriodEnd: cancel })

    return res.status(200).json({ ok: true })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('cancel-subscription error', err)
    return res.status(500).json({ error: 'No se pudo actualizar la suscripción' })
  }
}
