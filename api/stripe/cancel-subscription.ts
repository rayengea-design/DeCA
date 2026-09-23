import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { resolveActiveSubscription } from '../_lib/resolveActiveSubscription.js'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'
import { getStripe } from '../_lib/stripe.js'

/** Toggles cancel-at-period-end — the Netflix/Spotify pattern: cancel now,
 * keep access through what's already paid for, and undo it any time before
 * the period actually ends, all without leaving the app. `cancelAtPeriodEnd`
 * is also written to Firestore right here (not just left to the
 * `customer.subscription.updated` webhook, like every other subscription
 * field): that webhook has shown intermittent delivery failures in
 * production, and this one field is a plain boolean we already know for
 * certain from the Stripe call above.
 *
 * A subscription with a pending plan change (change-plan.ts) is managed by
 * a Subscription Schedule, and Stripe flatly rejects touching
 * `cancel_at_period_end` directly on one of those — it has to go through the
 * schedule instead. This used to call `subscriptionSchedules.release()` to
 * hand it back to plain management first, but that turned out to cancel the
 * subscription immediately instead of "leaving it in place" as Stripe's own
 * docs for that method promise — in production, a customer who canceled was
 * dropped straight to the trial instead of keeping paid access until the
 * period they'd already paid for actually ended. Setting the schedule's
 * `end_behavior` directly (`cancel` / `release`) sidesteps `release()`
 * entirely and does exactly what the name says, verified live: the
 * subscription keeps running as normal through the current (single, now
 * unpending-plan-change) phase, then either cancels or keeps renewing. */
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
    let subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId)
    subscription = await resolveActiveSubscription(
      stripe,
      subscription,
      company.stripeCustomerId as string | undefined,
      companyRef,
    )
    const scheduleId = subscription.schedule as string | null

    let scheduleCleared = false
    if (scheduleId) {
      const item = subscription.items.data[0]
      if (cancel && item) {
        // Collapsing to a single phase (dropping any pending-plan-change
        // phase) makes `end_behavior: 'cancel'` actually fire when this
        // phase ends — with a second, open-ended phase still queued, it
        // would never trigger at all.
        await stripe.subscriptionSchedules.update(scheduleId, {
          end_behavior: 'cancel',
          phases: [
            {
              items: [{ price: item.price.id, quantity: item.quantity }],
              start_date: item.current_period_start,
              end_date: item.current_period_end,
              proration_behavior: 'none',
            },
          ],
        })
        scheduleCleared = true
      } else {
        await stripe.subscriptionSchedules.update(scheduleId, { end_behavior: 'release' })
      }
    } else {
      await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: cancel })
    }

    await companyRef.update({ cancelAtPeriodEnd: cancel, ...(scheduleCleared ? { pendingPlan: null } : {}) })

    return res.status(200).json({ ok: true })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    console.error('cancel-subscription error', err)
    return res.status(500).json({ error: 'No se pudo actualizar la suscripción' })
  }
}
