import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'
import { getStripe } from '../_lib/stripe.js'
import { syncSubscriptionToFirestore } from '../_lib/syncSubscriptionToFirestore.js'

/** Client-triggered fast path, called by BillingPage right after the
 * embedded payment succeeds: re-reads the company's subscription straight
 * from Stripe and mirrors it into Firestore immediately, instead of waiting
 * on the `customer.subscription.updated` webhook to flip the company to
 * active. The webhook still fires and writes the same fields (both go
 * through syncSubscriptionToFirestore), so this is a fast path, not a
 * replacement — but it means a customer who just paid gets access at once
 * even if that one activation webhook is delayed or dropped, which is the
 * money-critical moment where waiting on a flaky webhook is least
 * acceptable. Returns the resulting subscriptionStatus so the client can
 * tell "paid and active" from "payment still processing". */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { company } = await requireCompanyAdmin(req)
    // A gifted plan isn't a Stripe subscription and must not be touched.
    if (company.comped) return res.status(200).json({ ok: true, subscriptionStatus: 'active' })

    const customerId = company.stripeCustomerId as string | undefined
    if (!customerId) return res.status(400).json({ error: 'Esta empresa todavía no tiene una suscripción' })

    const stripe = await getStripe()
    // The company doc may not have a subscriptionId yet (this fast path can
    // run before any webhook has landed at all), so find the customer's
    // most recent still-live subscription directly.
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 })
    const subscription: Stripe.Subscription | undefined = subs.data
      .filter((s) => s.status !== 'canceled' && s.status !== 'incomplete_expired')
      .sort((a, b) => b.created - a.created)[0]
    if (!subscription) return res.status(200).json({ ok: true, subscriptionStatus: null })

    await syncSubscriptionToFirestore(subscription)

    return res.status(200).json({ ok: true, subscriptionStatus: subscription.status })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('sync-subscription error', err)
    return res.status(500).json({ error: 'No se pudo sincronizar la suscripción' })
  }
}
