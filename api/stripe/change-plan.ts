import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureStripeCustomer, FiscalSyncError } from '../_lib/customerFiscalSync.js'
import { ApiError, requireCompanyAdmin } from '../_lib/requireCompanyAdmin.js'
import { getStripe, PRICE_IDS, type PlanId } from '../_lib/stripe.js'

/** Switches an already-subscribed company to a different self-serve plan
 * (up or down) — but not immediately: the current plan stays active and
 * paid-for until the end of the period already billed, and only then does
 * Stripe switch the price and charge the new amount. This uses a Stripe
 * Subscription Schedule with two phases (mirror of the current phase, then
 * the new price starting where it ends) rather than
 * `stripe.subscriptions.update()`'s immediate item swap, which is what an
 * ordinary plan change on Stripe would otherwise do. `pendingPlan` is
 * written to Firestore right away so the UI can show what's coming and
 * when — the price itself only actually changes later, at the phase
 * boundary, which fires the normal `customer.subscription.updated` webhook
 * (api/stripe/webhook.ts already clears `pendingPlan` once the synced plan
 * matches it). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const plan = req.body?.plan as PlanId | undefined
    if (!plan || !(plan in PRICE_IDS) || !PRICE_IDS[plan]) {
      return res.status(400).json({ error: 'Plan inválido' })
    }

    const { email, company, companyRef } = await requireCompanyAdmin(req)
    if (!company.nif || !company.domicilio) {
      return res.status(400).json({ error: 'Completa el NIF/CIF y el domicilio de tu empresa antes de cambiar de plan' })
    }

    const subscriptionId = company.stripeSubscriptionId as string | undefined
    if (!subscriptionId) return res.status(400).json({ error: 'Esta empresa todavía no tiene una suscripción activa' })

    const stripe = await getStripe()
    // Keep the invoice's fiscal data current in case nif/domicilio changed
    // since the subscription started.
    await ensureStripeCustomer(stripe, company.stripeCustomerId as string | undefined, email, {
      nombre: company.nombre as string,
      nif: company.nif as string,
      domicilio: company.domicilio as string,
    })

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const currentPriceId = subscription.items.data[0]?.price.id
    if (!currentPriceId) return res.status(500).json({ error: 'No se encontró el detalle de la suscripción' })

    const pendingPlan = company.pendingPlan as PlanId | null | undefined

    if (PRICE_IDS[plan] === currentPriceId) {
      if (!pendingPlan) return res.status(400).json({ error: 'Ya tienes contratado ese plan' })
      // Re-picking the currently-active plan while a different one is
      // scheduled reads as "changed my mind, undo the pending change" —
      // releasing hands the subscription back from schedule-managed to a
      // plain, normally-renewing one.
      const scheduleId = subscription.schedule as string | null
      if (scheduleId) await stripe.subscriptionSchedules.release(scheduleId)
      await companyRef.update({ pendingPlan: null })
      return res.status(200).json({ ok: true, scheduled: false })
    }
    if (pendingPlan === plan) {
      return res.status(400).json({ error: 'Ya tienes programado ese cambio de plan' })
    }

    const scheduleId = subscription.schedule as string | null
    const schedule = scheduleId
      ? await stripe.subscriptionSchedules.retrieve(scheduleId)
      : await stripe.subscriptionSchedules.create({ from_subscription: subscriptionId })
    const currentPhase = schedule.phases[0]

    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: 'release',
      phases: [
        {
          items: currentPhase.items.map((i) => ({ price: i.price as string, quantity: i.quantity })),
          start_date: currentPhase.start_date,
          end_date: currentPhase.end_date,
          proration_behavior: 'none',
        },
        {
          items: [{ price: PRICE_IDS[plan], quantity: 1 }],
          proration_behavior: 'none',
          metadata: { ...subscription.metadata, plan },
        },
      ],
    })

    await companyRef.update({ pendingPlan: plan })

    return res.status(200).json({ ok: true, scheduled: true })
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ error: err.message })
    if (err instanceof FiscalSyncError) return res.status(400).json({ error: err.message })
    console.error('change-plan error', err)
    return res.status(500).json({ error: 'No se pudo cambiar de plan' })
  }
}
